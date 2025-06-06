import React from "react";
import "../styles/Sidebar.css";
import ProfileTile, { User } from "./ProfileTile";
import { useDarkMode } from "@/contexts/DarkModeContext";

const SideBar = () => {
  const [isShrinkView, setIsShrinkView] = React.useState(true);
  const { isDarkMode, toggleTheme } = useDarkMode();

  const handleThemeChange = () => {
    toggleTheme();
  };

  // Sample user data - in a real app, this would come from props or context
  const users: User[] = [
    {
      id: "1",
      name: "Aadil Sengupta",
      avatar: "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_6.png",
      activityTime: "4 hrs 22 mins",
      isOnline: true,
      altText: "Aadil Sengupta"
    },
    {
      id: "2",
      name: "Aadil Sengupta",
      avatar: "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_7.png",
      activityTime: "4 hrs 22 mins",
      isOnline: true,
      altText: "Aadil Sengupta"
    },
    {
      id: "3",
      name: "Aadil Sengupta",
      avatar: "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_3.png",
      activityTime: "4 hrs 22 mins",
      isOnline: true,
      altText: "Aadil Sengupta"
    }
  ];

  // const handleSidebarView = () => {
  //   setIsShrinkView(!isShrinkView);
  // };

  return (
    <div className={`sidebar-container ${isShrinkView ? "shrink" : ""} z-10`} onMouseEnter={() => setIsShrinkView(false)} onMouseLeave={() => setIsShrinkView(true)}>
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
        <div className="sidebar-list flex flex-col justify-between h-full">
          <div>
          {users.map(user => (
            <ProfileTile key={user.id} user={user} />
          ))}
          </div>
          <div>
          <ProfileTile user={users[0]} />
          <div className="sidebar-themeContainer mr-[7.5px] mt-2">
          <label
            htmlFor="theme-toggle"
            className={`sidebar-themeLabel${isDarkMode ? " switched" : ""}`}
          >
            <input
              className="sidebar-themeInput"
              type="checkbox"
              id="theme-toggle"
              onChange={handleThemeChange}
            />
            <div className="sidebar-themeType light">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
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
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="sidebar-listIcon"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              <span className="sidebar-themeInputText">Dark</span>
            </div>
          </label>
        </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default SideBar;
