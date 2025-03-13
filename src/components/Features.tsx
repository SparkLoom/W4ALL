import React from 'react';
import { Users, TrendingUp, Globe, Heart, Zap, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    name: 'Comunidade Ativa',
    description: 'Compartilhe experiências e aprenda com outros profissionais.',
    icon: Users,
    color: 'from-green-600 to-green-400',
    comingSoon: false
  },
  {
    name: 'Desenvolvimento Profissional',
    description: 'Dicas e recursos para impulsionar sua carreira.',
    icon: TrendingUp,
    color: 'from-purple-600 to-purple-400',
    comingSoon: false
  },
  {
    name: 'Alcance Global',
    description: 'Conecte-se com oportunidades em todo o mundo.',
    icon: Globe,
    color: 'from-indigo-600 to-indigo-400',
    comingSoon: true
  },
  {
    name: 'Suporte Personalizado',
    description: 'Equipe dedicada para ajudar em sua jornada profissional.',
    icon: Heart,
    color: 'from-orange-600 to-orange-400',
    comingSoon: false
  },
  {
    name: 'Processo Simplificado',
    description: 'Interface intuitiva e fácil de usar para todos os usuários.',
    icon: Zap,
    color: 'from-lime-600 to-lime-400',
    comingSoon: true
  },
  {
    name: 'Benefícios Exclusivos',
    description: 'Descontos e vantagens especiais em serviços parceiros.',
    icon: Gift,
    color: 'from-violet-600 to-violet-400',
    comingSoon: true
  },
];

const Features = () => {
  return (
    <div className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="lg:text-center"
        >
          <h2 className="text-base text-blue-700 font-semibold tracking-wide uppercase">Benefícios</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Por que escolher a Work4All?
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Conectamos talentos às melhores oportunidades do mercado de trabalho com recursos exclusivos.
          </p>
        </motion.div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="relative bg-white p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                {feature.comingSoon && (
                  <div className="absolute top-0 right-0 bg-yellow-500 text-white px-3 py-1 transform rotate-45 translate-x-7 -translate-y-0 shadow-md z-10">
                    <span className="text-xs font-bold">Em breve</span>
                  </div>
                )}
                <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.color} shadow-lg`}>
                  <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="mt-8 text-center">
                  <h3 className="text-xl font-medium text-gray-900 mb-4">{feature.name}</h3>
                  <p className="text-base text-gray-500 mb-4">{feature.description}</p>
                  {feature.comingSoon && (
                    <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-md p-2">
                      <p className="text-sm text-yellow-700">Esta funcionalidade estará disponível brevemente.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Features;