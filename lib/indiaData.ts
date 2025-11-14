// -----------------------------
// INDIA STATES (STATIC LIST)
// -----------------------------
export const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh"
];

// ----------------------------------
// 🔥 LIVE CITY FETCHER
// ----------------------------------
export async function fetchCitiesByState(state: string): Promise<string[]> {
  try {
    const response = await fetch(
      "https://countriesnow.space/api/v0.1/countries/state/cities",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: "India",
          state,
        }),
      }
    );

    const data = await response.json();

    if (data.error || !data.data) return [];
    return data.data;
  } catch (err) {
    console.error("City fetch error:", err);
    return [];
  }
}

// ----------------------------------
// 🔥 LIVE PINCODE VALIDATION
// ----------------------------------
export async function validatePincode(pin: string) {
  if (!/^[1-9][0-9]{5}$/.test(pin)) {
    return { valid: false, message: "Invalid pincode format" };
  }

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
    const data = await res.json();

    if (data[0].Status === "Success") {
      return {
        valid: true,
        state: data[0].PostOffice[0].State,
        district: data[0].PostOffice[0].District,
        message: "Valid pincode",
      };
    } else {
      return { valid: false, message: "Pincode not found" };
    }
  } catch (error) {
    console.error("Pincode validation failed:", error);
    return { valid: false, message: "Server error validating pincode" };
  }
}
