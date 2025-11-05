import React from "react";
import IconWeather from "./IconWeather";

export default function DailyCard({ label, iconType, tMax, tMin, pop, wind }) {
  return (
    <div className="hour-card w-[160px]">
      <div className="text-[12px] font-medium">{label}</div>
      <div className="my-3 flex justify-center"><IconWeather type={iconType} className="w-10 h-10" /></div>
      <div className="text-sm mb-2">
        <span className="font-semibold">{tMax}</span><span className="hint"> / {tMin}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full" style={{ width:"100%", background:"linear-gradient(90deg, rgba(255,255,255,.15), rgba(255,255,255,.35))"}} />
      </div>
      <div className="mt-3 grid gap-1 text-[11px] hint">
        <div>🌧 {pop}%</div>
        <div>💨 {wind}</div>
      </div>
    </div>
  );
}
