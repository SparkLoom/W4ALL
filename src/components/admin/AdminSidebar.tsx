import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  FileText,
  Users,
  Newspaper,
  GraduationCap,
  HelpCircle,
  FileCheck,
  Shield,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Menu,
  Search
} from 'lucide-react';

interface AdminSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  activeSection, 
  setActiveSection, 
  isCollapsed, 
  toggleSidebar 
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jobs', label: 'Ofertas de Emprego', icon: Briefcase },
    { id: 'experiences', label: 'Experiências', icon: MessageSquare },
    { id: 'blog', label: 'Blog', icon: FileText },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'jobSearch', label: 'Pesquisa de Vagas', icon: Search },
    { id: 'careers', label: 'Carreiras', icon: GraduationCap },
    { id: 'press', label: 'Imprensa', icon: Newspaper },
    { id: 'help', label: 'Ajuda', icon: HelpCircle },
    { id: 'terms', label: 'Termos', icon: FileCheck },
    { id: 'privacy', label: 'Privacidade', icon: Shield },
    { id: 'documentation', label: 'Documentação', icon: BookOpen },
  ];

  return (
    <motion.div 
      className={`bg-white shadow-lg overflow-y-auto flex flex-col h-full transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-64'}`}
      initial={false}
      animate={{ width: isCollapsed ? 64 : 256 }}
    >
      <div className="p-4 flex justify-between items-center border-b border-gray-200">
        {!isCollapsed && (
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Administração
          </h3>
        )}
        <button 
          onClick={toggleSidebar}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          {isCollapsed ? <Menu className="h-5 w-5 text-gray-500" /> : <ChevronLeft className="h-5 w-5 text-gray-500" />}
        </button>
      </div>
      <nav className="mt-5 space-y-1 flex-grow px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              whileHover={{ x: 5 }}
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                activeSection === item.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
              {!isCollapsed && (
                <>
                  <span>{item.label}</span>
                  {activeSection === item.id && (
                    <ChevronRight className="ml-auto h-4 w-4" />
                  )}
                </>
              )}
            </motion.button>
          );
        })}
      </nav>
    </motion.div>
  );
};

export default AdminSidebar;