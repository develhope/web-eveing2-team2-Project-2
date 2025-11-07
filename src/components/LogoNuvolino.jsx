import React from "react";
import logoMark from "../assets/nuvolino-cloud.png";

/* Icona sopra + scritta */
export default function LogoNuvolino({ size = 80, textSize = "md", className = "" }) {
  const tClass =
    textSize === "lg"
      ? "brand-logo brand-logo--subtitle-lg"
      : textSize === "sm"
      ? "brand-logo brand-logo--subtitle-sm"
      : "brand-logo brand-logo--subtitle";

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <img
        src={logoMark}
        alt="Nuvolino"
        width={size}
        height={size}
        className="block"
        draggable="false"
      />
      <span className={`${tClass} mt-1`}>Nuvolino</span>
    </div>
  );
}
