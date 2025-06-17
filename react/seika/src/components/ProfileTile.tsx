import React from 'react';
import './ProfileTile.css';

export interface User {
  id: string;
  name: string;
  avatar: string;
  activityTime: string;
  isOnline: boolean;
  altText?: string;
}

interface ProfileTileProps {
  user: User;
  accentColor?: string;
}

const ProfileTile: React.FC<ProfileTileProps> = ({ user, accentColor }) => {
  return (
    <div 
      className="sidebar-profileSection bg-transparent profile-tile" 
      style={{ 
        marginTop: "6px",
        '--accent-glow': accentColor ? `${accentColor}40` : 'rgba(255, 255, 255, 0.1)'
      } as React.CSSProperties & { '--accent-glow': string }}
    >
      <div className="profile-image-container">
        <img
          src={user.avatar}
          alt={user.altText || user.name}
          className="profile-image"
        />
        <div
          className={`profile-status-bubble ${
            user.isOnline ? "online" : "offline"
          }`}
          title={user.isOnline ? "Online" : "Offline"}
        ></div>
      </div>
      <div className="profile-info">
        <span className="profile-name">{user.name}</span>
        <p className="profile-activity">{user.activityTime}</p>
        <p className={`profile-status ${user.isOnline ? "online" : "offline"}`}>
          {user.isOnline ? "Online" : "Offline"}
        </p>
      </div>
    </div>
  );
};

export default ProfileTile;
