import { useEffect } from "react";

export function useAssignSlug(user, profile, setProfile) {
  useEffect(() => {
    if (!user || profile?.slug) return;

    async function assign() {
      try {
        const res = await fetch("/api/assign-slug", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: user.uid, email: user.email }),
        });
        const data = await res.json();
        if (data.slug) {
          setProfile((p) => ({ ...p, slug: data.slug }));
        }
      } catch (err) {
        console.error("useAssignSlug error:", err);
      }
    }

    assign();
  }, [user?.uid, profile?.slug]);
}