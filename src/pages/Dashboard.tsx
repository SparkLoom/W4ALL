import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  CheckCircle, 
  Clock, 
  User, 
  FileText, 
  Settings, 
  Bell, 
  Star, 
  ChevronRight, 
  Calendar, 
  Building,
  MapPin,
  ExternalLink,
  X,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

type Application = {
  id: string;
  job_id: string;
  user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  cover_letter: string | null;
  created_at: string;
  job: {
    title: string;
    company: string;
    location: string;
    type: string;
    image_url: string | null;
  };
};

type SavedJob = {
  id: string;
  user_id: string;
  job_id: string;
  created_at: string;
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    image_url: string | null;
  };
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('applications');
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Sua candidatura para Desenvolvedor Full Stack foi visualizada', read: false, time: '2h atrás' },
    { id: 2, message: 'Nova vaga compatível com seu perfil: UX Designer', read: true, time: '1d atrás' },
    { id: 3, message: 'Lembrete: Entrevista amanhã às 14h', read: false, time: '6h atrás' },
  ]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchApplications();
    fetchSavedJobs();
  }, [user, navigate]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          job_id,
          user_id,
          status,
          cover_letter,
          created_at,
          job:job_posts (
            title,
            company,
            location,
            type,
            image_url
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setApplications(data || []);
    } catch (error: any) {
      console.error('Error fetching applications:', error.message);
      toast.error('Erro ao carregar candidaturas');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('saved_jobs')
        .select(`
          id,
          user_id,
          job_id,
          created_at,
          job:job_posts (
            id,
            title,
            company,
            location,
            type,
            image_url
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setSavedJobs(data || []);
    } catch (error: any) {
      console.error('Error fetching saved jobs:', error.message);
      toast.error('Erro ao carregar vagas salvas');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSavedJob = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setSavedJobs(savedJobs.filter(job => job.id !== id));
      toast.success('Vaga removida dos favoritos');
    } catch (error: any) {
      console.error('Error removing saved job:', error.message);
      toast.error('Erro ao remover vaga dos favoritos');
    }
  };

  const handleWithdrawApplication = async (id: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setApplications(applications.filter(app => app.id !== id));
      toast.success('Candidatura retirada com sucesso');
    } catch (error: any) {
      console.error('Error withdrawing application:', error.message);
      toast.error('Erro ao retirar candidatura');
    }
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'accepted':
        return 'Aceita';
      case 'rejected':
        return 'Rejeitada';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const renderApplications = () => {
    if (applications.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma candidatura encontrada</h3>
          <p className="text-gray-600 mb-4">Você ainda não se candidatou a nenhuma vaga.</p>
          <button
            onClick={() => navigate('/jobs')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Explorar Vagas
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {applications.map((application) => (
          <div key={application.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div className="flex items-start">
                  <div className="h-12 w-12 bg-blue-100 rounded-md flex items-center justify-center mr-4">
                    <Briefcase className="h-6 w-6 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{application.job.title}</h3>
                    <p className="text-gray-600">{application.job.company}</p>
                    <div className="flex flex-wrap items-center mt-2 text-sm text-gray-500">
                      <div className="flex items-center mr-4">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{application.job.location}</span>
                      </div>
                      <div className="flex items-center mr-4">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Candidatura: {formatDate(application.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 flex flex-col sm:items-end">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                    {getStatusText(application.status)}
                  </span>
                  <button
                    onClick={() => handleWithdrawApplication(application.id)}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Retirar candidatura
                  </button>
                </div>
              </div>
              
              {application.cover_letter && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Carta de Apresentação</h4>
                  <p className="text-sm text-gray-600">{application.cover_letter}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSavedJobs = () => {
    if (savedJobs.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma vaga salva</h3>
          <p className="text-gray-600 mb-4">Salve vagas para visualizá-las mais tarde.</p>
          <button
            onClick={() => navigate('/jobs')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Explorar Vagas
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {savedJobs.map((savedJob) => (
          <div key={savedJob.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div className="flex items-start">
                  <div className="h-12 w-12 bg-blue-100 rounded-md flex items-center justify-center mr-4">
                    <Building className="h-6 w-6 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{savedJob.job.title}</h3>
                    <p className="text-gray-600">{savedJob.job.company}</p>
                    <div className="flex flex-wrap items-center mt-2 text-sm text-gray-500">
                      <div className="flex items-center mr-4">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{savedJob.job.location}</span>
                      </div>
                      <div className="flex items-center mr-4">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Salvo em: {formatDate(savedJob.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 flex flex-col sm:items-end space-y-2">
                  <button
                    onClick={() => navigate(`/jobs/${savedJob.job_id}`)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                  >
                    Ver Vaga
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveSavedJob(savedJob.id)}
                    className="inline-flex items-center text-sm text-red-600 hover:text-red-800"
                  >
                    <X className="mr-1 h-4 w-4" />
                    Remover
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderNotifications = () => {
    return (
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma notificação</h3>
            <p className="text-gray-600">Você não tem notificações no momento.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${notification.read ? 'border-gray-300' : 'border-blue-500'}`}
            >
              <div className="flex justify-between">
                <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                  {notification.message}
                </p>
                <span className="text-xs text-gray-500">{notification.time}</span>
              </div>
              {!notification.read && (
                <button
                  onClick={() => markNotificationAsRead(notification.id)}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                >
                  Marcar como lida
                </button>
              )}
            </div>
          ))
        )}
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Notificações</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="email-notifications" className="text-sm text-gray-700">
                  Receber notificações por email
                </label>
                <input
                  id="email-notifications"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  defaultChecked
                />
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="job-recommendations" className="text-sm text-gray-700">
                  Receber recomendações de vagas
                </label>
                <input
                  id="job-recommendations"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  defaultChecked
                />
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="application-updates" className="text-sm text-gray-700">
                  Atualizações de candidaturas
                </label>
                <input
                  id="application-updates"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  defaultChecked
                />
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Privacidade</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="profile-visibility" className="text-sm text-gray-700">
                  Perfil visível para recrutadores
                </label>
                <input
                  id="profile-visibility"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  defaultChecked
                />
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="share-data" className="text-sm text-gray-700">
                  Compartilhar dados com empresas parceiras
                </label>
                <input
                  id="share-data"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Conta</h4>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/profile')}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                Editar Perfil
              </button>
              <button
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Excluir Conta
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'applications':
        return renderApplications();
      case 'saved':
        return renderSavedJobs();
      case 'notifications':
        return renderNotifications();
      case 'settings':
        return renderSettings();
      default:
        return renderApplications();
    }
  };

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900">Painel do Candidato</h1>
            <p className="mt-2 text-gray-600">Gerencie suas candidaturas e vagas salvas</p>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full md:w-64 flex-shrink-0"
            >
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-700" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{user.email}</p>
                      <p className="text-xs text-gray-500">Candidato</p>
                    </div>
                  </div>
                </div>
                
                <nav className="p-2">
                  <button
                    onClick={() => setActiveTab('applications')}
                    className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'applications'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Briefcase className="h-5 w-5 mr-3" />
                    <span>Minhas Candidaturas</span>
                    <span className="ml-auto bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 text-xs">
                      {applications.length}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('saved')}
                    className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'saved'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Star className="h-5 w-5 mr-3" />
                    <span>Vagas Salvas</span>
                    <span className="ml-auto bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 text-xs">
                      {savedJobs.length}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'notifications'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Bell className="h-5 w-5 mr-3" />
                    <span>Notificações</span>
                    <span className="ml-auto bg-blue-500 text-white rounded-full px-2 py-0.5 text-xs">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'settings'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    <span>Configurações</span>
                  </button>
                </nav>
                
                <div className="p-4 border-t border-gray-200">
                  <button
                    onClick={() => navigate('/jobs')}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Buscar Vagas
                  </button>
                </div>
              </div>
              
              <div className="mt-6 bg-white rounded-lg shadow-md p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Resumo</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span>Candidaturas</span>
                    </div>
                    <span className="text-sm font-medium">{applications.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                      <span>Pendentes</span>
                    </div>
                    <span className="text-sm font-medium">
                      {applications.filter(a => a.status === 'pending').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="h-4 w-4 mr-2 text-blue-500" />
                      <span>Vagas Salvas</span>
                    </div>
                    <span className="text-sm font-medium">{savedJobs.length}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-grow"
            >
              {loading ? (
                <div className="flex justify-center my-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                renderContent()
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;