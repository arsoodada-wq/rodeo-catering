"use client";

import { useEffect } from "react";

/**
 * next-view-transitions (see its README's own disclaimer) doesn't fully
 * reconcile with App Router's concurrent rendering/streaming, so the
 * browser's View Transition sometimes can't confirm the DOM update finished
 * in time and aborts with a TimeoutError. The navigation itself always
 * completes correctly either way — only the crossfade animation is skipped,
 * same as it would be on a browser with no View Transitions support at all.
 * Without this, that expected case surfaces as an unhandled promise
 * rejection in the console on every affected navigation.
 */
export function ViewTransitionErrorGuard() {
  useEffect(() => {
    function handleRejection(event: PromiseRejectionEvent) {
      const reason = event.reason;
      const isViewTransitionTimeout =
        reason instanceof DOMException &&
        reason.name === "TimeoutError" &&
        reason.message.includes("aborted because of timeout in DOM update");

      if (isViewTransitionTimeout) {
        event.preventDefault();
      }
    }

    window.addEventListener("unhandledrejection", handleRejection);
    return () => window.removeEventListener("unhandledrejection", handleRejection);
  }, []);

  return null;
}
