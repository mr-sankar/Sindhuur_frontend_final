import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton"; // Assuming Shadcn has Skeleton, add if needed
import axios from "axios";
import {
  Activity,
  AlertTriangle,
  DollarSign,
  Eye,
  Heart,
  TrendingDown,
  TrendingUp,
  Users,
  X as XIcon,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

type Stat = {
  title: string;
  value: string | number;
  change: string;
  trend: "up" | "down";
  icon: any;
  color: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: "Active" | "Pending" | "Inactive";
  verified?: boolean;
  joinDate: string;
  lastLogin: string;
  role?: string;
  profileCompletion?: number;
};

type Report = {
  id: number;
  reportingUserId: number;
  reportedProfileId: number;
  reason: string;
  severity: string;
};

type FlaggedProfile = {
  id: string;
  name: string;
  flagReasons: string[];
  profileStatus: "active" | "inactive" | "flagged" | "under_review";
};

type DashboardData = {
  userCount: number;
  activeUserCount: number;
  inactiveUserCount: number;
  bannedUserCount: number;
  freeUserCount: number;
  premiumUserCount: number;
  premiumPlusUserCount: number;
  revenue: number;
  recentLogins: User[];
  reports: Report[];
  flaggedProfiles: FlaggedProfile[];
};

const Dashboard: React.FC = () => {
  const [filterRange, setFilterRange] = useState<
    "all" | "week" | "month" | "year"
  >("all");
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const toastTimerRef = useRef<number | null>(null);

  const [selectedItem, setSelectedItem] = useState<
    User | FlaggedProfile | null
  >(null);
  const [modalOpen, setModalOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [
          userCountRes,
          statusCountsRes,
          subscriptionCountsRes,
          revenueRes,
          recentLoginsRes,
          reportsRes,
          profilesRes,
        ] = await Promise.all([
          axios.get(`${BASE_URL}/api/users/count`),
          axios.get(`${BASE_URL}/api/admin/status-counts`),
          axios.get(`${BASE_URL}/api/admin/subscription-counts`),
          axios.get(`${BASE_URL}/api/payment/total-revenue`),
          axios.get(`${BASE_URL}/api/admin/users/recent-logins`),
          axios.get(`${BASE_URL}/api/reports`),
          axios.get(`${BASE_URL}/api/profiles`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
        ]);

        const flagged = profilesRes.data.filter(
          (profile: FlaggedProfile) => profile.profileStatus === "flagged"
        );

        setData({
          userCount: userCountRes.data.count,
          activeUserCount: statusCountsRes.data.active,
          inactiveUserCount: statusCountsRes.data.inactive,
          bannedUserCount: statusCountsRes.data.banned,
          freeUserCount: subscriptionCountsRes.data.free,
          premiumUserCount: subscriptionCountsRes.data.premium,
          premiumPlusUserCount: subscriptionCountsRes.data.premium_plus,
          revenue: revenueRes.data.totalRevenue,
          recentLogins: recentLoginsRes.data.users,
          reports: reportsRes.data.reports,
          flaggedProfiles: flagged,
        });
      } catch (err: any) {
        setError("Failed to fetch dashboard data. Please try again.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const stats: Stat[] = useMemo(() => {
    if (!data) return [];
    return [
      {
        title: "Total Users",
        value: data.userCount.toLocaleString(),
        change: "+12%",
        trend: "up",
        icon: Users,
        color: "text-yellow-600",
      },
      {
        title: "Active Users",
        value: data.activeUserCount.toLocaleString(),
        change: "+10%",
        trend: "up",
        icon: Users,
        color: "text-green-600",
      },
      {
        title: "Inactive Users",
        value: data.inactiveUserCount.toLocaleString(),
        change: "-3%",
        trend: "down",
        icon: Users,
        color: "text-yellow-600",
      },
      // {
      //   title: "Banned Users",
      //   value: data.bannedUserCount.toLocaleString(),
      //   change: "+2%",
      //   trend: "up",
      //   icon: Users,
      //   color: "text-red-600",
      // },
      {
        title: "Free Users",
        value: data.freeUserCount.toLocaleString(),
        change: "+5%",
        trend: "up",
        icon: Users,
        color: "text-gray-600",
      },
      {
        title: "Premium Users",
        value: data.premiumUserCount.toLocaleString(),
        change: "+15%",
        trend: "up",
        icon: Users,
        color: "text-blue-600",
      },
      {
        title: "Premium Plus Users",
        value: data.premiumPlusUserCount.toLocaleString(),
        change: "+20%",
        trend: "up",
        icon: Users,
        color: "text-purple-600",
      },
      // {
      //   title: "Active Matches",
      //   value: data.userCount, // Placeholder, update if real data available
      //   change: "+8%",
      //   trend: "up",
      //   icon: Heart,
      //   color: "text-pink-600",
      // },
      {
        title: "Revenue",
        value: `₹${data.revenue.toLocaleString("en-IN")}`,
        change: "+23%",
        trend: "up",
        icon: DollarSign,
        color: "text-green-600",
      },
      {
        title: "Pending Reports",
        value: data.reports.length,
        change: "-5%",
        trend: "down",
        icon: AlertTriangle,
        color: "text-yellow-600",
      },
    ];
  }, [data]);

  const getCutoffDate = (range: typeof filterRange) => {
    if (range === "all") return null;
    const now = new Date();
    const cutoff = new Date(now);
    if (range === "week") cutoff.setDate(now.getDate() - 7);
    else if (range === "month") cutoff.setMonth(now.getMonth() - 1);
    else if (range === "year") cutoff.setFullYear(now.getFullYear() - 1);
    cutoff.setHours(0, 0, 0, 0);
    return cutoff;
  };

  const filteredRecentLogins = useMemo(() => {
    if (!data?.recentLogins) return [];
    const cutoff = getCutoffDate(filterRange);
    if (!cutoff) return data.recentLogins;
    return data.recentLogins.filter((u) => {
      const d =
        u.lastLogin !== "N/A" ? new Date(u.lastLogin) : new Date(u.joinDate);
      return d >= cutoff;
    });
  }, [filterRange, data]);

  const friendlyRangeLabel = (r: typeof filterRange) => {
    if (r === "all") return "all time";
    if (r === "week") return "last week";
    if (r === "month") return "last month";
    return "last year";
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = (message: string, ms = 2000) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToastMessage(message);
    setToastVisible(true);
    toastTimerRef.current = window.setTimeout(() => {
      setToastVisible(false);
      toastTimerRef.current = null;
    }, ms);
  };

  const hideToast = () => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToastVisible(false);
  };

  const handleGenerateReport = async () => {
    if (!data) return;
    try {
      const reportData = [
        {
          sheet: "Dashboard Stats",
          columns: [
            { label: "Title", value: "title" },
            { label: "Value", value: "value" },
            { label: "Change", value: "change" },
            { label: "Trend", value: "trend" },
          ],
          content: stats.map((stat) => ({
            title: stat.title,
            value: stat.value,
            change: stat.change,
            trend: stat.trend,
          })),
        },
        {
          sheet: "Recent Logins",
          columns: [
            { label: "Name", value: "name" },
            { label: "Email", value: "email" },
            { label: "Status", value: "status" },
            { label: "Join Date", value: "joinDate" },
            { label: "Last Login", value: "lastLogin" },
          ],
          content: filteredRecentLogins.map((user) => ({
            name: user.name,
            email: user.email,
            status: user.status,
            joinDate: user.joinDate,
            lastLogin: user.lastLogin,
          })),
        },
        {
          sheet: "Flagged Content",
          columns: [
            { label: "Type", value: "type" },
            { label: "User", value: "user" },
            { label: "Reason", value: "reason" },
            { label: "Severity", value: "severity" },
          ],
          content: data.flaggedProfiles.map((profile) => ({
            type: "Profile",
            user: profile.name,
            reason: profile.flagReasons[0] || "Flagged by admin",
            severity: "High",
          })),
        },
      ];

      const wb = XLSX.utils.book_new();
      reportData.forEach((sheetData) => {
        const ws = XLSX.utils.json_to_sheet(sheetData.content);
        XLSX.utils.book_append_sheet(wb, ws, sheetData.sheet);
      });

      XLSX.writeFile(
        wb,
        `Dashboard_Report_${new Date().toISOString().split("T")[0]}.xlsx`
      );
      showToast("Report downloaded successfully", 2000);
    } catch (err: any) {
      showToast("Failed to generate report", 2000);
      console.error("Error generating report:", err);
    }
  };

  const openItemModal = (item: User | FlaggedProfile) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) closeModal();
  };

  const fmtDate = (dateStr: string | undefined) => {
    if (!dateStr || dateStr === "N/A") return "-";
    return new Date(dateStr).toLocaleDateString();
  };

  const isUser = (item: User | FlaggedProfile): item is User => {
    return "email" in item;
  };

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* <select
            id="dashboard-range"
            value={filterRange}
            onChange={(e) =>
              setFilterRange(
                e.target.value as "all" | "week" | "month" | "year"
              )
            }
            className="flex-1 sm:flex-none rounded-md border px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-ring"
            aria-label="Filter dashboard range"
          >
            <option value="all">All Time</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select> */}
          <Button
            className="flex-1 sm:flex-none  bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700"
            onClick={handleGenerateReport}
            disabled={isLoading || !!error}
          >
            <Activity className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-md text-destructive text-sm flex items-center justify-between">
          {error}
          <Button
            variant="link"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 10 }).map((_, idx) => (
              <Card key={idx} className="p-4">
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </Card>
            ))
          : stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <Card key={idx} className="p-4 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-md">
                        <Icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      {stat.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={
                          stat.trend === "up"
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground text-right">
                    from {friendlyRangeLabel(filterRange)}
                  </div>
                </Card>
              );
            })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
        <Card className="min-h-0">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-xl font-semibold">
              Recent User Logins {data && `(${data.userCount} total)`}
            </CardTitle>
            <Button variant="outline" onClick={() => navigate("/admin/users")}>
              View All
            </Button>
          </CardHeader>
          <CardContent className="overflow-auto">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredRecentLogins.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No recent logins
              </p>
            ) : (
              <>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecentLogins.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700"
                              variant={
                                user.status === "Active"
                                  ? "default"
                                  : user.status === "Pending"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {fmtDate(user.joinDate)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {fmtDate(user.lastLogin)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openItemModal(user)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="md:hidden space-y-4">
                  {filteredRecentLogins.map((user) => (
                    <Card key={user.id} className="p-4">
                      <div className="flex items-start gap-6">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground truncate overflow-hidden max-w-[55%] sm:max-w-[65%]">
                            {user.email}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openItemModal(user)}
                          className="flex-shrink-0 min-w-[40px]"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge
                          variant={
                            user.status === "Active"
                              ? "default"
                              : user.status === "Pending"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {user.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Joined: {fmtDate(user.joinDate)}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

      </div>

      {modalOpen && selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 overflow-y-auto"
          onClick={handleOverlayClick}
        >
          <Card className="w-full max-w-[95vw] sm:max-w-md md:max-w-2xl mx-4 my-4 sm:my-0 p-4 sm:p-6 relative min-h-[200px] max-h-[90vh] overflow-y-auto">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
              onClick={closeModal}
            >
              <XIcon className="h-5 w-5" />
            </Button>
            <CardTitle className="text-lg sm:text-xl mb-4">
              {isUser(selectedItem)
                ? "User Details"
                : "Flagged Profile Details"}
            </CardTitle>
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs sm:text-sm text-muted-foreground">
                    Name
                  </label>
                  <p className="font-medium text-sm sm:text-base truncate">
                    {selectedItem.name}
                  </p>
                </div>
                {isUser(selectedItem) && (
                  <>
                    <div>
                      <label className="text-xs sm:text-sm text-muted-foreground">
                        Email
                      </label>
                      <p className="font-medium text-sm sm:text-base truncate">
                        {selectedItem.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm text-muted-foreground">
                        Phone
                      </label>
                      <p className="font-medium text-sm sm:text-base">
                        {selectedItem.phone ?? "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm text-muted-foreground">
                        Role
                      </label>
                      <Badge variant="secondary">
                        {selectedItem.role ?? "User"}
                      </Badge>
                    </div>
                  </>
                )}
                {!isUser(selectedItem) && (
                  <div>
                    <label className="text-xs sm:text-sm text-muted-foreground">
                      Flag Reasons
                    </label>
                    <p className="font-medium text-sm sm:text-base">
                      {selectedItem.flagReasons.join(", ") ||
                        "Flagged by admin"}
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs sm:text-sm text-muted-foreground">
                    Status
                  </label>
                  <Badge
                    variant={
                      isUser(selectedItem)
                        ? selectedItem.status === "Active"
                          ? "default"
                          : selectedItem.status === "Pending"
                          ? "secondary"
                          : "destructive"
                        : "destructive"
                    }
                  >
                    {isUser(selectedItem)
                      ? selectedItem.status
                      : selectedItem.profileStatus}
                  </Badge>
                </div>
                {isUser(selectedItem) && (
                  <>
                    <div>
                      <label className="text-xs sm:text-sm text-muted-foreground">
                        Verified
                      </label>
                      <p className="font-medium text-sm sm:text-base">
                        {selectedItem.verified ? "Yes" : "No"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm text-muted-foreground">
                        Join Date
                      </label>
                      <p className="font-medium text-sm sm:text-base">
                        {fmtDate(selectedItem.joinDate)}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm text-muted-foreground">
                        Last Login
                      </label>
                      <p className="font-medium text-sm sm:text-base">
                        {fmtDate(selectedItem.lastLogin)}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
            {isUser(selectedItem) && (
              <div className="mt-4 sm:mt-6">
                <label className="text-xs sm:text-sm text-muted-foreground mb-2 block">
                  Profile Completion
                </label>
                <div className="bg-muted h-2 rounded-full">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${selectedItem.profileCompletion ?? 0}%` }}
                  />
                </div>
                <p className="text-xs sm:text-sm text-right mt-1">
                  {selectedItem.profileCompletion ?? 0}%
                </p>
              </div>
            )}
          </Card>
        </div>
      )}

      {toastVisible && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-background border shadow-lg rounded-md p-4 max-w-sm flex items-start gap-3">
            <Activity className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Notification</p>
              <p className="text-sm text-muted-foreground">{toastMessage}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={hideToast}>
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
