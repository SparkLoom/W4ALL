import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, X, Upload, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface QuickApplyProps {
  jobId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const QuickApply: React.FC<QuickApplyProps> = ({ jobId, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Você precisa estar logado para se candidatar');
      return;
    }

    try {
      setLoading(true);

      // Upload resume if provided
      let resumeUrl = null;
      if (resume) {
        const fileExt = resume.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `resumes/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, resume);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        resumeUrl = data.publicUrl;
      }

      // Create application
      const { error } = await supabase
        .from('applications')
        .insert({
          job_id: jobId,
          user_id: user.id,
          cover_letter: message,
          resume_url: resumeUrl,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Candidatura enviada com sucesso!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast.error('Erro ao enviar candidatura');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-xl p-4 z-50"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Candidatura Rápida</h2>
        <button onClick={onClose} className="text-gray-500">
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mensagem
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Por que você seria ideal para esta vaga?"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currículo (opcional)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="resume-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <span>Upload um arquivo</span>
                  <input
                    id="resume-upload"
                    name="resume-upload"
                    type="file"
                    className="sr-only"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResume(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">
                PDF, DOC até 10MB
              </p>
            </div>
          </div>
          {resume && (
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <FileText className="h-4 w-4 mr-1" />
              {resume.name}
              <button
                type="button"
                onClick={() => setResume(null)}
                className="ml-2 text-red-600 hover:text-red-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default QuickApply;