import React from "react";
import "../styles/Sidebar.css";
import ProfileTile, { User } from "./ProfileTile";
import RadialThemeSwitcher from "./RadialThemeSwitcher";

const SideBar = () => {
  const [isShrinkView, setIsShrinkView] = React.useState(true);

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
          <div className="radial-theme-container">
            <RadialThemeSwitcher />
          </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default SideBar;
