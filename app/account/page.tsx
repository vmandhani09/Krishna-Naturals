"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Edit, Save, Trash2, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/userAuth";
import { STATES, fetchCitiesByState, validatePincode } from "@/lib/indiaData";

type AddressForm = {
  fullName: string;
  phone: string;
  pincode: string;
  house: string;
  street: string;
  landmark: string;
  state: string;
  city: string;
  isDefault: boolean;
};

type UserAddress = Omit<AddressForm, "isDefault"> & { isDefault: boolean };

type UserData = {
  id: string;
  name: string;
  email: string;
  addresses?: UserAddress[];
};

const EMPTY_ADDRESS: AddressForm = {
  fullName: "",
  phone: "",
  pincode: "",
  house: "",
  street: "",
  landmark: "",
  state: "",
  city: "",
  isDefault: true,
};

const TOKEN_KEY = "userToken";

export default function AccountPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, setUser, isLoading: isAuthLoading } = useAuth();

  const [localUser, setLocalUser] = useState<UserData | null>(null);
  const [profileName, setProfileName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressForm>(EMPTY_ADDRESS);
  const [cities, setCities] = useState<string[]>([]);
  const [pincodeStatus, setPincodeStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [pincodeMessage, setPincodeMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const primaryAddress = useMemo(() => localUser?.addresses?.[0], [localUser]);

  /* ------------------ LOAD USER ------------------ */
  useEffect(() => {
    if (user) {
      setLocalUser(user as UserData);
    } else if (!isAuthLoading) {
      setLocalUser(null);
    }
  }, [user, isAuthLoading]);

  /* ------------------ SYNC FORM WITH USER ------------------ */
  useEffect(() => {
    if (!localUser) {
      setProfileName("");
      setAddressForm(EMPTY_ADDRESS);
      setCities([]);
      setPincodeMessage("");
      return;
    }

    setProfileName(localUser.name ?? "");

    if (localUser.addresses?.length) {
      const addr = localUser.addresses[0];

      setAddressForm({
        fullName: addr.fullName,
        phone: addr.phone,
        pincode: addr.pincode,
        house: addr.house,
        street: addr.street,
        landmark: addr.landmark ?? "",
        state: addr.state,
        city: addr.city,
        isDefault: true,
      });

      if (addr.state) {
        fetchCitiesByState(addr.state).then((list) => setCities(list));
      }
    } else {
      setAddressForm(EMPTY_ADDRESS);
      setCities([]);
    }
  }, [localUser]);

  /* ------------------ HELPERS ------------------ */
  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

  const refreshUser = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const data = await res.json();
      setLocalUser(data.user);
      setUser(data.user);
    } catch {}
  };

  /* ------------------ UPDATE PROFILE NAME ------------------ */
  const handleNameSave = async () => {
    const trimmed = profileName.trim();
    if (trimmed.length < 3) {
      toast.error("Name must be at least 3 characters");
      return;
    }

    const token = getToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: trimmed }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update name");
        return;
      }

      toast.success("Profile updated");
      setIsEditingName(false);
      refreshUser();
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ------------------ HANDLE ADDRESS INPUT ------------------ */
  const handleAddressFieldChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "phone") {
      setAddressForm((prev) => ({ ...prev, phone: value.replace(/\D/g, "").slice(0, 10) }));
      return;
    }

    if (name === "pincode") {
      const digits = value.replace(/\D/g, "").slice(0, 6);

      setAddressForm((prev) => ({ ...prev, pincode: digits }));

      if (digits.length === 6) {
        try {
          setPincodeStatus("checking");
          const result = await validatePincode(digits);
          setPincodeStatus(result.valid ? "valid" : "invalid");
          setPincodeMessage(result.message);
        } catch {
          setPincodeStatus("invalid");
        }
      } else {
        setPincodeStatus("idle");
      }

      return;
    }

    if (name === "state") {
      setAddressForm((prev) => ({ ...prev, state: value, city: "" }));
      const list = await fetchCitiesByState(value);
      setCities(list);
      return;
    }

    setAddressForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ------------------ VALIDATE ADDRESS ------------------ */
  const validateAddressForm = () => {
    if (!addressForm.fullName.trim()) return toast.error("Full name is required");
    if (!/^[6-9]\d{9}$/.test(addressForm.phone)) return toast.error("Invalid phone");
    if (!/^\d{6}$/.test(addressForm.pincode)) return toast.error("Pincode must be 6 digits");
    if (!addressForm.house.trim()) return toast.error("House is required");
    if (!addressForm.street.trim()) return toast.error("Street is required");
    if (!addressForm.state) return toast.error("Select state");
    if (!addressForm.city) return toast.error("Select city");
    return true;
  };

  /* ------------------ SAVE ADDRESS ------------------ */
  const submitAddress = async (method: "POST" | "PUT") => {
    if (!validateAddressForm()) return;

    const token = getToken();
    if (!token) return router.push("/auth/login");

    setIsSubmitting(true);

    try {
      const endpoint =
        method === "POST"
          ? "/api/user/address/save"
          : "/api/user/address/update";

      const payload =
        method === "POST"
          ? addressForm
          : { index: 0, address: addressForm };

      const res = await fetch(endpoint, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to save address");
        return;
      }

      toast.success(method === "POST" ? "Address saved" : "Address updated");
      setIsEditingAddress(false);
      refreshUser();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddressSave = () => {
    primaryAddress ? submitAddress("PUT") : submitAddress("POST");
  };

  /* ------------------ DELETE ADDRESS ------------------ */
  const handleDeleteAddress = async () => {
    if (!primaryAddress) return;
    if (!confirm("Delete saved address?")) return;

    const token = getToken();
    if (!token) return router.push("/auth/login");

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/user/address/delete", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ index: 0 }),
      });

      if (!res.ok) return toast.error("Failed to delete");

      toast.success("Address removed");
      setAddressForm(EMPTY_ADDRESS);
      refreshUser();
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ------------------ LOGOUT ------------------ */
  const handleLogout = () => {
    fetch("/api/auth/logout", { method: "GET", credentials: "include" });
    localStorage.removeItem(TOKEN_KEY);
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970;";
    setUser(null);
    router.push("/");
  };

  /* ------------------ LOADING ------------------ */
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
      </div>
    );
  }

  /* ------------------ NO USER ------------------ */
  if (!localUser) {
    return (
      <div className="flex items-center justify-center py-20">
        <Card className="max-w-md">
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">No user session found.</p>
            <Button className="mt-4" onClick={() => router.push("/auth/login")}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ============================================================
     MAIN ACCOUNT PAGE
     ============================================================ */
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

      {/* ---------- Heading ---------- */}
      <div>
        <h1 className="text-3xl font-bold">My Account</h1>
        <p className="text-muted-foreground mt-1">
          Update your profile details and manage your saved address.
        </p>
      </div>

      {/* ---------- PROFILE ---------- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Profile Details</CardTitle>

          {!isEditingName ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditingName(true)}>
              <Edit className="h-4 w-4 mr-2" /> Edit
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleNameSave} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsEditingName(false);
                  setProfileName(localUser.name);
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Full Name</Label>
            <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} disabled={!isEditingName} />
          </div>

          <div>
            <Label>Email</Label>
            <Input value={localUser.email} disabled />
          </div>
        </CardContent>
      </Card>

      {/* ---------- ADDRESS ---------- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Saved Address</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Only one address can be stored for faster checkout.
            </p>
          </div>

          {!isEditingAddress && (
            <Button variant="outline" size="sm" onClick={() => setIsEditingAddress(true)}>
              <Edit className="h-4 w-4 mr-2" /> {primaryAddress ? "Edit address" : "Add address"}
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* DISPLAY ADDRESS */}
          {!isEditingAddress && primaryAddress && (
            <div className="rounded-lg border p-4">
              <p className="font-semibold">{primaryAddress.fullName}</p>
              <p className="text-sm text-muted-foreground mt-1">{primaryAddress.phone}</p>

              <p className="text-sm mt-2">
                {primaryAddress.house}, {primaryAddress.street}
              </p>

              <p className="text-sm">
                {primaryAddress.city} - {primaryAddress.pincode}, {primaryAddress.state}
              </p>

              {primaryAddress.landmark && (
                <p className="text-sm text-muted-foreground">Landmark: {primaryAddress.landmark}</p>
              )}

              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setIsEditingAddress(true)}>
                  Edit
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50"
                  onClick={handleDeleteAddress}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Remove
                </Button>
              </div>
            </div>
          )}

          {/* NO ADDRESS */}
          {!isEditingAddress && !primaryAddress && (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No address saved yet. Click “Add address” to store your delivery details.
            </div>
          )}

          {/* EDIT / ADD ADDRESS */}
          {isEditingAddress && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <div>
                  <Label>Full Name</Label>
                  <Input name="fullName" value={addressForm.fullName} onChange={handleAddressFieldChange} />
                </div>

                <div>
                  <Label>Phone</Label>
                  <Input name="phone" maxLength={10} value={addressForm.phone} onChange={handleAddressFieldChange} />
                </div>

                {/* ----------- STATE (Shadcn-style styling) ----------- */}
                <div>
                  <Label>State</Label>
                  <select
                    name="state"
                    value={addressForm.state}
                    onChange={handleAddressFieldChange}
                    className="
                      w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-sm
                      focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-emerald-500
                      shadow-sm
                    "
                  >
                    <option value="">Select State</option>
                    {STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ----------- CITY (matches input UI) ----------- */}
                <div>
                  <Label>City</Label>
                  <select
                    name="city"
                    value={addressForm.city}
                    onChange={handleAddressFieldChange}
                    disabled={!addressForm.state}
                    className="
                      w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-sm
                      disabled:opacity-60 disabled:cursor-not-allowed
                      focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-emerald-500
                      shadow-sm
                    "
                  >
                    <option value="">{addressForm.state ? "Select City" : "Select State First"}</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Pincode</Label>
                  <Input
                    name="pincode"
                    maxLength={6}
                    value={addressForm.pincode}
                    onChange={handleAddressFieldChange}
                    className={
                      pincodeStatus === "invalid" ? "border-red-500 focus-visible:ring-red-500" : ""
                    }
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {pincodeStatus === "checking" && "Validating pincode…"}
                    {pincodeStatus === "valid" && (
                      <span className="text-emerald-600">{pincodeMessage}</span>
                    )}
                    {pincodeStatus === "invalid" && (
                      <span className="text-red-600">{pincodeMessage}</span>
                    )}
                  </p>
                </div>

                <div>
                  <Label>House / Flat</Label>
                  <Input name="house" value={addressForm.house} onChange={handleAddressFieldChange} />
                </div>

                <div className="md:col-span-2">
                  <Label>Street / Area</Label>
                  <Input name="street" value={addressForm.street} onChange={handleAddressFieldChange} />
                </div>

                <div className="md:col-span-2">
                  <Label>Landmark (optional)</Label>
                  <Input name="landmark" value={addressForm.landmark} onChange={handleAddressFieldChange} />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleAddressSave} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {primaryAddress ? "Update Address" : "Save Address"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditingAddress(false);
                    if (primaryAddress) {
                      setAddressForm({
                        ...primaryAddress,
                        isDefault: true,
                      });
                    } else {
                      setAddressForm(EMPTY_ADDRESS);
                    }
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---------- SETTINGS ---------- */}
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>

        <CardContent className="flex items-center justify-between flex-col md:flex-row gap-4">
          <div>
            <p className="font-medium">Theme</p>
            <p className="text-sm text-muted-foreground">Toggle light and dark mode.</p>
          </div>

          <Button variant="outline" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            Switch to {theme === "dark" ? "light" : "dark"} mode
          </Button>
        </CardContent>
      </Card>

      {/* ---------- LOGOUT ---------- */}
      <div className="flex justify-end">
        <Button variant="outline" className="text-red-600 hover:bg-red-50" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
