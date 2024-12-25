import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="font-bold text-xl">
              SocialFeed
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/create"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                Create Post
              </Link>
              
              <Link to={`/profile/${user.uid}`}>
                <img
                  src={user.photoURL || 'https://via.placeholder.com/40'}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
              </Link>
              
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};
export default Layout