import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
import { 
  Users, 
  Briefcase, 
  Building2, 
  CheckCircle, 
  LogOut, 
  FileText, 
  MessageSquare, 
  Settings,
  User,
  BookOpen,
  Newspaper,
  HelpCircle,
  FileCheck,
  Shield,
  Layers,
  Menu
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Logo from '../Logo';
import AdminSidebar from './AdminSidebar';
import AdminJobManagement from './AdminJobManagement';
import AdminExperienceManagement from './AdminExperienceManagement';
import AdminBlogManagement from './AdminBlogManagement';
import AdminUserManagement from './AdminUserManagement';
import AdminContentManagement from './AdminContentManagement';
import JobSearchAggregator from './JobSearchAggregator';

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

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    totalCompanies: 0,
  });
  const [monthlyStats, setMonthlyStats] = useState({
    labels: [] as string[],
    users: [] as number[],
    applications: [] as number[],
  });
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
    fetchMonthlyStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: users } = await supabase.from('profiles').select('count');
      const { data: jobs } = await supabase.from('job_posts').select('count');
      const { data: applications } = await supabase.from('applications').select('count');
      
      // Fix for the distinct query - manually count unique companies
      const { data: companiesData } = await supabase
        .from('job_posts')
        .select('company');
      
      // Calculate unique companies manually
      const uniqueCompanies = new Set();
      companiesData?.forEach(job => {
        if (job.company) {
          uniqueCompanies.add(job.company);
        }
      });

      setStats({
        totalUsers: users?.[0]?.count || 0,
        totalJobs: jobs?.[0]?.count || 0,
        totalApplications: applications?.[0]?.count || 0,
        totalCompanies: uniqueCompanies.size || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Erro ao carregar estatísticas');
    }
  };

  const fetchMonthlyStats = async () => {
    // Simulando dados mensais para demonstração
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const userData = [65, 78, 90, 105, 125, 150];
    const applicationData = [30, 45, 55, 65, 80, 95];

    setMonthlyStats({
      labels: months,
      users: userData,
      applications: applicationData,
    });
  };

  const handleLogout = async () => {
    await signOut();
    toast.success('Sessão encerrada com sucesso');
    navigate('/admin/login');
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-white rounded-lg shadow-lg p-6 ${color}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-2">{value}</h3>
        </div>
        <Icon className="h-8 w-8 text-blue-600" />
      </div>
    </motion.div>
  );

  const renderDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total de Usuários" value={stats.totalUsers} icon={Users} />
        <StatCard title="Vagas Publicadas" value={stats.totalJobs} icon={Briefcase} />
        <StatCard title="Candidaturas" value={stats.totalApplications} icon={CheckCircle} />
        <StatCard title="Empresas" value={stats.totalCompanies} icon={Building2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Crescimento de Usuários</h3>
          <Line
            data={{
              labels: monthlyStats.labels,
              datasets: [
                {
                  label: 'Novos Usuários',
                  data: monthlyStats.users,
                  borderColor: 'rgb(59, 130, 246)',
                  tension: 0.4,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                },
              },
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Candidaturas por Mês</h3>
          <Bar
            data={{
              labels: monthlyStats.labels,
              datasets: [
                {
                  label: 'Candidaturas',
                  data: monthlyStats.applications,
                  backgroundColor: 'rgba(59, 130, 246, 0.5)',
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                },
              },
            }}
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Status das Candidaturas</h3>
        <div className="h-64">
          <Pie
            data={{
              labels: ['Pendentes', 'Aceitas', 'Rejeitadas'],
              datasets: [
                {
                  data: [30, 50, 20],
                  backgroundColor: [
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(255, 99, 132, 0.5)',
                  ],
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                },
              },
            }}
          />
        </div>
      </motion.div>
    </>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'jobs':
        return <AdminJobManagement />;
      case 'experiences':
        return <AdminExperienceManagement />;
      case 'blog':
        return <AdminBlogManagement />;
      case 'users':
        return <AdminUserManagement />;
      case 'jobSearch':
        return <JobSearchAggregator />;
      case 'careers':
      case 'press':
      case 'help':
      case 'terms':
      case 'privacy':
      case 'documentation':
        return <AdminContentManagement section={activeSection} />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="mr-2 p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>
              <Logo className="h-8 w-auto mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Work4All Admin</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-700 hover:text-gray-900"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sair
            </button>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
          isCollapsed={isCollapsed}
          toggleSidebar={toggleSidebar}
        />
        
        <main className={`flex-1 overflow-y-auto p-6 transition-all duration-300 ease-in-out ${isCollapsed ? 'ml-16' : 'ml-0'}`}>
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex items-center">
              <button
                onClick={toggleSidebar}
                className="mr-4 p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 hidden lg:block"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900">
                {activeSection === 'dashboard' && 'Painel de Controle'}
                {activeSection === 'jobs' && 'Gestão de Ofertas de Emprego'}
                {activeSection === 'experiences' && 'Gestão de Experiências Compartilhadas'}
                {activeSection === 'blog' && 'Gestão do Blog'}
                {activeSection === 'users' && 'Gestão de Usuários'}
                {activeSection === 'careers' && 'Gestão de Carreiras'}
                {activeSection === 'press' && 'Gestão de Imprensa'}
                {activeSection === 'help' && 'Gestão de Ajuda'}
                {activeSection === 'terms' && 'Gestão de Termos'}
                {activeSection === 'privacy' && 'Gestão de Privacidade'}
                {activeSection === 'documentation' && 'Gestão de Documentação'}
              </h2>
            </div>
            
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;