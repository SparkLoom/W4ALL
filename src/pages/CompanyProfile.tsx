import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { 
  Building, 
  MapPin, 
  Globe, 
  Users, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Calendar, 
  Briefcase,
  Send,
  ExternalLink,
  Clock,
  Info,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

type Company = {
  id: string;
  name: string;
  description: string;
  logo_url: string | null;
  website: string | null;
  industry: string | null;
  size: string | null;
  founded_year: number | null;
  headquarters: string | null;
  created_at: string;
};

type CompanyReview = {
  id: string;
  company_id: string;
  user_id: string;
  rating: number;
  title: string;
  pros: string;
  cons: string;
  advice: string | null;
  created_at: string;
  is_current_employee: boolean;
  job_title: string;
  employment_status: string;
  user: {
    full_name: string | null;
  };
};

type JobPost = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary_range: string | null;
  created_at: string;
  image_url: string | null;
};

const CompanyProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [reviews, setReviews] = useState<CompanyReview[]>([]);
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    title: '',
    pros: '',
    cons: '',
    advice: '',
    is_current_employee: false,
    job_title: '',
    employment_status: 'full-time'
  });

  useEffect(() => {
    if (id) {
      fetchCompany();
      fetchReviews();
      fetchJobs();
    }
  }, [id]);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      setCompany(data);
    } catch (error: any) {
      console.error('Error fetching company:', error.message);
      toast.error('Erro ao carregar informações da empresa');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      
      const { data, error } = await supabase
        .from('company_reviews')
        .select(`
          *,
          user:profiles (
            full_name
          )
        `)
        .eq('company_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setReviews(data || []);
    } catch (error: any) {
      console.error('Error fetching reviews:', error.message);
      toast.error('Erro ao carregar avaliações');
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      setJobsLoading(true);
      
      const { data, error } = await supabase
        .from('job_posts')
        .select('*')
        .eq('company', company?.name || '')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setJobs(data || []);
    } catch (error: any) {
      console.error('Error fetching jobs:', error.message);
      toast.error('Erro ao carregar vagas');
    } finally {
      setJobsLoading(false);
    }
  };

  const handleReviewInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setReviewForm(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleRatingChange = (rating: number) => {
    setReviewForm(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Você precisa estar logado para enviar uma avaliação');
      return;
    }
    
    if (reviewForm.rating === 0) {
      toast.error('Por favor, selecione uma classificação');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('company_reviews')
        .insert({
          company_id: id,
          user_id: user.id,
          rating: reviewForm.rating,
          title: reviewForm.title,
          pros: reviewForm.pros,
          cons: reviewForm.cons,
          advice: reviewForm.advice || null,
          is_current_employee: reviewForm.is_current_employee,
          job_title: reviewForm.job_title,
          employment_status: reviewForm.employment_status
        });
      
      if (error) throw error;
      
      toast.success('Avaliação enviada com sucesso');
      setIsWritingReview(false);
      setReviewForm({
        rating: 0,
        title: '',
        pros: '',
        cons: '',
        advice: '',
        is_current_employee: false,
        job_title: '',
        employment_status: 'full-time'
      });
      fetchReviews();
    } catch (error: any) {
      console.error('Error submitting review:', error.message);
      toast.error('Erro ao enviar avaliação');
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingInput = () => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-8 w-8 ${
                star <= reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const renderOverview = () => {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Sobre {company?.name}</h3>
          <p className="text-gray-700 whitespace-pre-line">{company?.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Informações</h4>
              <ul className="space-y-3">
                {company?.industry && (
                  <li className="flex items-start">
                    <Building className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                      <span className="text-sm text-gray-500">Indústria</span>
                      <p className="text-gray-900">{company.industry}</p>
                    </div>
                  </li>
                )}
                {company?.size && (
                  <li className="flex items-start">
                    <Users className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                      <span className="text-sm text-gray-500">Tamanho da empresa</span>
                      <p className="text-gray-900">{company.size}</p>
                    </div>
                  </li>
                )}
                {company?.founded_year && (
                  <li className="flex items-start">
                    <Calendar className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                      <span className="text-sm text-gray-500">Fundada em</span>
                      <p className="text-gray-900">{company.founded_year}</p>
                    </div>
                  </li>
                )}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Contato</h4>
              <ul className="space-y-3">
                {company?.headquarters && (
                  <li className="flex items-start">
                    <MapPin className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                      <span className="text-sm text-gray-500">Sede</span>
                      <p className="text-gray-900">{company.headquarters}</p>
                    </div>
                  </li>
                )}
                {company?.website && (
                  <li className="flex items-start">
                    <Globe className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                      <span className="text-sm text-gray-500">Website</span>
                      <p className="text-gray-900">
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          {company.website}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </p>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Avaliações</h3>
            <div className="flex items-center">
              <div className="flex items-center mr-4">
                <span className="text-3xl font-bold text-gray-900 mr-2">{calculateAverageRating()}</span>
                {renderStars(Math.round(parseFloat(calculateAverageRating())))}
              </div>
              <span className="text-gray-500">({reviews.length} avaliações)</span>
            </div>
          </div>
          
          {reviewsLoading ? (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhuma avaliação ainda</h4>
              <p className="text-gray-600 mb-4">Seja o primeiro a avaliar esta empresa.</p>
              <button
                onClick={() => setIsWritingReview(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <Star className="h-4 w-4 mr-2" />
                Avaliar Empresa
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-6 mb-6">
                {reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center mb-2">
                          {renderStars(review.rating)}
                          <span className="ml-2 text-gray-500 text-sm">
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-1">{review.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          {review.job_title} | {review.is_current_employee ? 'Funcionário atual' : 'Ex-funcionário'} | {
                            review.employment_status === 'full-time' ? 'Tempo integral' :
                            review.employment_status === 'part-time' ? 'Meio período' :
                            review.employment_status === 'contract' ? 'Contrato' :
                            review.employment_status === 'internship' ? 'Estágio' : 'Freelancer'
                          }
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {review.user.full_name || 'Usuário anônimo'}
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-3">
                      <div>
                        <div className="flex items-center text-sm font-medium text-gray-900 mb-1">
                          <ThumbsUp className="h-4 w-4 text-green-600 mr-2" />
                          Prós
                        </div>
                        <p className="text-gray-700">{review.pros}</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center text-sm font-medium text-gray-900 mb-1">
                          <ThumbsDown className="h-4 w-4 text-red-600 mr-2" />
                          Contras
                        </div>
                        <p className="text-gray-700">{review.cons}</p>
                      </div>
                      
                      {review.advice && (
                        <div>
                          <div className="flex items-center text-sm font-medium text-gray-900 mb-1">
                            <Info className="h-4 w-4 text-blue-600 mr-2" />
                            Conselhos para a gestão
                          </div>
                          <p className="text-gray-700">{review.advice}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {reviews.length > 3 && (
                <div className="text-center">
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Ver todas as {reviews.length} avaliações
                  </button>
                </div>
              )}
            </>
          )}
          
          {!isWritingReview && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsWritingReview(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <Star className="h-4 w-4 mr-2" />
                Avaliar Empresa
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Vagas Abertas</h3>
            <span className="text-gray-500">({jobs.length} vagas)</span>
          </div>
          
          {jobsLoading ? (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhuma vaga disponível</h4>
              <p className="text-gray-600">Esta empresa não tem vagas abertas no momento.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {jobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-1">{job.title}</h4>
                        <div className="flex flex-wrap items-center text-sm text-gray-500">
                          <div className="flex items-center mr-4">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center mr-4">
                            <Briefcase className="h-4 w-4 mr-1" />
                            <span>
                              {job.type === 'full-time' && 'Tempo Integral'}
                              {job.type === 'part-time' && 'Meio Período'}
                              {job.type === 'contract' && 'Contrato'}
                              {job.type === 'temporary' && 'Temporário'}
                              {job.type === 'internship' && 'Estágio'}
                            </span>
                          </div>
                          {job.salary_range && (
                            <div className="flex items-center mr-4">
                              <span className="text-green-600 font-medium">{job.salary_range}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{formatDate(job.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <Link
                        to={`/jobs/${job.id}`}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                      >
                        Ver Vaga
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              
              {jobs.length > 3 && (
                <div className="text-center">
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Ver todas as {jobs.length} vagas
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderReviews = () => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Todas as Avaliações</h3>
          <div className="flex items-center">
            <div className="flex items-center mr-4">
              <span className="text-3xl font-bold text-gray-900 mr-2">{calculateAverageRating()}</span>
              {renderStars(Math.round(parseFloat(calculateAverageRating())))}
            </div>
            <span className="text-gray-500">({reviews.length} avaliações)</span>
          </div>
        </div>
        
        {reviewsLoading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhuma avaliação ainda</h4>
            <p className="text-gray-600 mb-4">Seja o primeiro a avaliar esta empresa.</p>
            <button
              onClick={() => setIsWritingReview(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Star className="h-4 w-4 mr-2" />
              Avaliar Empresa
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center mb-2">
                      {renderStars(review.rating)}
                      <span className="ml-2 text-gray-500 text-sm">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-1">{review.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {review.job_title} | {review.is_current_employee ? 'Funcionário atual' : 'Ex-funcionário'} | {
                        review.employment_status === 'full-time' ? 'Tempo integral' :
                        review.employment_status === 'part-time' ? 'Meio período' :
                        review.employment_status === 'contract' ? 'Contrato' :
                        review.employment_status === 'internship' ? 'Estágio' : 'Freelancer'
                      }
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {review.user.full_name || 'Usuário anônimo'}
                  </div>
                </div>
                
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="flex items-center text-sm font-medium text-gray-900 mb-1">
                      <ThumbsUp className="h-4 w-4 text-green-600 mr-2" />
                      Prós
                    </div>
                    <p className="text-gray-700">{review.pros}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center text-sm font-medium text-gray-900 mb-1">
                      <ThumbsDown className="h-4 w-4 text-red-600 mr-2" />
                      Contras
                    </div>
                    <p className="text-gray-700">{review.cons}</p>
                  </div>
                  
                  {review.advice && (
                    <div>
                      <div className="flex items-center text-sm font-medium text-gray-900 mb-1">
                        <Info className="h-4 w-4 text-blue-600 mr-2" />
                        Conselhos para a gestão
                      </div>
                      <p className="text-gray-700">{review.advice}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!isWritingReview && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsWritingReview(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Star className="h-4 w-4 mr-2" />
              Avaliar Empresa
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderJobs = () => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Vagas Abertas</h3>
          <span className="text-gray-500">({jobs.length} vagas)</span>
        </div>
        
        {jobsLoading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-8">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhuma vaga disponível</h4>
            <p className="text-gray-600">Esta empresa não tem vagas abertas no momento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-1">{job.title}</h4>
                    <div className="flex flex-wrap items-center text-sm text-gray-500">
                      <div className="flex items-center mr-4">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center mr-4">
                        <Briefcase className="h-4 w-4 mr-1" />
                        <span>
                          {job.type === 'full-time' && 'Tempo Integral'}
                          {job.type === 'part-time' && 'Meio Período'}
                          {job.type === 'contract' && 'Contrato'}
                          {job.type === 'temporary' && 'Temporário'}
                          {job.type === 'internship' && 'Estágio'}
                        </span>
                      </div>
                      {job.salary_range && (
                        <div className="flex items-center mr-4">
                          <span className="text-green-600 font-medium">{job.salary_range}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{formatDate(job.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/jobs/${job.id}`}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                  >
                    Ver Vaga
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderWriteReview = () => {
    if (!user) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Login necessário</h3>
          <p className="text-gray-600 mb-4">Você precisa estar logado para avaliar esta empresa.</p>
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Fazer Login
          </Link>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Avaliar {company?.name}</h3>
        
        <form onSubmit={handleSubmitReview} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Classificação Geral</label>
            {renderRatingInput()}
          </div>
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Título da Avaliação</label>
            <input
              type="text"
              id="title"
              name="title"
              value={reviewForm.title}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Resumo da sua experiência"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="job_title" className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
              <input
                type="text"
                id="job_title"
                name="job_title"
                value={reviewForm.job_title}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Ex: Desenvolvedor Full Stack"
                required
              />
            </div>
            
            <div>
              <label htmlFor="employment_status" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Contrato</label>
              <select
                id="employment_status"
                name="employment_status"
                value={reviewForm.employment_status}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="full-time">Tempo Integral</option>
                <option value="part-time">Meio Período</option>
                <option value="contract">Contrato</option>
                <option value="internship">Estágio</option>
                <option value="freelance">Freelancer</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_current_employee"
              name="is_current_employee"
              checked={reviewForm.is_current_employee}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_current_employee" className="ml-2 block text-sm text-gray-700">
              Sou funcionário atual desta empresa
            </label>
          </div>
          
          <div>
            <label htmlFor="pros" className="block text-sm font-medium text-gray-700 mb-1">Prós</label>
            <textarea
              id="pros"
              name="pros"
              value={reviewForm.pros}
              onChange={handleInputChange}
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="O que você gosta na empresa?"
              required
            />
          </div>
          
          <div>
            <label htmlFor="cons" className="block text-sm font-medium text-gray-700 mb-1">Contras</label>
            <textarea
              id="cons"
              name="cons"
              value={reviewForm.cons}
              onChange={handleInputChange}
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="O que poderia ser melhorado?"
              required
            />
          </div>
          
          <div>
            <label htmlFor="advice" className="block text-sm font-medium text-gray-700 mb-1">Conselhos para a gestão (opcional)</label>
            <textarea
              id="advice"
              name="advice"
              value={reviewForm.advice}
              onChange={handleInputChange}
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Que conselhos você daria para a gestão da empresa?"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsWritingReview(false)}
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4 mr-2 inline" />
              Enviar Avaliação
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderContent = () => {
    if (isWritingReview) {
      return renderWriteReview();
    }

    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'reviews':
        return renderReviews();
      case 'jobs':
        return renderJobs();
      default:
        return renderOverview();
    }
  };

  if (loading && !company) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-700 to-blue-500 h-32"></div>
            <div className="px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-white p-2 rounded-lg shadow-md -mt-16">
                  {company?.logo_url ? (
                    <img 
                      src={company.logo_url} 
                      alt={company.name} 
                      className="h-24 w-24 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=' + company.name.charAt(0);
                      }}
                    />
                  ) : (
                    <div className="h-24 w-24 bg-blue-100 flex items-center justify-center rounded-lg">
                      <Building className="h-12 w-12 text-blue-700" />
                    </div>
                  )}
                </div>
                <div className="ml-4 mt-2 md:mt-0">
                  <h1 className="text-2xl font-bold text-gray-900">{company?.name}</h1>
                  <div className="flex items-center mt-1">
                    {renderStars(Math.round(parseFloat(calculateAverageRating())))}
                    <span className="ml-2 text-gray-500 text-sm">
                      {calculateAverageRating()} ({reviews.length} avaliações)
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 flex space-x-3">
                {company?.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Visitar Website
                  </a>
                )}
                <button
                  onClick={() => setIsWritingReview(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Avaliar
                </button>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Visão Geral
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'reviews'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Avaliações ({reviews.length})
                </button>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'jobs'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Vagas ({jobs.length})
                </button>
              </nav>
            </div>
          </div>
          
          {renderContent()}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CompanyProfile;