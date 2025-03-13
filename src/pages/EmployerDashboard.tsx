import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  BarChart2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building,
  Search,
  Filter,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  FileText,
  Star,
  Download,
  Share2,
  MessageSquare,
  Video,
  User,
  Eye,
  BookOpen,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

type Application = {
  id: string;
  job_id: string;
  user_id: string;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';
  cover_letter: string | null;
  created_at: string;
  user: {
    full_name: string;
    email: string;
  };
  job: {
    title: string;
    company: string;
  };
};

type Interview = {
  id: string;
  application_id: string;
  scheduled_at: string;
  duration_minutes: number;
  location: string;
  type: 'in-person' | 'video' | 'phone';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes: string | null;
};

type JobAnalytics = {
  job_id: string;
  views: number;
  applications: number;
  shares: number;
  saves: number;
  date: string;
};

const EmployerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [analytics, setAnalytics] = useState<JobAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchEmployerData();
  }, [user, navigate]);

  const fetchEmployerData = async () => {
    try {
      setLoading(true);
      
      // Fetch applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select(`
          *,
          user:profiles (
            full_name,
            email
          ),
          job:job_posts (
            title,
            company
          )
        `)
        .order('created_at', { ascending: false });
      
      if (applicationsError) throw applicationsError;
      
      // Fetch interviews
      const { data: interviewsData, error: interviewsError } = await supabase
        .from('interviews')
        .select('*')
        .order('scheduled_at', { ascending: true });
      
      if (interviewsError) throw interviewsError;
      
      // Fetch analytics
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('job_analytics')
        .select('*')
        .order('date', { ascending: false });
      
      if (analyticsError) throw analyticsError;
      
      setApplications(applicationsData || []);
      setInterviews(interviewsData || []);
      setAnalytics(analyticsData || []);
    } catch (error: any) {
      console.error('Error fetching employer data:', error.message);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId: string, newStatus: Application['status']) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) throw error;

      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
      
      toast.success('Status atualizado com sucesso');
    } catch (error: any) {
      console.error('Error updating application status:', error.message);
      toast.error('Erro ao atualizar status');
    }
  };

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Candidaturas</h3>
          <Users className="h-6 w-6 text-blue-600" />
        </div>
        <p className="mt-2 text-3xl font-bold">{applications.length}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Entrevistas</h3>
          <Calendar className="h-6 w-6 text-green-600" />
        </div>
        <p className="mt-2 text-3xl font-bold">{interviews.length}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Contratações</h3>
          <CheckCircle className="h-6 w-6 text-purple-600" />
        </div>
        <p className="mt-2 text-3xl font-bold">
          {applications.filter(a => a.status === 'hired').length}
        </p>
      </div>
    </div>
  );

  const renderApplications = () => {
    let filteredApplications = [...applications];

    if (searchTerm) {
      filteredApplications = filteredApplications.filter(app => 
        app.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.job.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filteredApplications = filteredApplications.filter(app => app.status === statusFilter);
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por candidato ou vaga"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="reviewing">Em Análise</option>
            <option value="shortlisted">Pré-selecionado</option>
            <option value="rejected">Rejeitado</option>
            <option value="hired">Contratado</option>
          </select>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma candidatura encontrada</h3>
            <p className="mt-1 text-sm text-gray-500">
              Ajuste os filtros ou aguarde novas candidaturas.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div
                key={application.id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {application.user.full_name}
                      </h4>
                      <p className="text-sm text-gray-500">{application.user.email}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Candidatura para: {application.job.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <select
                      value={application.status}
                      onChange={(e) => handleUpdateStatus(application.id, e.target.value as Application['status'])}
                      className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="pending">Pendente</option>
                      <option value="reviewing">Em Análise</option>
                      <option value="shortlisted">Pré-selecionado</option>
                      <option value="rejected">Rejeitado</option>
                      <option value="hired">Contratado</option>
                    </select>
                  </div>
                </div>
                {application.cover_letter && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="text-sm font-medium text-gray-900">Carta de Apresentação</h5>
                    <p className="mt-2 text-sm text-gray-600">{application.cover_letter}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Painel do Empregador</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie candidaturas e acompanhe o processo seletivo
            </p>
          </div>

          <div className="mb-8">
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'applications'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Candidaturas
              </button>
            </nav>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            activeTab === 'dashboard' ? renderDashboard() : renderApplications()
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EmployerDashboard;