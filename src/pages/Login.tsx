import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToastAction } from '@/components/ui/toast';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

const handleLogin = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const response = await fetch(`${BASE_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
    });

    const data = await response.json();
    console.log("Login response:", data);

    if (data?.token) {
      login(data.token);
      localStorage.setItem("loggedInUser", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      // localStorage.setItem(
      //   "subscription",
      //   data.user?.subscription?.current || ""
      // );

      const isAdmin =
        data.user?.role === "admin" || data.user?.role === "moderator";

      toast({
        title: "Login Successful!",
        description: `Welcome back, ${data.user.name}!`,
        duration: 5000,
        action: <ToastAction altText="Close">✖</ToastAction>,
      });

      // navigate after toast is shown
      setTimeout(() => {
        navigate(isAdmin ? "/admin" : "/dashboard");
      }, 300);
    } else {
      if (data?.error?.toLowerCase().includes("not verified")) {
        setShowResend(true);
        toast({
          variant: "destructive",
          title: "Email not verified",
          description:
            "Your email is not verified. You can resend the verification email.",
          duration: 7000,
          action: <ToastAction altText="Close">✖</ToastAction>,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: data.error || "Invalid email or password",
          duration: 5000,
          action: <ToastAction altText="Close">✖</ToastAction>,
        });
      }
    }
  } catch (error) {
    console.error("Frontend error during login:", error.message);
    toast({
      variant: "destructive",
      title: "Login Error",
      description: "Failed to connect to server. Please try again.",
      duration: 5000,
      action: <ToastAction altText="Close">✖</ToastAction>,
    });
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className='min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100'>
      <Header />

      <div className='container mx-auto px-4 py-12'>
        <div className='max-w-md mx-auto'>
          <Card className='border-yellow-200 shadow-lg'>
            <CardHeader className='text-center'>
              <CardTitle className='text-2xl text-gray-800'>
                Welcome Back
              </CardTitle>
              <p className='text-gray-600'>
                Sign in to your Sindhuura account
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleLogin} className='space-y-4'>
                {/* Email */}
                <div className='space-y-2'>
                  <Label
                    htmlFor='email'
                    className='text-sm font-medium text-gray-700'
                  >
                    Email Address
                  </Label>
                  <div className='relative'>
                    <Input
                      id='email'
                      type='email'
                      placeholder='your@email.com'
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange('email', e.target.value)
                      }
                      className='pl-4 pr-12 py-3 h-12 text-base border border-yellow-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-20 rounded-md transition-all'
                      required
                      disabled={isLoading}
                    />
                    <span className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg select-none pointer-events-none z-10'>
                      ✉
                    </span>
                  </div>
                </div>

                {/* Password */}
                <div className='space-y-2'>
                  <Label
                    htmlFor='password'
                    className='text-sm font-medium text-gray-700'
                  >
                    Password
                  </Label>
                  <div className='relative'>
                    <Input
                      id='password'
                      type={showPassword ? 'text' : 'password'}
                      placeholder='Enter your password'
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange('password', e.target.value)
                      }
                      className='pl-4 pr-20 py-3 h-12 text-base border border-yellow-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-20 rounded-md transition-all'
                      required
                      disabled={isLoading}
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors text-lg w-8 h-8 flex items-center justify-center z-10'
                    >
                      {showPassword ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>

                {/* Remember & Forgot */}
                <div className='flex items-center justify-between text-sm pt-2'>
                  <label className='flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      className='mr-3 h-4 w-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500 focus:ring-2'
                      disabled={isLoading}
                    />
                    <span className='text-gray-600'>Remember me</span>
                  </label>
                  <Link
                    to='/forgot-password'
                    className='text-yellow-600 hover:text-yellow-700 font-medium'
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit */}
                <Button
                  type='submit'
                  disabled={isLoading}
                  className='w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-medium py-3 px-4 h-12 text-base rounded-md transition-all duration-200 mt-6'
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className='mt-6 text-center text-sm text-gray-600'>
                Don't have an account?{' '}
                <Link
                  to='/signup'
                  className='text-yellow-600 hover:text-yellow-700 font-medium'
                >
                  Register
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
