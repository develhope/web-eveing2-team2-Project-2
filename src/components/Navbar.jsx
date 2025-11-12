import { useState, useEffect } from "react";
import { DateTime } from "luxon";
import logo from "../assets/logo.svg";
import logoDark from "../assets/logo-dark.svg";
import ToggleLightDark from "./ToggleLightDark";
import SearchBar from "./SearchBar";

function Navbar({ timezone, onSearch, onUseGps }) {
  const [localTime, setLocalTime] = useState("");
  const [isDark, setIsDark] = useState(false);

  // ripristina tema salvato e applica classe a <body>
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const dark = saved === "dark";
    setIsDark(dark);
    document.body.classList.toggle("dark-mode", dark);
  }, []);

  // aggiorna orario locale
  useEffect(() => {
    if (!timezone) return;
    const tick = () => {
      const now = DateTime.now().setZone(timezone).setLocale("it").toFormat("EEEE d LLLL, HH:mm");
      setLocalTime(now);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timezone]);

  const toggleMode = () => {
    const next = !isDark;
    setIsDark(next);
    document.body.classList.toggle("dark-mode", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* sinistra: logo */}
        <div className="navbar-left">
          <img src={isDark ? logoDark : logo} alt="Nuvolino" className="navbar-logo" />
        </div>

        {/* centro: barra ricerca + gps */}
        <div className="navbar-center">
          <SearchBar onSearch={onSearch} onUseGps={onUseGps} />
        </div>

        {/* destra: ora + toggle */}
        <div className="navbar-right">
          <p className="navbar-clock" style={{ textTransform: "capitalize" }}>{localTime}</p>
          <ToggleLightDark isDark={isDark} toggleMode={toggleMode} />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
