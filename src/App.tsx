import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import PrivateRoute from '@/pages/PrivateRoute';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Page Components
import FeaturedProfiles from './components/FeaturedProfiles';
import About from './pages/About';
import AdminDashboard from './pages/admin/Dashboard';
import Reports from './pages/admin/Reports';
import Tickets from './pages/admin/Tickets';
import AdminSettings from './pages/AdminSettings';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import Login from './pages/Login';
import Membership from './pages/Membership';
import Messages from './pages/Messages';
import NotFound from './pages/NotFound';
import Notifications from './pages/Notifications';
import Payment from './pages/Payment';
import Privacy from './pages/Privacy';
import ProfileDetails from './pages/ProfileDetails';
import PublicProfile from './pages/PublicProfile';
import Search from './pages/Search';
import SignUp from './pages/SignUp';
import SuccessStories from './pages/SuccessStories';
import Support from './pages/Support';
import Terms from './pages/Terms';
import Success from './pages/success';
// Admin-specific components (assumed to exist)
import AdminLayout from './components/layout/AdminLayout';
import UserManagement from './pages/admin/UserManagement';
import ProfileManagement from './pages/admin/ProfileManagement';
// import Settings from './pages/admin/Settings';
import Profile from './pages/admin/Profile';
import AdminEvents from './pages/admin/Events';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        {/* Toast Notifications */}
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/success-stories" element={<SuccessStories />} />
            <Route path="/about" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />

            {/* Protected Routes for Authenticated Users */}
            <Route
              path="/home"
              element={
                <PrivateRoute allowedRoles={["user"]}>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="/search"
              element={
                <PrivateRoute allowedRoles={["user"]}>
                  <Search />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute allowedRoles={["user"]}>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute allowedRoles={["user"]}>
                  <ProfileDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile/:id"
              element={
                <PrivateRoute allowedRoles={["user"]}>
                  <PublicProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <PrivateRoute allowedRoles={["user"]}>
                  <Messages />
                </PrivateRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <PrivateRoute allowedRoles={["user"]}>
                  <Notifications />
                </PrivateRoute>
              }
            />
            <Route
              path="/payment"
              element={
                <PrivateRoute allowedRoles={["user"]}>
                  <Payment />
                </PrivateRoute>
              }
            />
            <Route
              path="/support"
              element={
                <PrivateRoute allowedRoles={["user"]}>
                  <Support />
                </PrivateRoute>
              }
            />
            <Route
              path="/contact"
              element={
                <PrivateRoute allowedRoles={["user"]}>
                  <Contact />
                </PrivateRoute>
              }
            />
            <Route
              path="/events"
              element={
                <PrivateRoute allowedRoles={["user"]}>
                  <Events />
                </PrivateRoute>
              }
            />
            <Route
              path="/featured"
              element={
                <PrivateRoute allowedRoles={["user"]}>
                  <FeaturedProfiles />
                </PrivateRoute>
              }
            />
            <Route
              path="/membership"
              element={
                <PrivateRoute allowedRoles={["user"]}>
                  <Membership />
                </PrivateRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <AdminLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="profiles" element={<ProfileManagement />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="reports" element={<Reports />} />
              <Route path="tickets" element={<Tickets />} />
              <Route path="success" element={<Success />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Legacy Admin Routes (redirect to nested routes) */}
            <Route
              path="/admin/reports"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <Navigate to="/admin/reports" replace />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/tickets"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <Navigate to="/admin/tickets" replace />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <Navigate to="/admin/settings" replace />
                </PrivateRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;