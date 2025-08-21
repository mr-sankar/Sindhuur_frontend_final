// import { useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Switch } from '@/components/ui/switch';
// import { Textarea } from '@/components/ui/textarea';
// import { useAuth } from '@/contexts/AuthContext';
// import { Settings as SettingsIcon, User, Bell, Shield, Eye, Save } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';

// const Settings = () => {
//   const { user } = useAuth();
//   const { toast } = useToast();
  
//   const [profileSettings, setProfileSettings] = useState({
//     name: user?.name || '',
//     email: user?.email || '',
//     currentPassword: '',
//     newPassword: '',
//     confirmPassword: ''
//   });

//   const [notificationSettings, setNotificationSettings] = useState({
//     emailNotifications: true,
//     pushNotifications: true,
//     reportNotifications: true,
//     userActivityNotifications: false
//   });

//   const [systemSettings, setSystemSettings] = useState({
//     maintenanceMode: false,
//     userRegistration: true,
//     profileVerification: true,
//     autoModeration: true
//   });

//   const handleProfileSave = () => {
//     toast({
//       title: "Profile Updated",
//       description: "Your profile settings have been saved successfully.",
//     });
//   };

//   const handleNotificationSave = () => {
//     toast({
//       title: "Notifications Updated",
//       description: "Your notification preferences have been saved.",
//     });
//   };

//   const handleSystemSave = () => {
//     toast({
//       title: "System Settings Updated",
//       description: "System configurations have been saved.",
//     });
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center space-x-2">
//         <SettingsIcon className="h-8 w-8 text-primary" />
//         <h1 className="text-3xl font-bold text-foreground">Settings</h1>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Profile Settings */}
//         <Card className="admin-card">
//           <CardHeader>
//             <CardTitle className="flex items-center space-x-2">
//               <User className="h-5 w-5" />
//               <span>Profile Settings</span>
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div>
//               <Label htmlFor="name">Full Name</Label>
//               <Input
//                 id="name"
//                 value={profileSettings.name}
//                 onChange={(e) => setProfileSettings({...profileSettings, name: e.target.value})}
//               />
//             </div>
//             <div>
//               <Label htmlFor="email">Email Address</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 value={profileSettings.email}
//                 onChange={(e) => setProfileSettings({...profileSettings, email: e.target.value})}
//               />
//             </div>
//             <div>
//               <Label htmlFor="currentPassword">Current Password</Label>
//               <Input
//                 id="currentPassword"
//                 type="password"
//                 value={profileSettings.currentPassword}
//                 onChange={(e) => setProfileSettings({...profileSettings, currentPassword: e.target.value})}
//               />
//             </div>
//             <div>
//               <Label htmlFor="newPassword">New Password</Label>
//               <Input
//                 id="newPassword"
//                 type="password"
//                 value={profileSettings.newPassword}
//                 onChange={(e) => setProfileSettings({...profileSettings, newPassword: e.target.value})}
//               />
//             </div>
//             <Button className="w-full admin-button-primary" onClick={handleProfileSave}>
//               <Save className="h-4 w-4 mr-2" />
//               Save Profile
//             </Button>
//           </CardContent>
//         </Card>

//         {/* Notification Settings */}
//         <Card className="admin-card">
//           <CardHeader>
//             <CardTitle className="flex items-center space-x-2">
//               <Bell className="h-5 w-5" />
//               <span>Notification Settings</span>
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="flex items-center justify-between">
//               <Label htmlFor="emailNotifications">Email Notifications</Label>
//               <Switch
//                 id="emailNotifications"
//                 checked={notificationSettings.emailNotifications}
//                 onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
//               />
//             </div>
//             <div className="flex items-center justify-between">
//               <Label htmlFor="pushNotifications">Push Notifications</Label>
//               <Switch
//                 id="pushNotifications"
//                 checked={notificationSettings.pushNotifications}
//                 onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, pushNotifications: checked})}
//               />
//             </div>
//             <div className="flex items-center justify-between">
//               <Label htmlFor="reportNotifications">Report Notifications</Label>
//               <Switch
//                 id="reportNotifications"
//                 checked={notificationSettings.reportNotifications}
//                 onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, reportNotifications: checked})}
//               />
//             </div>
//             <Button className="w-full admin-button-primary" onClick={handleNotificationSave}>
//               <Save className="h-4 w-4 mr-2" />
//               Save Notifications
//             </Button>
//           </CardContent>
//         </Card>

//         {/* System Settings */}
//         <Card className="admin-card lg:col-span-2">
//           <CardHeader>
//             <CardTitle className="flex items-center space-x-2">
//               <Shield className="h-5 w-5" />
//               <span>System Settings</span>
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
//                     <p className="text-sm text-muted-foreground">Disable user access for maintenance</p>
//                   </div>
//                   <Switch
//                     id="maintenanceMode"
//                     checked={systemSettings.maintenanceMode}
//                     onCheckedChange={(checked) => setSystemSettings({...systemSettings, maintenanceMode: checked})}
//                   />
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <Label htmlFor="userRegistration">User Registration</Label>
//                     <p className="text-sm text-muted-foreground">Allow new user registrations</p>
//                   </div>
//                   <Switch
//                     id="userRegistration"
//                     checked={systemSettings.userRegistration}
//                     onCheckedChange={(checked) => setSystemSettings({...systemSettings, userRegistration: checked})}
//                   />
//                 </div>
//               </div>
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <Label htmlFor="profileVerification">Profile Verification</Label>
//                     <p className="text-sm text-muted-foreground">Require profile verification</p>
//                   </div>
//                   <Switch
//                     id="profileVerification"
//                     checked={systemSettings.profileVerification}
//                     onCheckedChange={(checked) => setSystemSettings({...systemSettings, profileVerification: checked})}
//                   />
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <Label htmlFor="autoModeration">Auto Moderation</Label>
//                     <p className="text-sm text-muted-foreground">Enable automatic content moderation</p>
//                   </div>
//                   <Switch
//                     id="autoModeration"
//                     checked={systemSettings.autoModeration}
//                     onCheckedChange={(checked) => setSystemSettings({...systemSettings, autoModeration: checked})}
//                   />
//                 </div>
//               </div>
//             </div>
//             <div className="mt-6">
//               <Button className="admin-button-primary" onClick={handleSystemSave}>
//                 <Save className="h-4 w-4 mr-2" />
//                 Save System Settings
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default Settings;