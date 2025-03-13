import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github as GitHub, Globe } from 'lucide-react';

interface PortfolioProjectProps {
  title: string;
  description: string;
  imageUrl?: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  className?: string;
}

const PortfolioProject: React.FC<PortfolioProjectProps> = ({
  title,
  description,
  imageUrl,
  technologies,
  liveUrl,
  githubUrl,
  className = ''
}) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}
    >
      {imageUrl && (
        <div className="relative h-48 w-full">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <p className="mt-2 text-gray-600">{description}</p>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {technologies.map((tech, index) => (
            <span
              key={index}
              className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
            >
              {tech}
            </span>
          ))}
        </div>
        
        <div className="mt-6 flex space-x-4">
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <Globe className="h-5 w-5 mr-2" />
              Live Demo
              <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          )}
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-gray-700 hover:text-gray-900"
            >
              <GitHub className="h-5 w-5 mr-2" />
              View Code
              <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PortfolioProject;