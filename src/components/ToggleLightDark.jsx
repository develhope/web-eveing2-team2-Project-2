/**
 * Interruttore tema (sole/luna con nuvole/stelle).
 * Riceve `isDark` e callback `toggleMode`.
 */
const ToggleLightDark = ({ isDark, toggleMode }) => {
  return (
    <div
      className={`toggle ${isDark ? "dark" : ""}`}
      onClick={toggleMode}
      title={isDark ? "Modalità Chiara" : "Modalità Scura"}
      role="button"
      aria-label="Cambia tema"
    >
      <div className="sky"></div>
      <div className="clouds"></div>
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="circle"></div>
    </div>
  );
};

export default ToggleLightDark;
