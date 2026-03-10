import { useState, useEffect } from 'react';
import { DateTime } from "luxon";
import logo from "../assets/logo.svg";
import logoDark from "../assets/logo-dark.svg";
import "../styles/Navbar.css";
import ToggleLightDark from "./ToggleLightDark";

function Navbar({ timezone }) {
  const [localTime, setLocalTime] = useState("");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const dark = savedTheme === "dark";
    setIsDark(dark);
    document.body.classList.toggle("dark-mode", dark);
  }, []);

  const toggleMode = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.body.classList.toggle("dark-mode", newIsDark);
    localStorage.setItem("theme", newIsDark ? "dark" : "light");
  };

  useEffect(() => {
    if (!timezone) return;

    const updateLocalTime = () => {
      const now = DateTime.now()
        .setZone(timezone)
        .setLocale("it")
        .toFormat("EEEE d LLLL, HH:mm");
      setLocalTime(now);
    };

    updateLocalTime();
    const interval = setInterval(updateLocalTime, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
      <div className="navbar-left">
        <img
          src={isDark ? logoDark : logo}
          alt="Nuvolino logo"
          className="navbar-logo"
        />
      </div>

      <div className="navbar-right">
        <p style={{ textTransform: "capitalize" }}>{localTime}</p>
        <ToggleLightDark isDark={isDark} toggleMode={toggleMode} />
      </div>
      </div>
    </nav>
  );
}

export default Navbar;