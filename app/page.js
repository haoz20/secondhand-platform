'use client';

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyingProduct, setBuyingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const response = await fetch(`${apiUrl}/products`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyProduct = async (productId) => {
    if (!session) {
      alert('Please login to buy products');
      return;
    }

    setBuyingProduct(productId);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const response = await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: productId,
          status: 'pending'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Order created successfully! Check your profile to manage orders.');
      } else {
        alert(data.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setBuyingProduct(null);
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

  return (
    <div className="flex flex-col flex-grow">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#06B6D4] via-[#14B8A6] to-[#10B981] text-white py-16 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md">
            Welcome to YaungWel
          </h1>
          <p className="text-xl md:text-2xl text-white text-opacity-90">
            Buy and sell pre-owned items with ease
          </p>
        </div>
      </div>

      {/* Products Section */}
      <div className="flex-grow bg-gradient-to-br from-[#14B8A6]/10 via-white to-[#FFDAB9]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[#292524]">Available Products</h2>
          {session && (
            <Link
              href="/sell"
              className="bg-[#14B8A6] text-white px-6 py-2 rounded-lg hover:bg-[#0d9488] transition font-medium"
            >
              + Sell Item
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-[#292524] text-lg">Loading products...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-stone-600 text-lg">No products available yet.</p>
            {session && (
              <Link
                href="/sell"
                className="inline-block mt-4 bg-[#14B8A6] text-white px-6 py-3 rounded-lg hover:bg-[#0d9488] transition"
              >
                Be the first to sell!
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product._id}
                href={`/products/${product._id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden block transform hover:-translate-y-1"
              >
                {/* Product Image */}
                <div className="relative h-48 bg-gray-200">
                  <Image
                    src={Array.isArray(product.imageUrl) ? product.imageUrl[0] : product.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={product.productName}
                    fill
                    className={`object-cover ${product.isSold ? 'opacity-50' : ''}`}
                  />
                  
                  {/* Sold Overlay Badge */}
                  {product.isSold && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                      <div className="bg-[#DC2626] text-white px-6 py-3 rounded-lg font-bold text-xl transform rotate-12">
                        SOLD OUT
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getConditionBadgeColor(product.condition)}`}>
                      {formatCondition(product.condition)}
                    </span>
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-[#FFDAB9] text-[#292524] capitalize">
                      {product.category}
                    </span>
                  </div>
                </div>

                {/* Product Details */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-[#292524] mb-2 truncate">
                    {product.productName}
                  </h3>
                  <p className="text-stone-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Price and View Details */}
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-[#14B8A6]">
                      ฿{product.price.toFixed(2)}
                    </div>
                    <div className="px-4 py-2 rounded-lg font-medium bg-[#14B8A6] text-white hover:bg-[#0d9488] transition">
                      View Details
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="mt-3 pt-3 border-t border-stone-200">
                    <p className="text-xs text-stone-500">
                      Listed {new Date(product.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
