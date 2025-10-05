'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showFullScreenImage, setShowFullScreenImage] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const response = await fetch(`${apiUrl}/products/${params.id}`);
      
      if (!response.ok) {
        throw new Error('Product not found');
      }
      
      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyProduct = async () => {
    if (!session) {
      alert('Please login to buy products');
      router.push('/login');
      return;
    }

    setBuying(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const response = await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: params.id,
          status: 'pending'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Order created successfully! Check your profile to manage orders.');
        router.push(`/users/${session.user.id}`);
      } else {
        alert(data.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setBuying(false);
    }
  };

  const getConditionBadgeColor = (condition) => {
    const colors = {
      new: 'bg-[#22C55E] text-white font-semibold shadow-sm',
      like_new: 'bg-[#14B8A6] text-white font-semibold shadow-sm',
      good: 'bg-[#FBBF24] text-white font-semibold shadow-sm',
      fair: 'bg-[#F97316] text-white font-semibold shadow-sm',
      poor: 'bg-[#DC2626] text-white font-semibold shadow-sm'
    };
    return colors[condition] || 'bg-[#78716C] text-white font-semibold shadow-sm';
  };

  const formatCondition = (condition) => {
    return condition.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#14B8A6] mx-auto mb-4"></div>
          <p className="text-stone-600 text-lg">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-[#292524] mb-2">Product Not Found</h2>
          <p className="text-stone-600 mb-6">
            The product you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/"
            className="inline-block bg-[#14B8A6] text-white px-6 py-3 rounded-lg hover:bg-[#0d9488] transition shadow-md hover:shadow-lg"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-stone-600">
            <li>
              <Link href="/" className="hover:text-[#14B8A6] transition">
                Home
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li className="text-[#292524] font-medium truncate max-w-xs">
              {product.productName}
            </li>
          </ol>
        </nav>

        {/* Product Detail Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="space-y-4">
              <div 
                className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-zoom-in"
                onClick={() => setShowFullScreenImage(true)}
              >
                <Image
                  src={
                    Array.isArray(product.imageUrl) && product.imageUrl.length > 0
                      ? product.imageUrl[selectedImageIndex]
                      : product.imageUrl || 'https://via.placeholder.com/400x400?text=No+Image'
                  }
                  alt={product.productName}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  priority
                />
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm">
                  Click to enlarge
                </div>
              </div>
              
              {/* Image Thumbnails - Only show if multiple images */}
              {Array.isArray(product.imageUrl) && product.imageUrl.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.imageUrl.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden bg-stone-100 border-2 transition ${
                        selectedImageIndex === index
                          ? 'border-[#14B8A6] ring-2 ring-[#14B8A6]/30'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <Image
                        src={url}
                        alt={`${product.productName} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
              
              {/* Additional Info Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#14B8A6]/10 rounded-lg p-4 border border-[#14B8A6]/20">
                  <div className="text-[#14B8A6] text-sm font-medium mb-1">Listed Date</div>
                  <div className="text-[#292524] font-semibold">
                    {new Date(product.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </div>
                </div>
                <div className="bg-[#FFDAB9]/30 rounded-lg p-4 border border-[#FFDAB9]">
                  <div className="text-[#292524] text-sm font-medium mb-1">Category</div>
                  <div className="text-[#292524] font-semibold capitalize">
                    {product.category}
                  </div>
                </div>
                <div className="bg-[#22C55E]/10 rounded-lg p-4 border border-[#22C55E]/20">
                  <div className="text-[#22C55E] text-sm font-medium mb-1">Year</div>
                  <div className="text-[#292524] font-semibold">
                    {product.year}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Information */}
            <div className="flex flex-col">
              {/* Title and Condition */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-3">
                  <h1 className="text-3xl lg:text-4xl font-bold text-[#292524] leading-tight">
                    {product.productName}
                  </h1>
                </div>
                <span className={`inline-block px-4 py-2 rounded-full text-sm ${getConditionBadgeColor(product.condition)}`}>
                  {formatCondition(product.condition)}
                </span>
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="text-stone-600 text-sm mb-2">Price</div>
                <div className="text-5xl font-bold text-[#14B8A6]">
                  ฿{product.price.toFixed(2)}
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-[#292524] mb-3">
                  Description
                </h2>
                <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>

              {/* Seller Information */}
              {product.seller && (
                <div className="mb-8 p-4 bg-stone-50 rounded-lg border border-stone-200">
                  <h3 className="text-sm font-semibold text-stone-600 mb-2">Seller Information</h3>
                  <Link 
                    href={`/users/${product.seller._id || product.seller}`}
                    className="flex items-center space-x-3 hover:bg-stone-100 p-2 rounded-lg transition group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-[#14B8A6] to-[#0d9488] rounded-full flex items-center justify-center text-white font-semibold group-hover:from-[#0d9488] group-hover:to-[#0f766e] transition">
                      {product.seller.name?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-[#292524] group-hover:text-[#14B8A6] transition">{product.seller.name}</div>
                      <div className="text-sm text-stone-600">@{product.seller.username || 'seller'}</div>
                    </div>
                    <svg className="w-5 h-5 text-stone-400 group-hover:text-[#14B8A6] transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <p className="mt-2 text-xs text-stone-500">Click to view seller&apos;s profile and listings</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-auto space-y-3">
                <button
                  onClick={handleBuyProduct}
                  disabled={buying || !session}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all transform hover:scale-[1.02] ${
                    !session
                      ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                      : buying
                      ? 'bg-[#14B8A6]/50 text-white cursor-wait'
                      : 'bg-[#14B8A6] text-white hover:bg-[#0d9488] shadow-lg hover:shadow-xl'
                  }`}
                >
                  {buying ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : !session ? (
                    'Login to Buy'
                  ) : (
                    'Buy Now'
                  )}
                </button>
                
                <Link
                  href="/"
                  className="block w-full py-4 px-6 rounded-xl font-semibold text-lg text-center border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition"
                >
                  ← Back to Marketplace
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Image Modal */}
      {showFullScreenImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullScreenImage(false)}
        >
          <button
            onClick={() => setShowFullScreenImage(false)}
            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-75 transition z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="relative w-full h-full flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {/* Main Image */}
            <div className="relative w-full max-w-5xl h-[80vh]">
              <Image
                src={
                  Array.isArray(product.imageUrl) && product.imageUrl.length > 0
                    ? product.imageUrl[selectedImageIndex]
                    : product.imageUrl || 'https://via.placeholder.com/800x800?text=No+Image'
                }
                alt={product.productName}
                fill
                className="object-contain rounded-lg"
              />
            </div>

            {/* Navigation Arrows (if multiple images) */}
            {Array.isArray(product.imageUrl) && product.imageUrl.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex((prev) => 
                      prev === 0 ? product.imageUrl.length - 1 : prev - 1
                    );
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-40 text-white rounded-full p-4 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex((prev) => 
                      prev === product.imageUrl.length - 1 ? 0 : prev + 1
                    );
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-40 text-white rounded-full p-4 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
                  {selectedImageIndex + 1} / {product.imageUrl.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
