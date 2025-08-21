import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as Slider from "@radix-ui/react-slider";
import { Switch } from "@/components/ui/switch";
import {
  Grid,
  List,
  Search as SearchIcon,
  Heart,
  X,
  User,
  MapPin,
  Briefcase,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface Community {
  _id: string;
  name: string;
  religion: string;
}

interface Religion {
  _id: string;
  name: string;
}

const stateCities = {
  andhra_pradesh: [
    "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool",
    "Rajahmundry", "Tirupati", "Kadapa", "Anantapur", "Chittoor", "Ongole"
  ],
  arunachal_pradesh: [
    "Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro"
  ],
  assam: [
    "Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Tezpur"
  ],
  bihar: [
    "Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga", "Purnia"
  ],
  chhattisgarh: [
    "Raipur", "Bhilai", "Bilaspur", "Korba", "Durg"
  ],
  goa: [
    "Panaji", "Margao", "Vasco da Gama", "Mapusa"
  ],
  gujarat: [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar",
    "Jamnagar", "Junagadh", "Gandhinagar"
  ],
  haryana: [
    "Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal", "Hisar",
    "Rohtak", "Sonipat"
  ],
  himachal_pradesh: [
    "Shimla", "Manali", "Dharamshala", "Mandi", "Kullu", "Solan"
  ],
  jharkhand: [
    "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh"
  ],
  karnataka: [
    "Bengaluru", "Mysuru", "Mangaluru", "Hubli", "Belagavi", "Davangere",
    "Tumakuru", "Shivamogga", "Ballari", "Udupi", "Hassan", "Raichur",
    "Bidar", "Chitradurga", "Gadag"
  ],
  kerala: [
    "Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Alappuzha",
    "Palakkad", "Kannur", "Malappuram", "Kollam", "Kottayam"
  ],
  madhya_pradesh: [
    "Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Satna"
  ],
  maharashtra: [
    "Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur",
    "Amravati", "Kolhapur", "Sangli", "Latur", "Jalgaon", "Akola",
    "Ahmednagar", "Satara", "Chandrapur"
  ],
  manipur: [
    "Imphal", "Thoubal", "Churachandpur", "Ukhrul"
  ],
  meghalaya: [
    "Shillong", "Tura", "Jowai"
  ],
  mizoram: [
    "Aizawl", "Lunglei", "Champhai"
  ],
  nagaland: [
    "Kohima", "Dimapur", "Mokokchung"
  ],
  odisha: [
    "Bhubaneswar", "Cuttack", "Rourkela", "Sambalpur", "Berhampur"
  ],
  punjab: [
    "Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda", "Mohali"
  ],
  rajasthan: [
    "Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Alwar"
  ],
  sikkim: [
    "Gangtok", "Namchi", "Mangan", "Geyzing"
  ],
  tamil_nadu: [
    "Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Erode",
    "Vellore", "Tirunelveli", "Thoothukudi", "Kanchipuram", "Thanjavur",
    "Dindigul", "Karur", "Cuddalore", "Nagapattinam"
  ],
  telangana: [
    "Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam",
    "Mahbubnagar", "Adilabad", "Ramagundam", "Siddipet", "Mancherial"
  ],
  tripura: [
    "Agartala", "Udaipur", "Dharmanagar"
  ],
  uttar_pradesh: [
    "Lucknow", "Kanpur", "Varanasi", "Agra", "Prayagraj", "Meerut",
    "Ghaziabad", "Noida", "Bareilly", "Moradabad", "Aligarh", "Jhansi"
  ],
  uttarakhand: [
    "Dehradun", "Haridwar", "Rishikesh", "Haldwani", "Roorkee", "Nainital"
  ],
  west_bengal: [
    "Kolkata", "Siliguri", "Asansol", "Durgapur", "Howrah", "Darjeeling"
  ],
  andaman_nicobar: ["Port Blair"],
  chandigarh: ["Chandigarh"],
  dadra_nagar_haveli_daman_diu: ["Silvassa", "Daman", "Diu"],
  delhi: ["New Delhi", "Dwarka", "Rohini", "Saket", "Karol Bagh"],
  jammu_kashmir: ["Srinagar", "Jammu", "Anantnag", "Baramulla"],
  ladakh: ["Leh", "Kargil"],
  lakshadweep: ["Kavaratti"],
  puducherry: ["Puducherry", "Karaikal", "Mahe", "Yanam"],
  other: []
};

const Search = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [ageRange, setAgeRange] = useState([25, 35]);
  const [showResults, setShowResults] = useState(true);
  const [passedProfiles, setPassedProfiles] = useState<string[]>([]);
  const [interestedProfiles, setInterestedProfiles] = useState<string[]>([]);
  const [profiles, setProfiles] = useState([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<string>("free");
  const [userProfileId, setUserProfileId] = useState<string>("anonymous");
  const [userGender, setUserGender] = useState<string>("");
  const [interestsSentToday, setInterestsSentToday] = useState<number>(0);
  const [interestLimitReached, setInterestLimitReached] = useState<boolean>(false);
  const [userType, setUserType] = useState<"free" | "premium" | "premium_plus">("free");
  const [selectedReligion, setSelectedReligion] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedEducation, setSelectedEducation] = useState("");
  const [selectedProfession, setSelectedProfession] = useState("");
  const [selectedIncome, setSelectedIncome] = useState("");
  const [horoscopeMatch, setHoroscopeMatch] = useState(false);
  const [photoAvailable, setPhotoAvailable] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [religions, setReligions] = useState<Religion[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [communitiesRes, religionsRes] = await Promise.all([
          fetch(`${BASE_URL}/api/communities`),
          fetch(`${BASE_URL}/api/religions`)
        ]);

        if (!communitiesRes.ok) throw new Error("Failed to fetch communities");
        if (!religionsRes.ok) throw new Error("Failed to fetch religions");

        const communitiesData = await communitiesRes.json();
        const religionsData = await religionsRes.json();

        setCommunities(communitiesData);
        setReligions(religionsData);
      } catch (error) {
        console.error("Error fetching initial data:", error.message);
        toast({
          title: "Error",
          description: "Failed to load filter options.",
          variant: "destructive",
        });
      }
    };

    fetchInitialData();
  }, [toast]);

  useEffect(() => {
    if (selectedReligion) {
      const filtered = communities.filter(community => 
        community.religion.toLowerCase() === selectedReligion.toLowerCase()
      );
      setFilteredCommunities(filtered);
    } else {
      setFilteredCommunities(communities);
    }
  }, [selectedReligion, communities]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userProfile = localStorage.getItem("loggedInUser");
        const userData = userProfile ? JSON.parse(userProfile) : null;
        const profileId = userData?.profileId || "anonymous";

        const userProfileResponse = await fetch(
          `${BASE_URL}/api/user-profile?profileId=${profileId}`,
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
        const subscriptionStatus = userProfileData.user.subscription?.current || "free";
        setCurrentSubscription(subscriptionStatus);
        setUserProfileId(userProfileData.user.profileId || "anonymous");
        setUserGender(userProfileData.user.gender || "");

        if (subscriptionStatus === "free") {
          setUserType("free");
        } else if (subscriptionStatus === "premium") {
          setUserType("premium");
        } else if (subscriptionStatus === "premium plus") {
          setUserType("premium_plus");
        }

        const interestsResponse = await fetch(
          `${BASE_URL}/api/interested-profiles?userProfileId=${userProfileData.user.profileId || "anonymous"}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!interestsResponse.ok) {
          const errorData = await interestsResponse.json().catch(() => ({}));
          throw new Error(`Failed to fetch interested profiles: ${errorData.error} || interests`)
        }
        const interestsData = await interestsResponse.json();
        setInterestedProfiles(interestsData.map((profile) => profile.id.toString()));

        const passedResponse = await fetch(
          `${BASE_URL}/api/passed-profiles?userProfileId=${userProfileData.user.profileId || "anonymous"}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!passedResponse.ok) {
          const errorData = await passedResponse.json().catch(() => ({}));
          throw new Error(`Failed to fetch passed profiles: ${errorData.error || passedResponse.statusText}`);
        }
        const passedData = await passedResponse.json();
        setPassedProfiles(passedData.map((profile) => profile.id.toString()));

        const profilesResponse = await fetch(`${BASE_URL}/api/profiles`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!profilesResponse.ok) {
          throw new Error(`Failed to fetch profiles: ${profilesResponse.statusText}`);
        }
        const profilesData = await profilesResponse.json();
        setProfiles(profilesData);
        setFetchError(null);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setFetchError("Failed to load profiles. Please try again later.");
        toast({
          title: "Error",
          description: "Failed to load profiles or interests.",
          variant: "destructive",
        });
      }
    };
    fetchData();
  }, [toast]);

  const sendInterest = async (profileId: string) => {
    if (userType === "free" && interestsSentToday >= 2) {
      toast({
        title: "Limit Reached",
        description: "You can only send 2 interests per day as a free user.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log(
        `Sending interest: userProfileId=${userProfileId}, interestedProfileId=${profileId}`
      );
      const response = await fetch(`${BASE_URL}/api/send-interest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userProfileId, interestedProfileId: profileId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to send interest");
      }

      const responseData = await response.json();
      console.log(
        `Interest sent successfully: ${JSON.stringify(responseData, null, 2)}`
      );
      toast({
        title: "Interest Sent",
        description: "Your interest has been sent.",
        variant: "default",
      });
      setInterestedProfiles((prev) => [...prev, profileId]);

      if (userType === "free") {
        setInterestsSentToday((prev) => prev + 1);
      }

      const noti = await fetch(
        `${BASE_URL}/api/admin/notifications/${profileId}`,
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
    } catch (error) {
      console.error("Error sending interest:", error.message);
      toast({
        title: "Error",
        description:
          error.message === "Interest already sent for this profile"
            ? "You have already sent interest to this profile."
            : error.message === "Interested profile not found"
            ? "The selected profile does not exist."
            : "Failed to send interest.",
        variant: "destructive",
      });
    }
  };

  const handlePass = async (id: string) => {
    try {
      console.log(
        `Sending pass: userProfileId=${userProfileId}, passedProfileId=${id}`
      );
      const response = await fetch(`${BASE_URL}/api/pass-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userProfileId, passedProfileId: id }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to pass profile");
      }

      setPassedProfiles((prev) => [...prev, id.toString()]);
      toast({
        title: "Profile Passed",
        description: "You have passed on this profile.",
      });
    } catch (error) {
      console.error("Error passing profile:", error.message);
      toast({
        title: "Error",
        description:
          error.message === "Profile not found"
            ? "The selected profile does not exist."
            : "Failed to pass profile.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = () => {
    setShowResults(true);
    console.log("Search triggered with filters:", {
      ageRange,
      selectedCommunity,
      selectedState,
      selectedCity,
      selectedEducation,
      selectedProfession,
      selectedIncome,
      horoscopeMatch,
      photoAvailable,
    });
  };

  const handleProfileView = async (profileId: string) => {
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

  const getSubscriptionValue = (sub: string) => {
    const subscription = sub || "free";
    if (subscription === "premium plus") return 3;
    if (subscription === "premium") return 2;
    return 1;
  };

  const getFilteredProfiles = () => {
    const userProfile = localStorage.getItem("loggedInUser");
    const userProfileId = userProfile ? JSON.parse(userProfile).profileId : "anonymous";
    const user = userProfile ? JSON.parse(userProfile) : { lookingFor: "female" };
    const currentSubscription = user.subscription?.current || user.subscription || "free";
    const userLookingFor = user.lookingFor?.toLowerCase() || "female";

    console.log(
      `Filtering profiles. User subscription: ${currentSubscription}, lookingFor: ${userLookingFor}, total profiles: ${profiles.length}`
    );

    let filtered = profiles.filter((profile) => {
      console.log(`Evaluating profile ID: ${profile.id}`);

      if (profile.id?.toString() === userProfileId) {
        console.log(`Excluding own profile: ${profile.id}`);
        return false;
      }

      const profileSub = profile.subscription || "free";
      if (currentSubscription === "free" && profileSub !== "free") {
        console.log(`Excluding profile ${profile.id} due to subscription mismatch: ${profileSub}`);
        return false;
      }
      if (currentSubscription === "premium" && profileSub === "premium plus") {
        console.log(`Excluding profile ${profile.id} due to subscription mismatch: ${profileSub}`);
        return false;
      }

      if (horoscopeMatch && currentSubscription === "premium plus") {
        if (profileSub !== "premium plus") {
          console.log(`Excluding profile ${profile.id} due to non-premium plus subscription: ${profileSub}`);
          return false;
        }
      }

      if (profile.gender) {
        if (profile.gender.toLowerCase() !== userLookingFor) {
          console.log(`Excluding profile ${profile.id} due to gender mismatch: ${profile.gender}`);
          return false;
        }
      } else {
        console.warn(`Profile ${profile.id} has undefined gender, excluding`);
        return false;
      }

      if (selectedReligion && selectedReligion !== "all") {
        if (!profile.religion || profile.religion.toLowerCase() !== selectedReligion.toLowerCase()) {
          return false;
        }
      }

      if (profile.age && (profile.age < ageRange[0] || profile.age > ageRange[1])) {
        console.log(`Excluding profile ${profile.id} due to age: ${profile.age}`);
        return false;
      }

      if (selectedCommunity && selectedCommunity !== "all") {
        if (!profile.community || profile.community.toLowerCase() !== selectedCommunity.toLowerCase()) {
          return false;
        }
      }

      if (selectedState && selectedState !== "all") {
        const profileLocLower = profile.location ? profile.location.toLowerCase() : "";
        if (selectedCity && selectedCity !== "all") {
          if (!profileLocLower.includes(selectedCity.toLowerCase())) {
            console.log(`Excluding profile ${profile.id} due to city mismatch: ${profile.location || "undefined"}`);
            return false;
          }
        } else {
          const stateCitiesList = stateCities[selectedState] || [];
          if (!stateCitiesList.some(city => profileLocLower.includes(city.toLowerCase()))) {
            console.log(`Excluding profile ${profile.id} due to state mismatch: ${profile.location || "undefined"}`);
            return false;
          }
        }
      }

      const educationMap = {
        "high-school": ["High School", "12th"],
        diploma: ["Diploma"],
        bachelor: ["B.E", "B.Sc", "B.Des", "B.Pharm", "Bachelor"],
        master: ["MBA", "M.E", "M.Sc", "Master"],
        phd: ["Ph.D", "MD"],
        professional: ["B.E", "MBA", "B.Pharm"],
        other: ["Other"],
      };
      if (selectedEducation && selectedEducation !== "all") {
        const keywords = educationMap[selectedEducation] || [];
        if (!profile.education || !keywords.some((k) => profile.education.toLowerCase().includes(k.toLowerCase()))) {
          console.log(`Excluding profile ${profile.id} due to education: ${profile.education || "undefined"}`);
          return false;
        }
      }

      const professionMap = {
        "software-engineer": ["Developer", "Engineer"],
        doctor: ["Doctor", "Nurse"],
        teacher: ["Teacher", "Professor"],
        business: ["Manager", "Business"],
        government: ["Government", "Officer"],
        banking: ["Bank", "Finance"],
        other: ["Other"],
      };
      if (selectedProfession && selectedProfession !== "all") {
        const keywords = professionMap[selectedProfession] || [];
        if (!profile.profession || !keywords.some((k) => profile.profession.toLowerCase().includes(k.toLowerCase()))) {
          console.log(`Excluding profile ${profile.id} due to profession: ${profile.profession || "undefined"}`);
          return false;
        }
      }

      if (selectedIncome && selectedIncome !== "all") {
        if (!profile.income || profile.income !== selectedIncome) {
          console.log(`Excluding profile ${profile.id} due to income: ${profile.income || "undefined"}`);
          return false;
        }
      }

      if (photoAvailable) {
        if (!profile.photos || profile.photos <= 0 || !profile.image) {
          console.log(`Excluding profile ${profile.id} due to missing photos: ${profile.photos || 0} and no image`);
          return false;
        }
      }

      console.log(`Including profile ${profile.id}`);
      return true;
    });

    if (currentSubscription === "premium plus") {
      filtered = filtered.sort(
        (a, b) =>
          getSubscriptionValue(b.subscription) - getSubscriptionValue(a.subscription)
      );
      console.log(
        "Sorted profiles for premium plus user:",
        JSON.stringify(
          filtered.map((p) => ({ id: p.id, subscription: p.subscription })),
          null,
          2
        )
      );
    }

    if (userType === "free") {
      filtered = filtered.slice(0, 5);
    }

    console.log(`Filtered profiles count: ${filtered.length}`);
    return filtered;
  };

  const filteredProfiles = showResults ? getFilteredProfiles() : [];
  const displayProfiles = filteredProfiles.filter(
    (p) => !passedProfiles.includes(p.id?.toString())
  );
  console.log(
    `Display profiles count: ${displayProfiles.length}, after excluding passed profiles: ${passedProfiles}`
  );

  const isPremiumOrPlus =
    currentSubscription === "premium" || currentSubscription === "premium plus";

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
      <Header />
      <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 lg:mb-8">Advanced Search</h1>
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          <div className="w-full lg:w-1/3 xl:w-1/4">
            <Card className="border-yellow-200 sticky top-4">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 lg:mb-6">Search Filters</h2>
                <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                  <div>
                    <label className="block mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base">
                      Age Range: {ageRange[0]} - {ageRange[1]} years
                    </label>
                    <Slider.Root
                      value={ageRange}
                      onValueChange={setAgeRange}
                      min={18}
                      max={80}
                      step={1}
                      className="relative flex items-center select-none touch-none w-full h-[20px]"
                    >
                      <Slider.Track className="bg-gray-200 relative flex-grow h-[4px] rounded-full">
                        <Slider.Range className="absolute bg-blue-500 h-full rounded-full" />
                      </Slider.Track>
                      <Slider.Thumb className="block w-[12px] h-[12px] sm:w-[15px] sm:h-[15px] bg-blue-500 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300" />
                      <Slider.Thumb className="block w-[12px] h-[12px] sm:w-[15px] sm:h-[15px] bg-blue-500 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300" />
                    </Slider.Root>
                  </div>
                  <div>
                    <Label className="mb-1 sm:mb-2 block text-xs sm:text-sm lg:text-base">
                      State
                      {currentSubscription === "free" && (
                        <span className="text-gray-400 text-[10px] sm:text-xs"> (Premium)</span>
                      )}
                    </Label>
                    <Select
                      value={selectedState}
                      onValueChange={(value) => {
                        setSelectedState(value);
                        setSelectedCity("");
                      }}
                      disabled={currentSubscription === "free"}
                    >
                      <SelectTrigger className="border-orange-200 text-xs sm:text-sm lg:text-base min-h-[32px] sm:min-h-[36px]">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All States</SelectItem>
                        {Object.keys(stateCities).map((state) => (
                          <SelectItem key={state} value={state}>
                            {state.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1 sm:mb-2 block text-xs sm:text-sm lg:text-base">
                      City
                      {currentSubscription === "free" && (
                        <span className="text-gray-400 text-[10px] sm:text-xs"> (Premium)</span>
                      )}
                    </Label>
                    <Select
                      value={selectedCity}
                      onValueChange={setSelectedCity}
                      disabled={currentSubscription === "free" || !selectedState}
                    >
                      <SelectTrigger className="border-orange-200 text-xs sm:text-sm lg:text-base min-h-[32px] sm:min-h-[36px]">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cities</SelectItem>
                        {selectedState &&
                          stateCities[selectedState]?.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1 sm:mb-2 block text-xs sm:text-sm lg:text-base">
                      Religion
                      {currentSubscription === "free" && (
                        <span className="text-gray-400 text-[10px] sm:text-xs"> (Premium)</span>
                      )}
                    </Label>
                    <Select
                      value={selectedReligion}
                      onValueChange={(value) => {
                        setSelectedReligion(value);
                        setSelectedCommunity("");
                      }}
                      disabled={currentSubscription === "free"}
                    >
                      <SelectTrigger className="border-orange-200 text-xs sm:text-sm lg:text-base min-h-[32px] sm:min-h-[36px]">
                        <SelectValue placeholder="Select religion" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Religions</SelectItem>
                        {religions.map((religion) => (
                          <SelectItem key={religion._id} value={religion.name}>
                            {religion.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1 sm:mb-2 block text-xs sm:text-sm lg:text-base">
                      Community
                      {currentSubscription === "free" && (
                        <span className="text-gray-400 text-[10px] sm:text-xs"> (Premium)</span>
                      )}
                    </Label>
                    <Select
                      value={selectedCommunity}
                      onValueChange={setSelectedCommunity}
                      disabled={currentSubscription === "free"}
                    >
                      <SelectTrigger className="border-orange-200 text-xs sm:text-sm lg:text-base min-h-[32px] sm:min-h-[36px]">
                        <SelectValue placeholder="Select community" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Communities</SelectItem>
                        {filteredCommunities.map((community) => (
                          <SelectItem key={community._id} value={community.name}>
                            {community.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1 sm:mb-2 block text-xs sm:text-sm lg:text-base">
                      Education
                      {currentSubscription === "free" && (
                        <span className="text-gray-400 text-[10px] sm:text-xs"> (Premium)</span>
                      )}
                    </Label>
                    <Select
                      value={selectedEducation}
                      onValueChange={setSelectedEducation}
                      disabled={currentSubscription === "free"}
                    >
                      <SelectTrigger className="border-orange-200 text-xs sm:text-sm lg:text-base min-h-[32px] sm:min-h-[36px]">
                        <SelectValue placeholder="Select education" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Educations</SelectItem>
                        <SelectItem value="high-school">High-school</SelectItem>
                        <SelectItem value="diploma">Diploma</SelectItem>
                        <SelectItem value="bachelor">Bachelor Degree</SelectItem>
                        <SelectItem value="master">Master's Degree</SelectItem>
                        <SelectItem value="phd">PhD</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1 sm:mb-2 block text-xs sm:text-sm lg:text-base">
                      Profession
                      {currentSubscription === "free" && (
                        <span className="text-gray-400 text-[10px] sm:text-xs"> (Premium)</span>
                      )}
                    </Label>
                    <Select
                      value={selectedProfession}
                      onValueChange={setSelectedProfession}
                      disabled={currentSubscription === "free"}
                    >
                      <SelectTrigger className="border-orange-200 text-xs sm:text-sm lg:text-base min-h-[32px] sm:min-h-[36px]">
                        <SelectValue placeholder="Select profession" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Professions</SelectItem>
                        <SelectItem value="software-engineer">Engineer</SelectItem>
                        <SelectItem value="doctor">Doctor</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="government">Government Job</SelectItem>
                        <SelectItem value="banking">Banking</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1 sm:mb-2 block text-xs sm:text-sm lg:text-base">
                      Annual Income
                      {currentSubscription === "free" && (
                        <span className="text-gray-400 text-[10px] sm:text-xs"> (Premium)</span>
                      )}
                    </Label>
                    <Select
                      value={selectedIncome}
                      onValueChange={setSelectedIncome}
                      disabled={currentSubscription === "free"}
                    >
                      <SelectTrigger className="border-orange-200 text-xs sm:text-sm lg:text-base min-h-[32px] sm:min-h-[36px]">
                        <SelectValue placeholder="Select income range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Incomes</SelectItem>
                        <SelectItem value="2-5">₹2-5 Lakhs</SelectItem>
                        <SelectItem value="5-10">₹5-10 Lakhs</SelectItem>
                        <SelectItem value="10-15">₹10-15 Lakhs</SelectItem>
                        <SelectItem value="15-25">₹15-25 Lakhs</SelectItem>
                        <SelectItem value="25-50">₹25-50 Lakhs</SelectItem>
                        <SelectItem value="50+">₹50+ Lakhs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs sm:text-sm lg:text-base">
                      Horoscope Match
                      {currentSubscription !== "premium plus" && (
                        <span className="text-gray-400 text-[10px] sm:text-xs"> (Premium+)</span>
                      )}
                    </Label>
                    <Switch
                      checked={horoscopeMatch}
                      onCheckedChange={setHoroscopeMatch}
                      disabled={currentSubscription !== "premium plus"}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs sm:text-sm lg:text-base">
                      Photo Available
                    </Label>
                    <Switch
                      checked={photoAvailable}
                      onCheckedChange={setPhotoAvailable}
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-xs sm:text-sm lg:text-base py-2 sm:py-2.5"
                  >
                    <SearchIcon size={14} className="mr-1 sm:mr-2" />
                    Search Profiles
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="w-full lg:w-2/3 xl:w-3/4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 lg:mb-6 gap-3 sm:gap-4">
              <div>
                <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800">
                  Search Results
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
                  {fetchError
                    ? "Error loading profiles"
                    : showResults
                    ? displayProfiles.length > 0
                      ? `Showing ${displayProfiles.length} profiles matching your criteria`
                      : "No profiles match your criteria. Try adjusting your filters."
                    : "Use filters to find your perfect match"}
                </p>
              </div>
              {showResults && !fetchError && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    variant={viewMode === "grid" ? "default" : "outline"}
                    className={
                      viewMode === "grid"
                        ? "bg-yellow-500 hover:bg-yellow-600 min-w-[36px] h-8 sm:h-9"
                        : "border-yellow-300 min-w-[36px] h-8 sm:h-9"
                    }
                  >
                    <Grid size={14} className="sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setViewMode("list")}
                    variant={viewMode === "list" ? "default" : "outline"}
                    className={
                      viewMode === "list"
                        ? "bg-yellow-500 hover:bg-yellow-600 min-w-[36px] h-8 sm:h-9"
                        : "border-yellow-300 min-w-[36px] h-8 sm:h-9"
                    }
                  >
                    <List size={14} className="sm:h-4 sm:w-4" />
                  </Button>
                </div>
              )}
            </div>
            {fetchError ? (
              <div className="text-center text-red-600 text-xs sm:text-sm lg:text-base">{fetchError}</div>
            ) : (
              <div
                className={`grid gap-3 sm:gap-4 lg:gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {displayProfiles.length > 0
                  ? displayProfiles.map((profile) => (
                      <Card
                        key={profile.id}
                        className={`overflow-hidden hover:shadow-lg transition-shadow border-yellow-200 min-w-0 ${
                          viewMode === "list" ? "flex flex-col sm:flex-row items-stretch" : ""
                        }`}
                      >
                        <div
                          className={`relative ${
                            viewMode === "list"
                              ? "w-full sm:w-32 md:w-40 h-48 sm:h-auto flex-shrink-0"
                              : "aspect-square w-full"
                          }`}
                        >
                          <img
                            src={profile.image}
                            alt={profile.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder-image.jpg"; // Fallback image
                            }}
                          />
                        </div>
                        <CardContent className="p-3 sm:p-4 flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 truncate max-w-[calc(100%-60px)]">
                                {profile.name}
                              </h3>
                              {profile.subscription === "premium plus" && (
                                <Badge className="bg-purple-100 text-purple-800 text-[10px] sm:text-xs">
                                  Premium Plus
                                </Badge>
                              )}
                            </div>
                            <div className="space-y-1 text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 lg:mb-4">
                              <div className="flex items-center gap-1">
                                <User size={12} className="sm:h-4 sm:w-4" />
                                <span>{profile.age} years</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Briefcase size={12} className="sm:h-4 sm:w-4" />
                                <span className="truncate">{profile.profession}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin size={12} className="sm:h-4 sm:w-4" />
                                <span className="truncate">{profile.location}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-row gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 text-xs sm:text-sm h-8 sm:h-9"
                                onClick={() => handlePass(profile.id)}
                              >
                                <X size={14} className="mr-1 sm:h-4 sm:w-4" /> Pass
                              </Button>
                              <Button
                                size="sm"
                                className={`flex-1 text-xs sm:text-sm h-8 sm:h-9 ${
                                  interestedProfiles.includes(profile.id?.toString())
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700"
                                }`}
                                onClick={() => sendInterest(profile.id)}
                                disabled={interestedProfiles.includes(profile.id?.toString())}
                              >
                                <Heart size={14} className="mr-1 sm:h-4 sm:w-4" />
                                {interestedProfiles.includes(profile.id?.toString()) ? "Sent" : "Interest"}
                              </Button>
                            </div>
                            <Link
                              to={`/profile/${profile.id}`}
                              onClick={(e) => {
                                e.preventDefault();
                                handleProfileView(profile.id).finally(() => {
                                  window.location.href = `/profile/${profile.id}`;
                                });
                              }}
                              className="w-full"
                            >
                              <Button
                                variant="ghost"
                                className="w-full text-yellow-600 hover:bg-yellow-50 text-xs sm:text-sm h-8 sm:h-9"
                              >
                                View Profile
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  : showResults && (
                      <div className="col-span-full text-center text-gray-600 text-xs sm:text-sm lg:text-base">
                        No profiles match your criteria. Try adjusting your filters or check back later.
                      </div>
                    )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;