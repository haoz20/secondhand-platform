'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function UserProfile() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [buyOrders, setBuyOrders] = useState([]);
  const [sellOrders, setSellOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'buying', 'selling'
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState(null);
  const [deletingOrder, setDeletingOrder] = useState(null);

  // Check if the current user is viewing their own profile
  const isOwnProfile = session?.user?.id === params.id;

  useEffect(() => {
    if (params.id) {
      fetchUserAndProducts();
      if (isOwnProfile) {
        fetchOrders();
      }
    }
  }, [params.id, isOwnProfile]);

  const fetchUserAndProducts = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      
      const [userResponse, productsResponse] = await Promise.all([
        fetch(`${apiUrl}/users/${params.id}`),
        fetch(`${apiUrl}/products`)
      ]);
      
      if (!userResponse.ok) {
        throw new Error('User not found');
      }
      
      const userData = await userResponse.json();
      const allProducts = await productsResponse.json();
      
      const userProducts = allProducts.filter(product => 
        product.seller?._id === params.id || product.seller === params.id
      );
      
      setUser(userData);
      setProducts(userProducts);
    } catch (error) {
      console.error('Error fetching user:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      
      // Fetch buy orders (where user is buyer)
      const buyResponse = await fetch(`${apiUrl}/orders?role=buyer`);
      if (buyResponse.ok) {
        const buyData = await buyResponse.json();
        setBuyOrders(buyData.orders || []);
      }
      
      // Fetch sell orders (where user is seller)
      const sellResponse = await fetch(`${apiUrl}/orders?role=seller`);
      if (sellResponse.ok) {
        const sellData = await sellResponse.json();
        setSellOrders(sellData.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const getConditionBadgeColor = (condition) => {
    const colors = {
      new: 'bg-green-100 text-green-800',
      like_new: 'bg-blue-100 text-blue-800',
      good: 'bg-yellow-100 text-yellow-800',
      fair: 'bg-orange-100 text-orange-800',
      poor: 'bg-red-100 text-red-800'
    };
    return colors[condition] || 'bg-gray-100 text-gray-800';
  };

  const formatCondition = (condition) => {
    return condition?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
  };

  const getOrderStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleDeleteProduct = async (productId) => {
    if (!isOwnProfile) {
      alert('You can only delete your own products');
      return;
    }

    if (!confirm('Are you sure you want to delete this product?')) return;

    setDeleting(productId);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const response = await fetch(`${apiUrl}/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete product');

      await fetchUserAndProducts();
      alert('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteAccount = async () => {
    if (!isOwnProfile) return;

    setDeletingAccount(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const response = await fetch(`${apiUrl}/users/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete account');

      await signOut({ redirect: false });
      router.push('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
      setDeletingAccount(false);
    }
  };

  const handleMarkAsSold = async (productId) => {
    if (!isOwnProfile) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const response = await fetch(`${apiUrl}/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSold: true }),
      });

      if (!response.ok) throw new Error('Failed to mark as sold');

      await fetchUserAndProducts();
      alert('Product marked as sold!');
    } catch (error) {
      console.error('Error marking product as sold:', error);
      alert('Failed to mark product as sold. Please try again.');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus, orderType) => {
    if (!confirm(`Are you sure you want to ${newStatus} this order?`)) return;

    setUpdatingOrderStatus(orderId);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const response = await fetch(`${apiUrl}/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update order status');
      }

      // Refresh orders
      await fetchOrders();
      alert(`Order ${newStatus} successfully!`);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert(error.message || 'Failed to update order status. Please try again.');
    } finally {
      setUpdatingOrderStatus(null);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!confirm('Are you sure you want to delete this cancelled order?')) return;

    setDeletingOrder(orderId);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const response = await fetch(`${apiUrl}/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete order');
      }

      // Refresh orders
      await fetchOrders();
      alert('Order deleted successfully!');
    } catch (error) {
      console.error('Error deleting order:', error);
      alert(error.message || 'Failed to delete order. Please try again.');
    } finally {
      setDeletingOrder(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex-grow flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-6">
            The user profile you&apos;re looking for doesn&apos;t exist.
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
    <div className="flex-grow bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* User Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between">
            <div className="flex flex-col md:flex-row items-center md:items-start">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4 md:mb-0 md:mr-6">
                {user.name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900">{user.name || user.username}</h1>
                <p className="text-gray-600 mt-1">@{user.username}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Member since {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            
            {/* Delete Account Button - Only visible for own profile */}
            {isOwnProfile && (
              <button
                onClick={() => setShowDeleteAccountModal(true)}
                className="mt-4 md:mt-0 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                <span>🗑️</span>
                Delete Account
              </button>
            )}
          </div>
        </div>

        {/* Delete Account Modal */}
        {showDeleteAccountModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Account</h3>
                <p className="text-gray-600">
                  This action cannot be undone. All your products and data will be permanently deleted.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteAccountModal(false)}
                  disabled={deletingAccount}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  {deletingAccount ? 'Deleting...' : 'Delete Forever'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Products</p>
                <p className="text-3xl font-bold text-blue-600">{products.length}</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Listings</p>
                <p className="text-3xl font-bold text-green-600">
                  {products.filter(p => !p.isSold).length}
                </p>
              </div>
              <div className="text-4xl">🏷️</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Sold Items</p>
                <p className="text-3xl font-bold text-purple-600">
                  {products.filter(p => p.isSold).length}
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
        </div>

        {/* Tabs - Only show for own profile */}
        {isOwnProfile && (
          <div className="bg-white rounded-xl shadow-md mb-8 overflow-hidden">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('products')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition ${
                  activeTab === 'products'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                📦 My Products ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('buying')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition ${
                  activeTab === 'buying'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                🛒 Buying Orders ({buyOrders.length})
              </button>
              <button
                onClick={() => setActiveTab('selling')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition ${
                  activeTab === 'selling'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                💰 Selling Orders ({sellOrders.length})
              </button>
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        {(!isOwnProfile || activeTab === 'products') && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {isOwnProfile ? 'My Products' : `Products by ${user.name || user.username}`}
            </h2>
            
            {products.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-500 text-lg">
                  {isOwnProfile ? "You haven't listed any products yet." : "This user hasn't listed any products yet."}
                </p>
                {isOwnProfile && (
                  <Link
                    href="/sell"
                    className="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                  >
                    List Your First Product
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300"
                  >
                    {/* Product Image */}
                    <Link href={`/products/${product._id}`}>
                      <div className="relative h-48 bg-gray-100">
                        <Image
                          src={
                            Array.isArray(product.imageUrl) && product.imageUrl.length > 0
                              ? product.imageUrl[0]
                              : product.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'
                          }
                          alt={product.productName}
                          fill
                          className={`object-cover ${product.isSold ? 'opacity-50' : ''}`}
                        />
                        
                        {/* Sold Overlay Badge */}
                        {product.isSold && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                            <div className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold text-xl transform rotate-12">
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
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 capitalize">
                            {product.category}
                          </span>
                        </div>
                      </div>
                    </Link>

                    {/* Product Details */}
                    <div className="p-4">
                      <Link href={`/products/${product._id}`}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition truncate">
                          {product.productName}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {product.description}
                        </p>

                        <div className="flex items-center justify-between mb-2">
                          <div className="text-2xl font-bold text-blue-600">
                            ${product.price.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Year: {product.year}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500">
                            Listed {new Date(product.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </Link>
                      
                      {/* Action Buttons - Only visible for own profile */}
                      {isOwnProfile && (
                        <div className="mt-4 pt-3 border-t border-gray-200 flex gap-2">
                          {!product.isSold && (
                            <>
                              <Link
                                href={`/products/${product._id}/edit`}
                                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition text-center"
                              >
                                ✏️ Edit
                              </Link>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleMarkAsSold(product._id);
                                }}
                                className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                              >
                                ✅ Mark Sold
                              </button>
                            </>
                          )}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteProduct(product._id);
                            }}
                            disabled={deleting === product._id}
                            className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                          >
                            {deleting === product._id ? '...' : '🗑️ Delete'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Buy Orders Tab */}
        {isOwnProfile && activeTab === 'buying' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Purchases</h2>
            
            {buyOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🛒</div>
                <p className="text-gray-500 text-lg">You haven&apos;t purchased any products yet.</p>
                <Link
                  href="/"
                  className="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Browse Marketplace
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {buyOrders.map((order) => (
                  <div key={order._id} className="border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Product Image */}
                      <div className="relative w-full md:w-48 h-48 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={
                            Array.isArray(order.product?.imageUrl) && order.product.imageUrl.length > 0
                              ? order.product.imageUrl[0]
                              : order.product?.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'
                          }
                          alt={order.product?.productName || 'Product'}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      {/* Order Details */}
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <Link href={`/products/${order.product?._id}`}>
                              <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                                {order.product?.productName}
                              </h3>
                            </Link>
                            <p className="text-sm text-gray-600 mt-1">
                              Sold by: <Link href={`/users/${order.product?.seller?._id}`} className="text-blue-600 hover:underline">
                                {order.product?.seller?.name || order.product?.seller?.username}
                              </Link>
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getOrderStatusBadgeColor(order.status)}`}>
                            {order.status?.toUpperCase()}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {order.product?.description}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="text-2xl font-bold text-blue-600">
                            ${order.product?.price?.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Order Date: {new Date(order.orderDate).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Buyer Actions */}
                        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2">
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order._id, 'cancelled', 'buy')}
                              disabled={updatingOrderStatus === order._id}
                              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                            >
                              {updatingOrderStatus === order._id ? 'Cancelling...' : '❌ Cancel Order'}
                            </button>
                          )}
                          {order.status === 'confirmed' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order._id, 'cancelled', 'buy')}
                              disabled={updatingOrderStatus === order._id}
                              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                            >
                              {updatingOrderStatus === order._id ? 'Cancelling...' : '❌ Cancel Order'}
                            </button>
                          )}
                          {order.status === 'cancelled' && (
                            <button
                              onClick={() => handleDeleteOrder(order._id)}
                              disabled={deletingOrder === order._id}
                              className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                            >
                              {deletingOrder === order._id ? 'Deleting...' : '🗑️ Delete Order'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sell Orders Tab */}
        {isOwnProfile && activeTab === 'selling' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Sales</h2>
            
            {sellOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💰</div>
                <p className="text-gray-500 text-lg">You haven&apos;t sold any products yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sellOrders.map((order) => (
                  <div key={order._id} className="border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Product Image */}
                      <div className="relative w-full md:w-48 h-48 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={
                            Array.isArray(order.product?.imageUrl) && order.product.imageUrl.length > 0
                              ? order.product.imageUrl[0]
                              : order.product?.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'
                          }
                          alt={order.product?.productName || 'Product'}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      {/* Order Details */}
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <Link href={`/products/${order.product?._id}`}>
                              <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                                {order.product?.productName}
                              </h3>
                            </Link>
                            <p className="text-sm text-gray-600 mt-1">
                              Bought by: <Link href={`/users/${order.buyer?._id}`} className="text-blue-600 hover:underline">
                                {order.buyer?.name || order.buyer?.username}
                              </Link>
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getOrderStatusBadgeColor(order.status)}`}>
                            {order.status?.toUpperCase()}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {order.product?.description}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="text-2xl font-bold text-green-600">
                            ${order.product?.price?.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Order Date: {new Date(order.orderDate).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Seller Actions */}
                        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2">
                          {order.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateOrderStatus(order._id, 'confirmed', 'sell')}
                                disabled={updatingOrderStatus === order._id}
                                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                              >
                                {updatingOrderStatus === order._id ? 'Confirming...' : '✅ Confirm Order'}
                              </button>
                              <button
                                onClick={() => handleUpdateOrderStatus(order._id, 'cancelled', 'sell')}
                                disabled={updatingOrderStatus === order._id}
                                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                              >
                                {updatingOrderStatus === order._id ? 'Cancelling...' : '❌ Cancel Order'}
                              </button>
                            </>
                          )}
                          {order.status === 'cancelled' && (
                            <button
                              onClick={() => handleDeleteOrder(order._id)}
                              disabled={deletingOrder === order._id}
                              className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                            >
                              {deletingOrder === order._id ? 'Deleting...' : '🗑️ Delete Order'}
                            </button>
                          )}
                          {order.status === 'confirmed' && (
                            <div className="px-4 py-2 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200">
                              ✅ Order Confirmed - Ready for delivery
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
