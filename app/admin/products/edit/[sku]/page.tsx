"use client";

import { useState, useEffect, useRef } from "react";
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
import { uploadImageToCloudinary } from "@/utlis/cloudinaryUpload";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productSku = params.sku as string; // Use SKU instead of ID
  const [isLoading, setIsLoading] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    image: "",
    description: "",
    category: "",
    sku: "",
    brand: "Krishna Naturals",
    tags: "",
    weights: [{ label: "", price: 0, quantity: 0 }],
    isBranded: true,
    isFeatured: false,
    packagingLabelImage: "",
  });

  // ✅ Fetch product details from the database using SKU
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

      // ✅ Ensure `weights` exist and have quantity values
      setFormData((prev) => ({
        ...prev,
        ...data,
        weights: Array.isArray(data.weights) && data.weights.length > 0
          ? data.weights.map((weight: { label: string; price: number; quantity?: number }) => ({
              ...weight,
              quantity: typeof weight.quantity === "number" ? weight.quantity : 0, // ✅ Prevents undefined quantity
            }))
          : [{ label: "", price: 0, quantity: 0 }], // ✅ Fallback if `weights` are missing
      }));
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  fetchProduct();
}, [productSku]);

  // ✅ Prevent uncontrolled input error by ensuring valid data structure
  if (!formData.name) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-stone-800 mb-4">Product Not Found</h1>
        <p className="text-stone-600 mb-6">The product you're trying to edit doesn't exist.</p>
        <Button onClick={() => router.push("/admin/products")}>Back to Products</Button>
      </div>
    );
  }
  const handleImageSelection = (file: File | undefined) => {
  if (!file) return;
  setSelectedFile(file);
  setFileUploaded(true);
};
const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData((prev) => ({ ...prev, image: e.target.value }));
  setFileUploaded(false);
};
  // ✅ Handle Input Changes Safely
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value ?? "", // ✅ Prevents setting undefined
    }));
  };

  // ✅ Handle Weight Changes
  const handleWeightChange = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      weights: prev.weights.map((weight, i) =>
        i === index ? { ...weight, [field]: field === "quantity" ? Number(value) || 0 : value } : weight
      ),
    }));
  };

  const addWeight = () => {
    setFormData((prev) => ({
      ...prev,
      weights: [...prev.weights, { label: "", price: 0, quantity: 0 }],
    }));
  };

  const removeWeight = (index: number) => {
    if (formData.weights.length > 1) {
      setFormData((prev) => ({
        ...prev,
        weights: prev.weights.filter((_, i) => i !== index),
      }));
    }
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (selectedFile) {
      const imageUrl = await uploadImageToCloudinary(selectedFile);
      if (imageUrl) {
        setFormData((prev) => ({ ...prev, image: imageUrl }));
      } else {
        alert("Image upload failed!");
        setIsLoading(false);
        return;
      }
    }

    if (!formData.image) {
      alert("Please upload an image or provide a URL!");
      setIsLoading(false);
      return;
    }

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
  const handleDelete = async () => {
  if (confirm("Are you sure you want to delete this product?")) {
    try {
      const response = await fetch(`/api/products/${productSku}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete product");

      alert("Product deleted successfully!");
      router.push("/admin/products");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product. Please try again.");
    }
  }
};
 const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };

const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const name = e.target.value;
  setFormData((prev) =>
    prev ? { ...prev, name, slug: generateSlug(name) } : prev
  );
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

         <div className="space-y-4 p-4 border rounded-lg shadow-sm bg-white">
                       <Label htmlFor="image" className="text-lg font-semibold text-gray-700">
                         Upload Image or Enter URL
                       </Label>
         
                       {/* File Upload Section */}
                       <div className="flex items-center space-x-2">
                         {/* File input: visible but disabled if URL is entered */}
                         <Input
                           id="imageUpload"
                           type="file"
                           accept="image/*"
                           ref={fileInputRef}
                           disabled={formData.image.length > 0}
                           className="border border-gray-300 rounded-md p-2 flex-1 opacity-50 cursor-not-allowed"
                           onChange={(e) => {
                             if (e.target.files?.[0]) handleImageSelection(e.target.files[0]); // ✅ Just store file
                           }}
                         />
         
         
                         {/* Button: triggers file selection */}
                         <Button
                           type="button"
                           className="bg-black text-white hover:bg-gray-800 border-black"
                           onClick={() => fileInputRef.current?.click()}
                           disabled={formData.image.length > 0}
                         >
                           Upload Image
                         </Button>
                       </div>
         
                       {/* OR Divider */}
                       <div className="flex items-center justify-center my-2">
                         <span className="text-gray-400 text-sm">OR</span>
                       </div>
         
                       {/* URL Input Section */}
                       <div className="flex items-center space-x-2">
                         <Input
                           id="imageUrl"
                           name="image"
                           type="url"
                           value={formData.image}
                           disabled={fileUploaded}
                           onChange={handleUrlInputChange}
                           placeholder="https://example.com/image.jpg"
                           className={`border border-gray-300 rounded-md p-2 flex-1 ${fileUploaded ? "opacity-50 cursor-not-allowed" : ""}`}
                         />
                       </div>
                     </div>
        </CardContent>
      </Card>

     <Card>
               <CardHeader>
                 <CardTitle>Product Details</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 {/* First Row: Category, SKU, Branded Checkbox */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {/* Category Selection */}
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
     
                   {/* SKU Input */}
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
     
                   {/* Is Branded Checkbox */}
                   <div className="flex items-center space-x-1 p-2 border rounded-lg">
                     <Checkbox
                       id="isBranded"
                       checked={formData.isBranded}
                       onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isBranded: checked as boolean }))}
                     />
                     <Label htmlFor="isBranded" className="font-medium">
                       This is a branded product
                     </Label>
                   </div>
     
                 </div>
     
                 {/* Second Row: Brand Input OR Packaging Label, Tags, Featured Checkbox */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-4 p-4 border rounded-lg">
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
                           For bulk/unbranded items, you can upload a preview of the packaging label.
                         </p>
                       </div>
                     )}
                   </div>
     
                   {/* Tags Input */}
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
     
                 {/* Third Row: Is Featured Checkbox */}
                 <div className="flex items-center space-x-2 p-4 border rounded-lg">
                   <Checkbox
                     id="isFeatured"
                     checked={formData.isFeatured}
                     onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isFeatured: checked as boolean }))}
                   />
                   <Label htmlFor="isFeatured" className="font-medium">
                     Feature this product on the homepage
                   </Label>
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
                      <div className="flex-1">
                        <Label htmlFor={`weight-quantity-${index}`}>Quantity</Label>
                        <Input
  id={`weight-quantity-${index}`}
  type="number"
  value={weight.quantity ?? 0} // Ensure fallback if undefined
  onChange={(e) => handleWeightChange(index, "quantity", e.target.value)}
  placeholder="0"
  min="0"
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