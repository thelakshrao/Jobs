"use client";
import { useEffect, useMemo, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { buildProfile, getRecommendedJobs } from "@/lib/jobRecommendations";

const RECOMMENDED_PATH = "/dashboard/jobs/recommended";
const seenKey = (uid) => `recommendedSeen:${uid}`;

function readSeen(uid) {
    try {
        return new Set(JSON.parse(localStorage.getItem(seenKey(uid)) || "[]"));
    } catch {
        return new Set();
    }
}

function writeSeen(uid, ids) {
    try {
        localStorage.setItem(seenKey(uid), JSON.stringify([...ids]));
    } catch { }
}

// Returns how many recommended jobs the person has not looked at yet.
// - Jobs and the profile are watched live, so a new matching job shows up
//   without reloading the page.
// - "Seen" is remembered on this device, per user.
// - Being on the Recommended jobs page marks everything shown there as seen.
export default function useNewRecommendedJobs(pathname) {
    const [uid, setUid] = useState(null);
    const [userData, setUserData] = useState(null);
    const [jobs, setJobs] = useState(null);
    const [seen, setSeen] = useState(new Set());

    useEffect(() => {
        const unsub = auth.onAuthStateChanged((user) => {
            setUid(user ? user.uid : null);
            if (!user) {
                setUserData(null);
                setJobs(null);
                setSeen(new Set());
            } else {
                setSeen(readSeen(user.uid));
            }
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        if (!uid) return;
        const unsubUser = onSnapshot(
            doc(db, "users", uid),
            (snap) => setUserData(snap.exists() ? snap.data() : {}),
            (err) => console.error(err),
        );
        const unsubJobs = onSnapshot(
            query(collection(db, "jobs"), where("status", "==", "Open")),
            (snap) => {
                const today = new Date().toISOString().split("T")[0];
                setJobs(
                    snap.docs
                        .map((d) => ({ id: d.id, ...d.data() }))
                        .filter((j) => !j.applicationDeadline || j.applicationDeadline >= today),
                );
            },
            (err) => console.error(err),
        );
        return () => {
            unsubUser();
            unsubJobs();
        };
    }, [uid]);

    const recommendedIds = useMemo(() => {
        if (!userData || !jobs) return [];
        return getRecommendedJobs(jobs, buildProfile(userData)).map((r) => r.job.id);
    }, [userData, jobs]);

    const onRecommendedPage = pathname === RECOMMENDED_PATH;

    // Looking at the list marks all of it as seen
    useEffect(() => {
        if (!uid || !onRecommendedPage || !userData || !jobs) return;
        const current = new Set(recommendedIds);
        // Keep earlier ids only while the job still exists, so the list stays small
        const stillOpen = new Set(jobs.map((j) => j.id));
        const next = new Set(
            [...seen].filter((id) => stillOpen.has(id)).concat(recommendedIds),
        );
        const changed =
            next.size !== seen.size || [...current].some((id) => !seen.has(id));
        if (changed) {
            writeSeen(uid, next);
            setSeen(next);
        }
    }, [uid, onRecommendedPage, userData, jobs, recommendedIds, seen]);

    if (onRecommendedPage) return 0;
    return recommendedIds.filter((id) => !seen.has(id)).length;
}