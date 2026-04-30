'use client';

import { formatDistanceToNow } from 'date-fns';
import { Megaphone, AlertCircle, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { markAsRead } from '@/app/notifications/actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface NotificationListProps {
  notifications: any[];
}

export function NotificationList({ notifications }: NotificationListProps) {
  const router = useRouter();

  const handleMarkRead = async (id: string) => {
    try {
      const res = await markAsRead(id);
      if (res.success) {
        toast.success('Notification marked as read');
        router.refresh();
      }
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {notifications.map((notif) => (
        <div 
          key={notif.id} 
          className={`p-6 bg-white rounded-[2rem] shadow-premium border ${
            notif.isRead ? 'border-gray-50 opacity-75' : 'border-primary/10 bg-primary/5'
          } flex items-start gap-6 transition-all hover:scale-[1.01] group relative`}
        >
          {/* Status icon button */}
          <button 
            onClick={() => !notif.isRead && handleMarkRead(notif.id)}
            disabled={notif.isRead}
            className={`p-3 rounded-2xl transition-all ${
              notif.isRead 
                ? 'bg-gray-50 text-teal-500' 
                : 'bg-white text-primary shadow-sm hover:scale-110 active:scale-95'
            }`}
            title={notif.isRead ? 'Already read' : 'Mark as read'}
          >
            {notif.isRead ? (
              <CheckCircle2 size={18} className="text-teal-500" />
            ) : (
              notif.type === 'ANNOUNCEMENT' ? <Megaphone size={18} /> : 
              notif.type === 'ALERT' ? <AlertCircle size={18} /> : 
              <CheckCircle2 size={18} />
            )}
          </button>
          
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-black uppercase tracking-tight ${notif.isRead ? 'text-slate-500' : 'text-black'}`}>
                {notif.title || 'Notification'}
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Clock size={12} /> {formatDistanceToNow(new Date(notif.createdAt))} ago
                </span>
              </div>
            </div>
            <p className={`text-xs font-medium leading-relaxed ${notif.isRead ? 'text-slate-400' : 'text-slate-600'}`}>
              {notif.message}
            </p>
          </div>

          {/* Quick Mark as Read button on hover */}
          {!notif.isRead && (
            <button 
              onClick={() => handleMarkRead(notif.id)}
              className="absolute right-6 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-[9px] font-bold uppercase tracking-widest rounded-lg shadow-lg"
            >
              Mark Read
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
