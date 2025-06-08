"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Target
} from 'lucide-react'
import { orders, users } from "@/lib/data"

export default function AnalyticsClient() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products")
        const data = await res.json()
        setProducts(data)
      } catch (err) {
        console.error("Failed to load products", err)
      }
    }

    fetchProducts()
  }, [])

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const thisMonthRevenue = 45000
  const lastMonthRevenue = 38000
  const revenueGrowth = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100

  const categoryStats = [
    { name: "Nuts", orders: 45, revenue: 25000, growth: 12 },
    { name: "Dry Fruits", orders: 38, revenue: 18500, growth: 8 },
    { name: "Spices", orders: 22, revenue: 12000, growth: -3 },
    { name: "Seeds", orders: 15, revenue: 8500, growth: 15 },
  ]

  const topProducts = products
    .map((product: any) => ({
      ...product,
      orderCount: Math.floor(Math.random() * 50) + 10,
      revenue: Math.floor(Math.random() * 15000) + 5000,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  const monthlyData = [
    { month: "Jan", revenue: 32000, orders: 120 },
    { month: "Feb", revenue: 28000, orders: 98 },
    { month: "Mar", revenue: 35000, orders: 135 },
    { month: "Apr", revenue: 42000, orders: 156 },
    { month: "May", revenue: 38000, orders: 142 },
    { month: "Jun", revenue: 45000, orders: 168 },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-800">Analytics Dashboard</h1>
        <p className="text-stone-600">Track your business performance and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-stone-600">Total Revenue</p>
                <p className="text-2xl font-bold text-stone-900">₹{totalRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+{revenueGrowth.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-stone-600">Total Orders</p>
                <p className="text-2xl font-bold text-stone-900">{orders.length}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+12.5%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-stone-600">Active Customers</p>
                <p className="text-2xl font-bold text-stone-900">{users.filter((u) => u.role === "user").length}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+8.2%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Target className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-stone-600">Avg. Order Value</p>
                <p className="text-2xl font-bold text-stone-900">₹{Math.round(totalRevenue / orders.length)}</p>
                <div className="flex items-center mt-1">
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-600">-2.1%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryStats.map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{category.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-stone-600">₹{category.revenue.toLocaleString()}</span>
                      <Badge
                        variant={category.growth >= 0 ? "default" : "destructive"}
                        className={category.growth >= 0 ? "bg-green-100 text-green-800" : ""}
                      >
                        {category.growth >= 0 ? "+" : ""}
                        {category.growth}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={(category.revenue / 25000) * 100} className="h-2" />
                  <div className="flex justify-between text-sm text-stone-600">
                    <span>{category.orders} orders</span>
                    <span>{((category.revenue / 25000) * 100).toFixed(1)}% of top category</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.sku || index} className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-stone-100 rounded-full">
                    <span className="text-sm font-medium">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-stone-900">{product.name}</p>
                    <p className="text-sm text-stone-600">{product.orderCount} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{product.revenue.toLocaleString()}</p>
                    <p className="text-sm text-stone-600">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-4">
              {monthlyData.map((month) => (
                <div key={month.month} className="text-center">
                  <div className="bg-emerald-100 h-20 flex items-end justify-center rounded-lg mb-2">
                    <div
                      className="bg-emerald-600 w-8 rounded-t"
                      style={{ height: ((month.revenue / 50000) * 80) + "px" }}
                    />
                  </div>
                  <p className="text-sm font-medium">{month.month}</p>
                  <p className="text-xs text-stone-600">₹{(month.revenue / 1000).toFixed(0)}k</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="bg-green-100 p-2 rounded-full">
                <ShoppingCart className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">New order received</p>
                <p className="text-sm text-stone-600">Order #ORD-004 for ₹1,299</p>
              </div>
              <div className="ml-auto text-xs text-stone-500">2 min ago</div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="bg-blue-100 p-2 rounded-full">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">New customer registered</p>
                <p className="text-sm text-stone-600">welcome@example.com joined</p>
              </div>
              <div className="ml-auto text-xs text-stone-500">15 min ago</div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <div className="bg-yellow-100 p-2 rounded-full">
                <Package className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium">Low stock alert</p>
                <p className="text-sm text-stone-600">Organic Dates running low (15 units)</p>
              </div>
              <div className="ml-auto text-xs text-stone-500">1 hour ago</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
