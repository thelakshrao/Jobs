"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { auth, db, firebaseConfig } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { initializeApp, deleteApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut as secondarySignOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import AdminSidebar, {
  getStoredSidebarCollapsed,
  TOGGLE_EVENT,
} from "@/adminComponents/AdminSidebar";
import {
  Plus,
  X,
  Copy,
  Check,
  Pencil,
  Trash2,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import {
  TOP_TIER,
  MID_TIER,
  UNIQUE_ROLES,
  canManage,
  canAdd,
  assignableRoles,
  generatePasscode,
  generateEmployeeId,
} from "@/lib/adminRoles";

const BRAND = "#003882";

const ROLE_STYLE = {
  Founder: "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Co-Founder": "bg-purple-50 text-purple-700 border-purple-200",
  Developer: "bg-blue-50 text-blue-700 border-blue-200",
  "Managing Head": "bg-amber-50 text-amber-700 border-amber-200",
  "Technical Head": "bg-teal-50 text-teal-700 border-teal-200",
  Staff: "bg-slate-100 text-slate-600 border-slate-200",
};

function RoleBadges({ roles = [] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {roles.length === 0 && (
        <span className="text-xs font-bold px-2 py-0.5 rounded-full border bg-slate-100 text-slate-500 border-slate-200">
          Staff
        </span>
      )}
      {roles.map((r) => (
        <span
          key={r}
          className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
            ROLE_STYLE[r] || ROLE_STYLE.Staff
          }`}
        >
          {r}
        </span>
      ))}
    </div>
  );
}

function AddStaffModal({ onClose, onCreated, currentRoles, takenUniqueRoles, existingIds }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roles, setRoles] = useState(
    assignableRoles(currentRoles, takenUniqueRoles).includes("Staff")
      ? ["Staff"]
      : [],
  );
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [existingMatch, setExistingMatch] = useState(null);
  const [copied, setCopied] = useState("");

  const available = assignableRoles(currentRoles, takenUniqueRoles);
  const lockedToStaff = available.length === 1 && available[0] === "Staff";

  const toggleRole = (r) => {
    if (UNIQUE_ROLES.includes(r)) {
      setRoles([r]);
    } else {
      setRoles((prev) =>
        prev.includes(r) ? prev.filter((x) => x !== r) : [...prev.filter((x) => !UNIQUE_ROLES.includes(x)), r],
      );
    }
  };

  const findExisting = async (targetEmail) => {
    const adminSnap = await getDocs(
      query(collection(db, "admin_staff"), where("email", "==", targetEmail)),
    );
    if (!adminSnap.empty) return { blocked: true };

    const usersSnap = await getDocs(
      query(collection(db, "users"), where("email", "==", targetEmail)),
    );
    if (!usersSnap.empty) {
      const d = usersSnap.docs[0];
      return { uid: d.id, source: "users", label: "an existing applicant account" };
    }

    const employersSnap = await getDocs(
      query(collection(db, "employers"), where("email", "==", targetEmail)),
    );
    if (!employersSnap.empty) {
      const d = employersSnap.docs[0];
      return { uid: d.id, source: "employers", label: "an existing employer account" };
    }

    return null;
  };

  const handleContinue = async (e) => {
    e.preventDefault();
    setError("");
    setExistingMatch(null);
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setChecking(true);
    try {
      const match = await findExisting(email.trim());
      if (match?.blocked) {
        setError("This person is already an admin staff member.");
        setChecking(false);
        return;
      }
      if (match) {
        setExistingMatch(match);
        setChecking(false);
        return;
      }
      await createFreshAccount();
    } catch (err) {
      console.error(err);
      setError("Something went wrong checking this email. Please try again.");
      setChecking(false);
    }
  };

  const createFreshAccount = async () => {
    setSubmitting(true);
    let secondaryApp;
    try {
      const passcode = generatePasscode();
      const employeeId = generateEmployeeId(existingIds);

      secondaryApp = initializeApp(firebaseConfig, "StaffCreate-" + Date.now());
      const secondaryAuth = getAuth(secondaryApp);
      const cred = await createUserWithEmailAndPassword(
        secondaryAuth,
        email.trim(),
        passcode,
      );
      const uid = cred.user.uid;
      await secondarySignOut(secondaryAuth);

      await setDoc(doc(db, "admin_staff", uid), {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        employee_id: employeeId,
        roles: roles.length ? roles : ["Staff"],
        status: "active",
        mustResetPassword: true,
        addedBy: auth.currentUser?.uid || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setResult({ passcode, employeeId, email: email.trim(), existing: false });
      onCreated();
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError(
          "This email already has a login account, but we couldn't find their profile automatically. Please check the email and try again.",
        );
      } else {
        setError("Could not create account. Please try again.");
      }
    } finally {
      if (secondaryApp) {
        try {
          await deleteApp(secondaryApp);
        } catch {}
      }
      setSubmitting(false);
      setChecking(false);
    }
  };

  const handleAddExisting = async () => {
    setSubmitting(true);
    try {
      const employeeId = generateEmployeeId(existingIds);
      await setDoc(doc(db, "admin_staff", existingMatch.uid), {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        employee_id: employeeId,
        roles: roles.length ? roles : ["Staff"],
        status: "active",
        mustResetPassword: false,
        addedBy: auth.currentUser?.uid || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setResult({ employeeId, email: email.trim(), existing: true });
      onCreated();
    } catch (err) {
      console.error(err);
      setError("Could not add this staff member. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900">
            {result ? "Staff Access Granted" : "Add Staff Member"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"
          >
            <X size={16} />
          </button>
        </div>

        {result ? (
          <div className="p-6 space-y-4">
            {result.existing ? (
              <p className="text-sm text-slate-500 font-medium">
                <span className="font-bold text-slate-800">{result.email}</span>{" "}
                already has an account — they can log in to the admin panel using
                their existing password. Their new Employee ID is{" "}
                <span className="font-mono font-bold text-slate-800">
                  {result.employeeId}
                </span>
                .
              </p>
            ) : (
              <>
                <p className="text-sm text-slate-500 font-medium">
                  Share these credentials securely with{" "}
                  <span className="font-bold text-slate-800">{result.email}</span>.
                  They'll be asked to set a new password the first time they log in.
                </p>
                {[
                  { label: "Employee ID", value: result.employeeId, key: "id" },
                  { label: "Default Passcode", value: result.passcode, key: "pass" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">
                      {f.label}
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-800">
                        {f.value}
                      </div>
                      <button
                        onClick={() => copy(f.value, f.key)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: BRAND }}
                      >
                        {copied === f.key ? <Check size={15} /> : <Copy size={15} />}
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white mt-2"
              style={{ backgroundColor: BRAND }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleContinue} className="p-6 space-y-4">
            {error && (
              <div className="px-3 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-sm font-semibold text-rose-600">
                {error}
              </div>
            )}

            {existingMatch && (
              <div className="px-3 py-3 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-sm font-bold text-amber-800 mb-1">
                  Email already in use
                </p>
                <p className="text-xs font-medium text-amber-700 mb-3">
                  <span className="font-bold">{email}</span> belongs to{" "}
                  {existingMatch.label}. You can grant this person admin access
                  directly — they'll keep logging in with their current password.
                </p>
                <button
                  type="button"
                  onClick={handleAddExisting}
                  disabled={submitting}
                  className="w-full py-2 rounded-lg text-xs font-bold text-white disabled:opacity-60"
                  style={{ backgroundColor: BRAND }}
                >
                  {submitting ? "Adding…" : "Add Them Directly"}
                </button>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">
                Full Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!!existingMatch}
                className="w-full px-3 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setExistingMatch(null);
                }}
                className="w-full px-3 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">
                Phone Number
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!!existingMatch}
                className="w-full px-3 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">
                Role
              </label>
              {lockedToStaff ? (
                <p className="text-sm font-semibold text-slate-500 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  Staff (default — you can only add normal staff)
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {available.map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => toggleRole(r)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border transition ${
                        roles.includes(r)
                          ? ROLE_STYLE[r] || ROLE_STYLE.Staff
                          : "bg-white text-slate-500 border-slate-200"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!existingMatch && (
              <button
                type="submit"
                disabled={checking || submitting}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                style={{ backgroundColor: BRAND }}
              >
                {checking ? "Checking…" : submitting ? "Creating…" : "Create Account"}
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

function EditStaffModal({ staff, currentRoles, takenUniqueRoles, onClose, onSaved, onDeleted, canDelete }) {
  const [name, setName] = useState(staff.name || "");
  const [phone, setPhone] = useState(staff.phone || "");
  const [roles, setRoles] = useState(staff.roles || []);
  const [status, setStatus] = useState(staff.status || "active");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const available = assignableRoles(
    currentRoles,
    takenUniqueRoles.filter((r) => !(staff.roles || []).includes(r)),
  );
  const isMidActor = !available.some((r) => TOP_TIER.includes(r) || MID_TIER.includes(r));

  const toggleRole = (r) => {
    if (UNIQUE_ROLES.includes(r)) {
      setRoles([r]);
    } else {
      setRoles((prev) =>
        prev.includes(r) ? prev.filter((x) => x !== r) : [...prev.filter((x) => !UNIQUE_ROLES.includes(x)), r],
      );
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, "admin_staff", staff.id), {
        name: name.trim(),
        phone: phone.trim(),
        roles: isMidActor ? staff.roles : (roles.length ? roles : ["Staff"]),
        status,
        updatedAt: new Date().toISOString(),
      });
      onSaved();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteDoc(doc(db, "admin_staff", staff.id));
      onDeleted();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900">Edit Staff</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">
              Full Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">
              Phone Number
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none"
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">
              Role
            </label>
            {isMidActor ? (
              <RoleBadges roles={staff.roles} />
            ) : (
              <div className="flex flex-wrap gap-2">
                {[...TOP_TIER, ...MID_TIER, "Staff"].map((r) => {
                  const disabled =
                    UNIQUE_ROLES.includes(r) &&
                    takenUniqueRoles.includes(r) &&
                    !(staff.roles || []).includes(r);
                  return (
                    <button
                      type="button"
                      key={r}
                      disabled={disabled}
                      onClick={() => toggleRole(r)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border transition ${
                        disabled
                          ? "opacity-30 cursor-not-allowed bg-white text-slate-400 border-slate-200"
                          : roles.includes(r)
                            ? ROLE_STYLE[r] || ROLE_STYLE.Staff
                            : "bg-white text-slate-500 border-slate-200"
                      }`}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: BRAND }}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
            {canDelete && (
              <button
                onClick={() => setConfirmDelete(true)}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>

          {confirmDelete && (
            <div className="mt-2 p-3 rounded-xl bg-rose-50 border border-rose-200">
              <p className="text-xs font-bold text-rose-700 mb-2">
                Remove {staff.name} permanently? This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2 rounded-lg text-xs font-bold text-white bg-rose-600"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-2 rounded-lg text-xs font-bold text-slate-600 bg-white border border-slate-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StaffPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [me, setMe] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  useEffect(() => {
    setCollapsed(getStoredSidebarCollapsed());
    const handler = () => setCollapsed(getStoredSidebarCollapsed());
    window.addEventListener(TOGGLE_EVENT, handler);
    return () => window.removeEventListener(TOGGLE_EVENT, handler);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.replace("/admin");
        return;
      }
      try {
        const snap = await getDoc(doc(db, "admin_staff", user.uid));
        if (!snap.exists() || snap.data().status !== "active") {
          await signOut(auth);
          router.replace("/admin");
          return;
        }
        setMe({ id: user.uid, ...snap.data() });
        setChecking(false);
      } catch (err) {
        console.error(err);
        router.replace("/admin");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(
        query(collection(db, "admin_staff"), orderBy("createdAt", "desc")),
      );
      setStaff(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (checking) return;
    loadStaff();
  }, [checking]);

  const takenUniqueRoles = useMemo(
    () => staff.flatMap((s) => (s.roles || []).filter((r) => UNIQUE_ROLES.includes(r))),
    [staff],
  );
  const existingIds = useMemo(() => staff.map((s) => s.employee_id), [staff]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const myRoles = me?.roles || [];

  return (
    <>
      <AdminSidebar />
      <main
        className={`pt-14 md:pt-0 min-h-screen bg-[#e8eaed] transition-all duration-200 ${
          collapsed ? "md:ml-20" : "md:ml-60"
        }`}
      >
        <div className="px-4 sm:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-[#003882] tracking-tight">
                Manage Staff
              </h1>
              <p className="text-sm text-slate-500 mt-0.5 font-medium">
                {staff.length} admin staff member{staff.length !== 1 ? "s" : ""}
              </p>
            </div>
            {canAdd(myRoles) && (
              <button
                onClick={() => setShowAdd(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-xl shadow-md"
                style={{ backgroundColor: BRAND }}
              >
                <Plus size={15} strokeWidth={2.5} />
                Add Staff
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-slate-400 font-medium">
              Loading…
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {staff.map((s) => (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: "#eaf1fb" }}
                      >
                        <User size={18} style={{ color: BRAND }} />
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-slate-900">
                          {s.name}
                          {s.id === me.id && (
                            <span className="ml-1.5 text-[10px] font-bold text-slate-400">
                              (you)
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-slate-400 font-semibold">
                          {s.employee_id}
                        </p>
                      </div>
                    </div>
                    {canManage(myRoles, s.roles || []) && (
                      <button
                        onClick={() => setEditTarget(s)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"
                      >
                        <Pencil size={13} />
                      </button>
                    )}
                  </div>
                  <RoleBadges roles={s.roles} />
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                      <Mail size={11} /> {s.email}
                    </p>
                    {s.phone && (
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                        <Phone size={11} /> {s.phone}
                      </p>
                    )}
                    <p className="text-xs font-semibold flex items-center gap-1.5">
                      <ShieldCheck
                        size={11}
                        className={
                          s.status === "active" ? "text-emerald-500" : "text-rose-500"
                        }
                      />
                      <span
                        className={
                          s.status === "active" ? "text-emerald-600" : "text-rose-500"
                        }
                      >
                        {s.status === "active" ? "Active" : "Suspended"}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showAdd && (
        <AddStaffModal
          currentRoles={myRoles}
          takenUniqueRoles={takenUniqueRoles}
          existingIds={existingIds}
          onClose={() => setShowAdd(false)}
          onCreated={loadStaff}
        />
      )}

      {editTarget && (
        <EditStaffModal
          staff={editTarget}
          currentRoles={myRoles}
          takenUniqueRoles={takenUniqueRoles}
          canDelete={editTarget.id !== me.id}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            setEditTarget(null);
            loadStaff();
          }}
          onDeleted={() => {
            setEditTarget(null);
            loadStaff();
          }}
        />
      )}
    </>
  );
}