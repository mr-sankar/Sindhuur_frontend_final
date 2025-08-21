
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Heart, MessageSquare, Users, Check, Trash2 } from "lucide-react";
import Header from "@/components/Header";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  fromProfileId: string;
  toProfileId: string;
  toUserName: string;
  createdAt: string;
  isRead: boolean;
  _id: string;
}

const iconMap: Record<string, any> = {
  interest: Heart,
  message: MessageSquare,
  match: Users,
  system: Bell,
};

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchNotifications = async () => {
      const profileDataStr = localStorage.getItem("loggedInUser");
      if (!profileDataStr) {
        console.error("No logged in user found in localStorage");
        toast({
          title: "Error",
          description: "No logged in user found. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      const profileData = JSON.parse(profileDataStr);

      try {
        const userId = profileData.profileId;
        console.log(userId);

        const res = await axios.get(
          `http://localhost:5000/api/admin/notifications/${profileData.profileId}`
        );
        setNotifications(res.data);
        console.log(res.data);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
        toast({
          title: "Error",
          description: "Failed to load notifications.",
          variant: "destructive",
        });
      }
    };

    fetchNotifications();
  }, [toast]);

  const markAsRead = async (toProfileId: string, notificationId: string) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/notifications/${toProfileId}/${notificationId}/read`
      );

      // Update UI instantly without waiting for refresh
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      window.location.reload();
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const profileDataStr = localStorage.getItem("loggedInUser");
      if (!profileDataStr) {
        console.error("No logged in user found in localStorage");
        return;
      }

      const profileData = JSON.parse(profileDataStr);

      const res = await axios.put(
        `http://localhost:5000/api/admin/notifications/${profileData.profileId}/read-all`
      );

      console.log("Backend response:", res.data);

      // Update UI instantly
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      window.location.reload();
    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
    }
  };

  const deleteNotification = async (
    toProfileId: string,
    notificationId: string
  ) => {
    console.log(notificationId);

    try {
      await axios.delete(
        `http://localhost:5000/api/admin/notifications/${notificationId}/${toProfileId}`
      );

      // Remove notification from state on successful delete
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
    } catch (error) {
      console.error("Failed to delete notification", error);
    }
  };

  const handleViewProfile = async (profileId: string) => {
    try {
      const userData = localStorage.getItem("loggedInUser");
      if (!userData) {
        throw new Error("User not logged in. Please log in again.");
      }
      let user;
      try {
        user = JSON.parse(userData);
      } catch (err) {
        throw new Error("Invalid user data. Please log in again.");
      }
      const userProfileId = user.profileId || "";
      if (!userProfileId) {
        throw new Error("Profile ID not found. Please log in again.");
      }

      // Check if profile has already been viewed in this session
      const viewedProfiles = localStorage.getItem("viewedProfiles");
      let viewedProfilesSet: Set<string> = viewedProfiles ? new Set(JSON.parse(viewedProfiles)) : new Set();

      if (!viewedProfilesSet.has(profileId)) {
        // Call API to increment profile views
        const response = await fetch(`${BASE_URL}/api/increment-profile-views`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ profileId }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to increment profile views");
        }

        // Add profileId to viewedProfiles in localStorage
        viewedProfilesSet.add(profileId);
        localStorage.setItem("viewedProfiles", JSON.stringify([...viewedProfilesSet]));

        console.log(`Profile view incremented for profileId=${profileId}`);
      }

      // Navigate to profile page
      navigate(`/profile/${profileId}`, { state: { fromSearch: true } });
    } catch (error) {
      console.error("Error incrementing profile view:", error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      // Navigate even if API fails to ensure UX continuity
      navigate(`/profile/${profileId}`, { state: { fromSearch: true } });
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotificationColor = (type: string, read: boolean) => {
    if (read) return "text-gray-500";
    switch (type) {
      case "interest":
        return "text-red-500";
      case "message":
        return "text-blue-500";
      case "match":
        return "text-green-500";
      default:
        return "text-yellow-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
      <Header />
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Notifications
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notifications`
                : "You're all caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="outline"
              className="w-full sm:w-auto border-yellow-300 text-yellow-600 hover:bg-yellow-50 px-3 sm:px-4 py-2 text-sm sm:text-base whitespace-nowrap"
            >
              <Check size={14} className="mr-1 sm:mr-2" /> Mark All as Read
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {notifications.map((notification) => {
            const IconComponent = iconMap[notification.type] || Bell;
            return (
              <Card
                key={notification.id}
                className={`border-yellow-200 hover:shadow-md transition-shadow ${!notification.isRead ? "bg-yellow-50" : "bg-white"}`}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div
                      className={`p-2 rounded-full bg-white ${getNotificationColor(
                        notification.type,
                        notification.read
                      )}`}
                    >
                      <IconComponent size={18} className="sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                        <div className="w-full">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                              {notification.toUserName}
                            </h3>
                            <p className="text-sm sm:text-base">showed interest in you</p>
                            {!notification.isRead && (
                              <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500 text-xs sm:text-sm">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 mb-2 text-sm sm:text-base">
                            {notification.message}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                          <Link
                            to={`/profile/${notification.fromProfileId}`}
                            onClick={(e) => {
                              e.preventDefault();
                              handleViewProfile(notification.fromProfileId);
                            }}
                          >
                            <Button
                              size="sm"
                              variant="ghost"
                              className="mt-2 border-yellow-300 text-yellow-600 hover:bg-yellow-50 text-xs sm:text-sm px-3 sm:px-4"
                            >
                              View Profile
                            </Button>
                          </Link>
                        </div>
                        <div className="flex gap-1 sm:gap-2 mt-2 sm:mt-0">
                          {!notification.isRead && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                markAsRead(
                                  notification.toProfileId,
                                  notification._id
                                )
                              }
                              className="text-yellow-600 hover:bg-yellow-100 p-1 sm:p-2"
                            >
                              <Check size={14} className="sm:w-4 sm:h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              deleteNotification(
                                notification.toProfileId,
                                notification._id
                              )
                            }
                            className="text-red-500 hover:bg-red-50 p-1 sm:p-2"
                          >
                            <Trash2 size={14} className="sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {notifications.length === 0 && (
          <Card className="border-yellow-200">
            <CardContent className="p-8 sm:p-12 text-center">
              <Bell size={36} className="mx-auto text-gray-400 mb-4 sm:w-12 sm:h-12" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
                No notifications yet
              </h3>
              <p className="text-gray-500 text-sm sm:text-base">
                When you receive interests, messages, or matches, they'll appear
                here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Notifications;