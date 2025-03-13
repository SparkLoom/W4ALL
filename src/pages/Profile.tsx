import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Briefcase, Award, Edit, Save, X, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

type ProfileData = {
  id: string;
  full_name: string;
  email: string;
  job_title: string | null;
  bio: string | null;
  skills: string[] | null;
  avatar_url: string | null;
};

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState<Partial<ProfileData>>({});
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      // Get user email from auth
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      // Get profile data
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userData.user.id)
        .single();
      
      if (error) throw error;
      
      const profileData: ProfileData = {
        ...data,
        email: userData.user.email || '',
      };
      
      setProfile(profileData);
      setFormData(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    
    const updatedSkills = [...(formData.skills || []), newSkill.trim()];
    setFormData({ ...formData, skills: updatedSkills });
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updatedSkills = (formData.skills || []).filter(skill => skill !== skillToRemove);
    setFormData({ ...formData, skills: updatedSkills });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          job_title: formData.job_title,
          bio: formData.bio,
          skills: formData.skills,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile?.id);
      
      if (error) throw error;
      
      toast.success('Perfil atualizado com sucesso');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-24 pb-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-700 to-blue-500 h-32"></div>
            
            <div className="relative px-6 pb-8">
              <div className="flex flex-col sm:flex-row items-center">
                <div className="absolute -top-16 sm:relative sm:top-0">
                  <div className="bg-white p-2 rounded-full">
                    <div className="h-32 w-32 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                      <User className="h-16 w-16" />
                    </div>
                  </div>
                </div>
                
                <div className="mt-20 sm:mt-0 sm:ml-6 text-center sm:text-left flex-grow">
                  <h1 className="text-2xl font-bold text-gray-900">{profile?.full_name}</h1>
                  <p className="text-gray-600">{profile?.job_title || 'Sem cargo definido'}</p>
                </div>
                
                <div className="mt-4 sm:mt-0">
                  {!editing ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEditing(true)}
                      className="flex items-center bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition duration-300"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Perfil
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setEditing(false);
                        setFormData(profile || {});
                      }}
                      className="flex items-center bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-300"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </motion.button>
                  )}
                </div>
              </div>
              
              <div className="mt-8">
                {!editing ? (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Mail className="h-5 w-5 mr-2 text-blue-700" />
                        Contato
                      </h2>
                      <p className="mt-2 text-gray-600">{profile?.email}</p>
                    </div>
                    
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Briefcase className="h-5 w-5 mr-2 text-blue-700" />
                        Cargo Atual
                      </h2>
                      <p className="mt-2 text-gray-600">{profile?.job_title || 'Não informado'}</p>
                    </div>
                    
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Sobre</h2>
                      <p className="mt-2 text-gray-600">{profile?.bio || 'Nenhuma informação disponível.'}</p>
                    </div>
                    
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Award className="h-5 w-5 mr-2 text-blue-700" />
                        Habilidades
                      </h2>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {profile?.skills && profile.skills.length > 0 ? (
                          profile.skills.map((skill, index) => (
                            <span 
                              key={index} 
                              className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-600">Nenhuma habilidade cadastrada.</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={formData.email || ''}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100"
                        disabled
                      />
                      <p className="mt-1 text-xs text-gray-500">O email não pode ser alterado.</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Cargo Atual</label>
                      <input
                        type="text"
                        name="job_title"
                        value={formData.job_title || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sobre</label>
                      <textarea
                        name="bio"
                        value={formData.bio || ''}
                        onChange={handleChange}
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Habilidades</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {formData.skills && formData.skills.map((skill, index) => (
                          <div 
                            key={index} 
                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="ml-2 text-blue-700 hover:text-blue-900"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 flex">
                        <input
                          type="text"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Adicionar habilidade"
                        />
                        <button
                          type="button"
                          onClick={handleAddSkill}
                          className="bg-blue-700 text-white px-3 rounded-r-md hover:bg-blue-800"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                          loading ? 'opacity-75 cursor-not-allowed' : ''
                        }`}
                      >
                        <Save className="h-5 w-5 mr-2" />
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                      </motion.button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;