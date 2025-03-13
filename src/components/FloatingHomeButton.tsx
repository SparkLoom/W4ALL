import React from 'react';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const FloatingHomeButton: React.FC = () => {
  return (
    <motion.div
      className="fixed bottom-8 right-8 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <Link 
        to="/" 
        aria-label="Voltar ao Início"
        className="flex items-center justify-center w-14 h-14 bg-blue-700 text-white rounded-full shadow-lg hover:bg-blue-800 transition-colors duration-300"
      >
        <Home className="h-6 w-6" />
      </Link>
    </motion.div>
  );
};

export default FloatingHomeButton;