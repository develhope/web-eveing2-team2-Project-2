import "../styles/WeatherCard.css";
import sunriseSunsetIcon from "../assets/sorge-tramonta.png";
import IconWeather from "./IconWeather";

function WeatherCard({ weather, city, timezone }) {
  if (!weather) return null;

  const sunrise = new Date(weather.sunrise).toLocaleTimeString("it-IT", { timeZone: timezone, hour: "2-digit", minute: "2-digit"});
  const sunset = new Date(weather.sunset).toLocaleTimeString("it-IT", { timeZone: timezone, hour: "2-digit", minute: "2-digit" });

  // Valutazione qualitativa AQI
  const getAQILevel = (aqi) => {
  if (aqi <= 20) return { label: "Ottima" };
  if (aqi <= 40) return { label: "Buona" };
  if (aqi <= 60) return { label: "Discreta" };
  if (aqi <= 80) return { label: "Scarsa" };
  return { label: "Cattiva" };
  };

  const aqiValue = weather.air_quality?.european_aqi;
  const aqiInfo = aqiValue !== undefined ? getAQILevel(aqiValue) : null;

  return (
    <div className="weather-container">
      <div className="weather-card">
        <div className="weather-top">
          <div className="weather-info-left">
            <div className="text-[16px] font-semibold leading-tight">
            Adesso &mdash;
            </div>
            <h2>{city}</h2>
            <div className="weather-temp">{weather.temperature_2m}°C</div>
            <p className="weather-status">{weather.description}</p>
          </div>

          <div className="weather-icon-center">
            <IconWeather type={weather.iconType} className="weather-main-icon w-10 h-10 weather-icon icon-glow" />
          </div>

          <div className="weather-sun-right">
            <img src={sunriseSunsetIcon} alt="Alba e tramonto" className="sun-icon" />
            <div className="sun-times">
              <span className="sun-time">{sunrise}</span>
              <span className="sun-time">{sunset}</span>
            </div>
          </div>
        </div>

        <div className="weather-details">
          <div><i className="fa-solid fa-temperature-three-quarters"></i>{weather.apparent_temperature}°C Percepita</div>
          <div><i className="fa-solid fa-droplet"></i>{weather.relative_humidity_2m}% Umidità</div>
          <div><i className="fa-solid fa-cloud-rain"></i> {Math.round(weather.precipitation_probability)}% Probabilità Precipitazioni</div>
          <div><i className="fa-solid fa-wind"></i>{Math.round(weather.wind_speed_10m)} km/h Vento</div>
          <div><i className="fa-solid fa-gauge-high"></i>{weather.surface_pressure ? Math.round(weather.surface_pressure) : "—"} hPa Pressione Atmosferica</div>
          <div><i className="fa-solid fa-cloud-showers-heavy"></i> {weather.precipitation} mm Quantità Precipitazioni</div>
          <div><i className="fa-solid fa-cloud"></i> {weather.cloudcover}% Nuvolosità</div>
          <div><i className="fa-solid fa-circle-half-stroke"></i> {weather.uv_index} Indice UV</div>
          <div><i className="fa-solid fa-compass"></i> {weather.wind_direction_10m}° Direzione vento</div>
          <div>
            <i className="fa-solid fa-leaf"></i>{" "}Qualità dell’aria:{" "}{aqiValue !== undefined ? `${aqiValue} (${aqiInfo.label})` : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeatherCard;




