import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, XCircle, Search, Filter, Eye } from 'lucide-react';
import useAdminStore from '../../stores/adminStore';

const AdminModeration: React.FC = () => {
  const { moderationQueue, loading, fetchModerationQueue, moderateContent } = useAdminStore();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('');
  const [selectedItem, setSelectedItem] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchModerationQueue();
  }, []);

  const filteredQueue = moderationQueue.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === '' || item.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Content Moderation</h2>
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="post">Posts</option>
            <option value="comment">Comments</option>
            <option value="profile">Profiles</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredQueue.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Queue is empty</h3>
          <p className="mt-1 text-sm text-gray-500">
            No content currently needs moderation.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQueue.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {item.type}
                    </span>
                    <span className="text-sm text-gray-500">
                      by {item.user.fullName}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-gray-900">
                      {selectedItem === item.id 
                        ? item.content 
                        : item.content.length > 200 
                          ? `${item.content.slice(0, 200)}...` 
                          : item.content
                      }
                    </p>
                    {item.content.length > 200 && (
                      <button
                        onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        {selectedItem === item.id ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.flags.map((flag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800"
                      >
                        {flag}
                      </span >
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => moderateContent(item.id, 'approved')}
                      className="flex items-center px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => moderateContent(item.id, 'rejected')}
                      className="flex items-center px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </button>
                    <button
                      onClick={() => window.open(`/content/${item.id}`, '_blank')}
                      className="flex items-center px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
};

export default AdminModeration;