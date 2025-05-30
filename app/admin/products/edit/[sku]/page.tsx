"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Minus, Save, ArrowLeft, Upload, Trash } from "lucide-react";
import { categories } from "@/lib/data";
import { Product } from "@/types";
import product from "@/lib/models/product";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productSku = params.sku as string; // Use SKU instead of ID
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Product>({
  name: "",
  slug: "",
  image: "",
  description: "",
  category: "",
  sku: "",
  stockQuantity: 0,
  brand: "Default Brand",
  tags: "",
  weights: [{ label: "", price: 0 }],
  isBranded: true,
  reviews: [], // ✅ Added missing reviews property
  averageRating: 0, // ✅ Added missing averageRating property
});

  // Fetch product details from the database using SKU
  useEffect(() => {
  const fetchProduct = async () => {
    try {
      if (!productSku) {
        console.error("Error: SKU is missing in the frontend");
        return;
      }

      console.log("Fetching product with SKU:", productSku);
      const response = await fetch(`/api/products/${productSku}`);

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const data = await response.json();
      console.log("Fetched product data:", data);

      setFormData(data);
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  fetchProduct();
}, [productSku]);
  if (!formData) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-stone-800 mb-4">Product Not Found</h1>
        <p className="text-stone-600 mb-6">The product you're trying to edit doesn't exist.</p>
        <Button onClick={() => router.push("/admin/products")}>Back to Products</Button>
      </div>
    );
  }

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => prev ? { ...prev, [name]: name === "stockQuantity" ? Number.parseInt(value) || 0 : value } : prev);
  };

  const handleWeightChange = (index: number, field: "label" | "price", value: string) => {
    const newWeights = [...formData!.weights];
    newWeights[index] = { ...newWeights[index], [field]: field === "price" ? Number.parseFloat(value) || 0 : value };
    setFormData((prev) => prev ? { ...prev, weights: newWeights } : prev);
  };

  const addWeight = () => {
    setFormData((prev) => prev ? { ...prev, weights: [...prev.weights, { label: "", price: 0 }] } : prev);
  };

  const removeWeight = (index: number) => {
    if (formData!.weights.length > 1) {
      setFormData((prev) => prev ? { ...prev, weights: prev.weights.filter((_, i) => i !== index) } : prev);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => prev ? { ...prev, name, slug: generateSlug(name) } : prev);
  };

  // API call to update product
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/products/${productSku}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update product");

      alert("Product updated successfully!");
      router.push("/admin/products");
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // API call to delete product
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(`/api/products/${productSku}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Failed to delete product");

        alert("Product deleted successfully!");
        router.push("/admin/products");
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product. Please try again.");
      }
    }
  };


  return (
  <div className="p-6 max-w-4xl mx-auto">
    <div className="mb-6">
      <div className="flex items-center space-x-4 mb-4">
        <Link href="/admin/products">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-stone-800">Edit Product</h1>
      <p className="text-stone-600">Update existing product information</p>
    </div>

    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleNameChange} required />
            </div>
            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input id="slug" name="slug" value={formData.slug} onChange={handleInputChange} required />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              name="image"
              type="url"
              value={formData.image}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sku">SKU *</Label>
              <Input id="sku" name="sku" value={formData.sku} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="stockQuantity">Stock Quantity *</Label>
              <Input
                id="stockQuantity"
                name="stockQuantity"
                type="number"
                value={formData.stockQuantity}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isBranded"
                  checked={formData.isBranded}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isBranded: checked as boolean }))}
                />
                <Label htmlFor="isBranded" className="font-medium">
                  This is a branded product
                </Label>
              </div>

              {formData.isBranded && (
                <div>
                  <Label htmlFor="brand">Brand Name</Label>
                  <Input id="brand" name="brand" value={formData.brand} onChange={handleInputChange} />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" name="tags" value={formData.tags} onChange={handleInputChange} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weight & Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.weights.map((weight, index) => (
            <div key={index} className="flex items-end space-x-4 p-4 border rounded-lg">
              <div className="flex-1">
                <Label htmlFor={`weight-label-${index}`}>Weight</Label>
                <Input
                  id={`weight-label-${index}`}
                  value={weight.label}
                  onChange={(e) => handleWeightChange(index, "label", e.target.value)}
                  required
                />
              </div>
              <div className="flex-1">
                <Label htmlFor={`weight-price-${index}`}>Price (₹)</Label>
                <Input
                  id={`weight-price-${index}`}
                  type="number"
                  value={weight.price}
                  onChange={(e) => handleWeightChange(index, "price", e.target.value)}
                  required
                />
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => removeWeight(index)}>
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addWeight}>
            <Plus className="h-4 w-4 mr-2" />
            Add Weight Option
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Link href="/admin/products">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
          {isLoading ? "Updating..." : <> <Save className="h-4 w-4 mr-2" /> Update Product </>}
        </Button>
        <Button type="button" onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
          <Trash className="h-4 w-4 mr-2" />
          Delete Product
        </Button>
      </div>
    </form>
  </div>
)};