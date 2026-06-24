'use client';

import { useEffect, useState } from 'react';
import { Bell, CheckCircle, XCircle, AlertCircle, FileText, Clock } from 'lucide-react';

type Notification = {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
};

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: FileText,
};

const colorMap = {
  success: { bg: 'bg-[#0e6251]/10', text: 'text-[#0e6251]', border: 'border-[#0e6251]' },
  error: { bg: 'bg-[#c0392b]/10', text: 'text-[#c0392b]', border: 'border-[#c0392b]' },
  warning: { bg: 'bg-[#f39c12]/10', text: 'text-[#f39c12]', border: 'border-[#f39c12]' },
  info: { bg: 'bg-[#2e86c1]/10', text: 'text-[#2e86c1]', border: 'border-[#2e86c1]' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/notifications', { 
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
    })
      .then(res => res.json())
      .then(data => setNotifications(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const markAsRead = (id: number) => {
    fetch(`/api/v1/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(() => {
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    });
  };

  const filtered = filter === 'all' ? notifications : notifications.filter(n => !n.read);
  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5b2c6f]" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#5b2c6f]/10 rounded-xl">
            <Bell className="w-6 h-6 text-[#5b2c6f]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Notifications</h1>
            <p className="text-sm text-gray-500 mt-1">{unreadCount} unread messages</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFilter('all')} 
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === 'all' ? 'bg-[#5b2c6f] text-white' : 'bg-gray-100 text-gray-600'
            }`}>
            All
          </button>
          <button onClick={() => setFilter('unread')} 
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === 'unread' ? 'bg-[#5b2c6f] text-white' : 'bg-gray-100 text-gray-600'
            }`}>
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="clay-card p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No notifications</p>
          <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((notif) => {
            const Icon = iconMap[notif.type];
            const colors = colorMap[notif.type];
            
            return (
              <div key={notif.id} 
                className={`clay-card p-5 border-l-4 ${colors.border} transition-all ${
                  !notif.read ? 'bg-white' : 'bg-gray-50'
                }`}>
                <div className="flex items-start gap-4">
                  <div className={`p-2 ${colors.bg} rounded-lg flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className={`font-semibold ${!notif.read ? 'text-gray-800' : 'text-gray-600'}`}>
                        {notif.title}
                      </h3>
                      {!notif.read && (
                        <span className="w-2 h-2 bg-[#5b2c6f] rounded-full flex-shrink-0 mt-2"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(notif.timestamp).toLocaleString()}
                      </p>
                      {!notif.read && (
                        <button onClick={() => markAsRead(notif.id)}
                          className="text-xs text-[#5b2c6f] hover:underline font-medium">
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
