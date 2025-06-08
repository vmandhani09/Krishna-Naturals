"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Edit, Trash2, AlertTriangle, Package } from "lucide-react"
import { Product } from "@/types";

export default function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch products from the API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Failed to fetch products");

        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = products.filter((p) => {
    const totalStock = p.weights.reduce((sum, w) => sum + w.quantity, 0);
    return totalStock < 20;
  });

  const handleDeleteProduct = async (productSku: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(`/api/products/${productSku}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Failed to delete product");

        alert("Product deleted successfully!");
        setProducts(products.filter((product) => product.sku !== productSku));
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product. Please try again.");
      }
    }
  };

  const getStockStatus = (weights: any) => {
    if (!Array.isArray(weights) || weights.length === 0) {
      return { label: "Out of Stock", color: "bg-red-100 text-red-800" };
    }

    const totalStock = weights.reduce((sum, w) => {
      const qty = Number(w.quantity) || 0;
      return sum + qty;
    }, 0);

    if (totalStock === 0) return { label: "Out of Stock", color: "bg-red-100 text-red-800" };
    if (totalStock < 20) return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
    return { label: "In Stock", color: "bg-green-100 text-green-800" };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">Product Management</h1>
          <p className="text-stone-600">Manage your product inventory</p>
        </div>
        <Link href="/admin/products/add">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-stone-600">Total Products</p>
                <p className="text-2xl font-bold text-stone-900">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-stone-600">In Stock</p>
                <p className="text-2xl font-bold text-stone-900">
                  {products.filter((p) => p.weights.reduce((total, w) => total + (w.quantity || 0), 0) > 20).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-stone-600">Low Stock</p>
                <p className="text-2xl font-bold text-stone-900">{lowStockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-stone-600">Out of Stock</p>
                <p className="text-2xl font-bold text-stone-900">
                  {products.filter((p) => p.weights.reduce((total, w) => total + (w.quantity || 0), 0) === 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Products Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Price Range</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const minPrice = Math.min(...product.weights.map((w) => w.price))
                  const maxPrice = Math.max(...product.weights.map((w) => w.price))

                  return (
                    <TableRow key={product.sku}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="relative w-12 h-12">
                            <Image
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                          <div>
                            <div className="font-medium text-stone-900">{product.name}</div>
                            <div className="text-sm text-stone-500">{product.brand}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{product.weights.reduce((total, w) => total + (w.quantity || 0), 0)} units</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          ₹{minPrice} - ₹{maxPrice}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStockStatus(product.weights).color}>
                          {getStockStatus(product.weights).label}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/products/edit/${product.sku}`}>
                                <Button>Edit Product</Button>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteProduct(product.sku)} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}