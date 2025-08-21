import React, { useState } from "react";
import axios from "axios";
import { Mail, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1 = request OTP, 2 = reset with OTP
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [inlineError, setInlineError] = useState(""); // for inline messages
  const navigate = useNavigate();
  const { toast } = useToast();

  // If you use Vite, set VITE_API_BASE_URL in .env and axios will use that as baseURL.
  // Otherwise, axios will request the same origin (use a proxy or full URL).
  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || "";

  // Step 1: send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setInlineError("");
    if (!email) {
      setInlineError("Email is required");
      return;
    }

    setIsLoading(true);
    try {
      // sends { email } to backend
      await axios.post("/api/auth/forgot-password", { email });
      toast({
        title: "OTP sent",
        description: "Check your email (spam folder too).",
      });
      setStep(2);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Failed to send OTP";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: reset using email + otp + password
  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    setInlineError("");

    // Client-side validation (prevent sending bad requests)
    if (!otp || otp.trim().length < 4) {
      setInlineError("Enter the OTP you received.");
      return;
    }
    if (!password || password.length < 8) {
      setInlineError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    try {
      // IMPORTANT: backend expects `password` (not `newPassword`)
      const payload = { email, otp, password };
      const res = await axios.post("/api/auth/reset-password", payload);

      toast({
        title: "Password updated",
        description: res?.data?.message || "You can now log in.",
      });
      navigate("/login");
    } catch (err) {
      // Show server message clearly
      const msg = err?.response?.data?.message || err.message || "Reset failed";
      // Common debugging hint: check network tab -> request payload
      toast({ title: "Error", description: msg, variant: "destructive" });
      // Also keep inline error for immediate feedback
      setInlineError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className="border-yellow-200 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-800">
                {step === 1 ? "Forgot Password" : "Reset Password"}
              </CardTitle>
              <p className="text-gray-600">
                {step === 1
                  ? "Enter your email to receive an OTP."
                  : "Enter the OTP and new password."}
              </p>
            </CardHeader>

            <CardContent>
              {step === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pr-10 py-2.5 text-sm border-yellow-200"
                        required
                      />
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    </div>
                  </div>

                  {inlineError && (
                    <p className="text-sm text-red-600">{inlineError}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700"
                  >
                    {isLoading ? "Sending..." : "Send OTP"}
                  </Button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleVerifyAndReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="6-digit code"
                      value={otp}
                      onChange={(e) =>
                        setOtp(
                          e.target.value.replace(/[^0-9]/g, "").slice(0, 6)
                        )
                      }
                      className="py-2.5 text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"} // toggle
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-10 py-2.5 text-sm"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Password must be at least 8 characters.
                    </p>
                  </div>

                  {inlineError && (
                    <p className="text-sm text-red-600">{inlineError}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading || password.length < 8}
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700"
                  >
                    {isLoading ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              )}

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="text-yellow-600 hover:text-yellow-700 text-sm flex items-center justify-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Login
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

export default ForgotPassword;
