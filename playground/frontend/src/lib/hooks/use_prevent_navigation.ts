import Router from "next/router";
import { useEffect, useCallback } from "react";

export const usePreventNavigation = (
  active: boolean,
  onConfirm: () => boolean,
) => {
  const handleRouteChangeStart = useCallback(() => {
    if (active) {
      const ok = onConfirm();
      if (!ok) {
        Router.events.emit("routeChangeError");
        throw "Abort route change. Please ignore this error.";
      }
    }
  }, [active, onConfirm]);

  const handleBeforeUnload = useCallback(
    (event: BeforeUnloadEvent) => {
      if (active) {
        const ok = onConfirm();
        if (!ok) {
          event.preventDefault();
          event.returnValue = true; // Standard message will be shown by the browser
          return true;
        }
      }
    },
    [active, onConfirm],
  );

  useEffect(() => {
    if (active) {
      Router.events.on("routeChangeStart", handleRouteChangeStart);
      window.addEventListener("beforeunload", handleBeforeUnload);
    } else {
      Router.events.off("routeChangeStart", handleRouteChangeStart);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      Router.events.off("routeChangeStart", handleRouteChangeStart);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [active, handleRouteChangeStart, handleBeforeUnload]);
};
