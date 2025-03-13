import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { JobPost } from '../../lib/supabase';
import { Edit, Trash2, Plus, X, Check, AlertCircle, Eye, EyeOff, ExternalLink, Image, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminJobManagement = () => {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingJob, setIsAddingJob] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<JobPost>>({
    title: '',
    company: '',
    location: '',
    description: '',
    requirements: '',
    benefits: '',
    salary_range: '',
    type: 'full-time',
    status: 'active',
    contact_email: '',
    contact_phone: '',
    application_url: '',
    external_url: '',
    image_url: '',
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('job_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error: any) {
      console.error('Error fetching jobs:', error.message);
      toast.error('Erro ao carregar vagas');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `job_images/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error.message);
      toast.error('Erro ao fazer upload da imagem');
      return null;
    }
  };

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Usuário não autenticado');
      
      let imageUrl = formData.image_url || '';
      
      // Upload image if selected
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }
      
      const { data, error } = await supabase
        .from('job_posts')
        .insert({
          ...formData,
          image_url: imageUrl,
          created_by: userData.user.id,
        })
        .select();

      if (error) throw error;
      
      toast.success('Vaga adicionada com sucesso');
      setIsAddingJob(false);
      setFormData({
        title: '',
        company: '',
        location: '',
        description: '',
        requirements: '',
        benefits: '',
        salary_range: '',
        type: 'full-time',
        status: 'active',
        contact_email: '',
        contact_phone: '',
        application_url: '',
        external_url: '',
        image_url: '',
      });
      setImageFile(null);
      setImagePreview(null);
      fetchJobs();
    } catch (error: any) {
      console.error('Error adding job:', error.message);
      toast.error('Erro ao adicionar vaga');
    } finally {
      setLoading(false);
    }
  };

  const handleEditJob = (job: JobPost) => {
    setEditingJobId(job.id);
    setFormData({
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      requirements: job.requirements,
      benefits: job.benefits || '',
      salary_range: job.salary_range,
      type: job.type,
      status: job.status,
      contact_email: job.contact_email || '',
      contact_phone: job.contact_phone || '',
      application_url: job.application_url || '',
      external_url: job.external_url || '',
      image_url: job.image_url || '',
    });
    
    if (job.image_url) {
      setImagePreview(job.image_url);
    } else {
      setImagePreview(null);
    }
  };

  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJobId) return;
    
    try {
      setLoading(true);
      
      let imageUrl = formData.image_url || '';
      
      // Upload image if selected
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }
      
      const { error } = await supabase
        .from('job_posts')
        .update({
          ...formData,
          image_url: imageUrl,
        })
        .eq('id', editingJobId);

      if (error) throw error;
      
      toast.success('Vaga atualizada com sucesso');
      setEditingJobId(null);
      setImageFile(null);
      setImagePreview(null);
      fetchJobs();
    } catch (error: any) {
      console.error('Error updating job:', error.message);
      toast.error('Erro ao atualizar vaga');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta vaga?')) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('job_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Vaga excluída com sucesso');
      setJobs(jobs.filter(job => job.id !== id));
    } catch (error: any) {
      console.error('Error deleting job:', error.message);
      toast.error('Erro ao excluir vaga');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (job: JobPost) => {
    const newStatus = job.status === 'active' ? 'closed' : 'active';
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('job_posts')
        .update({ status: newStatus })
        .eq('id', job.id);

      if (error) throw error;
      
      toast.success(`Vaga ${newStatus === 'active' ? 'ativada' : 'desativada'} com sucesso`);
      fetchJobs();
    } catch (error: any) {
      console.error('Error toggling job status:', error.message);
      toast.error('Erro ao alterar status da vaga');
    } finally {
      setLoading(false);
    }
  };

  const JobForm = ({ onSubmit, isEditing = false }: { onSubmit: (e: React.FormEvent) => Promise<void>, isEditing?: boolean }) => (
    <form onSubmit={onSubmit} className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">{isEditing ? 'Editar Vaga' : 'Adicionar Nova Vaga'}</h3>
      
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
          <input
            type="text"
            name="location"
            value={formData.location || ''}
            onChange={handleInputChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Faixa Salarial</label>
          <input
            type="text"
            name="salary_range"
            value={formData.salary_range || ''}
            onChange={handleInputChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select
            name="type"
            value={formData.type || 'full-time'}
            onChange={handleInputChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="full-time">Tempo Integral</option>
            <option value="part-time">Meio Período</option>
            <option value="contract">Contrato</option>
            <option value="temporary">Temporário</option>
            <option value="internship">Estágio</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email de Contato</label>
          <input
            type="email"
            name="contact_email"
            value={formData.contact_email || ''}
            onChange={handleInputChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="contato@empresa.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefone de Contato</label>
          <input
            type="text"
            name="contact_phone"
            value={formData.contact_phone || ''}
            onChange={handleInputChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="+351 926 214 839"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL de Candidatura</label>
          <input
            type="url"
            name="application_url"
            value={formData.application_url || ''}
            onChange={handleInputChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="https://empresa.com/vagas/candidatura"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Link Completo da Oferta</label>
        <div className="flex items-center">
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ExternalLink className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="url"
              name="external_url"
              value={formData.external_url || ''}
              onChange={handleInputChange}
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="https://empresa.com/vagas/detalhes-completos"
            />
          </div>
          {formData.external_url && (
            <a 
              href={formData.external_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              Testar Link
            </a>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500">Este link será exibido como um botão "Ir para a Oferta" para os usuários.</p>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Imagem da Vaga</label>
        <div className="flex items-start space-x-4">
          <div className="flex-grow">
            <div className="flex items-center">
              <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                <Image className="h-5 w-5 mr-2" />
                {imageFile ? 'Trocar Imagem' : 'Selecionar Imagem'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="sr-only"
                />
              </label>
              {(imageFile || imagePreview) && (
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                    setFormData(prev => ({ ...prev, image_url: '' }));
                  }}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            {!imagePreview && (
              <input
                type="url"
                name="image_url"
                value={formData.image_url || ''}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Ou insira a URL de uma imagem"
              />
            )}
          </div>
          {imagePreview && (
            <div className="w-24 h-24 relative">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-24 h-24 object-cover rounded-md border border-gray-300"
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={handleInputChange}
          rows={4}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Requisitos</label>
        <textarea
          name="requirements"
          value={formData.requirements || ''}
          onChange={handleInputChange}
          rows={4}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Oferta</label>
        <textarea
          name="benefits"
          value={formData.benefits || ''}
          onChange={handleInputChange}
          rows={4}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Descreva o que esta vaga oferece (benefícios, oportunidades, etc.)"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          name="status"
          value={formData.status || 'active'}
          onChange={handleInputChange}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        >
          <option value="active">Ativa</option>
          <option value="closed">Fechada</option>
          <option value="draft">Rascunho</option>
        </select>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => {
            setIsAddingJob(false);
            setEditingJobId(null);
            setImageFile(null);
            setImagePreview(null);
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
      {!isAddingJob && !editingJobId && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAddingJob(true)}
          className="mb-6 flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Adicionar Nova Vaga
        </motion.button>
      )}
      
      {isAddingJob && <JobForm onSubmit={handleAddJob} />}
      
      {editingJobId && <JobForm onSubmit={handleUpdateJob} isEditing />}
      
      {loading && !isAddingJob && !editingJobId ? (
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
                    Vaga
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Localização
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center justify-center py-6">
                        <AlertCircle className="h-12 w-12 text-gray-400 mb-2" />
                        <p>Nenhuma vaga encontrada</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {job.image_url ? (
                            <div className="h-10 w-10 flex-shrink-0">
                              <img 
                                className="h-10 w-10 rounded-full object-cover" 
                                src={job.image_url} 
                                alt={job.title}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                                }}
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Briefcase className="h-5 w-5 text-blue-700" />
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{job.title}</div>
                            {job.external_url && (
                              <a 
                                href={job.external_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center mt-1"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Link externo
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{job.company}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{job.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {job.type === 'full-time' && 'Tempo Integral'}
                          {job.type === 'part-time' && 'Meio Período'}
                          {job.type === 'contract' && 'Contrato'}
                          {job.type === 'temporary' && 'Temporário'}
                          {job.type === 'internship' && 'Estágio'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          job.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : job.status === 'closed' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {job.status === 'active' && 'Ativa'}
                          {job.status === 'closed' && 'Fechada'}
                          {job.status === 'draft' && 'Rascunho'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(job.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleToggleStatus(job)}
                            className={`text-gray-400 hover:text-gray-500`}
                            title={job.status === 'active' ? 'Desativar' : 'Ativar'}
                          >
                            {job.status === 'active' ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEditJob(job)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Editar"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job.id)}
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

export default AdminJobManagement;