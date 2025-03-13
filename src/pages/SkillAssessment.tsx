import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Trophy,
  Timer,
  ArrowRight,
  FileCheck,
  Upload,
  ExternalLink,
  Search
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

type Assessment = {
  id: string;
  title: string;
  description: string;
  industry: string;
  difficulty: string;
  time_limit_minutes: number;
  passing_score: number;
};

type UserAssessment = {
  id: string;
  assessment_id: string;
  score: number;
  passed: boolean;
  completed_at: string;
  time_taken_minutes: number;
};

type Certification = {
  id: string;
  title: string;
  issuer: string;
  issue_date: string;
  expiry_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
  verified: boolean;
};

type SkillBadge = {
  id: string;
  skill: string;
  level: string;
  earned_through: string;
  earned_at: string;
};

const SkillAssessment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('assessments');
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [userAssessments, setUserAssessments] = useState<UserAssessment[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [skillBadges, setSkillBadges] = useState<SkillBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [isAddingCertification, setIsAddingCertification] = useState(false);
  const [certificationForm, setCertificationForm] = useState({
    title: '',
    issuer: '',
    issue_date: '',
    expiry_date: '',
    credential_id: '',
    credential_url: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch assessments
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from('skill_assessments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (assessmentsError) throw assessmentsError;
      
      // Fetch user's completed assessments
      const { data: userAssessmentsData, error: userAssessmentsError } = await supabase
        .from('user_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });
      
      if (userAssessmentsError) throw userAssessmentsError;
      
      // Fetch certifications
      const { data: certificationsData, error: certificationsError } = await supabase
        .from('certifications')
        .select('*')
        .eq('user_id', user.id)
        .order('issue_date', { ascending: false });
      
      if (certificationsError) throw certificationsError;
      
      // Fetch skill badges
      const { data: skillBadgesData, error: skillBadgesError } = await supabase
        .from('skill_badges')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });
      
      if (skillBadgesError) throw skillBadgesError;
      
      setAssessments(assessmentsData || []);
      setUserAssessments(userAssessmentsData || []);
      setCertifications(certificationsData || []);
      setSkillBadges(skillBadgesData || []);
    } catch (error: any) {
      console.error('Error fetching data:', error.message);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    // Navigate to assessment page
    navigate(`/assessment/${assessment.id}`);
  };

  const handleAddCertification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('certifications')
        .insert({
          user_id: user?.id,
          ...certificationForm
        });
      
      if (error) throw error;
      
      toast.success('Certificação adicionada com sucesso');
      setIsAddingCertification(false);
      setCertificationForm({
        title: '',
        issuer: '',
        issue_date: '',
        expiry_date: '',
        credential_id: '',
        credential_url: '',
      });
      fetchData();
    } catch (error: any) {
      console.error('Error adding certification:', error.message);
      toast.error('Erro ao adicionar certificação');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      case 'expert':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const renderAssessments = () => {
    let filteredAssessments = [...assessments];
    
    if (searchTerm) {
      filteredAssessments = filteredAssessments.filter(assessment => 
        assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (industryFilter) {
      filteredAssessments = filteredAssessments.filter(assessment => 
        assessment.industry === industryFilter
      );
    }
    
    if (difficultyFilter) {
      filteredAssessments = filteredAssessments.filter(assessment => 
        assessment.difficulty === difficultyFilter
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar avaliações"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Todas as áreas</option>
                <option value="web_development">Desenvolvimento Web</option>
                <option value="programming">Programação</option>
                <option value="computer_science">Ciência da Computação</option>
                <option value="design">Design</option>
                <option value="devops">DevOps</option>
              </select>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Todas as dificuldades</option>
                <option value="beginner">Iniciante</option>
                <option value="intermediate">Intermediário</option>
                <option value="advanced">Avançado</option>
              </select>
            </div>
          </div>

          {filteredAssessments.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma avaliação encontrada</h3>
              <p className="mt-1 text-sm text-gray-500">
                Tente ajustar seus filtros de busca.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssessments.map((assessment) => {
                const userAttempt = userAssessments.find(ua => ua.assessment_id === assessment.id);
                
                return (
                  <div
                    key={assessment.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(assessment.difficulty)}`}>
                        {assessment.difficulty === 'beginner' && 'Iniciante'}
                        {assessment.difficulty === 'intermediate' && 'Intermediário'}
                        {assessment.difficulty === 'advanced' && 'Avançado'}
                      </span>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{assessment.time_limit_minutes} min</span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{assessment.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{assessment.description}</p>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-500">
                        Nota mínima: {assessment.passing_score}%
                      </div>
                      {userAttempt ? (
                        <div className={`flex items-center ${userAttempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                          {userAttempt.passed ? (
                            <CheckCircle className="h-5 w-5 mr-1" />
                          ) : (
                            <AlertCircle className="h-5 w-5 mr-1" />
                          )}
                          <span>{userAttempt.score}%</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartAssessment(assessment)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          Iniciar
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCertifications = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Minhas Certificações</h3>
            <button
              onClick={() => setIsAddingCertification(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              Adicionar Certificação
            </button>
          </div>

          {certifications.length === 0 ? (
            <div className="text-center py-12">
              <FileCheck className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma certificação</h3>
              <p className="mt-1 text-sm text-gray-500">
                Adicione suas certificações para destacar suas habilidades.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {certifications.map((certification) => (
                <div
                  key={certification.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{certification.title}</h4>
                      <p className="text-sm text-gray-600">{certification.issuer}</p>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                        <span>Emitido em: {formatDate(certification.issue_date)}</span>
                        {certification.expiry_date && (
                          <span>Expira em: {formatDate(certification.expiry_date)}</span>
                        )}
                      </div>
                      {certification.credential_url && (
                        <a
                          href={certification.credential_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                        >
                          Ver credencial
                          <ExternalLink className="ml-1 h-4 w-4" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center">
                      {certification.verified ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Verificado
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="h-4 w-4 mr-1" />
                          Pendente
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isAddingCertification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Adicionar Nova Certificação
              </h3>
              <form onSubmit={handleAddCertification} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Título</label>
                  <input
                    type="text"
                    value={certificationForm.title}
                    onChange={(e) => setCertificationForm({ ...certificationForm, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Emissor</label>
                  <input
                    type="text"
                    value={certificationForm.issuer}
                    onChange={(e) => setCertificationForm({ ...certificationForm, issuer: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data de Emissão</label>
                  <input
                    type="date"
                    value={certificationForm.issue_date}
                    onChange={(e) => setCertificationForm({ ...certificationForm, issue_date: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data de Expiração</label>
                  <input
                    type="date"
                    value={certificationForm.expiry_date}
                    onChange={(e) => setCertificationForm({ ...certificationForm, expiry_date: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID da Credencial</label>
                  <input
                    type="text"
                    value={certificationForm.credential_id}
                    onChange={(e) => setCertificationForm({ ...certificationForm, credential_id: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">URL da Credencial</label>
                  <input
                    type="url"
                    value={certificationForm.credential_url}
                    onChange={(e) => setCertificationForm({ ...certificationForm, credential_url: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddingCertification(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Adicionar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderBadges = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Minhas Conquistas</h3>
          
          {skillBadges.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma conquista ainda</h3>
              <p className="mt-1 text-sm text-gray-500">
                Complete avaliações para ganhar badges de habilidades.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skillBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Award className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(badge.level)}`}>
                      {badge.level === 'beginner' && 'Iniciante'}
                      {badge.level === 'intermediate' && 'Intermediário'}
                      {badge.level === 'advanced' && 'Avançado'}
                      {badge.level === 'expert' && 'Especialista'}
                    </span>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900">{badge.skill}</h4>
                  <p className="text-sm text-gray-500 mt-2">
                    Conquistado em {formatDate(badge.earned_at)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    via {badge.earned_through === 'assessment' ? 'Avaliação' : 'Certificação'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'assessments':
        return renderAssessments();
      case 'certifications':
        return renderCertifications();
      case 'badges':
        return renderBadges();
      default:
        return renderAssessments();
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
            <h1 className="text-3xl font-bold text-gray-900">Avaliação de Habilidades</h1>
            <p className="mt-2 text-gray-600">Teste seus conhecimentos e obtenha certificações</p>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full md:w-64 flex-shrink-0"
            >
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <nav className="p-2">
                  <button
                    onClick={() => setActiveTab('assessments')}
                    className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'assessments'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text- gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <BookOpen className="h-5 w-5 mr-3" />
                    <span>Avaliações</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('certifications')}
                    className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'certifications'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FileCheck className="h-5 w-5 mr-3" />
                    <span>Certificações</span>
                    <span className="ml-auto bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 text-xs">
                      {certifications.length}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('badges')}
                    className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'badges'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Award className="h-5 w-5 mr-3" />
                    <span>Conquistas</span>
                    <span className="ml-auto bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 text-xs">
                      {skillBadges.length}
                    </span>
                  </button>
                </nav>
              </div>
              
              <div className="mt-6 bg-white rounded-lg shadow-md p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Progresso</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span>Avaliações Concluídas</span>
                    </div>
                    <span className="text-sm font-medium">{userAssessments.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="h-4 w-4 mr-2 text-yellow-500" />
                      <span>Média de Pontuação</span>
                    </div>
                    <span className="text-sm font-medium">
                      {userAssessments.length > 0
                        ? `${Math.round(
                            userAssessments.reduce((acc, curr) => acc + curr.score, 0) / userAssessments.length
                          )}%`
                        : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-600">
                      <Trophy className="h-4 w-4 mr-2 text-purple-500" />
                      <span>Badges Conquistados</span>
                    </div>
                    <span className="text-sm font-medium">{skillBadges.length}</span>
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

export default SkillAssessment;