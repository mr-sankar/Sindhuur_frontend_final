import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { AlertTriangle, CheckCircle, Clock } from "lucide-react"
import axios from "axios"
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface SupportTicket {
  id: string
  title: string
  description: string
  userEmail: string
  category?: string
  priority?: string
  assignedTo?: string
  status: "open" | "in_progress" | "resolved" | "closed"
}

const mockModerators = ["moderator", "seniormoderator", "contentmoderator", "autommoderator"]

const Tickets = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  // const [searchTerm, setSearchTerm] = useState("")
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([])
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [assignData, setAssignData] = useState({
    ticketId: "",
    priority: "",
    category: "",
    assignee: "",
  })

  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Fetch reports
        const reportsResponse = await axios.get(`${BASE_URL}/api/reports`)
        const reports = reportsResponse.data.reports

        // Fetch profiles to map user IDs to emails
        const profilesResponse = await axios.get(`${BASE_URL}/api/profiles`)
        const profiles = profilesResponse.data

        const ticketsData: SupportTicket[] = reports.map((report: any) => {
          // Find the profile matching the reportingUserId
          const profile = profiles.find((p: any) => p.id === report.reportingUserId)
          // Use report.userEmail if available, else fallback to profile.id or reportingUserId
          const userEmail = report.userEmail || (profile ? profile.email || profile.id : report.reportingUserId || 'Unknown User')

          return {
            id: report._id,
            title: report.details[2] || "Untitled Report",
            description: report.details[4] || "No description",
            userEmail,
            category: report.category || report.details[3],
            priority: report.priority || "Medium",
            assignedTo: report.assignedTo || null,
            status: report.status || "open",
          }
        })
        setTickets(ticketsData)
        setFilteredTickets(ticketsData)
      } catch (error) {
        console.error('Error fetching reports or profiles:', error)
        toast({
          title: "Error",
          description: "Failed to load reports or profiles.",
          variant: "destructive",
        })
      }
    }
    fetchReports()
  }, [])

  // const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (e.key === "Enter") {
  //     const search = searchTerm.trim().toLowerCase()
  //     const filtered = tickets.filter((t) =>
  //       t.userEmail.toLowerCase().includes(search)
  //     )
  //     setFilteredTickets(filtered)
  //   }
  // }

  const openAssignDialog = (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId)
    setAssignData({
      ticketId,
      priority: ticket?.priority || "",
      category: ticket?.category || "",
      assignee: ticket?.assignedTo || "",
    })
    setIsAssignDialogOpen(true)
  }

  const handleAssignSubmit = async () => {
    try {
      const response = await axios.patch(`${BASE_URL}/api/reports/${assignData.ticketId}`, {
        priority: assignData.priority,
        category: assignData.category,
        assignedTo: assignData.assignee,
        status: "in_progress",
      })

      const updatedTickets = tickets.map((t) =>
        t.id === assignData.ticketId
          ? {
              ...t,
              priority: assignData.priority,
              category: assignData.category,
              assignedTo: assignData.assignee,
              status: "in_progress",
            }
          : t
      )
      setTickets(updatedTickets)
      setFilteredTickets(updatedTickets)
      setIsAssignDialogOpen(false)
      toast({
        title: "Ticket Assigned",
        description: `Assigned to ${assignData.assignee}`,
      })
    } catch (error) {
      console.error('Error assigning ticket:', error)
      toast({
        title: "Error",
        description: "Failed to assign ticket.",
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "in_progress":
        return <AlertTriangle className="h-4 w-4 text-blue-500" />
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "closed":
        return <CheckCircle className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Support Tickets</CardTitle>
        {/* <div className="relative w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by user email"
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div> */}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(filteredTickets.length ? filteredTickets : tickets).map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>{ticket.title}</TableCell>
                <TableCell>{ticket.description}</TableCell>
                <TableCell>{ticket.userEmail}</TableCell>
                <TableCell className="flex items-center gap-2">
                  {getStatusIcon(ticket.status)} {ticket.status}
                </TableCell>
                <TableCell>{ticket.assignedTo || "-"}</TableCell>
                <TableCell>
                  <Button className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700" onClick={() => openAssignDialog(ticket.id)}>Assign</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm">Priority</label>
              <Select
                value={assignData.priority}
                onValueChange={(val) =>
                  setAssignData({ ...assignData, priority: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm">Category</label>
              <Select
                value={assignData.category}
                onValueChange={(val) =>
                  setAssignData({ ...assignData, category: val })
                }
              >
                <SelectTrigger>
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
              <label className="text-sm">Assign to Moderator</label>
              <Select
                value={assignData.assignee}
                onValueChange={(val) =>
                  setAssignData({ ...assignData, assignee: val })
                }
              >
                <SelectTrigger>
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
            <div className="text-right ">
              <Button className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700" onClick={handleAssignSubmit}>Assign</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default Tickets