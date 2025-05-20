import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaFileAlt, FaEnvelope, FaClipboardCheck, FaTools } from 'react-icons/fa';
import { Button } from '@/components/ui/button';

const AuthStatus = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);

  const userDropdownRef = useRef(null);
  const toolsDropdownRef = useRef(null);


  
  // Get user from localStorage
  const userDataString = localStorage.getItem('userData');
  const user = userDataString ? JSON.parse(userDataString) : null;
  const isLoggedIn = !!localStorage.getItem('token');
  

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
    if (toolsDropdownOpen) setToolsDropdownOpen(false);
  };
  
  const toggleToolsDropdown = () => {
    setToolsDropdownOpen(!toolsDropdownOpen);
    if (dropdownOpen) setDropdownOpen(false);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    navigate('/');
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close user dropdown if clicked outside
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      
      // Close tools dropdown if clicked outside
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target)) {
        setToolsDropdownOpen(false);
      }
    };
    
    // Only add listeners if any dropdown is open
    if (dropdownOpen || toolsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen, toolsDropdownOpen]);


  return (
    <>
      <div className="flex-grow flex justify-center">
        <ul className="hidden md:flex px-4 mx-auto font-semibold space-x-8 mr-2">
          {isLoggedIn && (
              <li><Link to="/industry-insights" className="hover:text-cyan-300">Industry Insights</Link></li>
            )}
        </ul>
      </div>
      
      {isLoggedIn ? (
        <div className="flex items-center space-x-4">
          {/* Tools Dropdown */}
          <div className="relative" ref={toolsDropdownRef}>
            <button 
              onClick={toggleToolsDropdown}
              
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-zinc-800 text-cyan-50"
            >
              <FaTools className="mr-1" />
              <span>Tools</span>
            </button>
            
            {toolsDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg py-2 z-50">
                <Link 
                  to="/resume-generator" 
                  className="block px-4 py-2 text-cyan-50 hover:bg-zinc-700 flex items-center"
                >
                  <FaFileAlt className="mr-2 text-cyan-400" />
                  Resume Generator
                </Link>
                <Link 
                  to="/competency-test" 
                  className="block px-4 py-2 text-cyan-50 hover:bg-zinc-700 flex items-center"
                >
                  <FaClipboardCheck className="mr-2 text-cyan-400" />
                  Competency Test
                </Link>
              </div>
            )}
          </div>
          
          {/* User Profile Dropdown */}
          <div className="relative" ref={userDropdownRef}>
            <button 
              onClick={toggleDropdown}
              className="flex items-center space-x-2 p-2 rounded-full hover:bg-zinc-800"
            >
              {user?.imageUrl ? (
                <img 
                  src={user.imageUrl} 
                  alt={user.name} 
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-cyan-600 flex items-center justify-center text-white">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-zinc-700">
                  <p className="text-cyan-50 font-medium">{user?.name}</p>
                  <p className="text-cyan-400 text-xs truncate">{user?.email}</p>
                </div>
                <Link 
                  to="/profile/edit" 
                  className="block px-4 py-2 text-cyan-50 hover:bg-zinc-700 flex items-center"
                >
                  <FaUser className="mr-2 text-cyan-400" />
                  Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-cyan-50 hover:bg-zinc-700 flex items-center"
                >
                  <FaSignOutAlt className="mr-2 text-cyan-400" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <Button variant="outline">
          <Link to="/auth?signup=true">
            Sign Up
          </Link>
        </Button>
      )}
    </>
  );
};

export default AuthStatus; 





