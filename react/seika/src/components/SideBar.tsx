import React from "react";
import "../styles/Sidebar.css";
import ProfileTile, { User } from "./ProfileTile";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { FaPlus } from "react-icons/fa6";
import { useProfile } from "@/contexts/ProfileContext";
import { useAccentColorManager } from "@/contexts/AccentColorContext";
import { useContextMenu } from "@/contexts/ContextMenuContext";

const SideBar = () => {
  const [isShrinkView, setIsShrinkView] = React.useState(true);
  const [isMouseOverSidebar, setIsMouseOverSidebar] = React.useState(false);
  const { isDarkMode, toggleTheme } = useDarkMode();
  const { userName, profilePhoto } = useProfile();
  const { accentColor } = useAccentColorManager();
  const { isAnyMenuOpen } = useContextMenu();

  const handleThemeChange = () => {
    toggleTheme();
  };

  const handleMouseEnter = () => {
    setIsMouseOverSidebar(true);
    setIsShrinkView(false);
  };

  const handleMouseLeave = () => {
    setIsMouseOverSidebar(false);
    // Only allow shrinking if no context menu is open
    if (!isAnyMenuOpen) {
      setIsShrinkView(true);
    }
  };

  // Effect to handle sidebar state when context menus close
  React.useEffect(() => {
    // When all context menus are closed and mouse is not over sidebar, shrink it
    if (!isAnyMenuOpen && !isMouseOverSidebar && !isShrinkView) {
      const timeout = setTimeout(() => {
        // Double-check conditions before shrinking
        if (!isAnyMenuOpen && !isMouseOverSidebar) {
          setIsShrinkView(true);
        }
      }, 100); // Reduced delay for more responsive behavior

      return () => clearTimeout(timeout);
    }
  }, [isAnyMenuOpen, isMouseOverSidebar, isShrinkView]);

  // Additional immediate response effect for when menus close
  React.useEffect(() => {
    // If any menu closes and mouse is not over sidebar, immediately start shrinking process
    if (!isAnyMenuOpen && !isMouseOverSidebar) {
      // Small delay to allow for any mouse movement
      const quickTimeout = setTimeout(() => {
        if (!isAnyMenuOpen && !isMouseOverSidebar) {
          setIsShrinkView(true);
        }
      }, 50);

      return () => clearTimeout(quickTimeout);
    }
  }, [isAnyMenuOpen]);

  const mainUser = {
    id: "0",
    name: userName || "You",
    avatar: profilePhoto || "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_1.png",
    activityTime: "4 hrs 22 mins",
    isOnline: true,
    altText: userName || "Your Profile"
  }
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
      isOnline: false,
      altText: "Aadil Sengupta"
    }
  ];

  // const handleSidebarView = () => {
  //   setIsShrinkView(!isShrinkView);
  // };

  return (
    <div className={`sidebar-container ${isShrinkView ? "shrink" : ""} z-10`} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
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
          <div className={`relative  transition-all duration-500 ease-in-out flex ${isShrinkView ? 'h-0 mb-0' : 'h-10 mb-6 ml-4'}`}>
            <h2 className={`absolute top-0 left-0 w-full text-xl font-bold transition-all duration-500 ease-in-out transform text-accent ${
              isShrinkView 
                ? 'opacity-0 translate-y-[-100%] scale-95' 
                : 'opacity-100 translate-y-0 scale-100'
            }`}>
              Friends
            </h2>
            <div className={`absolute top-0 right-0 h-full mr-6 transition-all duration-500 ease-in-out transform ${
              isShrinkView 
                ? 'opacity-0 scale-95 translate-y-[-100%]' 
                : 'opacity-100 scale-100 translate-y-0'
            }`}>
              <button 
                className={`
                  sidebar-addButton group relative overflow-hidden
                  w-8 h-8 rounded-xl
                  backdrop-blur-sm transition-all duration-300 ease-out
                  hover:scale-110 hover:shadow-lg active:scale-95
                  flex items-center justify-center
                  border border-accent/20 hover:border-accent/40
                  ${isDarkMode 
                    ? "bg-accent/10 hover:bg-accent/20" 
                    : "bg-accent/10 hover:bg-accent/20"
                  }
                `} 
                title="Add Friend"
                style={{
                  boxShadow: `0 4px 12px ${accentColor}20`,
                }}
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${accentColor}30, transparent)`
                  }}
                />
                <FaPlus 
                  size={14} 
                  className="relative z-10 transition-all duration-300 text-accent group-hover:scale-110" 
                />
              </button>
            </div>
          </div>
          {users.map(user => (
            <ProfileTile key={user.id} user={user} accentColor={accentColor} />
          ))}
          </div>
          <div>
          <ProfileTile user={mainUser} accentColor={accentColor} />
          {/* <div className="sidebar-themeContainer mt-2">
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
        </div> */}
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default SideBar;
