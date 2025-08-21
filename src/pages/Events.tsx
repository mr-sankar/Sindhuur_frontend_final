import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [subscription, setSubscription] = useState("free");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(null); // Renamed for clarity
  const [openCancelDialog, setOpenCancelDialog] = useState(null); // New: For cancellation popup
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { toast } = useToast();

  const navigate = useNavigate();

  axios.defaults.baseURL = "http://localhost:5000";

  const fetchEventDetails = async (eventId) => {
    try {
      const res = await axios.get(`/api/events/${eventId}/details`);
      setSelectedEvent(res.data);
    } catch {
      toast({
        title: "Error",
        description: "Could not load event details.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(
        events.filter((e) =>
          e.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, events]);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const userProfile = localStorage.getItem("loggedInUser");
        const userProfileId = userProfile
          ? JSON.parse(userProfile).profileId
          : "anonymous";
        if (userProfileId === "anonymous") {
          setSubscription("free");
          return;
        }

        const response = await axios.get(
          `/api/user-profile?profileId=${userProfileId}`
        );
        const userSubscription =
          response.data.user.subscription?.current ||
          response.data.user.subscription ||
          "free";
        setSubscription(userSubscription);
      } catch (error) {
        console.error("Error fetching subscription status:", error.message);
        setSubscription("free");
        toast({
          title: "Error",
          description:
            "Failed to fetch subscription status. Defaulting to free.",
          variant: "destructive",
        });
      }
    };

    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("/api/events");
        setEvents(response.data);
        const userProfile = localStorage.getItem("loggedInUser");
        const userId = userProfile ? JSON.parse(userProfile).profileId : null;
        if (userId) {
          const registered = response.data
            .filter(
              (event) =>
                Array.isArray(event.registeredUsers) &&
                event.registeredUsers.some((user) => user.profileId === userId)
            )
            .map((event) => event._id);
          setRegisteredEvents(registered);
        }
        setError(null);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch events");
        toast({
          title: "Error",
          description: "Failed to fetch events. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionStatus();
    fetchEvents();
  }, [toast]);

  // Renamed for clarity: This handles both register and cancel (toggle)
  const handleToggleRegistration = async (eventId) => {
    if (subscription !== "premium plus") {
      toast({
        title: "Access Restricted",
        description:
          "Events are exclusive to Premium Plus users. Please upgrade your subscription.",
        variant: "destructive",
      });
      return;
    }

    try {
      const userProfile = localStorage.getItem("loggedInUser");
      const userId = userProfile ? JSON.parse(userProfile).profileId : null;

      if (!userId) {
        toast({
          title: "Error",
          description: "You must be logged in to register for events.",
          variant: "destructive",
        });
        return;
      }

      const response = await axios.post(`/api/events/${eventId}/register`, {
        userId,
      });
      const updatedEvent = response.data;

      // FIX: Use the 'isRegistered' boolean from backend response instead of faulty profileId check
      if (updatedEvent.isRegistered) {
        setRegisteredEvents((prev) => [...new Set([...prev, eventId])]);
        setOpenSuccessDialog(eventId); // Open success dialog
        toast({
          title: "Registration Successful!",
          description: "You have successfully registered for this event.",
        });
      } else {
        setRegisteredEvents((prev) => prev.filter((id) => id !== eventId));
        setOpenCancelDialog(eventId); // New: Open cancel dialog
        toast({
          title: "Registration Cancelled",
          description: "You have successfully cancelled your registration.",
        });
      }

      // Optional: Update the local events state to reflect changes (e.g., currentAttendees)
      setEvents((prevEvents) =>
        prevEvents.map((e) =>
          e._id === eventId ? { ...e, ...updatedEvent } : e
        )
      );
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to register or unregister for the event.",
        variant: "destructive",
      });
    }
  };

  // Removed handleUnregister since it's unused; the toggle handles both

  const getCategoryColor = (category) => {
    switch (category) {
      case "social":
        return "bg-blue-100 text-blue-800";
      case "cultural":
        return "bg-purple-100 text-purple-800";
      case "dating":
        return "bg-pink-100 text-pink-800";
      case "lifestyle":
        return "bg-green-100 text-green-800";
      case "adventure":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-lg text-gray-600">Loading events...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (subscription !== "premium plus") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Premium Plus Feature
            </h2>
            <p className="text-gray-600 mb-6">
              Access to exclusive events is only available for Premium Plus
              members. Upgrade your account to connect with potential matches at
              our curated events.
            </p>
            <Button
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white"
              onClick={() => {
                navigate("/membership")
              }}
            >
              Upgrade to Premium Plus
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-lg text-red-600">Error: {error}</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-lg text-gray-600">
            No events available at the moment.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            Matrimony Events
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Join our exclusive events to meet potential life partners in person.
            From cultural celebrations to adventure activities, find your
            perfect match while doing what you love.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 flex items-center">
            <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 mr-2" />
            Featured Events
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {filteredEvents
              .filter((event) => event.featured)
              .map((event) => (
                <Card
                  key={event._id}
                  className="overflow-hidden border-yellow-200 shadow-lg"
                >
                  <div className="relative">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                    />
                    <Badge className="absolute top-4 left-4 bg-yellow-500 text-white">
                      Featured
                    </Badge>
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base sm:text-xl">
                        {event.title}
                      </CardTitle>
                      <Badge
                        className={`${getCategoryColor(
                          event.category
                        )} text-xs`}
                      >
                        {event.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">
                      {event.description}
                    </p>
                    <div className="space-y-1 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {event.date} • {event.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.location}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        <Badge variant="secondary" className="font-bold">
                          {event.currentAttendees}/{event.maxAttendees}{" "}
                          registered
                        </Badge>
                      </div>
                    </div>
                    {/* Registration Success Dialog */}
                    <Dialog
                      open={openSuccessDialog === event._id}
                      onOpenChange={() => setOpenSuccessDialog(null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => handleToggleRegistration(event._id)} // Updated to use toggle handler
                          className={`w-full text-sm ${
                            registeredEvents.includes(event._id)
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700"
                          }`}
                          aria-label={
                            registeredEvents.includes(event._id)
                              ? `Cancel registration for ${event.title}`
                              : `Register for ${event.title}`
                          }
                        >
                          {registeredEvents.includes(event._id)
                            ? "Cancel"
                            : "Register Now"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Registration Confirmed</DialogTitle>
                        </DialogHeader>
                        <p>
                          You have successfully registered for {event.title}!
                        </p>
                        <Button onClick={() => setOpenSuccessDialog(null)}>
                          Close
                        </Button>
                      </DialogContent>
                    </Dialog>
                    {/* New: Cancellation Dialog (hidden trigger, opened via state) */}
                    <Dialog
                      open={openCancelDialog === event._id}
                      onOpenChange={() => setOpenCancelDialog(null)}
                    >
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Registration Cancelled</DialogTitle>
                        </DialogHeader>
                        <p>
                          You have successfully unregistered from {event.title}.
                        </p>
                        <Button onClick={() => setOpenCancelDialog(null)}>
                          Close
                        </Button>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
            All Events
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card
                key={event._id}
                className="overflow-hidden border-yellow-200 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  {event.featured && (
                    <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                      <Star className="h-3 w-3 mr-1" /> Featured
                    </Badge>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base sm:text-lg">
                      {event.title}
                    </CardTitle>
                    <Badge
                      className={`${getCategoryColor(event.category)} text-xs`}
                    >
                      {event.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="space-y-1 text-xs text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" /> {event.date}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" /> {event.time}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" /> {event.location}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      <Badge
                        variant=""
                        className="font-bold bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700"
                      >
                        {event.currentAttendees}/{event.maxAttendees} registered
                      </Badge>
                    </div>
                  </div>
                  {/* Registration Success Dialog */}
                  <Dialog
                    open={openSuccessDialog === event._id}
                    onOpenChange={() => setOpenSuccessDialog(null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        onClick={() => handleToggleRegistration(event._id)} // Updated to use toggle handler
                        className={`w-full text-sm ${
                          registeredEvents.includes(event._id)
                            ? "bg-red-500 hover:bg-red-700"
                            : "bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700"
                        }`}
                        aria-label={
                          registeredEvents.includes(event._id)
                            ? `Cancel registration for ${event.title}`
                            : `Register for ${event.title}`
                        }
                      >
                        {registeredEvents.includes(event._id)
                          ? "Cancel"
                          : "Register"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Registration Confirmed</DialogTitle>
                      </DialogHeader>
                      <p>You have successfully registered for {event.title}!</p>
                      <Button
                        onClick={() => setOpenSuccessDialog(null)}
                        className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700"
                      >
                        Close
                      </Button>
                    </DialogContent>
                  </Dialog>
                  {/* New: Cancellation Dialog (hidden trigger, opened via state) */}
                  <Dialog
                    open={openCancelDialog === event._id}
                    onOpenChange={() => setOpenCancelDialog(null)}
                  >
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Registration Cancelled</DialogTitle>
                      </DialogHeader>
                      <p>
                        You have successfully unregistered from {event.title}.
                      </p>
                      <Button
                        onClick={() => setOpenCancelDialog(null)}
                        className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700"
                      >
                        Close
                      </Button>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Events;
