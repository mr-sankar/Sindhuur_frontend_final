import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import {
  Briefcase,
  GraduationCap,
  Heart,
  Home,
  Mail,
  MapPin,
  Star,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const PublicProfile = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [isInterested, setIsInterested] = useState(false);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportCategory, setReportCategory] = useState("");
  const [reportMessage, setReportMessage] = useState("");
  const [isReported, setIsReported] = useState(false);

  useEffect(() => {
    const fetchProfileAndStatus = async () => {
      try {
        // Fetch profile
        const profileResponse = await fetch(`${BASE_URL}/api/profiles/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!profileResponse.ok) {
          const errorData = await profileResponse.json().catch(() => ({}));
          throw new Error(
            errorData.error ||
              `Profile fetch failed with status ${profileResponse.status}`
          );
        }
        const profileData = await profileResponse.json();
        console.log("Profile data:", profileData);
        if (!profileData.dateOfBirth) {
          console.warn("Profile data missing dateOfBirth:", profileData);
        }
        setProfile(profileData);

        // Fetch report status
        const userProfile = localStorage.getItem("loggedInUser");
        const reportingUserId = userProfile
          ? JSON.parse(userProfile).profileId
          : "anonymous";
        const reportStatusResponse = await fetch(
          `${BASE_URL}/api/report-status?reportingUserId=${reportingUserId}&reportedProfileId=${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!reportStatusResponse.ok) {
          console.error(
            "Error fetching report status:",
            reportStatusResponse.status
          );
          return;
        }
        const reportStatus = await reportStatusResponse.json();
        setIsReported(reportStatus.hasReported);

        // Fetch sent interests to check if this profile was sent an interest
        const sentResponse = await fetch(
          `${BASE_URL}/api/interested-profiles?userProfileId=${reportingUserId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!sentResponse.ok) {
          const errorData = await sentResponse.json().catch(() => ({}));
          throw new Error(
            errorData.error ||
              `Failed to fetch interested profiles: ${sentResponse.statusText}`
          );
        }
        const sentData = await sentResponse.json();
        // Check if the current profile ID is in the sent interests
        const hasSentInterest = sentData.some(
          (profile) => profile.id.toString() === id
        );
        setIsInterested(hasSentInterest);
      } catch (error) {
        console.error("Error fetching profile or statuses:", error.message);
        toast({
          title: "Error",
          description: "Failed to load profile or interest status.",
          variant: "destructive",
        });
        navigate("/search");
      }
    };
    fetchProfileAndStatus();
  }, [id, toast, navigate]);

  const handleSendInterest = async () => {
    if (isInterested) {
      toast({
        title: "Interest Already Sent",
        description: "You have already sent interest to this profile.",
        variant: "default",
      });
      return;
    }

    try {
      const userProfile = localStorage.getItem("loggedInUser");
      const userProfileId = userProfile
        ? JSON.parse(userProfile).profileId
        : "anonymous";

      const response = await fetch(`${BASE_URL}/api/send-interest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userProfileId, interestedProfileId: id }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `Send interest failed with status ${response.status}`
        );
      }

      setIsInterested(true);

       // Call the notification backend route AFTER interest is sent
      const noti = await fetch(
        `${BASE_URL}/api/admin/notifications/${id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromProfileId: userProfileId,
            type: "interest",
            message: "showed interest in you",
          }),
        }
      );


      toast({
        title: "Interest Sent!",
        description: "Your interest has been sent successfully.",
      });
    } catch (error) {
      console.error("Error sending interest:", error.message);
      toast({
        title: "Error",
        description:
          error.message === "Interested profile not found"
            ? "The selected profile does not exist."
            : "Failed to send interest.",
        variant: "destructive",
      });
    }
  };

  const handleChatNow = async () => {
    if (!profile) return;

    const userData = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
    const currentProfileId = userData.profileId;

    if (!currentProfileId) {
      toast({
        title: "Error",
        description: "User not logged in.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/api/add-chat-contact`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileId: currentProfileId,
            contactId: profile.id,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to add chat contact");
      }
      toast({
        title: "Starting Chat",
        description: `Opening conversation with ${profile.name || "user"}...`,
      });
      navigate(`/messages?chatId=${profile.id}`);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to start chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReportSubmit = async () => {
    try {
      const userProfile = localStorage.getItem("loggedInUser");
      const reportingUserId = userProfile
        ? JSON.parse(userProfile).profileId
        : "anonymous";

      if (!reportReason || !reportCategory || !reportMessage.trim()) {
        toast({
          title: "Error",
          description:
            "Please fill in all required fields: reason, category, and message.",
          variant: "destructive",
        });
        return;
      }

      const reportData = {
        reportingUserId,
        reportedProfileId: id,
        reason: reportReason,
        category: reportCategory,
        message: reportMessage.trim(),
        name: profile.name,
        location: profile.location,
        profession: profile.profession,
        education: profile.education,
      };
      console.log("Submitting report with data:", reportData);

      const response = await axios.post(
        `${BASE_URL}/api/report-profile`,
        reportData
      );

      toast({
        title: "Report Submitted",
        description:
          response.data.message ||
          "Your report has been submitted successfully.",
      });

      setIsReported(true);
    } catch (error) {
      if (error.response) {
        console.error("Server responded with error:", error.response.data);
        toast({
          title: "Error",
          description:
            error.response.data.error ||
            `Failed to submit report (status ${error.response.status})`,
          variant: "destructive",
        });
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast({
          title: "Error",
          description: "No response from server. Please check your network.",
          variant: "destructive",
        });
      } else {
        console.error("Error creating request:", error.message);
        toast({
          title: "Error",
          description:
            error.message || "Failed to submit report. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        <Header />
        <div className="w-full max-w-screen-md mx-auto px-2 sm:px-4 py-6">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <Header />
      <div className="w-full max-w-screen-md mx-auto px-2 sm:px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6 border-orange-100">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row gap-y-6 gap-x-8">
                <div className="w-full lg:w-1/3">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-orange-100 to-red-100">
                    <img
                      src={`${BASE_URL}${profile.images[0]}`}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {profile.images.slice(1).map((img, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded overflow-hidden bg-orange-100"
                      >
                        <img
                          src={img}
                          alt={`${profile.name} ${index + 2}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="w-full lg:w-2/3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-2">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
                        {profile.name}
                      </h1>
                      <div className="flex flex-wrap gap-4 text-gray-600 text-sm">
                        <span className="flex items-center gap-1">
                          <User size={16} />
                          {profile.age} years
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={16} />
                          {profile.location}
                        </span>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 w-fit">
                      <Star size={12} className="mr-1" />
                      Verified
                    </Badge>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mb-6 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Briefcase size={16} className="text-orange-500" />
                        <span className="font-medium">Profession:</span>
                        <span>{profile.profession}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap size={16} className="text-orange-500" />
                        <span className="font-medium">Education:</span>
                        <span>{profile.education}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-orange-500" />
                        <span className="font-medium">Height:</span>
                        <span>{profile.height}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Home size={16} className="text-orange-500" />
                        <span className="font-medium">Community:</span>
                        <span>{profile.community}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Mother Tongue:</span>
                        <span>{profile.motherTongue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Salary:</span>
                        <span>{profile.salary}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      className={`w-full transition-all duration-300 ${
                        isInterested
                          ? "bg-green-600 text-white cursor-not-allowed"
                          : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      }`}
                      onClick={handleSendInterest}
                      disabled={isInterested}
                    >
                      <Heart
                        size={16}
                        className={`mr-2 ${isInterested ? "fill-current" : ""}`}
                      />
                      {isInterested ? "Interest Sent" : "Send Interest"}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-orange-200 text-orange-600 hover:bg-orange-50 transition-all duration-300 hover:scale-105"
                      onClick={handleChatNow}
                    >
                      <Mail size={16} className="mr-2" />
                      Chat Now
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-orange-200 text-orange-600 hover:bg-orange-50 transition-all duration-300 hover:scale-105"
                      onClick={() => setIsReportModalOpen(true)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2"
                      >
                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                        <line x1="4" y1="22" x2="4" y2="15"></line>
                      </svg>
                      {isReported ? "Reported" : "Report"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="mb-6 border-orange-100">
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-4">
                Family Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Father Name:</span>
                  <p className="text-gray-600">{profile.family.father}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Mother Name:</span>
                  <p className="text-gray-600">{profile.family.mother}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-100">
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-4">
                Profile More Details
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">
                    Date of Birth:
                  </span>
                  <span className="text-gray-600">
                    {profile.dateOfBirth
                      ? new Date(profile.dateOfBirth)
                          .toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                          .split("/")
                          .join("-")
                      : "Not specified"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">
                    Birth Place:
                  </span>
                  <span className="text-gray-600">
                    {profile.placeOfBirth || "Not specified"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Hobbies:</span>
                  <span className="text-gray-600">
                    {profile.hobbies || "Not specified"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="w-[95vw] max-w-[600px] sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {isReported ? "Report Submitted" : "Report Profile"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <h3 className="text-sm sm:text-base font-medium text-gray-700 text-center">
                  Profile Details
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  <span className="font-medium">Name:</span> {profile?.name || "Not specified"}
                </p>
                <p className="text-sm text-gray-600 text-center">
                  <span className="font-medium">Location:</span> {profile?.location || "Not specified"}
                </p>
                <p className="text-sm text-gray-600 text-center">
                  <span className="font-medium">Profession:</span> {profile?.profession || "Not specified"}
                </p>
                <p className="text-sm text-gray-600 text-center">
                  <span className="font-medium">Education:</span> {profile?.education || "Not specified"}
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm sm:text-base font-medium text-gray-700 text-center">
                  Report Details
                </h3>
                {isReported ? (
                  <>
                    <p className="text-sm text-gray-600 text-center">
                      <span className="font-medium">Reason for Report:</span>{" "}
                      {reportReason}
                    </p>
                    <p className="text-sm text-gray-600 text-center">
                      <span className="font-medium">Category:</span>{" "}
                      {reportCategory}
                    </p>
                    <p className="text-sm text-gray-600 text-center">
                      <span className="font-medium">Message:</span>{" "}
                      {reportMessage}
                    </p>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="report-reason" className="text-sm sm:text-base">
                        Reason for Report
                      </Label>
                      <Select
                        value={reportReason}
                        onValueChange={setReportReason}
                      >
                        <SelectTrigger id="report-reason">
                          <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spam">Spam</SelectItem>
                          <SelectItem value="inappropriate-content">
                            Inappropriate Content
                          </SelectItem>
                          <SelectItem value="fake-profile">
                            Fake Profile
                          </SelectItem>
                          <SelectItem value="harassment">Harassment</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="report-message" className="text-sm sm:text-base">
                        Message
                      </Label>
                      <Textarea
                        id="report-message"
                        value={reportMessage}
                        onChange={(e) => setReportMessage(e.target.value)}
                        placeholder="Provide details about the issue"
                        className="min-h-[100px] text-sm"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="report-category" className="text-sm sm:text-base">
                        Category
                      </Label>
                      <Select
                        value={reportCategory}
                        onValueChange={setReportCategory}
                      >
                        <SelectTrigger id="report-category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="message">Message</SelectItem>
                          <SelectItem value="profile">Profile</SelectItem>
                          <SelectItem value="behaviour">Behaviour</SelectItem>
                          <SelectItem value="photos">Photos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-center sm:justify-end">
            {isReported ? (
              <Button
                onClick={() => setIsReportModalOpen(false)}
                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white text-sm sm:text-base"
              >
                Close
              </Button>
            ) : (
              <Button
                type="submit"
                onClick={handleReportSubmit}
                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white text-sm sm:text-base"
              >
                Submit Report
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublicProfile;