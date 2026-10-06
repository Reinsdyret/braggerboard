import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@kilden/designsystem";
import "./styles.css";
import "./halloween.css";
import { ToastProvider } from "./components/ui/ToastProvider.jsx";
import Home from "./Home.jsx";
import HalloweenSky from "./components/HalloweenSky.jsx";
import LeaderboardPage from "./LeaderboardPage.jsx";
import { activeHolidayTheme } from "./utils/holidayTheme.js";

// Holiday themes are dark-only: ild-dark supplies the full dark token set regardless of the OS
// setting, and the holiday stylesheet overrides the colors on top of it.
if (activeHolidayTheme) {
  document.documentElement.dataset.theme = "ild-dark";
  document.documentElement.dataset.holiday = activeHolidayTheme;
}

const App = () => {
  return (
    <TooltipProvider>
      <ToastProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/l/:leaderboardId" element={<LeaderboardPage />} />
          </Routes>
        </HashRouter>
        {activeHolidayTheme === "halloween" && <HalloweenSky />}
      </ToastProvider>
    </TooltipProvider>
  );
};

ReactDOM.createRoot(document.getElementById("app")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
