"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState<"info" | "email" | "otp" | "password">("info");

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const [otp, setOtp] = useState(Array(6).fill(""));
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verified, setVerified] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ---------------- PASSWORD STRENGTH ----------------
  const checkStrength = (password: string) => {
    if (password.length < 8) return "Weak";
    if (/[A-Z]/.test(password) && /\d/.test(password) && /[@$!%*?&#]/.test(password))
      return "Strong";
    return "Medium";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") setPasswordStrength(checkStrength(value));
  };

  // ---------------- STEP 1: NAME ----------------
  const handleNextToEmail = () => {
    if (!formData.name.trim() || !formData.surname.trim()) {
      toast.error("Enter both name and surname");
      return;
    }
    setStep("email");
  };

  // ---------------- STEP 2: SEND OTP (with email check) ----------------
  const handleSendOtp = async () => {
    if (sendingOtp || resendTimer > 0) return;
    setSendingOtp(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Enter a valid email address");
      setSendingOtp(false);
      return;
    }

    try {
      const checkRes = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const checkData = await checkRes.json();

      if (!checkRes.ok) {
        toast.error(checkData.error || "Email already registered");

        // Auto-focus email field for correction
        const input = document.getElementById("email-input") as HTMLInputElement;
        input?.focus();
        input?.select();

        setSendingOtp(false);
        return;
      }

      // EMAIL IS FREE → SEND OTP
      const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(randomOtp);

      await fetch("/api/auth/send-register-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: randomOtp }),
      });

      toast.success("OTP sent!");

      // reset otp inputs
      setOtp(["", "", "", "", "", ""]);
      setResendTimer(60);
      setStep("otp");

    } catch {
      toast.error("Error sending OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  // ---------------- OTP TIMER ----------------
  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  // ---------------- AUTO FOCUS FIRST OTP BOX ----------------
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  // ---------------- OTP INPUT HANDLING ----------------
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = () => {
    const enteredOtp = otp.join("").trim();
    const originalOtp = generatedOtp.trim();

    if (enteredOtp.length !== 6) {
      toast.error("Enter all 6 digits");
      return;
    }

    if (enteredOtp === originalOtp) {
      setVerified(true);
      toast.success("Email verified successfully!");
      setStep("password");
    } else {
      toast.error("Incorrect OTP");
    }
  };

  // ---------------- FINAL REGISTER ----------------
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verified) return toast.error("Verify your email first");
    if (formData.password !== formData.confirmPassword)
      return toast.error("Passwords do not match");
    if (
      !/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,20}$/.test(formData.password)
    )
      return toast.error("Password must be strong.");

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${formData.name} ${formData.surname}`,
          email: formData.email,
          password: formData.password,
        }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success("Account created!");
        router.push("/login");
      } else toast.error(result.error);
    } catch {
      toast.error("Registration error");
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center px-4 py-10">
      <Card className="max-w-md w-full shadow-lg border border-emerald-200">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-emerald-700">
            Create Your Account
          </CardTitle>
        </CardHeader>

        <CardContent>

          {/* STEP 1: NAME */}
          {step === "info" && (
            <div className="space-y-4">
              <Label>First Name</Label>
              <Input name="name" value={formData.name} onChange={handleChange} placeholder="Enter your first name" />

              <Label>Last Name</Label>
              <Input name="surname" value={formData.surname} onChange={handleChange} placeholder="Enter your surname" />

              <Button className="w-full bg-emerald-600 mt-4" onClick={handleNextToEmail}>
                Next
              </Button>
            </div>
          )}

          {/* STEP 2: EMAIL */}
          {step === "email" && (
            <div className="space-y-4">
              <Label>Email Address</Label>
              <Input
                id="email-input"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@gmail.com"
              />

              <Button
                className="w-full bg-emerald-600"
                onClick={handleSendOtp}
                disabled={sendingOtp || resendTimer > 0}
              >
                {sendingOtp
                  ? "Sending..."
                  : resendTimer > 0
                    ? `Resend OTP in ${resendTimer}s`
                    : "Send OTP"}
              </Button>
            </div>
          )}

          {/* STEP 3: OTP */}
          {step === "otp" && (
            <div className="space-y-4 text-center">
              <Label className="block text-lg font-medium mb-2">Enter 6-digit OTP</Label>

              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => {
                      otpRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold border-emerald-400 focus:ring-emerald-500"
                  />
                ))}
              </div>

              <Button className="w-full bg-emerald-600 mt-3" onClick={handleVerifyOtp}
                disabled={otp.join("").length !== 6}
              >
                Verify OTP
              </Button>
            </div>
          )}

          {/* STEP 4: PASSWORD */}
{step === "password" && (
  <form onSubmit={handleRegister} className="space-y-6">

    {/* Password Input */}
    <div>
      <Label>Password</Label>
      <div className="relative">
        <Input
          name="password"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={(e) => {
            // prevent beyond max 20 chars
            if (e.target.value.length <= 20) {
              handleChange(e);
            }
          }}
          maxLength={20}
          placeholder="Create a strong password"
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-3 text-gray-500"
        >
          {showPassword ? <EyeOff /> : <Eye />}
        </button>
      </div>

      {/* PASSWORD REQUIREMENTS */}
      <div className="mt-3 space-y-1 text-sm">
        <p
          className={`${
            formData.password.length >= 8 ? "text-green-600" : "text-red-500"
          }`}
        >
          {formData.password.length >= 8 ? "✔" : "✖"} Minimum 8 characters
        </p>

        <p
          className={`${
            formData.password.length <= 20 && formData.password.length > 0
              ? "text-green-600"
              : formData.password.length > 20
              ? "text-red-500"
              : "text-red-500"
          }`}
        >
          {formData.password.length <= 20 && formData.password.length > 0
            ? "✔"
            : "✖"}{" "}
          Maximum 20 characters
        </p>

        <p className={`${/[A-Z]/.test(formData.password) ? "text-green-600" : "text-red-500"}`}>
          {/[A-Z]/.test(formData.password) ? "✔" : "✖"} At least 1 uppercase letter (A–Z)
        </p>

        <p className={`${/[a-z]/.test(formData.password) ? "text-green-600" : "text-red-500"}`}>
          {/[a-z]/.test(formData.password) ? "✔" : "✖"} At least 1 lowercase letter (a–z)
        </p>

        <p className={`${/\d/.test(formData.password) ? "text-green-600" : "text-red-500"}`}>
          {/\d/.test(formData.password) ? "✔" : "✖"} At least 1 number (0–9)
        </p>

        <p
          className={`${
            /[@$!%*?&]/.test(formData.password) ? "text-green-600" : "text-red-500"
          }`}
        >
          {/[@$!%*?&]/.test(formData.password) ? "✔" : "✖"} At least 1 special symbol (@$!%*?&)
        </p>
      </div>

      {/* PASSWORD STRENGTH BAR */}
      {formData.password && (
        <div className="mt-3 w-full h-2 rounded bg-gray-200 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              passwordStrength === "Weak"
                ? "bg-red-500 w-1/4"
                : passwordStrength === "Medium"
                ? "bg-yellow-500 w-2/3"
                : "bg-green-600 w-full"
            }`}
          ></div>
        </div>
      )}
    </div>

    {/* Confirm Password */}
    <div>
      <Label>Confirm Password</Label>
      <div className="relative">
        <Input
          name="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          value={formData.confirmPassword}
          onChange={(e) => {
            if (e.target.value.length <= 20) {
              handleChange(e);
            }
          }}
          maxLength={20}
          placeholder="Confirm password"
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-3 text-gray-500"
        >
          {showConfirmPassword ? <EyeOff /> : <Eye />}
        </button>
      </div>

      {formData.confirmPassword && (
        <p
          className={`text-sm mt-1 ${
            formData.password === formData.confirmPassword
              ? "text-green-600"
              : "text-red-500"
          }`}
        >
          {formData.password === formData.confirmPassword
            ? "✔ Passwords match"
            : "✖ Passwords do not match"}
        </p>
      )}
    </div>

    {/* Submit Button */}
    <Button type="submit" disabled={isLoading} className="w-full bg-emerald-600">
      {isLoading ? "Creating Account..." : "Create Account"}
    </Button>
  </form>
)}

        </CardContent>
      </Card>
    </div>
  );
}
