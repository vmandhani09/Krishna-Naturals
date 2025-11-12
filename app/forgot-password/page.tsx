"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, CheckCircle2, XCircle, Lock } from "lucide-react";
import toast from "react-hot-toast";

type Step = "email" | "otp" | "reset";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [storedOtp, setStoredOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    checks: {
      length: false,
      upper: false,
      lower: false,
      number: false,
      special: false,
    },
  });
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === "otp") {
      otpInputRefs.current[0]?.focus();
    }
  }, [step]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      validatePasswordStrength(value);
    }
  };

  const validatePasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;
    setPasswordStrength({ score, checks });
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStoredOtp(data.otp);
        toast.success("OTP sent to your email!");
        setStep("otp");
      } else {
        toast.error(data.error || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take the last character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits are filled
    if (newOtp.every((digit) => digit) && newOtp.join("").length === 6) {
      setTimeout(() => verifyOtp(newOtp.join("")), 100);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = (enteredOtp: string) => {
    if (enteredOtp === storedOtp) {
      toast.success("OTP verified!");
      setStep("reset");
    } else {
      toast.error("Invalid OTP. Please try again.");
      setOtp(Array(6).fill(""));
      otpInputRefs.current[0]?.focus();
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!isPasswordValid()) {
      toast.error("Password does not meet requirements");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          newPassword: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Password reset successful!");
        router.push("/auth/login");
      } else {
        toast.error(data.error || "Failed to reset password");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const isPasswordValid = () => {
    return (
      passwordStrength.checks.length &&
      passwordStrength.checks.upper &&
      passwordStrength.checks.lower &&
      passwordStrength.checks.number &&
      passwordStrength.checks.special
    );
  };

  const getStrengthColor = () => {
    if (passwordStrength.score <= 2) return "text-red-500";
    if (passwordStrength.score <= 4) return "text-orange-500";
    return "text-green-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-600">Dryfruit Grove</h1>
          <p className="text-gray-600 mt-2">
            {step === "email" && "Enter your email to receive OTP"}
            {step === "otp" && "Verify the OTP sent to your email"}
            {step === "reset" && "Create your new password"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Reset Password</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Step 1: Email Input */}
            {step === "email" && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="Enter your email"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send OTP"}
                </Button>

                <div className="text-center">
                  <Link href="/auth/login" className="text-sm text-emerald-600 hover:underline">
                    Back to Sign In
                  </Link>
                </div>
              </form>
            )}

            {/* Step 2: OTP Input */}
            {step === "otp" && (
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div>
                  <Label htmlFor="otp" className="text-center block mb-3">
                    Enter 6-Digit OTP
                  </Label>
                  <div className="flex gap-2 justify-center">
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(el) => (otpInputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-12 text-center text-xl font-semibold"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Check your email for the code
                  </p>
                </div>

                <div className="text-center space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setOtp(Array(6).fill(""));
                    }}
                    className="text-sm text-emerald-600 hover:underline"
                  >
                    Change Email
                  </button>
                  <div className="text-sm text-gray-500">
                    <Link href="/auth/login" className="text-emerald-600 hover:underline">
                      Back to Sign In
                    </Link>
                  </div>
                </div>
              </form>
            )}

            {/* Step 3: Reset Password */}
            {step === "reset" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="Enter new password"
                      required
                    />
                  </div>

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2 space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        {passwordStrength.checks.length ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-gray-400" />
                        )}
                        <span className={passwordStrength.checks.length ? "text-green-600" : ""}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordStrength.checks.upper ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-gray-400" />
                        )}
                        <span className={passwordStrength.checks.upper ? "text-green-600" : ""}>
                          Uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordStrength.checks.lower ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-gray-400" />
                        )}
                        <span className={passwordStrength.checks.lower ? "text-green-600" : ""}>
                          Lowercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordStrength.checks.number ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-gray-400" />
                        )}
                        <span className={passwordStrength.checks.number ? "text-green-600" : ""}>
                          Number
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordStrength.checks.special ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-gray-400" />
                        )}
                        <span className={passwordStrength.checks.special ? "text-green-600" : ""}>
                          Special character
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                  disabled={isLoading || !isPasswordValid() || formData.password !== formData.confirmPassword}
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>

                <div className="text-center">
                  <Link href="/auth/login" className="text-sm text-emerald-600 hover:underline">
                    Back to Sign In
                  </Link>
                </div>
              </form>
            )}

            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Secure password reset with OTP verification</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
