"use client";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import {
  listenToUnreadCount,
  listenToNotifications,
  requestNotificationPermission,
  onForegroundMessage,
} from "@/lib/notifications";

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [permissionState, setPermissionState] = useState("default");
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setPermissionState(Notification.permission);
      setShowBanner(Notification.permission === "default");
    }
  }, []);

  useEffect(() => {
    let unsubCount = () => {};
    let unsubNotifs = () => {};
    let unsubFCM = () => {};

    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (!user) return;

      unsubCount = listenToUnreadCount(user.uid, setUnreadCount);
      unsubNotifs = listenToNotifications(user.uid, setNotifications);
      unsubFCM = onForegroundMessage((payload) => {
        // tab is open — you can show a custom toast here later
        console.log("Foreground message:", payload);
      });
    });

    return () => {
      unsubAuth();
      unsubCount();
      unsubNotifs();
      unsubFCM();
    };
  }, []);

  const allowNotifications = async () => {
    const granted = await requestNotificationPermission();
    setPermissionState(granted ? "granted" : "denied");
    setShowBanner(false);
  };

  const dismissBanner = () => setShowBanner(false);

  return {
    unreadCount,
    notifications,
    permissionState,
    showBanner,
    allowNotifications,
    dismissBanner,
  };
}