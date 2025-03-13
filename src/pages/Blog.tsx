import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Calendar, User, Clock, ChevronRight } from 'lucide-react';

const Blog = () => {
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
            <h1 className="text-4xl font-bold text-gray-900">Blog Work4All</h1>
            <p className="mt-4 text-xl text-gray-600">Dicas, tendências e novidades do mercado de trabalho</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((post) => (
              <motion.article
                key={post}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: post * 0.1 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition duration-300"
              >
                <img
                  src={`https://source.unsplash.com/random/800x600?work&${post}`}
                  alt="Blog post"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Mar 15, 2025</span>
                    <User className="h-4 w-4 ml-4 mr-2" />
                    <span>John Doe</span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    Como se destacar em entrevistas remotas
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    Aprenda as melhores práticas para se sair bem em entrevistas online e conquistar a vaga dos seus sonhos...
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>5 min de leitura</span>
                    </div>
                    <button className="text-blue-700 hover:text-blue-800 flex items-center transition duration-300">
                      Ler mais
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;