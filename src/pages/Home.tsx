import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Briefcase,
  Heart,
  MapPin,
  MessageSquare,
  Search,
  User,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

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

interface Story {
  _id: string;
  names: string;
  weddingDate: string;
  location: string;
  email: string;
  story: string;
  image: string;
  createdAt: string;
}

const Home = () => {
  const [recentMatches, setRecentMatches] = useState([]);
  const [profileStats, setProfileStats] = useState({
    profileViews: 0,
    interestsReceived: 0,
    messages: 0,
  });
  const [currentSubscription, setCurrentSubscription] =
    useState<string>("free");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Handle image load error
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    e.currentTarget.src = "https://via.placeholder.com/150";
  };

  // Auto-scrolling effect
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || stories.length === 0) return;

    const scrollWidth = scrollContainer.scrollWidth / 2; // Half the width since content is duplicated
    const clientWidth = scrollContainer.clientWidth;
    let scrollPosition = 0;
    const scrollSpeed = 2; // Pixels per frame
    const scrollInterval = 1000 / 60; // 60 FPS

    const scroll = () => {
      scrollPosition += scrollSpeed;
      if (scrollPosition >= scrollWidth) {
        scrollPosition = 0; // Reset to start of original set
        scrollContainer.scrollTo({
          left: 0,
          behavior: "auto", // Instant reset to avoid visible jump
        });
      } else {
        scrollContainer.scrollTo({
          left: scrollPosition,
          behavior: "smooth",
        });
      }
    };

    const intervalId = setInterval(scroll, scrollInterval);

    return () => clearInterval(intervalId);
  }, [stories]);

  // Fetch user profile to get subscription status
  const fetchUserProfile = async (profileId: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/user-profile?profileId=${profileId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch user profile");
      }

      const userProfileData = await response.json();
      setCurrentSubscription(
        userProfileData.user.subscription?.current || "free"
      );
    } catch (err) {
      console.error("Error fetching user profile:", err.message);
      setCurrentSubscription("free"); // Fallback to 'free' on error
      toast({
        title: "Error",
        description: "Failed to load user profile. Defaulting to free plan.",
        variant: "destructive",
      });
    }
  };

  // Fetch profile stats
  const fetchProfileStats = async (profileId: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/user/stats?profileId=${profileId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch profile stats");
      }

      const data = await response.json();
      setProfileStats({
        profileViews: data.profileViews || 0,
        interestsReceived: data.interestsReceived || 0,
        messages: data.messages || 0,
      });
    } catch (err) {
      console.error("Error fetching profile stats:", err.message);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load profile stats.",
        variant: "destructive",
      });
    }
  };

  // Fetch notifications
  const fetchNotifications = async (profileId: string) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/admin/notifications/${profileId}`
      );
      // Sort notifications by createdAt in descending order and take the first 3
      const sortedNotifications = response.data
        .sort((a: Notification, b: Notification) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 3);
      setNotifications(sortedNotifications);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load recent notifications.",
        variant: "destructive",
      });
    }
  };

  // Fetch success stories
  const fetchStories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/stories`);
      // Sort stories by createdAt in descending order
      const sortedStories = response.data.sort((a: Story, b: Story) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setStories(sortedStories);
    } catch (error) {
      console.error("Failed to fetch stories:", error);
      toast({
        title: "Error",
        description: "Failed to load success stories.",
        variant: "destructive",
      });
    }
  };

  // Fetch recent matches, stats, notifications, and stories
  useEffect(() => {
    const fetchRecentMatches = async () => {
      try {
        const userData = localStorage.getItem("loggedInUser");
        if (!userData) {
          throw new Error("User data not found. Please log in again.");
        }
        let user;
        try {
          user = JSON.parse(userData);
        } catch (err) {
          throw new Error("Invalid user data. Please log in again.");
        }

        const profileId = user.profileId || "";
        if (!profileId) {
          throw new Error("Profile ID not found. Please log in again.");
        }

        // Fetch user profile, stats, notifications, and stories
        await Promise.all([
          fetchUserProfile(profileId),
          fetchProfileStats(profileId),
          fetchNotifications(profileId),
          fetchStories(),
        ]);

        const gender = user.gender || "";
        const response = await fetch(
          `${BASE_URL}/api/recent-matches?profileId=${encodeURIComponent(
            profileId
          )}&gender=${encodeURIComponent(gender)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch recent matches");
        }

        const data = await response.json();
        setRecentMatches(data.matches || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching recent matches:", err.message);
        setError(err.message);
        setLoading(false);
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      }
    };

    fetchRecentMatches();

    // Refetch stats if coming from Search.js
    if (location.state?.fromSearch) {
      const userData = localStorage.getItem("loggedInUser");
      if (userData) {
        const user = JSON.parse(userData);
        const profileId = user.profileId || "";
        if (profileId) {
          fetchProfileStats(profileId);
        }
      }
    }
  }, [toast, location.state]);

  // Handle View Profile click
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

      // Call API to increment profile views
      const response = await fetch(`${BASE_URL}/api/profiles/${profileId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load profile");
      }

      console.log(`Profile view incremented for profileId=${profileId}`);

      // If viewing own profile, refetch stats to update profileViews
      if (profileId === userProfileId) {
        await fetchProfileStats(userProfileId);
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

  const isPremiumOrPlus =
    currentSubscription === "premium" || currentSubscription === "premium plus";

  // Format date to "DD/MM/YYYY, hh:mm:ss am/pm"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).replace(",", "");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your matrimony journey
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-yellow-200">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Quick Actions
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <Link to="/search">
                    <Button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700">
                      <Search size={18} className="mr-2" />
                      Find Matches
                    </Button>
                  </Link>
                  <Link to="/messages">
                    <Button
                      variant="outline"
                      className="w-full border-yellow-300 text-yellow-600 hover:bg-yellow-50"
                    >
                      <MessageSquare size={18} className="mr-2" />
                      Messages
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button
                      variant="outline"
                      className="w-full border-yellow-300 text-yellow-600 hover:bg-yellow-50"
                    >
                      <Heart size={18} className="mr-2" />
                      Interests
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Recent Matches
                  </h2>
                  <Link
                    to="/search"
                    className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>

                {loading ? (
                  <p className="text-gray-600">Loading recent matches...</p>
                ) : error ? (
                  <p className="text-red-600">Error: {error}</p>
                ) : recentMatches.length === 0 ? (
                  <p className="text-gray-600">No recent matches found.</p>
                ) : (
                  <div className="grid md:grid-cols-3 gap-4">
                    {recentMatches.map((profile) => (
                      <Card
                        key={profile.id}
                        className="overflow-hidden hover:shadow-md transition-shadow border-yellow-100"
                      >
                        <div className="aspect-square bg-gradient-to-br from-yellow-100 to-yellow-200">
                          <img
                            src={
                              profile.image || "https://via.placeholder.com/150"
                            }
                            alt={profile.name}
                            className="w-full h-full object-cover"
                            onError={handleImageError}
                          />
                        </div>

                        <CardContent className="p-3">
                          <h3 className="font-semibold text-gray-800 mb-1">
                            {profile.name}
                          </h3>
                          <div className="space-y-1 text-xs text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <User size={12} />
                              <span>
                                {profile.age !== "Not specified"
                                  ? `${profile.age} years`
                                  : "Age not specified"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase size={12} />
                              <span>
                                {profile.profession ||
                                  "Profession not specified"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin size={12} />
                              <span>
                                {profile.location || "Location not specified"}
                              </span>
                            </div>
                          </div>

                          <Link
                            to={`/profile/${profile.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              handleViewProfile(profile.id).finally(() => {
                                window.location.href = `/profile/${profile.id}`;
                              });
                            }}
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full text-xs border-yellow-300 text-yellow-600 hover:bg-yellow-50"
                            >
                              View Profile
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-yellow-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Your Profile
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Profile Views</span>
                    <span className="font-semibold text-yellow-600">
                      {profileStats.profileViews}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Interests Received</span>
                    <span className="font-semibold text-yellow-600">
                      {profileStats.interestsReceived}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {notifications.length === 0 ? (
                    <p className="text-gray-600">No recent activity found.</p>
                  ) : (
                    notifications.map((notification, index) => (
                      <div key={index} className="flex items-start gap-3 text-sm">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <p className="text-gray-800">
                            {notification.toUserName} showed interest in you
                          </p>
                          <p className="text-gray-500 text-xs">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <Link to="/notifications">
                  <Button
                    variant="ghost"
                    className="w-full mt-4 text-yellow-600 hover:bg-yellow-50"
                  >
                    View All Activity
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8">
          <style>
            {`
      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `}
          </style>
          <h2 className="text-2xl font-semibold text-gray-800 pt-3 mb-6 text-center">
            Success Stories
          </h2>
          {stories.length === 0 ? (
            <p className="text-gray-600 text-center">No success stories found.</p>
          ) : (
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto space-x-4 md:space-x-6 px-2 md:px-4 py-4 snap-x snap-mandatory no-scrollbar"
              style={{ scrollBehavior: "smooth" }}
            >
              {stories.concat(stories).map((story, index) => (
                <Card
                  key={`${story._id}-${index}`}
                  className="flex-shrink-0 w-64 sm:w-72 md:w-80 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 snap-center"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl">
                    <img
                      src={story.image || "https://via.placeholder.com/150"}
                      alt={story.names}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={handleImageError}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <CardContent className="p-3 md:p-4">
                    <h3 className="text-base md:text-lg font-bold text-gray-800 mb-1 md:mb-2">
                      {story.names}
                    </h3>
                    <div className="space-y-1 md:space-y-2 text-xs md:text-sm text-gray-600 mb-2 md:mb-3">
                      <div className="flex items-center gap-1 md:gap-2">
                        <MapPin size={12} className="text-yellow-600" />
                        <span>{story.location || "Location not specified"}</span>
                      </div>
                      <div className="flex items-center gap-1 md:gap-2">
                        <Heart size={12} className="text-yellow-600" />
                        <span>
                          {new Date(story.weddingDate).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs md:text-sm text-gray-700 line-clamp-3 italic">
                      "{story.story}"
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;