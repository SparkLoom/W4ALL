import React from 'react';
import { motion } from 'framer-motion';
import { Award, Star } from 'lucide-react';

interface SkillBadgeProps {
  name: string;
  level: string;
  earnedThrough: string;
  earnedAt: string;
  className?: string;
}

const SkillBadge: React.FC<SkillBadgeProps> = ({
  name,
  level,
  earnedThrough,
  earnedAt,
  className = ''
}) => {
  const getBadgeColor = () => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'advanced':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'expert':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStars = () => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 1;
      case 'intermediate':
        return 2;
      case 'advanced':
        return 3;
      case 'expert':
        return 4;
      default:
        return 0;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`relative rounded-lg border p-4 ${getBadgeColor()} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{name}</h3>
          <div className="flex items-center mt-1">
            {[...Array(getStars())].map((_, i) => (
              <Star
                key={i}
                className="h-4 w-4 fill-current"
              />
            ))}
          </div>
        </div>
        <Award className="h-8 w-8" />
      </div>
      <div className="mt-2 text-sm">
        <p>Earned through {earnedThrough}</p>
        <p className="mt-1">
          {new Date(earnedAt).toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>
    </motion.div>
  );
};

export default SkillBadge;