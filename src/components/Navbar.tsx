import React, { useState } from 'react';
import { LogIn, Menu, X, User, Bell, Building } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="flex items-center">
              <Logo />
              <span className="ml-2 text-2xl font-bold text-gray-900">
                Work4All
              </span>
            </Link>
          </motion.div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center space-x-8"
            >
              <Link to="/jobs" className="text-gray-700 hover:text-blue-700 transition-colors duration-300">Ver Ofertas</Link>
              <Link to="/companies" className="text-gray-700 hover:text-blue-700 transition-colors duration-300">Empresas</Link>
              <Link to="/share-experience" className="text-gray-700 hover:text-blue-700 transition-colors duration-300">Partilhar Experiência</Link>
              <Link to="/blog" className="text-gray-700 hover:text-blue-700 transition-colors duration-300">Blog</Link>
              <Link to="/about" className="text-gray-700 hover:text-blue-700 transition-colors duration-300">Sobre</Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center space-x-4"
            >
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center text-gray-700 hover:text-blue-700 transition-colors duration-300"
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-700" />
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                      >
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user.email}</p>
                        </div>
                        <Link
                          to="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Painel do Candidato
                        </Link>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Meu Perfil
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsProfileMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Sair
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    to="/admin/login"
                    className="flex items-center text-gray-700 hover:text-blue-700 transition-colors duration-300"
                  >
                    <LogIn className="h-5 w-5 mr-1" />
                    Admin
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition duration-300"
                  >
                    <Link to="/register" className="text-white">
                      Criar Conta
                    </Link>
                  </motion.button>
                </>
              )}
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-700 transition-colors duration-300"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-6 space-y-4">
              <Link
                to="/jobs"
                className="block text-gray-700 hover:text-blue-700 transition-colors duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Ver Ofertas
              </Link>
              <Link
                to="/companies"
                className="block text-gray-700 hover:text-blue-700 transition-colors duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Empresas
              </Link>
              <Link
                to="/share-experience"
                className="block text-gray-700 hover:text-blue-700 transition-colors duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Partilhar Experiência
              </Link>
              <Link
                to="/blog"
                className="block text-gray-700 hover:text-blue-700 transition-colors duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                to="/about"
                className="block text-gray-700 hover:text-blue-700 transition-colors duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Sobre
              </Link>
              
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block text-gray-700 hover:text-blue-700 transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Painel do Candidato
                  </Link>
                  <Link
                    to="/profile"
                    className="block text-gray-700 hover:text-blue-700 transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Meu Perfil
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block text-red-600 hover:text-red-800 transition-colors duration-300"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/admin/login"
                    className="block text-gray-700 hover:text-blue-700 transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition duration-300 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Criar Conta
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;