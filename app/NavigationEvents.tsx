"use client";

import { useEffect } from "react";
import { APP_NAVIGATION_EVENT } from "../lib/navigation";

export default function NavigationEvents() {
  useEffect(() => {
    const notify = () => window.dispatchEvent(new Event(APP_NAVIGATION_EVENT));
    const pushState = history.pushState.bind(history);
    const replaceState = history.replaceState.bind(history);

    history.pushState = (...args) => { pushState(...args); notify(); };
    history.replaceState = (...args) => { replaceState(...args); notify(); };

    return () => {
      history.pushState = pushState;
      history.replaceState = replaceState;
    };
  }, []);

  return null;
}
