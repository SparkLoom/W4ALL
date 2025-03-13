import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Plus, AlertCircle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

// Simulated blog post type since we don't have it in the database yet
interface BlogPost {
  id: string;
  title: string;
  author: string;
  content: string;
  image_url: string;
  created_at: string;
  status: 'published' | 'draft';
}

const AdminBlogManagement = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    author: '',
    content: '',
    image_url: '',
    status: 'draft',
  });

  useEffect(() => {
    // Simulated data fetch
    fetchPosts();
  }, []);

  const fetchPosts = () => {
    // Simulated API call
    setLoading(true);
    setTimeout(() => {
      const samplePosts: BlogPost[] = [
        {
          id: '1',
          title: 'Como se preparar para entrevistas técnicas',
          author: 'João Silva',
          content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.',
          image_url: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21',
          created_at: '2025-03-15T10:00:00Z',
          status: 'published',
        },
        {
          id: '2',
          title: 'Tendências do mercado de trabalho em 2025',
          author: 'Maria Oliveira',
          content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.',
          image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
          created_at: '2025-03-10T14:30:00Z',
          status: 'published',
        },
        {
          id: '3',
          title: 'Dicas para melhorar seu currículo',
          author: 'Carlos Mendes',
          content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.',
          image_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4',
          created_at: '2025-03-05T09:15:00Z',
          status: 'draft',
        },
      ];
      setPosts(samplePosts);
      setLoading(false);
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulated API call
    setLoading(true);
    setTimeout(() => {
      const newPost: BlogPost = {
        id: Date.now().toString(),
        title: formData.title || '',
        author: formData.author || '',
        content: formData.content || '',
        image_url: formData.image_url || '',
        created_at: new Date().toISOString(),
        status: formData.status as 'published' | 'draft' || 'draft',
      };
      setPosts([newPost, ...posts]);
      setIsAddingPost(false);
      setFormData({
        title: '',
        author: '',
        content: '',
        image_url: '',
        status: 'draft',
      });
      setLoading(false);
      toast.success('Post adicionado com sucesso');
    }, 1000);
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPostId(post.id);
    setFormData({
      title: post.title,
      author: post.author,
      content: post.content,
      image_url: post.image_url,
      status: post.status,
    });
  };

  const handleUpdatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPostId) return;
    
    // Simulated API call
    setLoading(true);
    setTimeout(() => {
      const updatedPosts = posts.map(post => 
        post.id === editingPostId 
          ? { 
              ...post, 
              title: formData.title || post.title,
              author: formData.author || post.author,
              content: formData.content || post.content,
              image_url: formData.image_url || post.image_url,
              status: formData.status as 'published' | 'draft' || post.status,
            } 
          : post
      );
      setPosts(updatedPosts);
      setEditingPostId(null);
      setLoading(false);
      toast.success('Post atualizado com sucesso');
    }, 1000);
  };

  const handleDeletePost = (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;
    
    // Simulated API call
    setLoading(true);
    setTimeout(() => {
      setPosts(posts.filter(post => post.id !== id));
      setLoading(false);
      toast.success('Post excluído com sucesso');
    }, 1000);
  };

  const handleToggleStatus = (post: BlogPost) => {
    // Simulated API call
    setLoading(true);
    setTimeout(() => {
      const updatedPosts = posts.map(p => 
        p.id === post.id 
          ? { ...p, status: p.status === 'published' ? 'draft' : 'published' } 
          : p
      );
      setPosts(updatedPosts);
      setLoading(false);
      toast.success(`Post ${post.status === 'published' ? 'despublicado' : 'publicado'} com sucesso`);
    }, 500);
  };

  const BlogForm = ({ onSubmit, isEditing = false }: { onSubmit: (e: React.FormEvent) => void, isEditing?: boolean }) => (
    <form onSubmit={onSubmit} className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">{isEditing ? 'Editar Post' : 'Adicionar Novo Post'}</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
        <input
          type="text"
          name="title"
          value={formData.title || ''}
          onChange={handleInputChange}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
        <input
          type="text"
          name="author"
          value={formData.author || ''}
          onChange={handleInputChange}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem</label>
        <input
          type="url"
          name="image_url"
          value={formData.image_url || ''}
          onChange={handleInputChange}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="https://exemplo.com/imagem.jpg"
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
        <textarea
          name="content"
          value={formData.content || ''}
          onChange={handleInputChange}
          rows={8}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          name="status"
          value={formData.status || 'draft'}
          onChange={handleInputChange}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        >
          <option value="published">Publicado</option>
          <option value="draft">Rascunho</option>
        </select>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => {
            setIsAddingPost(false);
            setEditingPostId(null);
          }}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Adicionar'}
        </button>
      </div>
    </form>
  );

  return (
    <div>
      {!isAddingPost && !editingPostId && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAddingPost(true)}
          className="mb-6 flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Adicionar Novo Post
        </motion.button>
      )}
      
      {isAddingPost && <BlogForm onSubmit={handleAddPost} />}
      
      {editingPostId && <BlogForm onSubmit={handleUpdatePost} isEditing />}
      
      {loading && !isAddingPost && !editingPostId ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Autor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center justify-center py-6">
                        <AlertCircle className="h-12 w-12 text-gray-400 mb-2" />
                        <p>Nenhum post encontrado</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img 
                              className="h-10 w-10 rounded-full object-cover" 
                              src={post.image_url} 
                              alt={post.title}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{post.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{post.author}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(post.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          post.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleToggleStatus(post)}
                            className={`text-gray-400 hover:text-gray-500`}
                            title={post.status === 'published' ? 'Despublicar' : 'Publicar'}
                          >
                            {post.status === 'published' ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEditPost(post)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Editar"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Excluir"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlogManagement;