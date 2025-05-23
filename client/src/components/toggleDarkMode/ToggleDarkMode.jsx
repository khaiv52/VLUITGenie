import React, { useEffect, useState } from "react";
import BrightnessHighIcon from "@mui/icons-material/BrightnessHigh";
import NightlightIcon from "@mui/icons-material/Nightlight";
import { Padding } from "@mui/icons-material";
import "./toggleDarkMode.css";

function ToggleDarkMode() {
  const [isDark, setIsDark] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);
  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="toggle-btn"
      style={{ padding: "10px" }}
    >
      {isDark ? <BrightnessHighIcon /> : <NightlightIcon />}
    </button>
  );
}   

export default ToggleDarkMode;
