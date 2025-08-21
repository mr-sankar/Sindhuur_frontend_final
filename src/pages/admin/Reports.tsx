import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  FileText,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  AlertTriangle,
  Clock,
  User,
  Flag,
  MessageSquare,
  Image,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import * as XLSX from "xlsx";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";


interface Report {
  id: string;
  reporterName: string;
  reporterEmail: string;
  reportingUserId: string;
  reportedUserName: string;
  reportedUserId: string;
  type:
    | "harassment"
    | "fake_profile"
    | "inappropriate_content"
    | "spam"
    | "other";
  category: "profile" | "message" | "photo" | "behavior";
  description: string;
  status: "pending" | "under_review" | "resolved" | "dismissed";
  priority: "low" | "medium" | "high" | "critical";
  evidence?: string[];
  reportDate: string;
  assignedTo?: string;
  resolutionNotes?: string;
  actionTaken?: string;
}

interface Stats {
  pending: number;
  under_review: number;
  resolved: number;
  critical: number;
}

const Reports = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [assignData, setAssignData] = useState({
    reportId: "",
    priority: "",
    category: "",
    assignee: "",
  });
  const [moderators, setModerators] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<Stats>({
    pending: 0,
    under_review: 0,
    resolved: 0,
    critical: 0,
  });

  // Set up axios with auth token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  const mockModerators = [
    "moderator",
    "seniormoderator",
    "contentmoderator",
    "autommoderator",
  ];
  const fetchStats = async () => {
    try {
      const statsResponse = await axios.get(`${BASE_URL}/api/reports/stats`);
      setStats(statsResponse.data);
    } catch (error: any) {
      console.error("Error fetching stats:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load stats.",
        variant: "destructive",
      });
    }
  };

 const fetchData = async (search = '') => {
  try {
    const params = {
      page: search ? 1 : page, // Always reset to page 1 when searching
      limit: 10,
      search: search || undefined,
    };
 const reportsResponse = await axios.get(`${BASE_URL}/api/reports`, { params });
    const { reports, pagination } = reportsResponse.data;

    setTotalPages(pagination.pages);
    setIsSearching(!!search); // Set searching state

      if (!reports.length) {
        toast({
          title: "No Reports",
          description: "No reports found in the system.",
          variant: "default",
        });
      }
      setTotalPages(pagination.pages);

      const profilesResponse = await axios.get(`${BASE_URL}/api/profiles`);
      const profiles = profilesResponse.data;

      const moderatorsResponse = await axios.get(`${BASE_URL}/api/moderators`);
      setModerators(moderatorsResponse.data.moderators);

      const reportsData: Report[] = reports.map((report: any) => {
        const profile = profiles.find(
          (p: any) => p.id === report.reportingUserId
        );
        const userEmail =
          report.userEmail ||
          (profile
            ? profile.email || profile.id
            : report.reportingUserId || "Unknown User");

        return {
          id: report._id,
          reporterName: report.details.reporterName || "Unknown",
          reporterEmail: userEmail,
          reportingUserId: report.reportingUserId || "Unknown",
          reportedUserName: report.details.reportedUserName || "Unknown",
          reportedUserId: report.reportedProfileId || "Unknown",
          type: report.details.reason || "other",
          category: report.category || report.details.category || "behavior",
          description: report.details.message || "No description",
          status: report.status || "pending",
          priority: report.priority || "medium",
          evidence: report.evidence || [],
          reportDate: report.createdAt || new Date().toISOString(),
          assignedTo: report.assignedTo || undefined,
          resolutionNotes: report.resolutionNotes || undefined,
          actionTaken: report.actionTaken || undefined,
        };
      });
      setReports(reportsData);
    setFilteredReports(reportsData);

      await fetchStats();
    } catch (error: any) {
      console.error("Error fetching data:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast({
          title: "Authentication Error",
          description: "Please log in as an admin to view reports.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.error || "Failed to load data.",
          variant: "destructive",
        });
      }
    }
  };

 useEffect(() => {
  const delayDebounceFn = setTimeout(() => {
    if (searchTerm.trim()) {
      fetchData(searchTerm.trim());
    } else {
      fetchData();
      setIsSearching(false);
    }
  }, 500); // 500ms debounce

  return () => clearTimeout(delayDebounceFn);
}, [searchTerm, page]); 

  const filteredReportsList = filteredReports.filter((report) => {
    const matchesSearch =
      report.reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportedUserName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportingUserId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportedUserId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || report.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || report.priority === priorityFilter;
    const matchesCategory =
      categoryFilter === "all" || report.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const handleExportReports = () => {
    const exportData = filteredReportsList.map((report) => ({
      "Report ID": report.id,
      "Reporter Name": report.reporterName,
      "Reporter Email": report.reporterEmail,
      "Reporter ID": report.reportingUserId,
      "Reported User": report.reportedUserName,
      "Reported User ID": report.reportedUserId,
      Type: report.type.replace("_", " "),
      Category: report.category,
      Description: report.description,
      Status: report.status.replace("_", " "),
      Priority: report.priority,
      Evidence: report.evidence ? report.evidence.join(", ") : "None",
      "Report Date": new Date(report.reportDate).toLocaleDateString(),
      "Assigned To": report.assignedTo || "Unassigned",
      "Resolution Notes": report.resolutionNotes || "None",
      "Action Taken": report.actionTaken || "None",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
    XLSX.writeFile(workbook, "reports.xlsx");
    toast({
      title: "Export Successful",
      description: "Reports have been exported to Excel.",
    });
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setResolutionNotes(report.resolutionNotes || "");
    setActionTaken(report.actionTaken || "");
    setIsViewDialogOpen(true);
    toast({
      title: "Report Details",
      description: `Viewing report #${report.id}`,
    });
  };

  const handleUpdateStatus = async (
    reportId: string,
    newStatus: "pending" | "under_review" | "resolved" | "dismissed"
  ) => {
    try {
      await axios.patch(`${BASE_URL}/api/reports/${reportId}`, {
        status: newStatus,
      });
      await fetchStats(); // Fetch updated stats
      await fetchData(); // Refresh reports
      toast({
        title: "Status Updated",
        description: `Report status changed to ${newStatus.replace("_", " ")}`,
      });
    } catch (error: any) {
      console.error("Error updating report status:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.error || "Failed to update report status.",
        variant: "destructive",
      });
    }
  };

  const handleResolveReport = async () => {
    if (selectedReport) {
      try {
        await axios.patch(`${BASE_URL}/api/reports/${selectedReport.id}`, {
          status: "resolved",
          resolutionNotes,
          actionTaken,
        });
        await fetchStats(); // Fetch updated stats
        await fetchData(); // Refresh reports
        setIsViewDialogOpen(false);
        toast({
          title: "Report Resolved",
          description: "Report has been marked as resolved.",
        });
      } catch (error: any) {
        console.error("Error resolving report:", error);
        toast({
          title: "Error",
          description:
            error.response?.data?.error || "Failed to resolve report.",
          variant: "destructive",
        });
      }
    }
  };

  const handleAssignReport = async (reportId: string, assignee: string) => {
    try {
      await axios.patch(`${BASE_URL}/api/reports/${reportId}`, {
        assignedTo: assignee,
        status: "under_review",
      });
      await fetchStats(); // Fetch updated stats
      await fetchData(); // Refresh reports
      toast({
        title: "Report Assigned",
        description: `Report assigned to ${assignee}`,
      });
    } catch (error: any) {
      console.error("Error assigning report:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to assign report.",
        variant: "destructive",
      });
    }
  };

  const openAssignDialog = (reportId: string) => {
    const report = reports.find((r) => r.id === reportId);
    setAssignData({
      reportId,
      priority: report?.priority || "",
      category: report?.category || "",
      assignee: report?.assignedTo || "",
    });
    setIsAssignDialogOpen(true);
  };

  const handleAssignSubmit = async () => {
    try {
      await axios.patch(`${BASE_URL}/api/reports/${assignData.reportId}`, {
        priority: assignData.priority,
        category: assignData.category,
        assignedTo: assignData.assignee,
        status: "under_review",
      });
      await fetchStats(); // Fetch updated stats
      await fetchData(); // Refresh reports
      setIsAssignDialogOpen(false);
      toast({
        title: "Report Assigned",
        description: `Assigned to ${assignData.assignee}`,
      });
    } catch (error: any) {
      console.error("Error assigning report:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to assign report.",
        variant: "destructive",
      });
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "under_review":
        return "default";
      case "resolved":
        return "default";
      case "dismissed":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "low":
        return "secondary";
      case "medium":
        return "default";
      case "high":
        return "destructive";
      case "critical":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "under_review":
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "dismissed":
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "profile":
        return <User className="h-4 w-4" />;
      case "message":
        return <MessageSquare className="h-4 w-4" />;
      case "photo":
        return <Image className="h-4 w-4" />;
      case "behavior":
        return <Flag className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            Reports & Moderation
          </h1>
        </div>
        <Button
          className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-primary-foreground hover:bg-primary/90"
          onClick={handleExportReports}
        >
          <Download className="h-4 w-4 mr-2" />
          Export Reports
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-background border border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-background border border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Under Review</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.under_review}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-background border border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.resolved}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-background border border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.critical}
                </p>
              </div>
              <Flag className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-background border border-border">
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          
<div className="relative w-full">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  <Input
    placeholder="Search reports..."
    value={searchTerm}
    onChange={(e) => {
      setSearchTerm(e.target.value);
      if (e.target.value === '') {
        setPage(1); // Reset to page 1 when clearing search
      }
    }}
    className="pl-10 bg-background border-border w-full ml-3"
  />
  {/* {isSearching && (
    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
      Searching...
    </span>
  )} */}
</div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Harassment">Harassment</SelectItem>
                <SelectItem value="Technical">Technical</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card className="bg-background border border-border">
        <CardHeader>
          <CardTitle>Reports ({filteredReportsList.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Details</TableHead>
                  <TableHead>Reported User</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReportsList.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            Report #{report.id}
                          </span>
                          <Badge variant="outline">
                            {report.type.replace("_", " ")}
                          </Badge>
                        </div>
                       
                        <div className="text-sm text-muted-foreground">
                          Reporter ID: {report.reportingUserId}
                        </div>
                        <div className="text-sm">
                          Date:{" "}
                          {new Date(report.reportDate).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {report.reportedUserName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {report.reportedUserId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(report.category)}
                        <Badge variant="outline">{report.category}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityBadgeVariant(report.priority)}>
                        {report.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(report.status)}
                        <Badge
                          className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700"
                          variant={getBadgeVariant(report.status)}
                        >
                          {report.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {report.assignedTo || "Unassigned"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewReport(report)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openAssignDialog(report.id)}
                        >
                          Assign
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(report.id, "under_review")
                              }
                            >
                              <AlertTriangle className="h-4 w-4 mr-2" /> Mark
                              Under Review
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(report.id, "resolved")
                              }
                            >
                              <CheckCircle className="h-4 w-4 mr-2" /> Mark
                              Resolved
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(report.id, "dismissed")
                              }
                            >
                              <XCircle className="h-4 w-4 mr-2" /> Dismiss
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleAssignReport(
                                  report.id,
                                  "Senior Moderator"
                                )
                              }
                            >
                              <User className="h-4 w-4 mr-2" /> Assign to Senior
                              Moderator
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
          <div className="flex items-center justify-center gap-4 mt-4 sm:gap-6 md:gap-8 flex-wrap">
            <Button
  disabled={page === 1}
  onClick={() => {
    setPage(p => p - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }}
  className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-primary-foreground hover:bg-primary/90 px-4 py-2 text-sm sm:text-base"
>
  Previous
</Button>
<span className="text-foreground text-sm sm:text-base">
  Page {page} of {totalPages}
  {isSearching && <span className="text-muted-foreground text-xs"> (Search Results)</span>}
</span>
<Button
  disabled={page === totalPages}
  onClick={() => {
    setPage(p => p + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }}
  className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-primary-foreground hover:bg-primary/90 px-4 py-2 text-sm sm:text-base"
>
  Next
</Button>
          </div>
        </CardContent>
      </Card>

      {/* View Report Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="w-[95vw] max-w-full sm:max-w-3xl md:max-w-4xl max-h-[80vh] overflow-y-auto bg-background p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-foreground text-lg sm:text-xl">
              Report Details - #{selectedReport?.id}
            </DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-base sm:text-lg text-foreground">
                    Report Information
                  </h4>
                  <div className="space-y-2 text-sm sm:text-base">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Report Type:
                      </span>
                      <Badge variant="outline">
                        {selectedReport.type.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <div className="flex items-center space-x-1">
                        {getCategoryIcon(selectedReport.category)}
                        <span className="text-foreground">
                          {selectedReport.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Priority:</span>
                      <Badge
                        variant={getPriorityBadgeVariant(
                          selectedReport.priority
                        )}
                      >
                        {selectedReport.priority}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge
                        className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700"
                        variant={getBadgeVariant(selectedReport.status)}
                      >
                        {selectedReport.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="text-foreground">
                        {new Date(
                          selectedReport.reportDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Assigned To:
                      </span>
                      <span className="text-foreground">
                        {selectedReport.assignedTo || "Unassigned"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-base sm:text-lg text-foreground">
                    People Involved
                  </h4>
                  <div className="space-y-2 text-sm sm:text-base">
                    <div>
                      <span className="text-muted-foreground">Reporter:</span>
                      <div className="mt-1">
                        <div className="font-medium text-foreground">
                          {selectedReport.reporterName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {selectedReport.reporterEmail}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {selectedReport.reportingUserId}
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Reported User:
                      </span>
                      <div className="mt-1">
                        <div className="font-medium text-foreground">
                          {selectedReport.reportedUserName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {selectedReport.reportedUserId}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-base sm:text-lg mb-2 text-foreground">
                  Report Description
                </h4>
                <div className="bg-secondary p-4 rounded-lg">
                  <p className="text-sm sm:text-base text-foreground">
                    {selectedReport.description}
                  </p>
                </div>
              </div>
              {selectedReport.evidence &&
                selectedReport.evidence.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-base sm:text-lg mb-2 text-foreground">
                      Evidence
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedReport.evidence.map((evidence, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer"
                        >
                          <Image className="h-3 w-3 mr-1" /> {evidence}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              {selectedReport.status === "resolved" ||
              selectedReport.status === "dismissed" ? (
                <div className="space-y-4">
                  <h4 className="font-semibold text-base sm:text-lg text-foreground">
                    Resolution
                  </h4>
                  <div className="space-y-2 text-sm sm:text-base">
                    <div>
                      <Label className="text-sm sm:text-base font-medium text-foreground">
                        Action Taken:
                      </Label>
                      <p className="text-sm sm:text-base text-foreground">
                        {selectedReport.actionTaken}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm sm:text-base font-medium text-foreground">
                        Resolution Notes:
                      </Label>
                      <p className="text-sm sm:text-base text-foreground">
                        {selectedReport.resolutionNotes}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="font-semibold text-base sm:text-lg text-foreground">
                    Resolution
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="actionTaken"
                        className="text-foreground text-sm sm:text-base"
                      >
                        Action Taken
                      </Label>
                      <Input
                        id="actionTaken"
                        placeholder="Enter action taken..."
                        value={actionTaken}
                        onChange={(e) => setActionTaken(e.target.value)}
                        className="bg-background border-border"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="resolutionNotes"
                        className="text-foreground text-sm sm:text-base"
                      >
                        Resolution Notes
                      </Label>
                      <Textarea
                        id="resolutionNotes"
                        placeholder="Enter resolution notes..."
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        className="bg-background border-border"
                      />
                    </div>
                    <Button
                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-primary-foreground hover:bg-primary/90"
                      onClick={handleResolveReport}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" /> Mark as Resolved
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Report Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="w-[95vw] max-w-full sm:max-w-md bg-background p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-foreground text-lg sm:text-xl">
              Assign Report
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm sm:text-base text-foreground">
                Priority
              </label>
              <Select
                value={assignData.priority}
                onValueChange={(val) =>
                  setAssignData({ ...assignData, priority: val })
                }
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm sm:text-base text-foreground">
                Category
              </label>
              <Select
                value={assignData.category}
                onValueChange={(val) =>
                  setAssignData({ ...assignData, category: val })
                }
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Harassment">Harassment</SelectItem>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm sm:text-base text-foreground">
                Assign to Moderator
              </label>
              <Select
                value={assignData.assignee}
                onValueChange={(val) =>
                  setAssignData({ ...assignData, assignee: val })
                }
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select Moderator" />
                </SelectTrigger>
                <SelectContent>
                  {mockModerators.map((email) => (
                    <SelectItem key={email} value={email}>
                      {email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-right">
              <Button
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700"
                onClick={handleAssignSubmit}
              >
                Assign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;