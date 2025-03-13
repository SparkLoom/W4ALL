import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminContentManagementProps {
  section: string;
}

const AdminContentManagement: React.FC<AdminContentManagementProps> = ({ section }) => {
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, [section]);

  const fetchContent = () => {
    // Simulated API call to fetch content
    setLoading(true);
    setTimeout(() => {
      let sampleContent = '';
      
      switch (section) {
        case 'careers':
          sampleContent = `
# Carreiras na Work4All

Junte-se à nossa equipe e faça parte de uma empresa inovadora que está transformando o mercado de trabalho.

## Vagas Abertas

### Desenvolvedor Full Stack
- Experiência com React, Node.js e bancos de dados SQL
- Conhecimento em metodologias ágeis (Scrum, Kanban)
- Capacidade de resolver problemas de forma autônoma
          `;
          break;

        default:
          sampleContent = 'Selecione uma seção válida.';
      }

      setContent(sampleContent);
      setLoading(false);
    }, 1000);
  };

  return (
    <div>
      {loading ? <p>Carregando...</p> : <pre>{content}</pre>}
    </div>
  );
};

export default AdminContentManagement;