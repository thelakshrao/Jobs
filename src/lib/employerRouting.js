import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getEmployerDestination(uid, { redirect } = {}) {
  const wantsCreateJob = redirect === "create-job";

  const empLoggedOut =
    typeof window !== "undefined" &&
    sessionStorage.getItem("empLoggedOut") === "true";

  if (empLoggedOut) {
    return `/employer/onboarding?mode=switch${
      wantsCreateJob ? "&redirect=create-job" : ""
    }`;
  }

  try {
    const empDoc = await getDoc(doc(db, "employers", uid));
    if (empDoc.exists()) {
      return wantsCreateJob
        ? "/employer/dashboard/create-job"
        : "/employer/dashboard";
    }
    return `/employer/onboarding${wantsCreateJob ? "?redirect=create-job" : ""}`;
  } catch (err) {
    console.error("getEmployerDestination: Firestore error", err);
    return `/employer/onboarding${wantsCreateJob ? "?redirect=create-job" : ""}`;
  }
}