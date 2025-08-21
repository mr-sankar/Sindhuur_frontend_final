import Logo from '@/assets/logo.png';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Calendar,
  FileText,
  LayoutDashboard,
  Settings,
  Ticket,
  UserCheck,
  Users,
  Cross,
  Heart,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-toastify';
import axios from 'axios';

const menuItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'User Management', url: '/users', icon: Users },
  { title: 'Profile Management', url: '/profiles', icon: UserCheck },
  { title: 'Events', url: '/events', icon: Calendar },
  { title: 'Tickets', url: '/tickets', icon: Ticket },
  { title: 'Reports', url: '/reports', icon: FileText },
  { title: 'Religion', url: '#', icon: Cross },
  { title: 'Success Stories', url: '/success', icon: Heart }, // Added Success Stories item
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';
  const [isReligionModalOpen, setIsReligionModalOpen] = useState(false);
  const [newReligion, setNewReligion] = useState('');
  const [newCommunity, setNewCommunity] = useState('');
  const [showReligionInput, setShowReligionInput] = useState(false);
  const [showCommunityInput, setShowCommunityInput] = useState(false);
  const [religions, setReligions] = useState([]);
  const [communities, setCommunities] = useState([]);

  useEffect(() => {
    const fetchReligions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/religions');
        setReligions(response.data.map((item) => item.name));
        if (response.data.length === 0) {
          toast.warning('No religions found in the database.');
        }
      } catch (error) {
        toast.error('Failed to fetch religions: ' + error.message);
      }
    };

    const fetchCommunities = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/communities');
        setCommunities(response.data.map((item) => item.name));
        if (response.data.length === 0) {
          toast.warning('No communities found in the database.');
        }
      } catch (error) {
        toast.error('Failed to fetch communities: ' + error.message);
      }
    };

    fetchReligions();
    fetchCommunities();
  }, []);

  const isActive = (path) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  const handleAddNewReligion = async () => {
    if (newReligion.trim() && !religions.includes(newReligion.trim())) {
      try {
        const response = await axios.post('http://localhost:5000/api/religions', { name: newReligion.trim() });
        setReligions([...religions, response.data.name]);
        setNewReligion('');
        setShowReligionInput(false);
        toast.success('Religion added successfully!');
      } catch (error) {
        toast.error('Failed to add religion: ' + (error.response ? error.response.data.error : error.message));
      }
    } else if (religions.includes(newReligion.trim())) {
      toast.error('Religion already exists');
    } else {
      toast.error('Religion name cannot be empty');
    }
  };

  const handleAddNewCommunity = async () => {
    if (newCommunity.trim() && !communities.includes(newCommunity.trim())) {
      try {
        const response = await axios.post('http://localhost:5000/api/communities', { name: newCommunity.trim() });
        setCommunities([...communities, response.data.name]);
        setNewCommunity('');
        setShowCommunityInput(false);
        toast.success('Community added successfully!');
      } catch (error) {
        toast.error('Failed to add community: ' + (error.response ? error.response.data.error : error.message));
      }
    } else if (communities.includes(newCommunity.trim())) {
      toast.error('Community already exists');
    } else {
      toast.error('Community name cannot be empty');
    }
  };

  return (
    <>
      <Sidebar
        className={`${collapsed ? 'w-14' : 'w-64'} transition-all duration-300`}
        collapsible='icon'
      >
        <SidebarContent>
          <div className='p-4 border-b border-border'>
            <div className='flex items-center space-x-3'>
              <div className='ml-[-10px] p-1 bg-white rounded-lg flex-shrink-0'>
                <img src={Logo} alt='Logo' className='h-8 w-8 object-contain' />
              </div>
              {!collapsed && (
                <div className='overflow-hidden'>
                  <h2 className='text-lg font-bold text-foreground truncate'>
                    Sindhuura
                  </h2>
                  <p className='text-xs text-muted-foreground'>Admin Panel</p>
                </div>
              )}
            </div>
          </div>

          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={`/admin${item.url}`}
                        end={item.url === '/'}
                        onClick={
                          item.title === 'Religion'
                            ? (e) => {
                                e.preventDefault();
                                setIsReligionModalOpen(true);
                              }
                            : undefined
                        }
                        className={({ isActive: navActive }) =>
                          `flex items-center ${
                            collapsed ? 'justify-center' : 'space-x-3'
                          } px-3 py-2 rounded-lg transition-smooth min-h-[44px] ${
                            isActive(item.url) || navActive
                              ? 'bg-primary text-primary-foreground font-medium'
                              : 'text-foreground hover:bg-primary/10 hover:text-primary'
                          }`
                        }
                        title={collapsed ? item.title : undefined}
                      >
                        <item.icon className='h-5 w-5 flex-shrink-0' />
                        {!collapsed && (
                          <span className='truncate'>{item.title}</span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <Dialog
        open={isReligionModalOpen}
        onOpenChange={setIsReligionModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Religion Management</DialogTitle>
            <DialogDescription>
              Manage religion-related settings and data here. Select from existing religions and communities or add new ones.
            </DialogDescription>
          </DialogHeader>
          <div className='py-4'>
            <h3 className='text-lg font-semibold mb-2'>Religions</h3>
            <div className='flex items-center space-x-2'>
              <Select>
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Select a religion' />
                </SelectTrigger>
                <SelectContent>
                  {religions.map((religion) => (
                    <SelectItem key={religion} value={religion}>
                      {religion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                className='bg-[rgb(253,187,61)] hover:bg-[rgb(230,170,55)] text-white'
                onClick={() => setShowReligionInput(true)}
              >
                Add New
              </Button>
            </div>
            {showReligionInput && (
              <div className='mt-2 flex items-center space-x-2'>
                <Input
                  value={newReligion}
                  onChange={(e) => setNewReligion(e.target.value)}
                  placeholder='Enter new religion'
                  className='w-[180px]'
                />
                <Button 
                  className='bg-[rgb(253,187,61)] hover:bg-[rgb(230,170,55)] text-white'
                  onClick={handleAddNewReligion}
                >
                  Submit
                </Button>
              </div>
            )}
            <h3 className='text-lg font-semibold mt-4 mb-2'>Communities</h3>
            <div className='flex items-center space-x-2'>
              <Select>
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Select a community' />
                </SelectTrigger>
                <SelectContent>
                  {communities.map((community) => (
                    <SelectItem key={community} value={community}>
                      {community}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                className='bg-[rgb(253,187,61)] hover:bg-[rgb(230,170,55)] text-white'
                onClick={() => setShowCommunityInput(true)}
              >
                Add New
              </Button>
            </div>
            {showCommunityInput && (
              <div className='mt-2 flex items-center space-x-2'>
                <Input
                  value={newCommunity}
                  onChange={(e) => setNewCommunity(e.target.value)}
                  placeholder='Enter new community'
                  className='w-[180px]'
                />
                <Button 
                  className='bg-[rgb(253,187,61)] hover:bg-[rgb(230,170,55)] text-white'
                  onClick={handleAddNewCommunity}
                >
                  Submit
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              style={{ background: "rgba(253, 91, 69, 1)", color: "white" }}
              onClick={() => setIsReligionModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}