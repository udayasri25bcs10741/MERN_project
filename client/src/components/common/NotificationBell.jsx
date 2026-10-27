import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { notificationApi } from '../../api/notificationApi';
import { formatDateTime } from '../../utils/formatDate';
import { useAuth } from '../../context/AuthContext';

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationApi.getNotifications({ limit: 5 });
      setNotifications(res.data?.notifications || []);
      setUnreadCount(res.data?.unreadCount || 0);
    } catch (err) {
      // Quiet fail on notifications poll
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 45000); // 45s poll
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-surface-600 hover:text-surface-900 hover:bg-surface-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-xl border border-surface-200 py-3 z-50 animate-fade-in">
          <div className="flex items-center justify-between px-4 pb-2 border-b border-surface-100">
            <h4 className="text-sm font-bold text-surface-900">Notifications</h4>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-surface-100">
            {notifications.length === 0 ? (
              <p className="text-xs text-surface-400 text-center py-6">
                No notifications yet
              </p>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  className={`p-3.5 hover:bg-surface-50 transition-colors flex items-start gap-3 ${
                    !item.isRead ? 'bg-primary-50/30' : ''
                  }`}
                >
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-surface-900">{item.title}</p>
                    <p className="text-xs text-surface-600 mt-0.5">{item.message}</p>
                    <span className="text-[10px] text-surface-400 mt-1 block">
                      {formatDateTime(item.createdAt)}
                    </span>
                  </div>
                  {!item.isRead && (
                    <button
                      onClick={(e) => handleMarkAsRead(item._id, e)}
                      title="Mark as read"
                      className="text-surface-400 hover:text-primary-600 p-1"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
