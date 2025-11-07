export function itLabelFromType(type) {
  const t = (type || "").toLowerCase();
  if (t.includes("thunder")) return "Temporale";
  if (t.includes("drizzle")) return "Pioggerellina";
  if (t.includes("rain"))    return "Pioggia";
  if (t.includes("snow"))    return "Neve";
  if (t.includes("mist") || t.includes("fog") || t.includes("haze")) return "Nebbia";
  if (t.includes("clear"))   return "Sereno";
  if (t.includes("cloud"))   return "Nuvoloso";
  return "Nuvoloso";
}
