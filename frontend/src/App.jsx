import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@kilden/designsystem";
import "./styles.css";
import { ToastProvider } from "./components/ui/ToastProvider.jsx";
import Home from "./Home.jsx";
import LeaderboardPage from "./LeaderboardPage.jsx";

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
      </ToastProvider>
    </TooltipProvider>
  );
};

ReactDOM.createRoot(document.getElementById("app")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
