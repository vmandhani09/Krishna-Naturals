import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("adminToken")?.value;

  if (!token) {
    redirect("/admin/login");
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as any;
    if (decoded.role !== "admin") {
      redirect("/admin/login");
    }
  } catch {
    redirect("/admin/login");
  }
}