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
    if (step === "otp") otpInputRefs.current[0]?.focus();
  }, [step]);

  // ------------------------------
  // Form change handler
  // ------------------------------
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") validatePasswordStrength(value);
  };

  // ------------------------------
  // Password strength logic
  // ------------------------------
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

  const isPasswordValid = () =>
    passwordStrength.checks.length &&
    passwordStrength.checks.upper &&
    passwordStrength.checks.lower &&
    passwordStrength.checks.number &&
    passwordStrength.checks.special;

  // ------------------------------
  // SEND OTP — with email check
  // ------------------------------
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1️⃣ Check if email exists
      const checkRes = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const checkData = await checkRes.json();

      if (!checkData.exists) {
        toast.error("This email is not registered!");
        setIsLoading(false);
        return;
      }

      // 2️⃣ Send OTP
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
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------------
  // OTP input logic
  // ------------------------------
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);

    setOtp(newOtp);

    if (value && index < 5) otpInputRefs.current[index + 1]?.focus();

    if (newOtp.every((d) => d)) {
      setTimeout(() => verifyOtp(newOtp.join("")), 150);
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
      toast.error("Incorrect OTP. Try again.");
      setOtp(Array(6).fill(""));
      otpInputRefs.current[0]?.focus();
    }
  };

  // ------------------------------
  // RESET PASSWORD
  // ------------------------------
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!isPasswordValid()) {
      toast.error("Password is too weak");
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
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------------
  // UI
  // ------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-600">Dryfruit Grove</h1>
          <p className="text-gray-600 mt-2">
            {step === "email" && "Enter your email to receive OTP"}
            {step === "otp" && "Enter the OTP sent to your email"}
            {step === "reset" && "Create your new password"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Reset Password</CardTitle>
          </CardHeader>

          <CardContent>
            {/* STEP 1: Email */}
            {step === "email" && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <Label>Email Address</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      name="email"
                      type="email"
                      required
                      placeholder="Enter your email"
                      className="pl-10"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isLoading ? "Sending..." : "Send OTP"}
                </Button>

                <div className="text-center text-sm">
                  <Link href="/auth/login" className="text-emerald-600 hover:underline">
                    Back to Login
                  </Link>
                </div>
              </form>
            )}

            {/* STEP 2: OTP */}
            {step === "otp" && (
              <div className="space-y-6">
                <Label className="text-center block">Enter 6-digit OTP</Label>

                <div className="flex gap-2 justify-center">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el: HTMLInputElement | null) => {otpInputRefs.current[index] = el;
}}

                      type="text"
                      maxLength={1}
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 text-center text-xl font-semibold"
                    />
                  ))}
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
                </div>
              </div>
            )}

            {/* STEP 3: Reset Password */}
            {step === "reset" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <Label>New Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      name="password"
                      type="password"
                      placeholder="Enter new password"
                      className="pl-10"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </div>

                  {formData.password && (
                    <div className="mt-2 text-xs space-y-1">
                      {Object.entries(passwordStrength.checks).map(([rule, passed]) => (
                        <div key={rule} className="flex items-center gap-2">
                          {passed ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-gray-400" />
                          )}
                          <span className={passed ? "text-green-600" : ""}>
                            {rule === "length"
                              ? "At least 8 characters"
                              : rule === "upper"
                              ? "Uppercase letter"
                              : rule === "lower"
                              ? "Lowercase letter"
                              : rule === "number"
                              ? "Number"
                              : "Special character"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label>Confirm Password</Label>
                  <Input
                    name="confirmPassword"
                    type="password"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />

                  {formData.confirmPassword &&
                    formData.password !== formData.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                    )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !isPasswordValid()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>

                <div className="text-center text-sm">
                  <Link href="/auth/login" className="text-emerald-600 hover:underline">
                    Back to Login
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
