'use client';

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function UsersPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [session]);

  const fetchUsers = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      // Fetch with higher limit to get all users
      const response = await fetch(`${apiUrl}/users?limit=1000`);
      const data = await response.json();
      
      // Extract users array from response
      const allUsers = data.users || [];
      
      // Filter out the logged-in user
      const filteredUsers = session 
        ? allUsers.filter(user => user._id !== session.user.id)
        : allUsers;
      
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return nameParts[0][0] + nameParts[1][0];
    }
    return name[0];
  };

  const getRandomColor = (username) => {
    // Generate a consistent color based on username
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500'
    ];
    const index = username ? username.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  return (
    <div className="flex flex-col flex-grow">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Community Members
          </h1>
          <p className="text-xl md:text-2xl text-purple-100">
            Connect with buyers and sellers in our marketplace
          </p>
        </div>
      </div>

      {/* Users Section */}
      <div className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              All Users
              {!loading && (
                <span className="text-gray-500 text-2xl ml-2">
                  ({users.length})
                </span>
              )}
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-600 text-lg">Loading users...</div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {session 
                  ? "No other users found yet."
                  : "No users available yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {users.map((user) => (
                <Link
                  key={user._id}
                  href={`/users/${user._id}`}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden block transform hover:-translate-y-1"
                >
                  <div className="p-6">
                    {/* Avatar */}
                    <div className="flex justify-center mb-4">
                      <div className={`w-24 h-24 rounded-full ${getRandomColor(user.username)} flex items-center justify-center text-white text-3xl font-bold shadow-lg`}>
                        {getInitials(user.name)}
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {user.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        @{user.username}
                      </p>

                      {/* View Profile Button */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="inline-block px-4 py-2 rounded-lg font-medium bg-purple-600 text-white hover:bg-purple-700 transition">
                          View Profile
                        </div>
                      </div>

                      {/* Member Since */}
                      <div className="mt-3">
                        <p className="text-xs text-gray-500">
                          Member since {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
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
