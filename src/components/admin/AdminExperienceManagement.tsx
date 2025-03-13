import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Experience } from '../../lib/supabase';
import { Edit, Trash2, Plus, AlertCircle, Lock, Unlock } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminExperienceManagement = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<Partial<Experience>>({
    title: '',
    company: '',
    content: '',
    category: 'general',
  });

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Initialize blocked status
      const blocked: Record<string, boolean> = {};
      (data || []).forEach(exp => {
        blocked[exp.id] = false;
      });
      
      setExperiences(data || []);
      setIsBlocked(blocked);
    } catch (error: any) {
      console.error('Error fetching experiences:', error.message);
      toast.error('Erro ao carregar experiências');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('experiences')
        .insert({
          ...formData,
          user_id: userData.user.id,
        })
        .select();

      if (error) throw error;
      
      toast.success('Experiência adicionada com sucesso');
      setExperiences([...(data || []), ...experiences]);
      setIsAddingExperience(false);
      setFormData({
        title: '',
        company: '',
        content: '',
        category: 'general',
      });
      fetchExperiences();
    } catch (error: any) {
      console.error('Error adding experience:', error.message);
      toast.error('Erro ao adicionar experiência');
    } finally {
      setLoading(false);
    }
  };

  const handleEditExperience = (experience: Experience) => {
    setEditingExperienceId(experience.id);
    setFormData({
      title: experience.title,
      company: experience.company,
      content: experience.content,
      category: experience.category,
    });
  };

  const handleUpdateExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExperienceId) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('experiences')
        .update(formData)
        .eq('id', editingExperienceId);

      if (error) throw error;
      
      toast.success('Experiência atualizada com sucesso');
      setEditingExperienceId(null);
      fetchExperiences();
    } catch (error: any) {
      console.error('Error updating experience:', error.message);
      toast.error('Erro ao atualizar experiência');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExperience = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta experiência?')) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Experiência excluída com sucesso');
      setExperiences(experiences.filter(exp => exp.id !== id));
    } catch (error: any) {
      console.error('Error deleting experience:', error.message);
      toast.error('Erro ao excluir experiência');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = (id: string) => {
    setIsBlocked(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    
    toast.success(`Experiência ${isBlocked[id] ? 'desbloqueada' : 'bloqueada'} com sucesso`);
  };

  const ExperienceForm = ({ onSubmit, isEditing = false }: { onSubmit: (e: React.FormEvent) => Promise<void>, isEditing?: boolean }) => (
    <form onSubmit={onSubmit} className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">{isEditing ? 'Editar Experiência' : 'Adicionar Nova Experiência'}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
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
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
          <input
            type="text"
            name="company"
            value={formData.company || ''}
            onChange={handleInputChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
        <select
          name="category"
          value={formData.category || 'general'}
          onChange={handleInputChange}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        >
          <option value="first_job">Primeiro Emprego</option>
          <option value="interview_tips">Dicas de Entrevista</option>
          <option value="success_story">História de Sucesso</option>
          <option value="general">Geral</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
        <textarea
          name="content"
          value={formData.content || ''}
          onChange={handleInputChange}
          rows={6}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => {
            setIsAddingExperience(false);
            setEditingExperienceId(null);
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
      {!isAddingExperience && !editingExperienceId && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAddingExperience(true)}
          className="mb-6 flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Adicionar Nova Experiência
        </motion.button>
      )}
      
      {isAddingExperience && <ExperienceForm onSubmit={handleAddExperience} />}
      
      {editingExperienceId && <ExperienceForm onSubmit={handleUpdateExperience} isEditing />}
      
      {loading && !isAddingExperience && !editingExperienceId ? (
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
                    Empresa
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
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
                {experiences.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center justify-center py-6">
                        <AlertCircle className="h-12 w-12 text-gray-400 mb-2" />
                        <p>Nenhuma experiência encontrada</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  experiences.map((experience) => (
                    <tr key={experience.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{experience.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{experience.company}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {experience.category === 'first_job' && 'Primeiro Emprego'}
                          {experience.category === 'interview_tips' && 'Dicas de Entrevista'}
                          {experience.category === 'success_story' && 'História de Sucesso'}
                          {experience.category === 'general' && 'Geral'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(experience.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          isBlocked[experience.id] 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {isBlocked[experience.id] ? 'Bloqueada' : 'Ativa'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleToggleBlock(experience.id)}
                            className={`text-gray-400 hover:text-gray-500`}
                            title={isBlocked[experience.id] ? 'Desbloquear' : 'Bloquear'}
                          >
                            {isBlocked[experience.id] ? (
                              <Unlock className="h-5 w-5" />
                            ) : (
                              <Lock className="h-5 w-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEditExperience(experience)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Editar"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteExperience(experience.id)}
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

export default AdminExperienceManagement;