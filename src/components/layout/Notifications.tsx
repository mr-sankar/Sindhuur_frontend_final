// components/Notifications.jsx or Notifications.tsx
import { useState } from "react";
import {
  Bell,
  MessageCircle,
  Heart,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const Notifications = () => {
  const [notifications] = useState([
    {
      id: 1,
      title: "New Interest Received",
      message: "Priya S. has shown interest in your profile.",
      icon: <Heart className="w-4 h-4 text-pink-600" />,
      time: "2m ago",
    },
    {
      id: 2,
      title: "New Message",
      message: "You have a new message from Kavya.",
      icon: <MessageCircle className="w-4 h-4 text-blue-600" />,
      time: "10m ago",
    },
    {
      id: 3,
      title: "Event Reminder",
      message: "Matrimony meet-up starts in 30 minutes.",
      icon: <AlertTriangle className="w-4 h-4 text-yellow-600" />,
      time: "1h ago",
    },
    {
      id: 4,
      title: "Profile Approved",
      message: "Your profile was approved by the admin.",
      icon: <CheckCircle className="w-4 h-4 text-green-600" />,
      time: "2d ago",
    },
  ]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative p-2 rounded-full hover:bg-yellow-100">
          <Bell className="w-5 h-5 text-gray-700" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {notifications.length}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0 border-yellow-200 shadow-xl">
        <div className="bg-yellow-50 px-4 py-2 border-b border-yellow-200">
          <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
        </div>
        <ul className="max-h-72 overflow-y-auto divide-y divide-yellow-100">
          {notifications.map((notif) => (
            <li key={notif.id} className="px-4 py-3 flex items-start gap-3 hover:bg-yellow-100 transition">
              <div className="mt-1">{notif.icon}</div>
              <div className="text-sm text-gray-700">
                <p className="font-medium">{notif.title}</p>
                <p className="text-xs text-gray-600">{notif.message}</p>
                <span className="text-[11px] text-gray-400">{notif.time}</span>
              </div>
            </li>
          ))}
        </ul>
        <div className="px-4 py-2 text-center">
          <Button variant="link" className="text-yellow-600 text-sm">
            View All Notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Notifications;
