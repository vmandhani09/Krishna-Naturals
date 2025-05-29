"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Minus, Save, ArrowLeft, Upload } from 'lucide-react'
import { categories } from "@/lib/data"
import Link from "next/link"

export default function AddProductPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    image: "",
    description: "",
    category: "",
    sku: "",
    stockQuantity: 0,
    brand: "Krishna Naturals",
    tags: "",
    weights: [{ label: "", price: 0 }],
    isBranded: true,
    packagingLabelImage: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "stockQuantity" ? Number.parseInt(value) || 0 : value,
    }))
  }

  const handleWeightChange = (index: number, field: "label" | "price", value: string) => {
    const newWeights = [...formData.weights]
    newWeights[index] = {
      ...newWeights[index],
      [field]: field === "price" ? Number.parseFloat(value) || 0 : value,
    }
    setFormData((prev) => ({ ...prev, weights: newWeights }))
  }

  const addWeight = () => {
    setFormData((prev) => ({
      ...prev,
      weights: [...prev.weights, { label: "", price: 0 }],
    }))
  }

  const removeWeight = (index: number) => {
    if (formData.weights.length > 1) {
      setFormData((prev) => ({
        ...prev,
        weights: prev.weights.filter((_, i) => i !== index),
      }))
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      alert("Product added successfully!")
      router.push("/admin/products")
    }, 1000)
  }

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
        <h1 className="text-3xl font-bold text-stone-800">Add New Product</h1>
        <p className="text-stone-600">Create a new product for your inventory</p>
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
                <Input
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  placeholder="e.g., ALM-001"
                  required
                />
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
              {/* Brand Section - Replace the existing brand input */}
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

                {formData.isBranded ? (
                  <div>
                    <Label htmlFor="brand">Brand Name</Label>
                    <Input
                      id="brand"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      placeholder="e.g., Krishna Naturals"
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="packagingLabelImage">Packaging Label Preview (Optional)</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="packagingLabelImage"
                        name="packagingLabelImage"
                        type="url"
                        value={formData.packagingLabelImage}
                        onChange={handleInputChange}
                        placeholder="Upload packaging label preview"
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Label
                      </Button>
                    </div>
                    <p className="text-sm text-stone-500 mt-1">
                      For bulk/unbranded items, you can upload a preview of the packaging label
                    </p>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="e.g., organic, premium, healthy"
                />
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
                    placeholder="e.g., 250g"
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
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeWeight(index)}
                  disabled={formData.weights.length === 1}
                >
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
          <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {isLoading ? (
              "Adding..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Add Product
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
