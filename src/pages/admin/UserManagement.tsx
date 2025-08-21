import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  UserCheck,
  UserX,
  Mail,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";


const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';


interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  subscription: "free" | "premium";
  status: "active" | "inactive" | "banned";
  verified: boolean;
  joinDate: string;
  lastActive: string;
  profileComplete: number;
}

const UserManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/get/users`);
        console.log("My response", response.data);
        const userdata = response.data.map((user: any) => ({
          ...user,
          // Handle missing subscription or current field
          subscription: user.subscription,
          // role: user.subscription === "premium" ? "premium" : user.subscription || "free",
        }));
        setUsers(userdata);
        console.log("userdata", userdata)
      } catch (error) {
        console.error("Error fetching users:", error.message);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term, status, and role
  // Filter users based on search term, status, and role
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchMatch =
        searchTerm === "" ||
        (user.name?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
        (user.phone ?? "").includes(searchTerm);

      const statusMatch =
        statusFilter === "all" || (user.status ?? "") === statusFilter;

      const roleMatch = roleFilter === "all" || user.subscription === roleFilter;

      return searchMatch && statusMatch && roleMatch;
    });
  }, [users, searchTerm, statusFilter, roleFilter]);

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
    toast({
      title: "User Details",
      description: `Viewing details for ${user.name}`,
    });
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDeleteUser = async (userId: Number) => {
    try {
      await axios.delete(`${BASE_URL}/delete/user/${userId}`);
      setUsers((prev) => prev.filter((user) => user._id !== userId));
      toast({
        title: "User Deleted",
        description: "User has been successfully removed.",
        variant: "destructive",
      });
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Something went wrong while deleting.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      // Send status update to backend
      const res = await axios.put(`${BASE_URL}/user/${userId}/status`, {
        status: newStatus,
      });

      // Update local state with the new status
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId
            ? { ...user, status: res.data.status }
            : user
        )
      );

      toast({
        title: "Status Updated",
        description: `User status changed to ${newStatus}`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to update status",
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
      case "banned":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "premium":
        return "default";
      case "user":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            User Management
          </h1>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="addName">Full Name</Label>
                <Input id="addName" placeholder="Enter full name" />
              </div>
              <div>
                <Label htmlFor="addEmail">Email</Label>
                <Input id="addEmail" type="email" placeholder="Enter email" />
              </div>
              <div>
                <Label htmlFor="addPhone">Phone</Label>
                <Input id="addPhone" placeholder="Enter phone number" />
              </div>
              <div>
                <Label htmlFor="addRole">Subscription Status</Label>
                <Select defaultValue="free">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full admin-button-primary"
                onClick={() => {
                  toast({
                    title: "User Added",
                    description: "New user has been successfully created.",
                  });
                  setIsAddDialogOpen(false);
                }}
              >
                Add User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
                placeholder="    search users..."
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
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by subscription" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subscriptions</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="admin-card">
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Profile</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getRoleBadgeVariant(
                          user.subscription
                        )}
                      >
                        {user.subscription}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1 ">
                        <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700" variant={getBadgeVariant(user.status)}>
                          {user.status}
                        </Badge>
                        {/* {user.verified && (
                          <Badge variant="outline" className="text-xs">
                            ✓ Verified
                          </Badge>
                        )} */}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 h-2 rounded-full"
                            style={{ width: `${user.profileComplete}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {user.profileComplete}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(user.lastActive).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewUser(user)}
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
                            <DropdownMenuItem
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(
                                  user._id,
                                  user.status === "active"
                                    ? "inactive"
                                    : "active"
                                )
                              }
                            >
                              {user.status === "active" ? (
                                <>
                                  <UserX className="h-4 w-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user._id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
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

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.name}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.email}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.phone}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Subscription</Label>
                  <Badge
                    variant={getRoleBadgeVariant(
                      selectedUser.subscription
                    )}
                  >
                    {selectedUser.subscription}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700" variant={getBadgeVariant(selectedUser.status)}>
                    {selectedUser.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Verified</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.verified ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Join Date</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedUser.joinDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Active</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedUser.lastActive).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Profile Completion
                </Label>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-full bg-secondary rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 h-3 rounded-full"
                      style={{ width: `${selectedUser.profileComplete}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {selectedUser.profileComplete}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editName">Full Name</Label>
                <Input id="editName" defaultValue={selectedUser.name} />
              </div>
              <div>
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  defaultValue={selectedUser.email}
                />
              </div>
              <div>
                <Label htmlFor="editPhone">Phone</Label>
                <Input id="editPhone" defaultValue={selectedUser.phone} />
              </div>
              <div>
                <Label htmlFor="editRole">Subscription Status</Label>
                <Select
                  defaultValue={
                    selectedUser.subscription
                  }
                  onValueChange={setRole}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editStatus">Status</Label>
                <Select defaultValue={selectedUser.status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2">
                <Button
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700"
                  onClick={async () => {
                    try {
                      const updatedFields: any = {};

                      const name = (document.getElementById("editName") as HTMLInputElement).value;
                      const email = (document.getElementById("editEmail") as HTMLInputElement).value;
                      const phone = (document.getElementById("editPhone") as HTMLInputElement).value;

                      if (name !== selectedUser.name) updatedFields.name = name;
                      if (email !== selectedUser.email) updatedFields.email = email;
                      if (phone !== selectedUser.phone) updatedFields.phone = phone;

                      // Update subscription field
                      if (role && role !== selectedUser.subscription) {
                        updatedFields.subscription = role; // Directly set the subscription value
                      }

                      if (status && status !== selectedUser.status) {
                        updatedFields.status = status;
                      } else {
                        updatedFields.status = selectedUser.status;
                      }

                      await axios.put(`${BASE_URL}/update/user/${selectedUser._id}`, updatedFields);
                      setUsers((prevUsers) =>
                        prevUsers.map((user) =>
                          user._id === selectedUser._id ? { ...user, ...updatedFields } : user
                        )
                      );
                      toast({
                        title: "User Updated",
                        description: "User details have been successfully updated.",
                      });

                      setIsEditDialogOpen(false);
                    } catch (err) {
                      console.error("Error updating user:", err);
                      toast({
                        title: "Error",
                        description: "Failed to update user.",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  Save Changes
                </Button>

                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;