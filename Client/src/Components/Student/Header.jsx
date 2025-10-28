import React, { useState } from 'react';
import { FiMenu, FiX, FiBell, FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo_2.png';
import { useDispatch } from 'react-redux';
import { logoutUser } from '@/Store/AuthUserSlice';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
const dispatch=useDispatch()
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  const navLinks = [
    { name: 'Dashboard', path: '/quality-office-home' },
    
  ];
  const LogOutHandler=()=>{
    dispatch(logoutUser())
  }

  return (
    <header className='bg-(--six) shadow-md'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo and Mobile Menu Button */}
          <div className='flex items-center'>
            <button
              onClick={toggleMenu}
              className='md:hidden text-white p-2 rounded-md hover:bg-(--five) focus:outline-none'
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
            <div className='flex-shrink-0 flex items-center'>
              <img 
                className='h-10 w-auto' 
                src={logo} 
                alt='Oromia State University' 
              />
              <span className='ml-3 text-xl font-semibold text-white hidden sm:block'>
                Oromia State University
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className='hidden md:ml-6 md:flex md:items-center md:space-x-4'>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className='text-white hover:bg-(--five) hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-150'
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Side Icons */}
          <div className='flex items-center'>
            <button className='p-2 text-white rounded-full hover:bg-(--five) focus:outline-none'>
              <FiBell className='h-6 w-6' />
            </button>
            
            {/* Profile Dropdown */}
            <div className='ml-3 relative'>
              <div>
                <button
                  onClick={toggleProfile}
                  className='flex items-center max-w-xs rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-(--six) focus:ring-white'
                >
                  <div className='h-8 w-8 rounded-full bg-white flex items-center justify-center'>
                    <FiUser className='h-5 w-5 text-(--six)' />
                  </div>
                  <span className='hidden md:inline-block ml-2 text-white text-sm font-medium'>
                     User
                    <FiChevronDown className='ml-1 inline-block' />
                  </span>
                </button>
              </div>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className='origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50'>
                  <Link
                    to='/profile'
                    className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                  >
                    Your Profile
                  </Link>
                 
                  <button
                    onClick={
                      LogOutHandler
                    }
                    className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center'
                  >
                    <FiLogOut className='mr-2' />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className='md:hidden'>
          <div className='px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-(--six)'>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className='text-white hover:bg-(--five) hover:text-white block px-3 py-2 rounded-md text-base font-medium'
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;