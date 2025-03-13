import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Briefcase, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState('');
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    let feedback = '';

    if (password.length >= 8) {
      strength += 1;
    } else {
      feedback = 'A senha deve ter pelo menos 8 caracteres';
      return { strength, feedback };
    }

    if (/[A-Z]/.test(password)) {
      strength += 1;
    } else {
      feedback = 'A senha deve conter pelo menos uma letra maiúscula';
      return { strength, feedback };
    }

    if (/[a-z]/.test(password)) {
      strength += 1;
    } else {
      feedback = 'A senha deve conter pelo menos uma letra minúscula';
      return { strength, feedback };
    }

    if (/[0-9]/.test(password)) {
      strength += 1;
    } else {
      feedback = 'A senha deve conter pelo menos um número';
      return { strength, feedback };
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      strength += 1;
    } else {
      feedback = 'A senha deve conter pelo menos um caractere especial';
      return { strength, feedback };
    }

    if (strength === 5) {
      feedback = 'Senha forte!';
    }

    return { strength, feedback };
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    
    const { strength, feedback } = checkPasswordStrength(newPassword);
    setPasswordStrength(strength);
    setPasswordFeedback(feedback);
  };

  const validateStep1 = () => {
    if (!fullName.trim()) {
      toast.error('Por favor, insira seu nome completo');
      return false;
    }
    if (!email.trim()) {
      toast.error('Por favor, insira seu email');
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Por favor, insira um email válido');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (password.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres');
      return false;
    }
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return false;
    }
    if (passwordStrength < 3) {
      toast.error('Por favor, escolha uma senha mais forte');
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobTitle.trim()) {
      toast.error('Por favor, insira seu cargo atual');
      return;
    }

    setIsLoading(true);

    try {
      await signUp(email, password, fullName);
      toast.success('Conta criada com sucesso! Bem-vindo à Work4All!');
      navigate('/');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPasswordStrengthBar = () => {
    const getColor = () => {
      if (passwordStrength <= 2) return 'bg-red-500';
      if (passwordStrength <= 3) return 'bg-yellow-500';
      return 'bg-green-500';
    };

    return (
      <div className="mt-2">
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div 
            className={`h-full rounded-full ${getColor()}`} 
            style={{ width: `${(passwordStrength / 5) * 100}%` }}
          ></div>
        </div>
        {password && (
          <p className={`text-xs mt-1 ${passwordStrength <= 2 ? 'text-red-500' : passwordStrength <= 3 ? 'text-yellow-500' : 'text-green-500'}`}>
            {passwordFeedback}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-xl p-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Crie sua conta</h2>
              <p className="text-gray-600 mt-2">Junte-se à comunidade Work4All</p>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((stepNumber) => (
                  <div key={stepNumber} className="flex flex-col items-center">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step === stepNumber 
                          ? 'bg-blue-600 text-white' 
                          : step > stepNumber 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {step > stepNumber ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        stepNumber
                      )}
                    </div>
                    <span className="text-xs mt-2 text-gray-600">
                      {stepNumber === 1 ? 'Identificação' : stepNumber === 2 ? 'Segurança' : 'Profissional'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="relative mt-2">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2"></div>
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 transition-all duration-300"
                  style={{ width: `${((step - 1) / 2) * 100}%` }}
                ></div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Seu nome completo"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="seu.email@exemplo.com"
                        required
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Senha</label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={handlePasswordChange}
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Crie uma senha forte"
                        required
                      />
                    </div>
                    {renderPasswordStrengthBar()}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Confirmar Senha</label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Confirme sua senha"
                        required
                      />
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs mt-1 text-red-500 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        As senhas não coincidem
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cargo Atual</label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Briefcase className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Ex: Desenvolvedor Full Stack"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        isLoading ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                    >
                      {isLoading ? 'Criando conta...' : 'Criar Conta'}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              <div className="flex justify-between mt-8">
                {step > 1 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={prevStep}
                    className="text-blue-700 hover:text-blue-800"
                  >
                    Voltar
                  </motion.button>
                )}
                {step < 3 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={nextStep}
                    className="ml-auto bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition duration-300"
                  >
                    Próximo
                  </motion.button>
                )}
              </div>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">
                Já tem uma conta?{' '}
                <a href="#" className="text-blue-700 hover:text-blue-800 font-medium">
                  Faça login
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Register;