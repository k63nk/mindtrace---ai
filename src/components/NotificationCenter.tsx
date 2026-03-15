
import React, { useState, useRef, useEffect } from 'react';
import { Notification } from '@/types';
import { backend } from '@/services/backendService';

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications, onMarkAsRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleRead = (id: string) => {
    onMarkAsRead(id);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleToggle}
        className="p-2 text-slate-400 hover:bg-slate-800 rounded-full relative transition-colors"
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 size-4 bg-red-500 rounded-full border-2 border-[#0a0f14] text-[8px] font-black flex items-center justify-center text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#111821] border border-slate-800 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
            <h4 className="text-xs font-black text-white uppercase tracking-widest">Thông báo</h4>
            <span className="text-[10px] font-bold text-[#1392ec]">{unreadCount} tin mới</span>
          </div>
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-xs text-slate-500 font-medium italic">Không có thông báo nào</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  onClick={() => handleRead(n.id)}
                  className={`p-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer relative ${!n.isRead ? 'bg-[#1392ec]/5' : ''}`}
                >
                  {!n.isRead && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#1392ec] rounded-full"></div>}
                  <div className="flex flex-col gap-1">
                    <h5 className={`text-xs font-bold ${!n.isRead ? 'text-white' : 'text-slate-400'}`}>{n.title}</h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{n.message}</p>
                    <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider mt-1">{n.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-3 text-center bg-slate-900/30">
            <button className="text-[10px] font-black text-[#1392ec] uppercase tracking-widest hover:underline">Xem tất cả thông báo</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
