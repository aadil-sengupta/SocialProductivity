import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useContextMenu } from '@/contexts/ContextMenuContext';
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

interface ContextMenuPosition {
  x: number;
  y: number;
}
const ProfileTile: React.FC<ProfileTileProps> = ({ user, accentColor }) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<ContextMenuPosition>({ x: 0, y: 0 });
  const [isMouseOverMenu, setIsMouseOverMenu] = useState(false);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const profileTileRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { setIsAnyMenuOpen } = useContextMenu();


  // Update global context menu state when local state changes
  useEffect(() => {
    setIsAnyMenuOpen(showContextMenu);
    
    // Cleanup when component unmounts
    return () => {
      if (showContextMenu) {
        setIsAnyMenuOpen(false);
      }
    };
  }, [showContextMenu, setIsAnyMenuOpen]);

  const handleMenuButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (showContextMenu) {
      setShowContextMenu(false);
      // Immediately update global state to ensure sidebar responds quickly
      setIsAnyMenuOpen(false);
      return;
    }
    
    const rect = profileTileRef.current?.getBoundingClientRect();
    if (rect) {
      const menuWidth = 200;
      const menuHeight = 250;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Position menu closer to the menu button
      const offsetX = 4;
      const offsetY = 0;
      
      // Check if sidebar is in shrink mode
      const sidebarContainer = document.querySelector('.sidebar-container');
      const isSidebarShrunk = sidebarContainer?.classList.contains('shrink') ?? false;
      
      // Position menu relative to the button
      const shouldPositionLeft = rect.right + menuWidth + offsetX > viewportWidth;
      const shouldPositionAbove = rect.bottom + menuHeight > viewportHeight;
      
      let x, y;
      
      if (isSidebarShrunk) {
        // In shrink mode, position to the right of the tile
        x = rect.right + offsetX;
        y = rect.top + offsetY;
      } else {
        // In expanded mode
        if (shouldPositionLeft) {
          x = rect.left - menuWidth - offsetX;
        } else {
          x = rect.right + offsetX;
        }
        
        y = shouldPositionAbove 
          ? rect.bottom - menuHeight 
          : rect.top + offsetY;
      }
      
      // Ensure menu stays within viewport
      x = Math.min(Math.max(8, x), viewportWidth - menuWidth - 8);
      y = Math.min(Math.max(8, y), viewportHeight - menuHeight - 8);
      
      setContextMenuPosition({ x, y });
    }
    
    setShowContextMenu(true);
  };

  const handleMenuMouseEnter = () => {
    setIsMouseOverMenu(true);
    // Clear any pending close timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleMenuMouseLeave = () => {
    setIsMouseOverMenu(false);
    // Delay closing to allow user to move back to sidebar
    closeTimeoutRef.current = setTimeout(() => {
      setShowContextMenu(false);
      // Immediately update global state to ensure sidebar responds quickly
      setIsAnyMenuOpen(false);
    }, 200);
  };

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as Node;
    
    // Don't close if clicking on the context menu itself
    if (contextMenuRef.current && contextMenuRef.current.contains(target)) {
      return;
    }
    
    // Don't close if clicking on the profile tile that opened the menu
    if (profileTileRef.current && profileTileRef.current.contains(target)) {
      return;
    }
    
    // Close the menu for any other click
    setShowContextMenu(false);
    // Immediately update global state to ensure sidebar responds quickly
    setIsAnyMenuOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowContextMenu(false);
      // Immediately update global state to ensure sidebar responds quickly
      setIsAnyMenuOpen(false);
    }
  };

  const handleMenuItemClick = (action: string) => {
    setShowContextMenu(false);
    setIsAnyMenuOpen(false); // Explicitly set global state
    // Handle different actions here - you can add callbacks or emit events
    console.log(`Action: ${action} for user: ${user.name}`);
    
    // Example action handling
    switch (action) {
      case 'view-profile':
        // Navigate to profile or open profile modal
        break;
      case 'send-message':
        // Open chat/message interface
        break;
      case 'start-call':
        // Initiate video call
        break;
      case 'mute-notifications':
        // Toggle notification settings
        break;
      case 'remove-friend':
        // Show confirmation dialog and remove friend
        break;
    }
  };

  useEffect(() => {
    if (showContextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      
      // Watch for sidebar shrink/expand changes but don't auto-close if menu is being used
      const sidebarContainer = document.querySelector('.sidebar-container');
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const target = mutation.target as Element;
            if (target.classList.contains('shrink') && !isMouseOverMenu) {
              // Only close if mouse is not over the menu
              setShowContextMenu(false);
              // Immediately update global state to ensure sidebar responds quickly
              setIsAnyMenuOpen(false);
            }
          }
        });
      });
      
      if (sidebarContainer) {
        observer.observe(sidebarContainer, {
          attributes: true,
          attributeFilter: ['class']
        });
      }
      
      // Handle mouse leave on sidebar container with delay
      const handleSidebarMouseLeave = () => {
        // Only close if mouse is not over the menu
        if (!isMouseOverMenu) {
          closeTimeoutRef.current = setTimeout(() => {
            if (!isMouseOverMenu) {
              setShowContextMenu(false);
              // Immediately update global state to ensure sidebar responds quickly
              setIsAnyMenuOpen(false);
            }
          }, 300); // Longer delay for better UX
        }
      };
      
      if (sidebarContainer) {
        sidebarContainer.addEventListener('mouseleave', handleSidebarMouseLeave);
      }
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
        observer.disconnect();
        if (sidebarContainer) {
          sidebarContainer.removeEventListener('mouseleave', handleSidebarMouseLeave);
        }
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
        }
      };
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, [showContextMenu, isMouseOverMenu]);
  return (
    <>
      <div 
        ref={profileTileRef}
        className={`sidebar-profileSection bg-transparent profile-tile ${showContextMenu ? 'context-menu-open' : ''}`}
        onContextMenu={handleMenuButtonClick}
        style={{ 
          marginTop: "6px",
          '--accent-glow': accentColor ? `${accentColor}40` : 'rgba(255, 255, 255, 0.1)',
          '--accent-color': accentColor || '#3b82f6'
        } as React.CSSProperties & { '--accent-glow': string; '--accent-color': string }}
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
        
        {/* Menu Button */}
        <button 
          className="profile-menu-button"
          onClick={handleMenuButtonClick}
          title="More options"
          style={{
            '--accent-color': accentColor || '#3b82f6'
          } as React.CSSProperties & { '--accent-color': string }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="profile-menu-icon">
            <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </button>
      </div>

      {/* Context Menu - Rendered as Portal */}
      {showContextMenu && createPortal(
        <div
          ref={contextMenuRef}
          className="profile-context-menu"
          onMouseEnter={handleMenuMouseEnter}
          onMouseLeave={handleMenuMouseLeave}
          style={{
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
            '--accent-color': accentColor || '#3b82f6'
          } as React.CSSProperties & { '--accent-color': string }}
        >
          <div className="context-menu-item" onClick={() => handleMenuItemClick('view-profile')}>
            <svg className="context-menu-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <span>View Profile</span>
          </div>
          
          <div className="context-menu-item" onClick={() => handleMenuItemClick('send-message')}>
            <svg className="context-menu-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
            <span>Send Message</span>
          </div>

          <div className="context-menu-item" onClick={() => handleMenuItemClick('start-call')}>
            <svg className="context-menu-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 12h2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2V12zM4 12h2v8H4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1z"/>
              <path d="M17 2a3 3 0 0 1 3 3v5H4V5a3 3 0 0 1 3-3h10z"/>
            </svg>
            <span>Start Video Call</span>
          </div>

          <div className="context-menu-divider"></div>

          <div className="context-menu-item" onClick={() => handleMenuItemClick('mute-notifications')}>
            <svg className="context-menu-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 8v8H8V8h8m2-2H6v12h12V6z"/>
              <path d="M12 2a4 4 0 0 1 4 4H8a4 4 0 0 1 4-4z"/>
            </svg>
            <span>Mute Notifications</span>
          </div>

          <div className="context-menu-item danger" onClick={() => handleMenuItemClick('remove-friend')}>
            <svg className="context-menu-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14.12 10.47L12 12.59l-2.13-2.12-1.41 1.41L10.59 14l-2.12 2.12 1.41 1.41L12 15.41l2.12 2.12 1.41-1.41L13.41 14l2.12-2.12-1.41-1.41zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
            <span>Remove Friend</span>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ProfileTile;
