import sunriseSunsetIcon from "../assets/sorge-tramonta.png";
import IconWeather from "./IconWeather";

/**
 * Card "Adesso":
 * - A sinistra: città, temperatura, descrizione meteo.
 * - Centro: icona grande.
 * - Destra: alba/tramonto.
 * - Sotto: dettagli extra (percepita, umidità, vento, ecc.)
 */
function WeatherCard({ weather, city, timezone }) {
  if (!weather) return null;

  const sunrise = new Date(weather.sunrise).toLocaleTimeString("it-IT", { timeZone: timezone, hour: "2-digit", minute: "2-digit" });
  const sunset  = new Date(weather.sunset ).toLocaleTimeString("it-IT", { timeZone: timezone, hour: "2-digit", minute: "2-digit" });

  const aqi = weather.air_quality?.european_aqi;
  const aqiLabel =
    aqi === undefined ? "—"
    : aqi <= 20 ? "Ottima"
    : aqi <= 40 ? "Buona"
    : aqi <= 60 ? "Discreta"
    : aqi <= 80 ? "Scarsa"
    : "Cattiva";

  return (
    <div className="weather-container">
      <div className="weather-card">
        <div className="weather-top">
          {/* Sinistra: città e stato */}
          <div className="weather-info-left">
            <div className="text-[16px] font-semibold leading-tight">Adesso —</div>
            <h2>{city}</h2>
            <div className="weather-temp">{Math.round(weather.temperature_2m)}°C</div>
            <p className="weather-status">{weather.description}</p>
          </div>

          {/* Centro: icona meteo (centrata) */}
          <div className="weather-icon-center">
            <IconWeather type={weather.iconType} className="weather-main-icon w-16 h-16 weather-icon icon-glow" />
          </div>

          {/* Destra: alba/tramonto */}
          <div className="weather-sun-right">
            <img src={sunriseSunsetIcon} alt="Alba e tramonto" className="sun-icon" />
            <div className="sun-times">
              <span className="sun-time">{sunrise}</span>
              <span className="sun-time">{sunset}</span>
            </div>
          </div>
        </div>

        {/* Dettagli in griglia */}
        <div className="weather-details">
          <div><i className="fa-solid fa-temperature-three-quarters"></i>{Math.round(weather.apparent_temperature)}°C Percepita</div>
          <div><i className="fa-solid fa-droplet"></i>{weather.relative_humidity_2m}% Umidità</div>
          <div><i className="fa-solid fa-cloud-rain"></i>{Math.round(weather.precipitation_probability)}% Prob. Precipitazioni</div>
          <div><i className="fa-solid fa-wind"></i>{weather.wind_speed_10m != null ? Math.round(weather.wind_speed_10m) : "--"} km/h Vento</div>
          <div><i className="fa-solid fa-gauge-high"></i>{weather.surface_pressure ? Math.round(weather.surface_pressure) : "—"} hPa Pressione</div>
          <div><i className="fa-solid fa-cloud-showers-heavy"></i>{weather.precipitation} mm Precipitazioni</div>
          <div><i className="fa-solid fa-cloud"></i>{weather.cloudcover}% Nuvolosità</div>
          <div><i className="fa-solid fa-circle-half-stroke"></i>{weather.uv_index} Indice UV</div>
          <div><i className="fa-solid fa-compass"></i>{weather.wind_direction_10m}° Direzione vento</div>
          <div><i className="fa-solid fa-leaf"></i>Qualità dell’aria: {aqi !== undefined ? `${aqi} (${aqiLabel})` : "—"}</div>
        </div>
      </div>
    </div>
  );
}

export default WeatherCard;
