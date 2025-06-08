import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
  import { Badge } from "@/components/ui/badge"
  import Link from "next/link"
  import { Button } from "@/components/ui/button"
  import { Users, Package, ShoppingCart, TrendingUp, DollarSign, AlertCircle, Plus } from 'lucide-react'
  import Product from "@/lib/models/product"
  import User from "@/lib/models/user"
import { dbConnect } from "@/lib/dbConnect"
import { requireAdmin } from "@/lib/admin-auth"

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

async function getDashboardStats() {
  await dbConnect();

  const totalUsers = await User.countDocuments();
  const products = await Product.find({});

  return {
    totalUsers,
    totalProducts: products.length,
    lowStockProducts: products.filter((p) => p.stockQuantity < 20).length,
  };
}

export default async function AdminDashboardPage() {
  await requireAdmin(); // ✅ Ensure admin authentication

  const dynamicStats = await getDashboardStats(); // ✅ Fetch dynamic stats

  // ✅ Keep static values that don’t need to be fetched
  const staticStats = {
    totalOrders: 156,
    totalRevenue: 125000,
    pendingOrders: 12,
  };

  // ✅ Merge static and dynamic data
  const stats = { ...staticStats, ...dynamicStats };

  const recentOrders = [
    { id: "ORD-001", customer: "John Doe", amount: 899, status: "pending" },
    { id: "ORD-002", customer: "Jane Smith", amount: 1299, status: "confirmed" },
    { id: "ORD-003", customer: "Mike Johnson", amount: 649, status: "shipped" },
    { id: "ORD-004", customer: "Sarah Wilson", amount: 999, status: "delivered" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

 
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to Krishna Naturals Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-emerald-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <ShoppingCart className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link href="/admin/products">
          <Button className="w-full h-16 flex flex-col items-center justify-center space-y-1 bg-white border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
            <Package className="h-6 w-6" />
            <span className="text-sm font-medium">Manage Products</span>
          </Button>
        </Link>
        <Link href="/admin/orders">
          <Button className="w-full h-16 flex flex-col items-center justify-center space-y-1 bg-white border-2 border-blue-200 text-blue-700 hover:bg-blue-50">
            <ShoppingCart className="h-6 w-6" />
            <span className="text-sm font-medium">View Orders</span>
          </Button>
        </Link>
        <Link href="/admin/products/add">
          <Button className="w-full h-16 flex flex-col items-center justify-center space-y-1 bg-white border-2 border-purple-200 text-purple-700 hover:bg-purple-50">
            <Plus className="h-6 w-6" />
            <span className="text-sm font-medium">Add Product</span>
          </Button>
        </Link>
        <Link href="/admin/users">
          <Button className="w-full h-16 flex flex-col items-center justify-center space-y-1 bg-white border-2 border-yellow-200 text-yellow-700 hover:bg-yellow-50">
            <Users className="h-6 w-6" />
            <span className="text-sm font-medium">Manage Users</span>
          </Button>
        </Link>
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-gray-600">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{order.amount}</p>
                    <Badge className={getStatusColor(order.status)}>{order.status.toUpperCase()}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm font-medium text-orange-800">Low Stock Alert</p>
              <p className="text-sm text-orange-600">{stats.lowStockProducts} products running low</p>
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-medium text-yellow-800">Pending Orders</p>
              <p className="text-sm text-yellow-600">{stats.pendingOrders} orders need attention</p>
            </div>

            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800">Revenue Growth</p>
              <p className="text-sm text-green-600">15% increase this month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Nuts</span>
                <span className="text-sm font-medium">45%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Dry Fruits</span>
                <span className="text-sm font-medium">30%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Spices</span>
                <span className="text-sm font-medium">15%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Seeds</span>
                <span className="text-sm font-medium">10%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm">Orders: +23%</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm">Revenue: +15%</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm">New Users: +8%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm">Website Status: Online</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm">Payment Gateway: Active</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm">Database: Connected</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
