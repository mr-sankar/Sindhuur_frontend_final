import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UserCheck,
  Search,
  Filter,
  Eye,
  Flag,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Heart,
  MapPin,
  Calendar,
  Briefcase,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface SubscriptionDetails {
  current: "free" | "premium" | "premium plus";
  startDate: string | null;
  expiryDate: string | null;
  autoRenew: boolean;
}

interface Profile {
  id: number;
  name: string;
  age: number;
  gender: "male" | "female";
  location: string;
  profession: string;
  community: string;
  education: string;
  maritalStatus: "never_married" | "divorced" | "widowed";
  profileStatus: "active" | "inactive" | "flagged" | "under_review";
  verified: boolean;
  premium: boolean;
  subscription: SubscriptionDetails;
  photos: number;
  profileComplete: number;
  lastActive: string;
  joinDate: string;
  flagReasons: string[];
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const getSubscriptionDisplay = (sub: string) => {
  if (sub === "free") return "Free";
  if (sub === "premium") return "Premium";
  if (sub === "premium plus") return "Premium Plus";
  return sub.charAt(0).toUpperCase() + sub.slice(1);
};

const getSubscriptionBadgeVariant = (sub: string) => {
  if (sub === "premium") return "default";
  if (sub === "premium plus") return "outline";
  return "secondary";
};

const ProfileManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [communityFilter, setCommunityFilter] = useState("all");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [communities, setCommunities] = useState<string[]>([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast({
            title: "Authentication Error",
            description: "Please log in to access profiles.",
            variant: "destructive",
          });
          return;
        }
        const response = await axios.get(`${BASE_URL}/api/admin/profiles`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfiles(response.data);
      } catch (error) {
        console.error("Error fetching profiles:", error);
        toast({
          title: "Error",
          description: "Failed to fetch profiles from backend.",
          variant: "destructive",
        });
      }
    };

    const fetchCommunities = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/communities`);
        setCommunities(response.data.map((item: { name: string }) => item.name));
        if (response.data.length === 0) {
          toast({
            title: "Warning",
            description: "No communities found in the database.",
            variant: "default",
          });
        }
      } catch (error: any) {
        console.error("Error fetching communities:", error);
        toast({
          title: "Error",
          description: `Failed to fetch communities: ${error.message}`,
          variant: "destructive",
        });
      }
    };

    fetchProfiles();
    fetchCommunities();
  }, [toast]);

  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch =
      profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.profession.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || profile.profileStatus === statusFilter;
    const matchesCommunity =
      communityFilter === "all" || profile.community === communityFilter;

    return matchesSearch && matchesStatus && matchesCommunity;
  });

  const handleViewProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setIsViewDialogOpen(true);
    toast({
      title: "Profile Details",
      description: `Viewing profile for ${profile.name}`,
    });
  };

  const handleFlagProfile = async (profileId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to perform this action.",
          variant: "destructive",
        });
        return;
      }
      await axios.patch(
        `${BASE_URL}/api/admin/profiles/${profileId}/flag`,
        { reason: "Flagged by admin" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfiles(
        profiles.map((profile) =>
          profile.id === profileId
            ? {
                ...profile,
                profileStatus: "flagged" as const,
                flagReasons: [...profile.flagReasons, "Flagged by admin"],
              }
            : profile
        )
      );
      toast({
        title: "Profile Flagged",
        description: "Profile has been flagged for review.",
        variant: "destructive",
      });
    } catch (error) {
      console.error("Error flagging profile:", error);
      toast({
        title: "Error",
        description: "Failed to flag profile.",
        variant: "destructive",
      });
    }
  };

  const handleUnflagProfile = async (profileId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to perform this action.",
          variant: "destructive",
        });
        return;
      }
      await axios.patch(
        `${BASE_URL}/api/admin/profiles/${profileId}/unflag`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfiles(
        profiles.map((profile) =>
          profile.id === profileId
            ? { ...profile, profileStatus: "active" as const, flagReasons: [] }
            : profile
        )
      );
      toast({
        title: "Profile Unflagged",
        description: "Profile has been restored to active status.",
      });
    } catch (error) {
      console.error("Error unflagging profile:", error);
      toast({
        title: "Error",
        description: "Failed to unflag profile.",
        variant: "destructive",
      });
    }
  };

  const handleVerifyProfile = async (profileId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to perform this action.",
          variant: "destructive",
        });
        return;
      }
      await axios.patch(
        `${BASE_URL}/api/admin/profiles/${profileId}/verify`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfiles(
        profiles.map((profile) =>
          profile.id === profileId ? { ...profile, verified: true } : profile
        )
      );
      toast({
        title: "Profile Verified",
        description: "Profile has been verified successfully.",
      });
    } catch (error) {
      console.error("Error verifying profile:", error);
      toast({
        title: "Error",
        description: "Failed to verify profile.",
        variant: "destructive",
      });
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "inactive":
        return "secondary";
      case "flagged":
        return "destructive";
      case "under_review":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "inactive":
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case "flagged":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "under_review":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <UserCheck className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            Profile Management
          </h1>
        </div>
      </div>

      {/* Filters */}
      <Card className="admin-card">
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              {searchTerm === "" && (
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              )}
              <Input
                placeholder="    Search profiles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-border w-full"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
              </SelectContent>
            </Select>

            <Select value={communityFilter} onValueChange={setCommunityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by community" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Communities</SelectItem>
                {communities.map((community) => (
                  <SelectItem key={community} value={community}>
                    {community}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Profiles Table */}
      <Card className="admin-card">
        <CardHeader>
          <CardTitle>Profiles ({filteredProfiles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profile</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Completion</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback>
                            {profile.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{profile.name}</span>
                            {profile.verified && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            {profile.subscription.current !== "free" && (
                              <Badge
                                variant={getSubscriptionBadgeVariant(
                                  profile.subscription.current
                                )}
                                className="text-xs bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700"
                              >
                                {getSubscriptionDisplay(
                                  profile.subscription.current
                                )}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {profile.age} years • {profile.gender}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                          {profile.location}
                        </div>
                        <div className="flex items-center text-sm">
                          <Briefcase className="h-3 w-3 mr-1 text-muted-foreground" />
                          {profile.profession}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {profile.community} • {profile.education}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(profile.profileStatus)}
                          <Badge
                            variant={getBadgeVariant(profile.profileStatus)}
                            className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700"
                          >
                            {profile.profileStatus.replace("_", " ")}
                          </Badge>
                        </div>
                        {profile.flagReasons.length > 0 && (
                          <div className="text-xs text-red-500">
                            {profile.flagReasons.length} flag(s)
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 h-2 rounded-full"
                            style={{ width: `${profile.profileComplete}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {profile.profileComplete}%
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {profile.photos} photos
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(profile.lastActive).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewProfile(profile)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {profile.profileStatus === "flagged" ? (
                              <DropdownMenuItem
                                onClick={() => handleUnflagProfile(profile.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                Unflag Profile
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleFlagProfile(profile.id)}
                              >
                                <Flag className="h-4 w-4 mr-2 text-red-500" />
                                Flag Profile
                              </DropdownMenuItem>
                            )}
                            {/* {!profile.verified && (
                              <DropdownMenuItem
                                onClick={() => handleVerifyProfile(profile.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                Verify Profile
                              </DropdownMenuItem>
                            )} */}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Profile Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-3xl md:max-w-4xl max-h-[90vh] p-4 sm:p-6 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl md:text-2xl">
              Profile Details
            </DialogTitle>
          </DialogHeader>
          {selectedProfile && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="text-sm sm:text-base md:text-lg">
                    {selectedProfile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-2">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold">
                      {selectedProfile.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {selectedProfile.verified && (
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                      )}
                      {selectedProfile.subscription.current !== "free" && (
                        <Badge
                          variant={getSubscriptionBadgeVariant(
                            selectedProfile.subscription.current
                          )}
                          className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-xs sm:text-sm"
                        >
                          {getSubscriptionDisplay(
                            selectedProfile.subscription.current
                          )}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-muted-foreground" />
                      {selectedProfile.age} years old
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-muted-foreground" />
                      {selectedProfile.location}
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-muted-foreground" />
                      {selectedProfile.profession}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Community:</span>{" "}
                      {selectedProfile.community}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="font-semibold text-base sm:text-lg">
                    Personal Information
                  </h4>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gender:</span>
                      <span className="capitalize">
                        {selectedProfile.gender}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Marital Status:
                      </span>
                      <span className="capitalize">
                        {selectedProfile.maritalStatus.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Education:</span>
                      <span>{selectedProfile.education}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Photos:</span>
                      <span>{selectedProfile.photos} uploaded</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h4 className="font-semibold text-base sm:text-lg">
                    Account Information
                  </h4>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge
                        variant={getBadgeVariant(selectedProfile.profileStatus)}
                        className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-xs sm:text-sm"
                      >
                        {selectedProfile.profileStatus.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Subscription:
                      </span>
                      <span>
                        {getSubscriptionDisplay(
                          selectedProfile.subscription.current
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Subscription Start:
                      </span>
                      <span>
                        {selectedProfile.subscription.startDate
                          ? new Date(
                              selectedProfile.subscription.startDate
                            ).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Subscription Expiry:
                      </span>
                      <span>
                        {selectedProfile.subscription.expiryDate
                          ? new Date(
                              selectedProfile.subscription.expiryDate
                            ).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Auto Renew:</span>
                      <span>
                        {selectedProfile.subscription.autoRenew ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Join Date:</span>
                      <span>
                        {new Date(
                          selectedProfile.joinDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Last Active:
                      </span>
                      <span>
                        {new Date(
                          selectedProfile.lastActive
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-base sm:text-lg mb-2">
                  Profile Completion
                </h4>
                <div className="flex items-center space-x-2">
                  <div className="w-full bg-secondary rounded-full h-3 sm:h-4">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 h-3 sm:h-4 rounded-full"
                      style={{ width: `${selectedProfile.profileComplete}%` }}
                    ></div>
                  </div>
                  <span className="text-xs sm:text-sm font-medium">
                    {selectedProfile.profileComplete}%
                  </span>
                </div>
              </div>

              {selectedProfile.flagReasons.length > 0 && (
                <div>
                  <h4 className="font-semibold text-base sm:text-lg mb-2 text-red-600">
                    Flag Reasons
                  </h4>
                  <div className="space-y-1">
                    {selectedProfile.flagReasons.map((reason, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                        <span className="text-red-600 text-xs sm:text-sm">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4 border-t">
                {selectedProfile.profileStatus === "flagged" ? (
                  <Button
                    className="admin-button-primary w-full sm:w-auto"
                    onClick={() => {
                      handleUnflagProfile(selectedProfile.id);
                      setIsViewDialogOpen(false);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Unflag Profile
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      handleFlagProfile(selectedProfile.id);
                      setIsViewDialogOpen(false);
                    }}
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Flag Profile
                  </Button>
                )}

                {/* {!selectedProfile.verified && (
                  <Button
                    className="admin-button-secondary bg-green-600 w-full sm:w-auto"
                    onClick={() => {
                      handleVerifyProfile(selectedProfile.id);
                      setIsViewDialogOpen(false);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify Profile
                  </Button>
                )} */}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileManagement;