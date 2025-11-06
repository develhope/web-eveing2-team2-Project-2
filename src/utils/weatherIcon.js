export function mapOWToIcon(id, main) {
  const code = Number(id) || 0;
  if (code >= 200 && code <= 232) return "storm";
  if (code >= 300 && code <= 321) return "drizzle";
  if (code >= 500 && code <= 531) return "rain";
  if (code >= 600 && code <= 622) return "snow";
  if (code >= 701 && code <= 781) return "mist";
  if (code === 800) return "clear";
  if (code >= 801 && code <= 804) return "clouds";
  const m = (main || "").toLowerCase();
  if (m.includes("thunder")) return "storm";
  if (m.includes("drizzle")) return "drizzle";
  if (m.includes("rain")) return "rain";
  if (m.includes("snow")) return "snow";
  if (m.includes("mist") || m.includes("fog") || m.includes("haze"))
    return "mist";
  if (m.includes("clear")) return "clear";
  if (m.includes("cloud")) return "clouds";
  return "clouds";
}
