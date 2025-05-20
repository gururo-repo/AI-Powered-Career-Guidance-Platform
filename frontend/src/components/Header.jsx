import React from 'react';
import { Link } from 'react-router-dom';
import AuthStatus from './AuthStatus';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    navigate('/');
  };

  return (
    <header className='fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-[backdrop-filter]:bg-background/60'>
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/">
          <img
            src={logo} 
            alt="JobNest"
            width={200}
            height={50}
            className='h-20 py-1 w-auto object-contain'
          />
        </Link>
        
        <AuthStatus />

      </nav>
    </header>
  );
}

export default Header;