
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { NavLink as RouterNavLink, Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  Users,
  Heart,
  MessageSquare,
  Search,
  Grid3X3,
  Bell,
  User,
  LogOut,
  Crown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/hooks/useChat";
import logo from "@/assets/logo.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoggedIn, logout } = useAuth();
  const { unreadCount, clearUnreadCount } = useChat();
  const navigate = useNavigate();
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const loggedInUser = localStorage.getItem("loggedInUser");
  const profileId = loggedInUser ? JSON.parse(loggedInUser).profileId : null;

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      if (!isLoggedIn || !profileId) {
        setUnreadNotificationsCount(0);
        return;
      }
      try {
        const response = await fetch(`/api/admin/notifications/${profileId}/unread-count`);
        const data = await response.json();
        if (response.ok) {
          setUnreadNotificationsCount(data.count || 0);
        } else {
          console.error("Failed to fetch unread notifications count:", data.message);
          setUnreadNotificationsCount(0);
        }
      } catch (error) {
        console.error("Error fetching unread notifications count:", error);
        setUnreadNotificationsCount(0);
      }
    };

    fetchUnreadNotifications();
  }, [isLoggedIn, profileId]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("loggedInUser");
    setIsMenuOpen(false);
    navigate("/login");
  };

  const handleMessagesClick = (event: React.MouseEvent) => {
    event.preventDefault();
    clearUnreadCount();
    setTimeout(() => {
      navigate("/messages");
    }, 50);
  };

  const handleNotificationsClick = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (isLoggedIn && profileId) {
      try {
        await fetch(`/api/admin/notifications/${profileId}/mark-read`, { method: "POST" });
        setUnreadNotificationsCount(0);
      } catch (error) {
        console.error("Error marking notifications as read:", error);
      }
    } else {
      setUnreadNotificationsCount(0);
    }
    setTimeout(() => {
      navigate("/notifications");
    }, 50);
  };

  return (
    <header className="bg-white shadow-lg border-b-2 border-yellow-400">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-2 min-h-[60px]">
          {/* Logo */}
          <Link
            to={isLoggedIn ? "/home" : "/"}
            className="flex items-center space-x-1.5 flex-shrink-0"
          >
            <img
              src={logo || "/placeholder.svg"}
              alt="Sindhuura Logo"
              className="h-8 w-8 sm:h-9 sm:w-9 object-contain"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">
                Sindhuura
              </span>
              <span className="text-sm sm:text-base text-yellow-600 font-medium hidden sm:block">
                Find Your Perfect Match
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1">
            {/* Desktop nav at 1280px+ to avoid wrapping on iPad Pro */}
            {isLoggedIn ? (
              <>
                <NavLink
                  to="/home"
                  icon={<Home className="h-5 w-5" />}
                  text="Home"
                />
                <NavLink
                  to="/search"
                  icon={<Users className="h-5 w-5" />}
                  text="Matches"
                />
                <NavLink
                  to="/dashboard"
                  icon={<Heart className="h-5 w-5" />}
                  text="Interests"
                />
                <div className="relative">
                  <RouterNavLink
                    to="/messages"
                    onClick={handleMessagesClick}
                    className={({ isActive }) =>
                      `flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                        isActive
                          ? "text-yellow-600 font-semibold shadow-md shadow-yellow-400 bg-yellow-50"
                          : "text-gray-700 hover:bg-yellow-50 hover:text-yellow-600"
                      }`
                    }
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>Messages</span>
                  </RouterNavLink>
                  {unreadCount > 0 && (
                    <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    </div>
                  )}
                </div>
                <NavLink
                  to="/events"
                  icon={<Grid3X3 className="h-5 w-5" />}
                  text="Events"
                />
                <NavLink
                  to="/membership"
                  icon={<Crown className="h-5 w-5" />}
                  text="Membership"
                />
                <div className="relative">
                  <RouterNavLink
                    to="/notifications"
                    onClick={handleNotificationsClick}
                    className={({ isActive }) =>
                      `flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                        isActive
                          ? "text-yellow-600 font-semibold shadow-md shadow-yellow-400 bg-yellow-50"
                          : "text-gray-700 hover:bg-yellow-50 hover:text-yellow-600"
                      }`
                    }
                  >
                    <Bell className="h-5 w-5" />
                    <span>Notifications</span>
                  </RouterNavLink>
                  {unreadNotificationsCount > 0 && (
                    <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {unreadNotificationsCount > 99 ? "99+" : unreadNotificationsCount}
                      </span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <NavLink
                  to="/"
                  icon={<Home className="h-5 w-5" />}
                  text="Home"
                />
                <NavLink
                  to="/search"
                  icon={<Search className="h-5 w-5" />}
                  text="Search"
                />
                <NavLink
                  to="/membership"
                  icon={<Crown className="h-5 w-5" />}
                  text="Membership"
                />
              </>
            )}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden xl:flex items-center space-x-1 flex-shrink-0">
            {isLoggedIn ? (
              <>
                <Button
                  variant="outline"
                  className="border-yellow-400 text-yellow-700 hover:bg-yellow-50 font-medium px-2 py-1.5 text-sm bg-transparent"
                  onClick={() => navigate("/profile")}
                >
                  <User className="h-4 w-4 mr-1" />
                  Profile
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-red-400 text-red-700 hover:bg-red-50 font-medium px-2 py-1.5 text-sm bg-transparent"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="outline"
                    className="border-yellow-400 text-yellow-700 hover:bg-yellow-50 font-medium px-2 py-1.5 text-sm bg-transparent"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-semibold px-2 py-1.5 text-sm shadow-lg">
                    Join Free
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="xl:hidden p-1.5 rounded-lg hover:bg-yellow-50 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMenuOpen ? (
              <X size={28} className="text-yellow-700" />
            ) : (
              <Menu size={28} className="text-yellow-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="xl:hidden mt-4 flex flex-col space-y-2 text-lg">
            {isLoggedIn ? (
              <>
                <MobileLink to="/home" text="Home" aria-label="Navigate to Home" />
                <MobileLink to="/search" text="Matches" aria-label="Navigate to Matches" />
                <MobileLink to="/dashboard" text="Interests" aria-label="Navigate to Interests" />
                <div className="relative">
                  <Link
                    to="/messages"
                    onClick={handleMessagesClick}
                    className="px-4 py-2.5 rounded text-gray-700 hover:bg-yellow-50 block text-lg"
                    aria-label="Navigate to Messages"
                  >
                    Messages
                  </Link>
                  {unreadCount > 0 && (
                    <div className="absolute top-1.5 right-4 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    </div>
                  )}
                </div>
                <MobileLink to="/events" text="Events" aria-label="Navigate to Events" />
                <MobileLink to="/membership" text="Membership" aria-label="Navigate to Membership" />
                <div className="relative">
                  <Link
                    to="/notifications"
                    onClick={handleNotificationsClick}
                    className="px-4 py-2.5 rounded text-gray-700 hover:bg-yellow-50 block text-lg"
                    aria-label="Navigate to Notifications"
                  >
                    Notifications
                  </Link>
                  {unreadNotificationsCount > 0 && (
                    <div className="absolute top-1.5 right-4 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {unreadNotificationsCount > 99 ? "99+" : unreadNotificationsCount}
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  className="text-left text-yellow-700 px-4 py-2.5 text-lg"
                  onClick={() => navigate("/profile")}
                  aria-label="Navigate to Profile"
                >
                  Profile
                </Button>
                <Button
                  variant="ghost"
                  className="text-left text-red-600 px-4 py-2.5 text-lg"
                  onClick={handleLogout}
                  aria-label="Log out"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <MobileLink to="/" text="Home" aria-label="Navigate to Home" />
                <MobileLink to="/search" text="Search" highlight aria-label="Navigate to Search" />
                <MobileLink to="/membership" text="Membership" aria-label="Navigate to Membership" />
                <MobileLink to="/login" text="Login" aria-label="Navigate to Login" />
                <Link
                  to="/signup"
                  className="px-4 py-2.5 text-white bg-yellow-500 hover:bg-yellow-600 rounded text-center text-lg"
                  aria-label="Sign up for free"
                >
                  Join Free
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

const NavLink = ({ to, icon, text, ariaLabel }: any) => (
  <RouterNavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium whitespace-nowrap ${
        isActive
          ? "text-yellow-600 font-semibold shadow-md shadow-yellow-400 bg-yellow-50"
          : "text-gray-700 hover:bg-yellow-50 hover:text-yellow-600"
      }`
    }
    aria-label={ariaLabel || `Navigate to ${text}`}
  >
    {icon}
    <span>{text}</span>
  </RouterNavLink>
);

const MobileLink = ({ to, text, highlight, ariaLabel }: any) => (
  <Link
    to={to}
    className={`px-4 py-2.5 rounded text-lg ${
      highlight
        ? "text-yellow-700 bg-yellow-50 border border-yellow-200 hover:bg-yellow-100"
        : "text-gray-700 hover:bg-yellow-50"
    }`}
    aria-label={ariaLabel}
  >
    {text}
  </Link>
);

export default Header;
