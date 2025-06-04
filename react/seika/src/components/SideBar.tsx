import React from "react";
import "../styles/Sidebar.css";
import { useDarkMode } from "../contexts/DarkModeContext";

const SideBar = () => {
  const [isShrinkView, setIsShrinkView] = React.useState(true);
  const { isDarkMode, toggleTheme } = useDarkMode();

  // const handleSidebarView = () => {
  //   setIsShrinkView(!isShrinkView);
  // };

  return (
    <div className={`sidebar-container${isShrinkView ? " shrink" : ""} z-10`} onMouseEnter={() => setIsShrinkView(false)} onMouseLeave={() => setIsShrinkView(true)}>
      {/* <button
        className="sidebar-viewButton"
        type="button"
        aria-label={isShrinkView ? "Expand Sidebar" : "Shrink Sidebar"}
        title={isShrinkView ? "Expand" : "Shrink"}
        onClick={handleSidebarView}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="feather feather-chevron-left"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button> */}
      <div className="sidebar-wrapper">
        <div className="sidebar-themeContainer">
          <label
            htmlFor="theme-toggle"
            className={`sidebar-themeLabel${isDarkMode ? " switched" : ""}`}
          >
            <input
              className="sidebar-themeInput"
              type="checkbox"
              id="theme-toggle"
              checked={isDarkMode}
              onChange={toggleTheme}
            />
            <div className="sidebar-themeType light">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="sidebar-listIcon"
              >
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
              <span className="sidebar-themeInputText">Light</span>
            </div>
            <div className="sidebar-themeType dark">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="sidebar-listIcon"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              <span className="sidebar-themeInputText">Dark</span>
            </div>
          </label>
        </div>
        <div className="sidebar-list">
          <div className="sidebar-profileSection" style={{ marginTop: "16px" }} >
          <img
            src="https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_6.png"
            width="40"
            height="40"
            alt="Aadil Sengupta"
          />
          <div style={{ marginLeft: "8px" }}>
          <span>Thomas</span>
          <p className="text-gray-500 text-sm m-[-2]" >7 hrs 18 mins</p>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div className="bg-gray-600 w-3 h-3 rounded-full" ></div>
            <p className="text-gray-600 text-sm mt-[0.9]" >Offline</p>
          </div>
          </div>
        </div>

          <div className="sidebar-profileSection" style={{ marginTop: "6px" }}>
          <img
            src="https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_7.png"
            width="40"
            height="40"
            alt="Aadil Sengupta"
          />
          <div style={{ marginLeft: "8px" }}>
          <span>Aadil Sengupta</span>
          <p className="text-gray-500 text-sm m-[-2]" >4 hrs 22 mins</p>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div className="bg-green-600 w-3 h-3 rounded-full" ></div>
            <p className="text-green-600 text-sm mt-[0.9]" >Online</p>
          </div>
          </div>
        </div>

      </div>
        
        <div className="sidebar-profileSection">
          <img
            src="https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_3.png"
            width="40"
            height="40"
            alt="Aadil Sengupta"
          />
          <div style={{ marginLeft: "8px" }}>
          <span>Aadil Sengupta</span>
          <p className="text-gray-500 text-sm m-[-2]" >4 hrs 22 mins</p>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div className="bg-green-600 w-3 h-3 rounded-full" ></div>
            <p className="text-green-600 text-sm mt-[0.9]" >Online</p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
