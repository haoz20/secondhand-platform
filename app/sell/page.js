'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { PRODUCT_CATEGORIES, CONDITION_LABELS } from "@/lib/constants";

export default function SellItem() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    price: '',
    year: currentYear,
    category: '',
    condition: '',
  });
  
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  if (status === "loading") {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#14B8A6] mx-auto mb-4"></div>
          <p className="text-stone-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    const validFiles = [];
    const newPreviews = [];
    let hasError = false;
    
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          images: 'Please select valid image files only'
        }));
        hasError = true;
        break;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          images: 'Each image must be less than 5MB'
        }));
        hasError = true;
        break;
      }
      
      validFiles.push(file);
    }
    
    if (!hasError && validFiles.length > 0) {
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result);
          if (newPreviews.length === validFiles.length) {
            setImagePreviews(prev => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
      
      setImageFiles(prev => [...prev, ...validFiles]);
      setErrors(prev => ({
        ...prev,
        images: ''
      }));
    }
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadToCloudinary = async (file) => {
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('upload_preset', 'secondhand_marketplace');
    
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: cloudinaryFormData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Cloudinary error:', errorData);
        throw new Error(errorData.error?.message || 'Failed to upload image');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }

    if (!formData.year) {
      newErrors.year = 'Year is required';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.condition) {
      newErrors.condition = 'Please select a condition';
    }

    if (imageFiles.length === 0) {
      newErrors.images = 'At least one product image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      setUploading(true);
      const imageUrls = [];
      
      for (const file of imageFiles) {
        const url = await uploadToCloudinary(file);
        if (url) {
          imageUrls.push(url);
        }
      }
      
      setUploading(false);

      if (imageUrls.length === 0) {
        throw new Error('Failed to upload images');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const response = await fetch(`${apiUrl}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          year: parseInt(formData.year),
          imageUrl: imageUrls,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Product listed successfully!');
        router.push(`/users/${session.user.id}`);
      } else {
        alert(data.message || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert(`Error: ${error.message || 'An error occurred. Please try again.'}`);
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const yearOptions = [];
  for (let year = currentYear; year >= 1900; year--) {
    yearOptions.push(year);
  }

  return (
    <div className="flex-grow">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#292524] mb-3">List Your Item</h1>
          <p className="text-stone-600 text-lg">Fill in the details below to sell your item</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Product Images * (at least one required)</label>
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-300">
                      <Image src={preview} alt={`Product ${index + 1}`} fill className="object-cover" />
                      <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 bg-gradient-to-r from-[#DC2626] to-[#b91c1c] text-white rounded-full p-1 hover:from-[#b91c1c] hover:to-[#991b1b] transition shadow-md">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      {index === 0 && <div className="absolute bottom-2 left-2 bg-[#14B8A6] text-white text-xs px-2 py-1 rounded shadow-md">Main</div>}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-col items-center">
                <label className="cursor-pointer bg-[#14B8A6] text-white px-6 py-3 rounded-lg hover:bg-[#0d9488] transition font-medium shadow-md hover:shadow-lg">
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                  Add Images
                </label>
                {errors.images && <p className="mt-2 text-sm text-[#DC2626]">{errors.images}</p>}
                <p className="mt-2 text-xs text-stone-500">JPG, PNG, or GIF (Max 5MB each). First image will be the main image.</p>
              </div>
            </div>
            <div className="border-t border-gray-200"></div>
            <div>
              <label htmlFor="productName" className="block text-sm font-semibold text-[#292524] mb-2">Product Name *</label>
              <input type="text" id="productName" name="productName" value={formData.productName} onChange={handleInputChange} placeholder="e.g., iPhone 13 Pro Max" className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent transition text-[#292524] bg-white ${errors.productName ? 'border-[#DC2626]' : 'border-stone-300'}`} />
              {errors.productName && <p className="mt-1 text-sm text-[#DC2626]">{errors.productName}</p>}
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-[#292524] mb-2">Description *</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={5} placeholder="Describe your item in detail... (minimum 10 characters)" className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent transition resize-none text-[#292524] bg-white ${errors.description ? 'border-[#DC2626]' : 'border-stone-300'}`} />
              <div className="flex justify-between mt-1">
                {errors.description ? <p className="text-sm text-[#DC2626]">{errors.description}</p> : <p className="text-sm text-stone-500">{formData.description.length} characters</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-[#292524] mb-2">Category *</label>
                <select id="category" name="category" value={formData.category} onChange={handleInputChange} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent transition text-[#292524] bg-white ${errors.category ? 'border-[#DC2626]' : 'border-stone-300'}`}>
                  <option value="">Select category</option>
                  {PRODUCT_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
                </select>
                {errors.category && <p className="mt-1 text-sm text-[#DC2626]">{errors.category}</p>}
              </div>
              <div>
                <label htmlFor="condition" className="block text-sm font-semibold text-[#292524] mb-2">Condition *</label>
                <select id="condition" name="condition" value={formData.condition} onChange={handleInputChange} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent transition text-[#292524] bg-white ${errors.condition ? 'border-[#DC2626]' : 'border-stone-300'}`}>
                  <option value="">Select condition</option>
                  {Object.entries(CONDITION_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
                {errors.condition && <p className="mt-1 text-sm text-[#DC2626]">{errors.condition}</p>}
              </div>
              <div>
                <label htmlFor="year" className="block text-sm font-semibold text-[#292524] mb-2">Year *</label>
                <select id="year" name="year" value={formData.year} onChange={handleInputChange} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent transition text-[#292524] bg-white ${errors.year ? 'border-[#DC2626]' : 'border-stone-300'}`}>
                  {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
                </select>
                {errors.year && <p className="mt-1 text-sm text-[#DC2626]">{errors.year}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-semibold text-[#292524] mb-2">Price (THB) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-500 text-lg font-semibold">฿</span>
                <input type="number" id="price" name="price" value={formData.price} onChange={handleInputChange} step="0.01" min="0" placeholder="0.00" className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent transition text-[#292524] bg-white ${errors.price ? 'border-[#DC2626]' : 'border-stone-300'}`} />
              </div>
              {errors.price && <p className="mt-1 text-sm text-[#DC2626]">{errors.price}</p>}
            </div>
            <div className="border-t border-gray-200"></div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button type="submit" disabled={submitting || uploading} className={`flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all transform ${submitting || uploading ? 'bg-[#14B8A6]/50 text-white cursor-wait' : 'bg-[#14B8A6] text-white hover:bg-[#0d9488] hover:scale-[1.02] shadow-lg hover:shadow-xl'}`}>
                {uploading ? <span className="flex items-center justify-center"><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Uploading Images...</span> : submitting ? <span className="flex items-center justify-center"><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Creating Listing...</span> : 'List Item'}
              </button>
              <button type="button" onClick={() => router.push('/')} disabled={submitting || uploading} className="flex-1 py-4 px-6 rounded-xl font-semibold text-lg border-2 border-stone-300 text-[#292524] hover:border-stone-400 hover:bg-stone-50 transition disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
