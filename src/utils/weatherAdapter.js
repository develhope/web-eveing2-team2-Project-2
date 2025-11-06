/*L’adattatore prende weathercode (OpenMeteo) e pop (probabilità precipitazione, 0..1) e 
restituisce un owId (un codice representative fra quelli OpenWeather)
Converte OpenMeteo -> valori compatibili con mapOWToIcon (OpenWeather)*/

export function mapOMToOWMStyle(code, pop = 0) {
  const id = Number(code);

  // 🌧️ Gestione probabilità di pioggia
  if (pop >= 0.5) return { icon: "rain", description: "Probabile pioggia" };
  if (pop >= 0.2)
    return { icon: "drizzle", description: "Possibile pioggerella" };

  if (id === 0) return { icon: "clear", description: "Sereno" };
  if (id === 1) return { icon: "clear", description: "Prevalentemente sereno" };
  if (id === 2) return { icon: "clouds", description: "Parzialmente nuvoloso" };
  if (id === 3) return { icon: "clouds", description: "Coperto" };
  if ([45, 48].includes(id))
    return { icon: "mist", description: "Nebbia o foschia" };
  if ([51, 53, 55].includes(id))
    return { icon: "drizzle", description: "Pioggerella" };
  if ([56, 57].includes(id))
    return { icon: "drizzle", description: "Pioggerella gelata" };
  if ([61, 63, 65].includes(id))
    return { icon: "rain", description: "Pioggia" };
  if ([66, 67].includes(id))
    return { icon: "rain", description: "Pioggia gelata" };
  if ([71, 73, 75, 77].includes(id))
    return { icon: "snow", description: "Neve" };
  if ([80, 81, 82].includes(id))
    return { icon: "rain", description: "Rovesci" };
  if ([85, 86].includes(id))
    return { icon: "snow", description: "Rovesci di neve" };
  if ([95, 96, 99].includes(id))
    return { icon: "storm", description: "Temporale" };

  return { icon: "clouds", description: "Variabile" };
}
