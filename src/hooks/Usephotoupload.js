import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { uploadToCloudinary } from "@/lib/cloudinary";

export function usePhotoUpload(setForm) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please pick an image (JPG, PNG, etc.)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB");
      return;
    }

    setError("");
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm((prev) => ({ ...prev, photoURL: url }));
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, "users", user.uid), { photoURL: url }, { merge: true });
      }
    } catch (e) {
      console.error(e);
      setError("Upload failed — please try again.");
    } finally {
      setUploading(false);
    }
  };

  return { uploading, error, upload };
}