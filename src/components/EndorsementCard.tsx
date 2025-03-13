import React from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, User, Calendar } from 'lucide-react';

interface EndorsementCardProps {
  endorser: {
    name: string;
    title: string;
    avatarUrl?: string;
  };
  skill: string;
  comment: string;
  date: string;
  relationship: string;
}

const EndorsementCard: React.FC<EndorsementCardProps> = ({
  endorser,
  skill,
  comment,
  date,
  relationship
}) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {endorser.avatarUrl ? (
            <img
              src={endorser.avatarUrl}
              alt={endorser.name}
              className="h-12 w-12 rounded-full"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{endorser.name}</h3>
              <p className="text-sm text-gray-500">{endorser.title}</p>
            </div>
            <ThumbsUp className="h-5 w-5 text-blue-600" />
          </div>
          <div className="mt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {skill}
            </span>
          </div>
          <p className="mt-3 text-gray-600">{comment}</p>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{new Date(date).toLocaleDateString('pt-BR')}</span>
            <span className="mx-2">•</span>
            <span>{relationship}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EndorsementCard;