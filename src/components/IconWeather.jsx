import React from "react";

/**
 * Icone meteo vettoriali (animate) con className esterna per dimensioni/colore.
 * Il prop `type` è una delle mood: "clear","clouds","rain","drizzle","snow","storm","mist","wind".
 */
export default function IconWeather({
  type = "clouds",
  className = "w-8 h-8 weather-icon",
}) {
  const st = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  const Sun = (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <radialGradient id="nuvoSun" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#ffdf6b" />
          <stop offset="100%" stopColor="#ffc83a" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="5" className="sun-core" fill="url(#nuvoSun)" />
      <g className="sun-rays" {...st}>
        <path d="M12 2.4v2.3M12 19.3v2.3M2.4 12h2.3M19.3 12h2.3" />
        <path d="M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7" />
        <circle cx="12" cy="12" r="5" />
      </g>
    </svg>
  );

  const Cloud = (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...st}>
      <path d="M8.5 18.2h7.2A4.8 4.8 0 0 0 20.5 13 4.8 4.8 0 0 0 16 8.3 6.8 6.8 0 0 0 3.8 11.2 4.7 4.7 0 0 0 8.5 18.2Z" />
      <path d="M14.2 8.1a4.2 4.2 0 0 0-6.6 2.8" opacity=".4" />
    </svg>
  );

  const Rain = (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <g {...st}>
        <path d="M8.5 16.2h7.2A4.8 4.8 0 0 0 20.5 11 4.8 4.8 0 0 0 16 6.3 6.8 6.8 0 0 0 3.8 9.2 4.7 4.7 0 0 0 8.5 16.2Z" />
      </g>
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path className="rain-drop" d="M9 19.2v3" />
        <path className="rain-drop d2" d="M12 19.2v3" />
        <path className="rain-drop d3" d="M15 19.2v3" />
      </g>
    </svg>
  );

  const Drizzle = (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <g {...st}>
        <path d="M8.5 16.2h7.2A4.8 4.8 0 0 0 20.5 11 4.8 4.8 0 0 0 16 6.3 6.8 6.8 0 0 0 3.8 9.2 4.7 4.7 0 0 0 8.5 16.2Z" />
      </g>
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path className="rain-drop" d="M9.5 20.2v0" />
        <path className="rain-drop d2" d="M12 20.9v0" />
        <path className="rain-drop d3" d="M14.5 20.2v0" />
      </g>
    </svg>
  );

  const Snow = (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <g {...st}>
        <path d="M8.5 16.2h7.2A4.8 4.8 0 0 0 20.5 11 4.8 4.8 0 0 0 16 6.3 6.8 6.8 0 0 0 3.8 9.2 4.7 4.7 0 0 0 8.5 16.2Z" />
      </g>
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path className="snow-flake" d="M9.5 19.5l.7.7" />
        <path className="snow-flake d2" d="M12 20.6v1" />
        <path className="snow-flake d3" d="M14.5 19.5l-.7.7" />
      </g>
    </svg>
  );

  const Storm = (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <g {...st}>
        <path d="M8.5 15.8h7.2A4.8 4.8 0 0 0 20.5 10.5 4.8 4.8 0 0 0 16 5.8 6.8 6.8 0 0 0 3.8 8.6 4.7 4.7 0 0 0 8.5 15.8Z" />
      </g>
      <path className="storm-bolt" d="M12 12.8l-1.8 3.6h1.9l-1.1 4 3.7-5.2h-1.9l1.2-2.4z" />
    </svg>
  );

  const Mist = (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...st}>
      <path className="mist-line" d="M4 9.5h16" />
      <path className="mist-line" d="M3 12.5h18" />
      <path className="mist-line" d="M5 15.5h14" />
    </svg>
  );

  const Wind = (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...st}>
      <path d="M3 12h10a3 3 0 1 0-3-3" />
      <path d="M4 16h12a3.4 3.4 0 1 0-3.4-3.4" />
    </svg>
  );

  const map = {
    clear: Sun,
    clouds: Cloud,
    rain: Rain,
    drizzle: Drizzle,
    snow: Snow,
    storm: Storm,
    mist: Mist,
    wind: Wind,
  };

  return map[type] || map.clouds;
}
