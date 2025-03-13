import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Send, MessageSquare, ThumbsUp } from 'lucide-react';

const ShareExperience = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-gray-900">Compartilhe Sua Experiência</h1>
            <p className="mt-4 text-xl text-gray-600">Ajude outros profissionais com suas vivências e aprendizados</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-6">Conte sua história</h2>
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Título</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Ex: Minha primeira experiência como desenvolvedor"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Empresa</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Nome da empresa"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sua experiência</label>
                    <textarea
                      rows={6}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Compartilhe sua experiência..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex justify-center items-center bg-blue-700 text-white px-6 py-3 rounded-md hover:bg-blue-800 transition duration-300"
                  >
                    <Send className="h-5 w-5 mr-2" />
                    Publicar Experiência
                  </button>
                </form>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-6">Experiências Recentes</h2>
                <div className="space-y-6">
                  {[1, 2, 3].map((exp) => (
                    <motion.div
                      key={exp}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: exp * 0.1 }}
                      className="border-b border-gray-200 pb-4 last:border-0"
                    >
                      <h3 className="text-lg font-medium text-gray-900">Primeiro emprego em TI</h3>
                      <p className="text-gray-600 text-sm mt-1">Empresa Tech</p>
                      <p className="text-gray-500 mt-2 line-clamp-3">
                        Uma experiência incrível que me permitiu crescer profissionalmente...
                      </p>
                      <div className="flex items-center mt-3 space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          <span>24</span>
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          <span>12</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ShareExperience;