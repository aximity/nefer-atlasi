"use client";

import { useEffect, useState } from "react";
import EventCalendar from "./EventCalendar";
import GroupBoard from "./GroupBoard";

type View = "İlan Panosu" | "Planlayıcı";

export default function CommunityEvents() {
  const [view, setView] = useState<View>("İlan Panosu");
  useEffect(() => {
    const initialize = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (params.get("community") === "Planlayıcı" || params.get("title")) setView("Planlayıcı");
    }, 0);
    return () => window.clearTimeout(initialize);
  }, []);
  return <div className="community-events">
    <nav className="community-tabs" aria-label="Topluluk etkinlik araçları">
      {(["İlan Panosu", "Planlayıcı"] as View[]).map((item) => <button key={item} className={view === item ? "active" : ""} onClick={() => setView(item)}>{item}</button>)}
    </nav>
    {view === "İlan Panosu" ? <GroupBoard/> : <EventCalendar/>}
  </div>;
}
