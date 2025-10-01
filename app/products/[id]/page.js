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
        alert('Order created successfully! Check your dashboard to manage orders.');
        router.push('/dashboard');
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
      new: 'bg-green-100 text-green-800 border-green-200',
      like_new: 'bg-blue-100 text-blue-800 border-blue-200',
      good: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      fair: 'bg-orange-100 text-orange-800 border-orange-200',
      poor: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[condition] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatCondition = (condition) => {
    return condition.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex-grow flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-blue-600 transition">
                Home
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li>
              <span className="capitalize hover:text-blue-600 transition cursor-pointer">
                {product.category}
              </span>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li className="text-gray-900 font-medium truncate max-w-xs">
              {product.productName}
            </li>
          </ol>
        </nav>

        {/* Product Detail Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                <Image
                  src={
                    Array.isArray(product.imageUrl) && product.imageUrl.length > 0
                      ? product.imageUrl[selectedImageIndex]
                      : product.imageUrl || 'https://via.placeholder.com/400x400?text=No+Image'
                  }
                  alt={product.productName}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              
              {/* Image Thumbnails - Only show if multiple images */}
              {Array.isArray(product.imageUrl) && product.imageUrl.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.imageUrl.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 transition ${
                        selectedImageIndex === index
                          ? 'border-blue-600 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
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
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="text-blue-600 text-sm font-medium mb-1">Listed Date</div>
                  <div className="text-gray-900 font-semibold">
                    {new Date(product.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                  <div className="text-purple-600 text-sm font-medium mb-1">Category</div>
                  <div className="text-gray-900 font-semibold capitalize">
                    {product.category}
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <div className="text-green-600 text-sm font-medium mb-1">Year</div>
                  <div className="text-gray-900 font-semibold">
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
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                    {product.productName}
                  </h1>
                </div>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${getConditionBadgeColor(product.condition)}`}>
                  {formatCondition(product.condition)}
                </span>
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="text-gray-600 text-sm mb-2">Price</div>
                <div className="text-5xl font-bold text-blue-600">
                  ${product.price.toFixed(2)}
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Description
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>

              {/* Seller Information */}
              {product.seller && (
                <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Seller Information</h3>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {product.seller.name?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{product.seller.name}</div>
                      <div className="text-sm text-gray-600">{product.seller.email}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-auto space-y-3">
                <button
                  onClick={handleBuyProduct}
                  disabled={buying || !session}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all transform hover:scale-[1.02] ${
                    !session
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : buying
                      ? 'bg-blue-400 text-white cursor-wait'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
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
                    '🛒 Buy Now'
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

        {/* Additional Features Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-semibold text-gray-900 mb-2">Secure Purchase</h3>
            <p className="text-sm text-gray-600">
              All transactions are protected and secure
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="text-3xl mb-3">✅</div>
            <h3 className="font-semibold text-gray-900 mb-2">Quality Checked</h3>
            <p className="text-sm text-gray-600">
              Items verified before listing
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="font-semibold text-gray-900 mb-2">Direct Communication</h3>
            <p className="text-sm text-gray-600">
              Contact seller through our platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
