import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LogoDebug from '../components/LogoDebug';

const Debug = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-center mb-8">Debug Page</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <LogoDebug />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Debug;