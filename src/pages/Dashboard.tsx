import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart, X, User, MapPin, Briefcase, Inbox, Users } from "lucide-react";
import Header from "@/components/Header";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const Dashboard = () => {
  const [filters, setFilters] = useState({
    ageRange: "",
    community: "",
    location: "",
    education: "",
  });
  const [profiles, setProfiles] = useState([]);
  const [interestsSent, setInterestsSent] = useState([]);
  const [receivedInterests, setReceivedInterests] = useState([]);
  const [showReceived, setShowReceived] = useState(false);
  const [showSent, setShowSent] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState("free");
  const [communities, setCommunities] = useState([]);

  // Flatten and sort all cities from stateCities
  const allCities = [
    "Adilabad", "Agartala", "Agra", "Ahmedabad", "Ahmednagar", "Aizawl", "Ajmer", "Akola", "Alappuzha", "Aligarh",
    "Alwar", "Ambala", "Amravati", "Amritsar", "Anantapur", "Anantnag", "Asansol", "Aurangabad", "Ballari", "Baramulla",
    "Bareilly", "Bathinda", "Belagavi", "Bengaluru", "Berhampur", "Bhagalpur", "Bhavnagar", "Bhilai", "Bhopal", "Bhubaneswar",
    "Bidar", "Bikaner", "Bilaspur", "Bokaro", "Champhai", "Chandigarh", "Chandrapur", "Chennai", "Chitradurga", "Chittoor",
    "Churachandpur", "Coimbatore", "Cuddalore", "Cuttack", "Daman", "Darbhanga", "Darjeeling", "Davangere", "Dehradun", "Dhanbad",
    "Dharamshala", "Dharmanagar", "Dibrugarh", "Dimapur", "Dindigul", "Diu", "Durg", "Durgapur", "Dwarka", "Erode",
    "Faridabad", "Gadag", "Gandhinagar", "Gangtok", "Gaya", "Geyzing", "Ghaziabad", "Guntur", "Gurugram", "Guwahati",
    "Gwalior", "Haldwani", "Haridwar", "Hassan", "Hazaribagh", "Hisar", "Howrah", "Hubli", "Hyderabad", "Imphal",
    "Indore", "Itanagar", "Jabalpur", "Jaipur", "Jalandhar", "Jalgaon", "Jammu", "Jamnagar", "Jamshedpur", "Jhansi",
    "Jodhpur", "Jorhat", "Jowai", "Junagadh", "Kadapa", "Kanchipuram", "Kannur", "Kanpur", "Karaikal", "Kargil",
    "Karimnagar", "Karnal", "Karol Bagh", "Karur", "Kavaratti", "Khammam", "Kochi", "Kohima", "Kolhapur", "Kolkata",
    "Kollam", "Korba", "Kota", "Kottayam", "Kozhikode", "Kullu", "Kurnool", "Latur", "Leh", "Lucknow",
    "Ludhiana", "Lunglei", "Madurai", "Mahbubnagar", "Mahe", "Malappuram", "Manali", "Mancherial", "Mandi", "Mangaluru",
    "Mangan", "Mapusa", "Margao", "Meerut", "Mohali", "Mokokchung", "Moradabad", "Mumbai", "Muzaffarpur", "Mysuru",
    "Nagapattinam", "Nagpur", "Naharlagun", "Nainital", "Namchi", "Nashik", "Nellore", "New Delhi", "Nizamabad", "Noida",
    "Ongole", "Palakkad", "Panaji", "Panipat", "Pasighat", "Patiala", "Patna", "Port Blair", "Prayagraj", "Puducherry",
    "Pune", "Purnia", "Raichur", "Raipur", "Rajahmundry", "Rajkot", "Ramagundam", "Ranchi", "Rishikesh", "Rohini",
    "Rohtak", "Roorkee", "Rourkela", "Sagar", "Saket", "Salem", "Sambalpur", "Sangli", "Satara", "Satna",
    "Shillong", "Shimla", "Shivamogga", "Siddipet", "Silchar", "Siliguri", "Silvassa", "Solan", "Solapur", "Sonipat",
    "Srinagar", "Surat", "Tawang", "Tezpur", "Thanjavur", "Thiruvananthapuram", "Thoothukudi", "Thoubal", "Thrissur", "Tirunelveli",
    "Tirupati", "Trichy", "Tumakuru", "Tura", "Udaipur", "Udupi", "Ujjain", "Ukhrul", "Vadodara", "Varanasi",
    "Vasco da Gama", "Vellore", "Vijayawada", "Visakhapatnam", "Warangal", "Yanam", "Ziro"
  ];

  // Fetch communities on component mount
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/communities`);
        setCommunities(response.data.map((item) => item.name));
        if (response.data.length === 0) {
          toast.warning('No communities found in the database.', {
            position: "top-right",
          });
        }
      } catch (error) {
        toast.error('Failed to fetch communities: ' + error.message, {
          position: "top-right",
        });
      }
    };

    fetchCommunities();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const userProfile = localStorage.getItem("loggedInUser");
        const userProfileId = userProfile
          ? JSON.parse(userProfile).profileId
          : "anonymous";

        // Fetch user profile to get subscription status
        console.log(`Fetching user profile with profileId: ${userProfileId}`);
        const userProfileResponse = await fetch(
          `${BASE_URL}/api/user-profile?profileId=${userProfileId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!userProfileResponse.ok) {
          const errorData = await userProfileResponse.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch user profile");
        }

        const userProfileData = await userProfileResponse.json();
        console.log(
          "User profile data:",
          JSON.stringify(userProfileData, null, 2)
        );
        setCurrentSubscription(
          userProfileData.user.subscription?.current || "free"
        );

        // Fetch interested profiles (sent interests)
        console.log(
          `Fetching interested profiles for userProfileId=${userProfileId}`
        );
        const sentResponse = await fetch(
          `${BASE_URL}/api/interested-profiles?userProfileId=${userProfileId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!sentResponse.ok) {
          const errorData = await sentResponse.json();
          throw new Error(
            `Failed to fetch interested profiles: ${
              errorData.error || sentResponse.statusText
            }`
          );
        }
        const sentData = await sentResponse.json();
        console.log(`Received interested profiles: ${JSON.stringify(sentData)}`);
        const filteredSentData = sentData.filter(
          (profile) => profile.id.toString() !== userProfileId
        );
        setInterestsSent(sentData.map((profile) => profile.id.toString()));

        // Fetch received interests
        console.log(
          `Fetching received interests for userProfileId=${userProfileId}`
        );
        const receivedResponse = await fetch(
          `${BASE_URL}/api/received-interests?userProfileId=${userProfileId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!receivedResponse.ok) {
          const errorData = await receivedResponse.json();
          throw new Error(
            `Failed to fetch received interests: ${
              errorData.error || receivedResponse.statusText
            }`
          );
        }
        const receivedData = await receivedResponse.json();
        console.log(`Received interests: ${JSON.stringify(receivedData)}`);
        const filteredReceivedData = receivedData.filter(
          (profile) => profile.id.toString() !== userProfileId
        );
        setReceivedInterests(receivedData.map((profile) => profile.id.toString()));

        // Set profiles based on initial view (sent interests)
        setProfiles(filteredSentData);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        toast.error("Failed to load profiles or user data.", {
          position: "top-right",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (showReceived) {
      const fetchReceivedInterests = async () => {
        try {
          setIsLoading(true);
          const userProfile = localStorage.getItem("loggedInUser");
          const userProfileId = userProfile
            ? JSON.parse(userProfile).profileId
            : "anonymous";
          console.log(
            `Fetching received interests for userProfileId=${userProfileId}`
          );
          const response = await fetch(
            `${BASE_URL}/api/received-interests?userProfileId=${userProfileId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              `Failed to fetch received interests: ${
                errorData.error || response.statusText
              }`
            );
          }
          const data = await response.json();
          console.log(`Received interests: ${JSON.stringify(data)}`);
          const filteredData = data.filter(
            (profile) => profile.id.toString() !== userProfileId
          );
          setProfiles(filteredData);
          setReceivedInterests(data.map((profile) => profile.id.toString()));
        } catch (error) {
          console.error("Error fetching received interests:", error.message);
          toast.error("Failed to load received interests.", {
            position: "top-right",
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchReceivedInterests();
    } else if (showSent) {
      const fetchSentInterests = async () => {
        try {
          setIsLoading(true);
          const userProfile = localStorage.getItem("loggedInUser");
          const userProfileId = userProfile
            ? JSON.parse(userProfile).profileId
            : "anonymous";
          console.log(
            `Fetching interested profiles for userProfileId=${userProfileId}`
          );
          const response = await fetch(
            `${BASE_URL}/api/interested-profiles?userProfileId=${userProfileId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              `Failed to fetch interested profiles: ${
                errorData.error || response.statusText
              }`
            );
          }
          const data = await response.json();
          console.log(`Received interested profiles: ${JSON.stringify(data)}`);
          const filteredData = data.filter(
            (profile) => profile.id.toString() !== userProfileId
          );
          setProfiles(filteredData);
          setInterestsSent(data.map((profile) => profile.id.toString()));
        } catch (error) {
          console.error("Error fetching interested profiles:", error.message);
          toast.error("Failed to load interested profiles.", {
            position: "top-right",
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchSentInterests();
    } else {
      setProfiles([]);
    }
  }, [showReceived, showSent]);

  const handleInterest = async (id) => {
    if (interestsSent.includes(id)) {
      toast.error("You have already sent interest to this profile.", {
        position: "top-right",
      });
      return;
    }

    try {
      const userProfile = localStorage.getItem("loggedInUser");
      const userProfileId = userProfile
        ? JSON.parse(userProfile).profileId
        : "anonymous";

      console.log(
        `Sending interest from dashboard: userProfileId=${userProfileId}, interestedProfileId=${id}`
      );
      const response = await fetch(`${BASE_URL}/api/send-interest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userProfileId, interestedProfileId: id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to send interest: ${errorData.error || response.statusText}`
        );
      }

      setInterestsSent((prev) => [...prev, id]);
      toast.success(
        "Interest Sent!\nYour interest has been sent successfully.",
        {
          position: "top-right",
        }
      );

      const interestsResponse = await fetch(
        `${BASE_URL}/api/interested-profiles?userProfileId=${userProfileId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!interestsResponse.ok) {
        const errorData = await interestsResponse.json();
        throw new Error(
          `Failed to fetch interested profiles: ${
            errorData.error || interestsResponse.statusText
          }`
        );
      }
      const interestsData = await interestsResponse.json();
      const filteredInterestsData = interestsData.filter(
        (profile) => profile.id.toString() !== userProfileId
      );
      setInterestsSent(interestsData.map((profile) => profile.id.toString()));
      if (showSent) {
        setProfiles(filteredInterestsData);
      }
    } catch (error) {
      console.error("Error sending interest:", error.message);
      toast.error(
        error.message === "Interest already sent for this profile"
          ? "You have already sent interest to this profile."
          : error.message === "Interested profile not found"
          ? "The selected profile does not exist."
          : "Failed to send interest.",
        { position: "top-right" }
      );
    }
  };

  const handlePass = async (id) => {
    try {
      const userProfile = localStorage.getItem("loggedInUser");
      if (!userProfile) {
        throw new Error(
          "No user profile found in localStorage. Please log in."
        );
      }
      const userProfileId = JSON.parse(userProfile).profileId || "anonymous";
      console.log(
        `Attempting to remove interest: userProfileId=${userProfileId}, interestedProfileId=${id}`
      );

      const response = await fetch(`${BASE_URL}/api/remove-interest`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userProfileId, interestedProfileId: id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Remove interest failed: ${JSON.stringify(errorData)}`);
        throw new Error(
          errorData.error || `Failed to remove interest: ${response.statusText}`
        );
      }

      setProfiles((prev) => {
        const updated = prev.filter((profile) => profile.id.toString() !== id);
        console.log(`Updated profiles after pass: ${JSON.stringify(updated)}`);
        return updated;
      });
      setReceivedInterests((prev) => {
        const updated = prev.filter((profileId) => profileId !== id);
        console.log(
          `Updated receivedInterests after pass: ${JSON.stringify(updated)}`
        );
        return updated;
      });
      setInterestsSent((prev) => {
        const updated = prev.filter((profileId) => profileId !== id);
        console.log(
          `Updated interestsSent after pass: ${JSON.stringify(updated)}`
        );
        return updated;
      });
      toast.success("Profile passed and interest removed.", {
        position: "top-right",
      });
      console.log(`Interest successfully removed for profile id=${id}`);
    } catch (error) {
      console.error("Error removing interest:", error.message);
      toast.error(
        error.message.includes("No user profile found")
          ? "Please log in to remove interests."
          : error.message.includes("Interest not found")
          ? "Interest not found in database."
          : `Failed to remove interest: ${error.message}`,
        { position: "top-right" }
      );
    }
  };

  const handleProfileView = async (profileId) => {
    try {
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
    } catch (error) {
      console.error("Error incrementing profile views:", error.message);
    }
  };

  const getFilteredProfiles = () => {
    const userProfile = localStorage.getItem("loggedInUser");
    const userProfileId = userProfile
      ? JSON.parse(userProfile).profileId
      : "anonymous";

    return displayedProfiles.filter((profile) => {
      if (profile.id.toString() === userProfileId) return false;

      // Handle age range filtering
      if (filters.ageRange) {
        const [minAge, maxAge] = filters.ageRange
          .split("-")
          .map((val) => parseInt(val, 10));
        if (isNaN(minAge) || isNaN(maxAge)) {
          console.warn(`Invalid age range format: ${filters.ageRange}`);
          return true; // Skip invalid age range filter to avoid filtering out all profiles
        }
        if (profile.age < minAge || profile.age > maxAge) {
          return false;
        }
      }

      if (
        filters.community &&
        filters.community !== "all" &&
        profile.community !== filters.community
      ) {
        return false;
      }
      if (
        filters.location &&
        filters.location !== "all" &&
        profile.location.toLowerCase() !== filters.location.toLowerCase()
      ) {
        return false;
      }
      if (
        filters.education &&
        filters.education !== "all" &&
        !profile.education.includes(filters.education)
      ) {
        return false;
      }
      return true;
    });
  };

  const displayedProfiles = showReceived
    ? profiles.filter((profile) =>
        receivedInterests.includes(profile.id.toString())
      )
    : showSent
    ? profiles.filter((profile) =>
        interestsSent.includes(profile.id.toString())
      )
    : profiles;

  const filteredProfiles = getFilteredProfiles();
  const isPremiumOrPlus =
    currentSubscription === "premium" || currentSubscription === "premium plus";

  // Log filtered profiles for debugging
  console.log("Filtered profiles:", JSON.stringify(filteredProfiles, null, 2));

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
      <Header />
      <ToastContainer />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Your Matches
            </h1>
            <p className="text-gray-600">
              Discover compatible profiles based on your preferences
            </p>
          </div>
        <div className="flex flex-col gap-2 min-[320px]:mt-2 md:flex-row">
  <Button
    variant="outline"
    onClick={() => {
      setShowSent(true);
      setShowReceived(false);
    }}
    className={`text-yellow-700 border-yellow-400 hover:bg-yellow-100 w-full min-[320px]:w-[calc(90%-1rem)] min-[320px]:mt-[2px] ${
      showSent && !showReceived ? "bg-yellow-100" : ""
    }`}
  >
    <Inbox size={16} className="mr-2" />
    Sent Interests
  </Button>
  <Button
    variant="outline"
    onClick={() => {
      setShowReceived(true);
      setShowSent(false);
    }}
    className={`text-yellow-700 border-yellow-400 hover:bg-yellow-100 w-full min-[320px]:w-[calc(90%-1rem)] min-[320px]:mt-[2px] ${
      showReceived && !showSent ? "bg-yellow-100" : ""
    }`}
  >
    <Users size={16} className="mr-2" />
    Received Interests
  </Button>
</div>
        </div>

        <Card className="mb-8 border-yellow-200">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Filter Matches
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              <Select
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, ageRange: value }))
                }
              >
                <SelectTrigger className="border-yellow-300">
                  <SelectValue placeholder="Age Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="18-25">18-25 years</SelectItem>
                  <SelectItem value="26-30">26-30 years</SelectItem>
                  <SelectItem value="31-35">31-35 years</SelectItem>
                </SelectContent>
              </Select>

              <Select
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, community: value }))
                }
              >
                <SelectTrigger className="border-yellow-300">
                  <SelectValue placeholder="Community" />
                </SelectTrigger>
                <SelectContent>
                  {communities.map((community) => (
                    <SelectItem key={community} value={community}>
                      {community}
                    </SelectItem>
                  ))}
                  <SelectItem value="all">All Communities</SelectItem>
                </SelectContent>
              </Select>

              <Select
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, location: value }))
                }
              >
                <SelectTrigger className="border-yellow-300">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent className="max-h-48 overflow-y-auto">
                  <SelectItem value="all">All Locations</SelectItem>
                  {allCities.map((city) => (
                    <SelectItem key={city} value={city.toLowerCase()}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, education: value }))
                }
              >
                <SelectTrigger className="border-yellow-300">
                  <SelectValue placeholder="Education" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Qualifications</SelectItem>
                  <SelectItem value="High-School">High School</SelectItem>
                  <SelectItem value="Diploma">Diploma</SelectItem>
                  <SelectItem value="Bachelor">Bachelor's Degree</SelectItem>
                  <SelectItem value="Master">Master's Degree</SelectItem>
                  <SelectItem value="Ph.D.">PhD</SelectItem>
                  <SelectItem value="Professional">Professional Degree</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center text-gray-600">Loading profiles...</div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center text-gray-600">
            {showReceived
              ? "No interests received yet."
              : showSent
              ? "No interests sent yet."
              : "No profiles to display."}
            {filters.ageRange && " Try adjusting your filters."}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <Card
                key={profile.id}
                className="overflow-hidden hover:shadow-lg transition-shadow border-yellow-200"
              >
                <div className="aspect-square">
                  <img
                    src={
                      profile.photos > 0
                        ? `/api/profile/${profile.id}/photo`
                        : "https://via.placeholder.com/150"
                    }
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {profile.name}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>{profile.age} years</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase size={14} />
                      <span>{profile.profession}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span>{profile.location}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handlePass(profile.id.toString())}
                    >
                      <X size={16} className="mr-1" /> Decline
                    </Button>
                    <Button
                      size="sm"
                      className={`flex-1 ${
                        interestsSent.includes(profile.id.toString())
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700"
                      }`}
                      onClick={() => handleInterest(profile.id.toString())}
                      disabled={interestsSent.includes(profile.id.toString())}
                    >
                      <Heart size={16} className="mr-1" />{" "}
                      {interestsSent.includes(profile.id.toString())
                        ? "Accepted"
                        : "Accept"}
                    </Button>
                  </div>
                  {isPremiumOrPlus ? (
                    <Link
                      to={`/profile/${profile.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleProfileView(profile.id).finally(() => {
                          window.location.href = `/profile/${profile.id}`;
                        });
                      }}
                    >
                      <Button
                        variant="ghost"
                        className="w-full mt-2 text-yellow-600 hover:bg-yellow-50"
                      >
                        View Profile
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      disabled
                      variant="ghost"
                      className="w-full mt-2 text-gray-400"
                    >
                      View Profile (Premium+)
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;