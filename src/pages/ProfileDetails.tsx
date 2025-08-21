import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { Camera, LogOut, Pencil, Trash2, User, Crown, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function ProfileDetails() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [editableSections, setEditableSections] = useState({
    basic: false,
    personal: false,
    religion: false,
    professional: false,
    horoscope: false,
  });
  const [horoscopeGenerated, setHoroscopeGenerated] = useState(false);
  const [horoscopeData, setHoroscopeData] = useState(null);
  const [horoscopeLoading, setHoroscopeLoading] = useState(false);
  const [familyTree, setFamilyTree] = useState([]);
  const [newMember, setNewMember] = useState({
    name: "",
    relation: "",
    details: "",
  });
  const [addingMember, setAddingMember] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const [dobError, setDobError] = useState('');

  const navigate = useNavigate();
  const { toast } = useToast();

  const validateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      setDobError('You must be at least 18 years old.');
      return false;
    } else {
      setDobError('');
      return true;
    }
  };

  const handleInputChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    if (field === 'dob') {
      validateAge(value);
    }
  };

  // Function to fetch user profile from server
  const fetchUserProfile = async (profileId) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/user-profile`, {
        params: { profileId },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
      const user = response.data.user;
      const transformedProfile = {
        profileId: user.profileId || "KM" + Date.now(),
        name: user.name || user.personalInfo?.name || "Unknown",
        age: user.dateOfBirth
          ? calculateAge(user.dateOfBirth)
          : user.demographics?.dateOfBirth
            ? calculateAge(user.demographics.dateOfBirth)
            : "Not specified",
        height: user.height || user.demographics?.height || "Not specified",
        location:
          user.city && user.state
            ? `${user.city}, ${user.state}`
            : user.location?.city && user.location?.state
              ? `${user.location.city}, ${user.location.state}`
              : "Not specified",
        profession:
          user.occupation ||
          user.professionalInfo?.occupation ||
          "Not specified",
        religion:
          user.religion || user.demographics?.religion || "Not specified",
        caste:
          user.community || user.demographics?.community || "Not specified",
        education:
          user.education || user.professionalInfo?.education || "Not specified",
          fieldOfStudy:
          user.fieldOfStudy || user.professionalInfo?.fieldOfStudy || "Not specified",
        fatherOccupation:
          user.familyInfo?.father || user.fatherOccupation || "Not specified",
        motherOccupation:
          user.familyInfo?.mother || user.motherOccupation || "Not specified",
        hobbies: user.hobbies || "Not specified",
        dob: user.dateOfBirth
          ? formatDate(user.dateOfBirth)
          : user.demographics?.dateOfBirth
            ? formatDate(user.demographics.dateOfBirth)
            : "Not specified",
        tob:
          user.timeOfBirth || user.demographics?.timeOfBirth || "Not specified",
        pob:
          user.placeOfBirth ||
          user.demographics?.placeOfBirth ||
          user.city ||
          "Not specified",
        language:
          user.motherTongue ||
          user.demographics?.motherTongue ||
          "Not specified",
        chartStyle:
          user.chartStyle || user.demographics?.chartStyle || "South Indian",
        email: user.email || user.personalInfo?.email || "Not specified",
        mobile: user.mobile || user.personalInfo?.mobile || "Not specified",
        gender: user.gender || user.personalInfo?.gender || "Not specified",
        lookingFor:
          user.lookingFor || user.personalInfo?.lookingFor || "Not specified",
        maritalStatus:
          user.maritalStatus ||
          user.demographics?.maritalStatus ||
          "Not specified",
        income: user.income || user.professionalInfo?.income || "Not specified",
        subscription: user.subscription || { current: "free" },
        profileImage:
          user.profileImage || user.personalInfo?.profileImage || null,
        document: user.document || user.personalInfo?.document || null,
        status: user.personalInfo?.Status || "active",
        horoscope: user.horoscope || {
          generated: false,
          compatibility: "",
          luckyNumbers: [],
          luckyColors: [],
          favorableTime: "",
          message: "",
        },
      };

      setProfile(transformedProfile);
      setFamilyTree(user.familyTree || []);
      setHoroscopeGenerated(transformedProfile.horoscope.generated);
      setHoroscopeData({
        compatibility: transformedProfile.horoscope.compatibility || "",
        luckyNumbers: transformedProfile.horoscope.luckyNumbers || [],
        luckyColors: transformedProfile.horoscope.luckyColors || [],
        favorableTime: transformedProfile.horoscope.favorableTime || "",
        message: transformedProfile.horoscope.message || "",
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError(err.response?.data?.error || "Failed to fetch user profile");
      setLoading(false);
    }
  };

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
        if (!loggedInUser?.profileId) {
          throw new Error("Please log in to view your profile");
        }
        await fetchUserProfile(loggedInUser.profileId);
      } catch (err) {
        console.error("Error loading user data:", err);
        setError(err.message || "Failed to load user data");
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const calculateAge = (dateOfBirth) => {
    try {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      return age;
    } catch (e) {
      return "Not specified";
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    } catch (e) {
      return "Not specified";
    }
  };

  // Handle profile image file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle document file change
  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedDocument(file);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setDocumentPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setDocumentPreview(null);
      }
    }
  };

  const generateHoroscope = () => {
    if (!validateAge(profile.dob)) {
      toast({
        title: "Error",
        description: "You must be at least 18 years old to generate a horoscope.",
        variant: "destructive",
      });
      return;
    }

    setHoroscopeLoading(true);
    setTimeout(() => {
      const mockResponse = {
        compatibility: "85%",
        luckyNumbers: [3, 7, 21, 33],
        luckyColors: ["Blue", "Green", "Yellow"],
        favorableTime: "Morning 6–8 AM",
        message:
          "This is a favorable time for new beginnings and relationships.",
      };
      setHoroscopeData(mockResponse);
      setHoroscopeGenerated(true);
      setHoroscopeLoading(false);
    }, 1000);
  };



  const handleDeleteFamilyMember = (index) => {
    const member = familyTree[index];
    setFamilyTree((prev) => prev.filter((_, i) => i !== index));
    toast({
      title: "Family Member Removed",
      description: `${member.name} has been removed from the family tree.`,
    });
  };

  const handleDeactivateAccount = async () => {
    if (!profile) {
      toast({
        title: "Error",
        description: "Profile data is missing.",
        variant: "destructive",
      });
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to deactivate your account? This will restrict access to your profile."
      )
    ) {
      return;
    }

    setIsDeactivating(true);
    try {
      const response = await axios.patch(
        `${BASE_URL}/api/profiles/${profile.profileId}/flag`,
        { reason: "User-initiated deactivation" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );

      if (response.status === 200) {
        setProfile((prev) => ({
          ...prev,
          status: "inactive",
        }));
        toast({
          title: "Account Deactivated",
          description:
            "Your account has been deactivated. Contact support to reactivate.",
        });
      }
    } catch (error) {
      console.error("Error deactivating account:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to deactivate account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) {
      toast({
        title: "Error",
        description: "Profile data is missing. Please reload the page.",
        variant: "destructive",
      });
      return;
    }

    if (!validateAge(profile.dob)) {
      toast({
        title: "Error",
        description: "You must be at least 18 years old to save the profile.",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);
    try {
      const updatedData = {
        personalInfo: {
          name: profile.name.trim(),
          email: profile.email || "Not specified",
          mobile: profile.mobile || "Not specified",
          gender: profile.gender || "Not specified",
          lookingFor: profile.lookingFor || "Not specified",
          profileImage: profile.profileImage || null,
          document: profile.document || null,
          avatar: profile.profileImage || null,
          profileComplete: profile.profileComplete || 0,
          Status: profile.status || "active",
        },
        demographics: {
          dateOfBirth:
            profile.dob && profile.dob.includes("/")
              ? new Date(
                profile.dob.split("/").reverse().join("-")
              ).toISOString()
              : profile.dob || "Not specified",
          height: profile.height || "Not specified",
          maritalStatus: profile.maritalStatus || "Not specified",
          religion: profile.religion || "Not specified",
          community: profile.caste || "Not specified",
          motherTongue: profile.language || "Not specified",
          timeOfBirth: profile.tob || "Not specified",
          placeOfBirth: profile.pob || "Not specified",
          chartStyle: profile.chartStyle || "South Indian",
        },
        professionalInfo: {
          education: profile.education || "Not specified",
          fieldOfStudy: profile.fieldOfStudy || "Not specified",
          occupation: profile.profession || "Not specified",
          income: profile.income || "Not specified",
        },
        location: {
          city:
            typeof profile.location === "string" &&
              profile.location.includes(",")
              ? profile.location.split(", ")[0].trim()
              : profile.pob || "Not specified",
          state:
            typeof profile.location === "string" &&
              profile.location.includes(",")
              ? profile.location.split(", ")[1]?.trim() || "Not specified"
              : "Not specified",
        },
        familyInfo: {
          father: profile.fatherOccupation || "Not specified",
          mother: profile.motherOccupation || "Not specified",
        },
        hobbies: profile.hobbies || "Not specified",
        familyTree: familyTree,
        subscription: profile.subscription || { current: "free" },
        horoscope: horoscopeGenerated
          ? {
            generated: true,
            compatibility: horoscopeData?.compatibility || "Not specified",
            luckyNumbers: horoscopeData?.luckyNumbers || [],
            luckyColors: horoscopeData?.luckyColors || [],
            favorableTime: horoscopeData?.favorableTime || "Not specified",
            message: horoscopeData?.message || "Not specified",
          }
          : {
            generated: false,
            compatibility: "",
            luckyNumbers: [],
            luckyColors: [],
            favorableTime: "",
            message: "",
          },
      };

      const formData = new FormData();
      formData.append("profileId", profile.profileId);
      formData.append("updatedData", JSON.stringify(updatedData));
      if (selectedFile) {
        formData.append("profileImage", selectedFile);
      }
      if (selectedDocument) {
        formData.append("document", selectedDocument);
      }

      const response = await axios.put(
        `${BASE_URL}/api/update-profile`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );

      if (response.status === 200) {
        await fetchUserProfile(profile.profileId);

        const updatedLocalStorageData = {
          ...JSON.parse(localStorage.getItem("loggedInUser") || "{}"),
          profileId: profile.profileId,
          name: updatedData.personalInfo.name,
          email: updatedData.personalInfo.email,
          mobile: updatedData.personalInfo.mobile,
          gender: updatedData.personalInfo.gender,
          lookingFor: updatedData.personalInfo.lookingFor,
          profileImage:
            response.data.user.personalInfo?.profileImage ||
            updatedData.personalInfo.profileImage ||
            null,
          document: response.data.user.personalInfo?.document || null,
          dateOfBirth: updatedData.demographics.dateOfBirth,
          height: updatedData.demographics.height,
          maritalStatus: updatedData.demographics.maritalStatus,
          religion: updatedData.demographics.religion,
          community: updatedData.demographics.community,
          motherTongue: updatedData.demographics.motherTongue,
          timeOfBirth: updatedData.demographics.timeOfBirth,
          placeOfBirth: updatedData.demographics.placeOfBirth,
          chartStyle: updatedData.demographics.chartStyle,
          education: updatedData.professionalInfo.education,
          fieldOfStudy: updatedData.professionalInfo.fieldOfStudy,
          occupation: updatedData.professionalInfo.occupation,
          income: updatedData.professionalInfo.income,
          city: updatedData.location.city,
          state: updatedData.location.state,
          familyInfo: updatedData.familyInfo,
          hobbies: updatedData.hobbies,
          familyTree: updatedData.familyTree,
          subscription: updatedData.subscription,
          status: response.data.user.personalInfo?.Status || "active",
          horoscope: updatedData.horoscope,
        };

        localStorage.setItem(
          "loggedInUser",
          JSON.stringify(updatedLocalStorageData)
        );

        setSelectedFile(null);
        setPreview(null);
        setSelectedDocument(null);
        setDocumentPreview(null);

        toast({
          title: "Profile Saved",
          description: "Your profile has been updated successfully!",
        });
        setEditableSections({
          basic: false,
          personal: false,
          religion: false,
          professional: false,
          horoscope: false,
        });
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.error ||
          error.message ||
          "Failed to save profile. Please check your network or try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    const possibleKeys = [
      "userData",
      "user",
      "currentUser",
      "loggedInUser",
      "userToken",
      "token",
    ];
    possibleKeys.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 bg-[#fffdeb] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 bg-[#fffdeb] min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Profile Not Found
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <Button
              onClick={() => navigate("/login")}
              className="bg-blue-600 hover:bg-blue-700 mr-2"
            >
              Go to Login
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              Refresh Page
            </Button>
          </div>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left text-sm">
            <p className="font-semibold text-yellow-800 mb-2">Debug Info:</p>
            <p className="text-yellow-700">
              localStorage userData:{" "}
              {localStorage.getItem("loggedInUser") ? "✓ Found" : "✗ Not found"}
            </p>
            <p className="text-yellow-700">
              sessionStorage userData:{" "}
              {sessionStorage.getItem("loggedInUser")
                ? "✓ Found"
                : "✗ Not found"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (profile?.status === "inactive") {
    return (
      <>
        <Header />
        <div className="max-w-5xl mx-auto px-4 py-10 bg-[#fffdeb] min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Account Deactivated
            </h2>
            <p className="text-gray-600 mb-4">
              Your account is currently deactivated. Please contact support to
              reactivate your account.
            </p>
            <Button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700"
            >
              Logout
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6 min-h-screen">
        <div className="flex justify-between items-center">
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold mb-1">My Profile</h1>
            <p className="text-muted-foreground">
              Manage your profile information and preferences
            </p>
          </div>
          <div className="flex gap-2">
            {/* <Button
              onClick={handleLogout}
              variant='outline'
              className='flex items-center gap-2 hover:bg-red-50 hover:border-red-300'
            >
              <LogOut className='w-4 h-4' />
              Logout
            </Button> */}
            <Button
              onClick={handleDeactivateAccount}
              variant="destructive"
              className="flex items-center gap-2"
              disabled={isDeactivating}
            >
              {isDeactivating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Deactivating...
                </>
              ) : (
                "Deactivate"
              )}
            </Button>
          </div>
        </div>

        {/* Basic Info */}
        <Card className="shadow-md rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Basic Information</CardTitle>
            <Pencil
              className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-700"
              onClick={() =>
                setEditableSections((prev) => ({
                  ...prev,
                  basic: !prev.basic,
                }))
              }
            />
          </CardHeader>
          <CardContent className="p-6 flex items-center gap-6">
            <div className="relative w-20 h-20">
              <img
                src={
                  preview ||
                  (profile.profileImage
                    ? profile.profileImage.startsWith("http")
                      ? profile.profileImage
                      : `${BASE_URL}${profile.profileImage}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      profile.name
                    )}&background=6366f1&color=fff&size=80`)
                }
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover"
              />
              <label
                htmlFor="profilePhoto"
                className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow hover:bg-gray-100 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-gray-600" />
                <input
                  id="profilePhoto"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            <div className="flex-1 space-y-1">
              {editableSections.basic ? (
                <div className="space-y-2">
                  <Input
                    value={profile.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Full Name"
                  />
                  <Input
                    value={profile.height}
                    onChange={(e) =>
                      handleInputChange("height", e.target.value)
                    }
                    placeholder="Height"
                  />
                  <Input
                    value={profile.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    placeholder="Location (City, State)"
                  />
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-semibold">{profile.name}</h2>
                  <p className="text-sm text-gray-600">
                    Profile ID: {profile.profileId}
                  </p>
                  <p>
                    {profile.age} Years, {profile.height}
                  </p>
                  <p>{profile.location}</p>
                  <p>{profile.profession}</p>
                  <p className="text-sm text-blue-600 font-medium">
                    {profile.subscription?.current?.toUpperCase() || "FREE"}{" "}
                    Member
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="shadow-md rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Personal Information</CardTitle>
            <Pencil
              className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-700"
              onClick={() =>
                setEditableSections((prev) => ({
                  ...prev,
                  personal: !prev.personal,
                }))
              }
            />
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {editableSections.personal ? (
              <>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Email:
                  </label>
                  <Input value={profile.email} disabled placeholder="Email" />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Mobile:
                  </label>
                  <Input
                    value={profile.mobile}
                    onChange={(e) =>
                      handleInputChange("mobile", e.target.value)
                    }
                    placeholder="Mobile"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Gender:
                  </label>
                  <Input
                    value={profile.gender}
                    onChange={(e) =>
                      handleInputChange("gender", e.target.value)
                    }
                    placeholder="Gender"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Looking For:
                  </label>
                  <Input
                    value={profile.lookingFor}
                    onChange={(e) =>
                      handleInputChange("lookingFor", e.target.value)
                    }
                    placeholder="Looking For"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Marital Status:
                  </label>
                  <Input
                    value={profile.maritalStatus}
                    onChange={(e) =>
                      handleInputChange("maritalStatus", e.target.value)
                    }
                    placeholder="Marital Status"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Income:
                  </label>
                  <Input
                    value={profile.income}
                    onChange={(e) =>
                      handleInputChange("income", e.target.value)
                    }
                    placeholder="Income"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Father's Name:
                  </label>
                  <Input
                    value={profile.fatherOccupation}
                    onChange={(e) =>
                      handleInputChange("fatherOccupation", e.target.value)
                    }
                    placeholder="Father's Name"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Mother's Name:
                  </label>
                  <Input
                    value={profile.motherOccupation}
                    onChange={(e) =>
                      handleInputChange("motherOccupation", e.target.value)
                    }
                    placeholder="Mother's Name"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Hobbies:
                  </label>
                  <Input
                    value={profile.hobbies}
                    onChange={(e) =>
                      handleInputChange("hobbies", e.target.value)
                    }
                    placeholder="Hobbies"
                  />
                </div>
                
              </>
            ) : (
              <>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>{" "}
                  {profile.email}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Mobile:</span>{" "}
                  {profile.mobile}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Gender:</span>{" "}
                  {profile.gender}
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Looking For:
                  </span>{" "}
                  {profile.lookingFor}
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Marital Status:
                  </span>{" "}
                  {profile.maritalStatus}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Income:</span> ₹
                  {profile.income}
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Father's Name:
                  </span>{" "}
                  {profile.fatherOccupation}
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Mother's Name:
                  </span>{" "}
                  {profile.motherOccupation}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Hobbies:</span>{" "}
                  {profile.hobbies}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Religion Info */}
        <Card className="shadow-md rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Religion Information</CardTitle>
            <Pencil
              className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-700"
              onClick={() =>
                setEditableSections((prev) => ({
                  ...prev,
                  religion: !prev.religion,
                }))
              }
            />
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {editableSections.religion ? (
              <>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Religion:
                  </label>
                  <Input
                    value={profile.religion}
                    onChange={(e) =>
                      handleInputChange("religion", e.target.value)
                    }
                    placeholder="Religion"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Community:
                  </label>
                  <Input
                    value={profile.caste}
                    onChange={(e) => handleInputChange("caste", e.target.value)}
                    placeholder="Community/Caste"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="font-medium text-gray-700">Religion:</span>{" "}
                  {profile.religion}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Community:</span>{" "}
                  {profile.caste}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Professional Info */}
        <Card className="shadow-md rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Professional Information</CardTitle>
            <Pencil
              className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-700"
              onClick={() =>
                setEditableSections((prev) => ({
                  ...prev,
                  professional: !prev.professional,
                }))
              }
            />
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {editableSections.professional ? (
              <>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Education:
                  </label>
                  <Input
                    value={profile.education}
                    onChange={(e) =>
                      handleInputChange("education", e.target.value)
                    }
                    placeholder="Education"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Field:
                  </label>
                  <Input
                    value={profile.fieldOfStudy}
                    onChange={(e) =>
                      handleInputChange("fieldOfStudy", e.target.value)
                    }
                    placeholder="Field"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Profession:
                  </label>
                  <Input
                    value={profile.profession}
                    onChange={(e) =>
                      handleInputChange("profession", e.target.value)
                    }
                    placeholder="Profession"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="font-medium text-gray-700">Education:</span>{" "}
                  {profile.education}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Field:</span>{" "}
                  {profile.fieldOfStudy}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Profession:</span>{" "}
                  {profile.profession}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Subscription Management */}
        <Card className="shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Subscription Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Plan Status */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Current Plan</h3>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${profile.subscription?.current === "premium plus"
                      ? "bg-purple-100 text-purple-800"
                      : profile.subscription?.current === "premium"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                >
                  {profile.subscription?.current?.toUpperCase() || "FREE"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <p className="text-green-600 font-medium">Active</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Started:</span>
                  <p>
                    {profile.subscription?.details?.startDate
                      ? new Date(
                        profile.subscription.details.startDate
                      ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Expires:</span>
                  <p>
                    {profile.subscription?.details?.expiryDate
                      ? new Date(
                        profile.subscription.details.expiryDate
                      ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              {profile.subscription?.current !== "free" &&
                profile.subscription?.details?.expiryDate && (
                  <div className="mt-3 p-2 bg-blue-100 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Days Remaining:</span>{" "}
                      {Math.max(
                        0,
                        Math.ceil(
                          (new Date(profile.subscription.details.expiryDate) -
                            new Date()) /
                          (1000 * 60 * 60 * 24)
                        )
                      )}{" "}
                      days
                    </p>
                  </div>
                )}
            </div>

            {/* Plan Features Comparison */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Plan Features</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Free Plan */}
                <div
                  className={`p-4 rounded-xl border-2 ${profile.subscription?.current === "free" ||
                      !profile.subscription?.current
                      ? "border-gray-400 bg-gray-50"
                      : "border-gray-200 bg-white"
                    }`}
                >
                  <div className="text-center mb-3">
                    <h5 className="font-semibold text-gray-900">Free</h5>
                    <p className="text-2xl font-bold text-gray-900">₹0</p>
                    <p className="text-sm text-gray-600">Forever</p>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Basic profile creation
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Limited profile views
                    </li>
                    <li className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      Contact details hidden
                    </li>
                    <li className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      No horoscope matching
                    </li>
                  </ul>
                </div>

                {/* Premium Plan */}
                <div
                  className={`p-4 rounded-xl border-2 ${profile.subscription?.current === "premium"
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-200 bg-white"
                    }`}
                >
                  <div className="text-center mb-3">
                    <h5 className="font-semibold text-blue-900">Premium</h5>
                    <p className="text-2xl font-bold text-blue-900">₹2,999</p>
                    <p className="text-sm text-blue-600">3 months</p>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Unlimited profile views
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Contact details visible
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Advanced search filters
                    </li>
                    <li className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      No horoscope matching
                    </li>
                  </ul>
                </div>

                {/* Premium Plus Plan */}
                <div
                  className={`p-4 rounded-xl border-2 ${profile.subscription?.current === "premium plus"
                      ? "border-purple-400 bg-purple-50"
                      : "border-gray-200 bg-white"
                    }`}
                >
                  <div className="text-center mb-3">
                    <div className="flex items-center justify-center gap-1">
                      <Crown className="w-4 h-4 text-purple-600" />
                      <h5 className="font-semibold text-purple-900">
                        Premium Plus
                      </h5>
                    </div>
                    <p className="text-2xl font-bold text-purple-900">₹4,999</p>
                    <p className="text-sm text-purple-600">3 months</p>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      All Premium features
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Horoscope matching
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Priority customer support
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Profile highlighting
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Subscription History */}
            {profile.subscription?.history &&
              profile.subscription.history.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">
                    Subscription History
                  </h4>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="space-y-2">
                      {profile.subscription.history
                        .slice(0, 3)
                        .map((history, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
                          >
                            <div>
                              <span className="font-medium text-gray-900">
                                {history.type?.toUpperCase() || "Unknown"}
                              </span>
                              {history.isUpgrade && (
                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  Upgrade
                                </span>
                              )}
                            </div>
                            <div className="text-right text-sm text-gray-600">
                              <p>
                                ₹
                                {history.proratedAmount ||
                                  (history.type === "premium"
                                    ? 2999
                                    : history.type === "premium plus"
                                      ? 4999
                                      : "N/A")}
                              </p>
                              <p>
                                {history.startDate
                                  ? new Date(
                                    history.startDate
                                  ).toLocaleDateString()
                                  : "N/A"}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

          {/* Upgrade Options */}
<div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200">
  <h4 className="font-semibold text-orange-900 mb-3">
    Available Upgrades
  </h4>
  <div className="space-y-3">
    {profile.subscription?.current === "free" ||
      !profile.subscription?.current ? (
      <div className="space-y-2">
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-sm h-16 leading-5 flex items-center justify-center text-center"
          onClick={() =>
            navigate("/payment?plan=premium&price=2999")
          }
        >
          Upgrade to Premium<br />₹2,999
        </Button>
        <Button
          className="w-full bg-purple-600 hover:bg-purple-700 text-sm h-16 leading-5 flex items-center justify-center text-center"
          onClick={() =>
            navigate("/payment?plan=premium%20plus&price=4999")
          }
        >
          Upgrade to Premium Plus<br />₹4,999
        </Button>
      </div>
    ) : profile.subscription?.current === "premium" ? (
      <Button
        className="w-full bg-purple-600 hover:bg-purple-700 text-sm h-16 leading-5 flex items-center justify-center text-center"
        onClick={() =>
          navigate("/payment?plan=premium%20plus&upgrade=true")
        }
      >
        Upgrade to Premium Plus<br />(Prorated Billing)
      </Button>
    ) : (
      <div className="text-center py-4">
        <Crown className="w-8 h-8 text-purple-600 mx-auto mb-2" />
        <p className="text-purple-900 font-medium">
          You have the highest plan!
        </p>
        <p className="text-sm text-purple-700">
          Enjoy all premium features
        </p>
      </div>
    )}
  </div>
</div>

            {/* Billing Information */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h4 className="font-semibold text-gray-900 mb-3">
                Billing Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">
                    Payment Method:
                  </span>
                  <p>Razorpay (Card/UPI/Net Banking)</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Auto-Renewal:
                  </span>
                  <p className="text-red-600">Disabled</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Last Payment:
                  </span>
                  <p>
                    {profile.subscription?.details?.startDate
                      ? new Date(
                        profile.subscription.details.startDate
                      ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Next Billing:
                  </span>
                  <p>
                    {profile.subscription?.details?.expiryDate
                      ? new Date(
                        profile.subscription.details.expiryDate
                      ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Horoscope */}
        <Card className="shadow-md rounded-2xl">
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle>Horoscope</CardTitle>
            <Pencil
              className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-700"
              onClick={() =>
                setEditableSections((prev) => ({
                  ...prev,
                  horoscope: !prev.horoscope,
                }))
              }
            />
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {editableSections.horoscope ? (
                <>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Date of Birth:
                    </label>
                    <Input
                      type="date"
                      value={profile.dob}
                      onChange={(e) => handleInputChange("dob", e.target.value)}
                      placeholder="Date of Birth"
                      className="w-full"
                    />
                    {dobError && <p className="text-red-500 text-sm mt-1">{dobError}</p>}
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Time of Birth:
                    </label>
                    <Input
                      type="time"
                      value={profile.tob}
                      onChange={(e) => handleInputChange("tob", e.target.value)}
                      placeholder="Time of Birth"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Birth Place:
                    </label>
                    <Input
                      value={profile.pob}
                      onChange={(e) => handleInputChange("pob", e.target.value)}
                      placeholder="Birth Place"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Language:
                    </label>
                    <Input
                      value={profile.language}
                      onChange={(e) => handleInputChange("language", e.target.value)}
                      placeholder="Language"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Chart Style:
                    </label>
                    <Input
                      value={profile.chartStyle}
                      onChange={(e) => handleInputChange("chartStyle", e.target.value)}
                      placeholder="Chart Style"
                      className="w-full"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="font-medium text-gray-700">Date of Birth:</span>{" "}
                    {profile.dob}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Time of Birth:</span>{" "}
                    {profile.tob}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Birth Place:</span>{" "}
                    {profile.pob}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Language:</span>{" "}
                    {profile.language}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Chart Style:</span>{" "}
                    {profile.chartStyle}
                  </div>
                </>
              )}
            </div>

            {profile.subscription?.current === "premium plus" ? (
              <>
                {horoscopeLoading ? (
                  <div className="bg-yellow-100 text-yellow-800 p-4 rounded-xl flex flex-col items-center justify-center space-y-2 text-center">
                    <div className="w-6 h-6 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-medium">
                      Generating Horoscope...
                    </p>
                  </div>
                ) : !horoscopeGenerated ? (
                  <div className="bg-yellow-400 text-black p-4 rounded-xl flex flex-col items-center justify-center space-y-4 text-center">
                    <span className="text-sm md:text-base">
                      Generate your horoscope and get more responses
                    </span>
                    <Button
                      onClick={generateHoroscope}
                      className="bg-white text-yellow-600 font-semibold hover:bg-gray-100"
                    >
                      GENERATE HOROSCOPE
                    </Button>
                  </div>
                ) : (
                  horoscopeData && (
                    <div className="bg-green-100 border border-green-300 rounded p-4 text-green-800">
                      <p className="font-semibold">
                        Horoscope Generated Successfully!
                      </p>
                      <p>
                        <strong>Compatibility:</strong>{" "}
                        {horoscopeData.compatibility}
                      </p>
                      <p>
                        <strong>Lucky Numbers:</strong>{" "}
                        {horoscopeData.luckyNumbers.join(", ")}
                      </p>
                      <p>
                        <strong>Lucky Colors:</strong>{" "}
                        {horoscopeData.luckyColors.join(", ")}
                      </p>
                      <p>
                        <strong>FavorableTime:</strong>{" "}
                        {horoscopeData.favorableTime}
                      </p>
                      <p>{horoscopeData.message}</p>
                    </div>
                  )
                )}
              </>
            ) : (
              <div className="bg-gray-100 border border-gray-300 rounded p-4 text-gray-800 text-center">
                <p className="font-semibold mb-2">Horoscope Features</p>
                <p>
                  Upgrade to Premium Plus to access horoscope generation and
                  analysis.
                </p>
                <Button
                  className="mt-3 bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate("/membership")}
                >
                  Upgrade Now
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Family Tree
        <Card className="shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle>Family Tree</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {familyTree.map((member, idx) => (
                <li
                  key={idx}
                  className="border p-4 rounded-xl shadow-sm bg-gray-50 flex justify-between items-center"
                >
                  <div>
                    <strong>{member.name}</strong>
                    <br />
                    <span className="text-gray-600">
                      {member.relation} – {member.details}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteFamilyMember(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>

            {addingMember && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-4 border-t">
                <Input
                  placeholder="Name"
                  value={newMember.name}
                  onChange={(e) =>
                    setNewMember({ ...newMember, name: e.target.value })
                  }
                />
                <Input
                  placeholder="Relation"
                  value={newMember.relation}
                  onChange={(e) =>
                    setNewMember({ ...newMember, relation: e.target.value })
                  }
                />
                <Input
                  placeholder="Details"
                  value={newMember.details}
                  onChange={(e) =>
                    setNewMember({ ...newMember, details: e.target.value })
                  }
                />
                <div className="col-span-1 md:col-span-3 flex gap-2 mt-2">
                  <Button
                    onClick={() => {
                      if (newMember.name && newMember.relation) {
                        setFamilyTree([...familyTree, newMember]);
                        setNewMember({ name: "", relation: "", details: "" });
                        setAddingMember(false);
                      }
                    }}
                    className="flex-1"
                  >
                    Add Member
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNewMember({ name: "", relation: "", details: "" });
                      setAddingMember(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            {!addingMember && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setAddingMember(true)}
              >
                + Add Member
              </Button>
            )}
          </CardContent>
        </Card> */}

        {/* Document Upload */}
        <Card className="shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle>Document Upload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {documentPreview ? (
                <img
                  src={documentPreview}
                  alt="Document Preview"
                  className="w-20 h-20 rounded object-cover"
                />
              ) : profile.document ? (
                <a
                  href={
                    profile.document.startsWith("http")
                      ? profile.document
                      : `${BASE_URL}${profile.document}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View Document
                </a>
              ) : (
                <p className="text-gray-600">No document uploaded</p>
              )}
              <label
                htmlFor="documentUpload"
                className="bg-white p-2 rounded-full shadow hover:bg-gray-100 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-gray-600" />
                <input
                  id="documentUpload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleDocumentChange}
                />
              </label>
            </div>
            <p className="text-sm text-gray-600">
              Upload a document (e.g., ID proof, certificate) in PDF, JPG, or
              PNG format.
            </p>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="text-center pt-6">
          <Button
            className="px-6 py-2 text-lg font-semibold"
            onClick={handleSaveProfile}
            disabled={updating}
          >
            {updating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              "Save Profile"
            )}
          </Button>
        </div>
      </div>
    </>
  );
}