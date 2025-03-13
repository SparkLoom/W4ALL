import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, FileText, Plus, Trash2, Edit2, Save, Layout, Image as ImageIcon, Link as LinkIcon, Award, Book, Briefcase, Calendar, MapPin, Mail, Phone, Globe, Github as GitHub, Linkedin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ResumeData {
  template: string;
  personalInfo: {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
    github?: string;
    linkedin?: string;
    bio: string;
  };
  education: {
    id: string;
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    description?: string;
  }[];
  experience: {
    id: string;
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    achievements: string[];
  }[];
  skills: {
    id: string;
    name: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    category: string;
  }[];
  projects: {
    id: string;
    name: string;
    description: string;
    url?: string;
    technologies: string[];
    image?: string;
  }[];
  certifications: {
    id: string;
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialUrl?: string;
  }[];
}

const defaultResumeData: ResumeData = {
  template: 'modern',
  personalInfo: {
    fullName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    bio: ''
  },
  education: [],
  experience: [],
  skills: [],
  projects: [],
  certifications: []
};

const ResumeBuilder = () => {
  const { user } = useAuth();
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<keyof ResumeData>('personalInfo');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (user) {
      loadResumeData();
    }
  }, [user]);

  const loadResumeData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('resumes')
        .select('data')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No resume found, use default
          return;
        }
        throw error;
      }

      if (data) {
        setResumeData(data.data);
      }
    } catch (error) {
      console.error('Error loading resume:', error);
      toast.error('Error loading resume data');
    } finally {
      setLoading(false);
    }
  };

  const saveResumeData = async () => {
    if (!user) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('resumes')
        .upsert({
          user_id: user.id,
          data: resumeData
        });

      if (error) throw error;

      toast.success('Resume saved successfully');
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Error saving resume');
    } finally {
      setSaving(false);
    }
  };

  const handlePersonalInfoChange = (field: keyof ResumeData['personalInfo'], value: string) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: Math.random().toString(36).substr(2, 9),
          school: '',
          degree: '',
          field: '',
          startDate: '',
          endDate: '',
          description: ''
        }
      ]
    }));
  };

  const updateEducation = (id: string, field: keyof ResumeData['education'][0], value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: Math.random().toString(36).substr(2, 9),
          company: '',
          position: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          description: '',
          achievements: []
        }
      ]
    }));
  };

  const updateExperience = (id: string, field: keyof ResumeData['experience'][0], value: any) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const addSkill = () => {
    setResumeData(prev => ({
      ...prev,
      skills: [
        ...prev.skills,
        {
          id: Math.random().toString(36).substr(2, 9),
          name: '',
          level: 'Beginner',
          category: ''
        }
      ]
    }));
  };

  const updateSkill = (id: string, field: keyof ResumeData['skills'][0], value: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.map(skill => 
        skill.id === id ? { ...skill, [field]: value } : skill
      )
    }));
  };

  const removeSkill = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.id !== id)
    }));
  };

  const exportToPDF = async () => {
    const resumeElement = document.getElementById('resume-preview');
    if (!resumeElement) return;

    try {
      const canvas = await html2canvas(resumeElement);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_resume.pdf`);
      
      toast.success('Resume exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Error exporting resume');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>
              <p className="mt-2 text-gray-600">Create and manage your professional resume</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                {previewMode ? (
                  <>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Mode
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Preview
                  </>
                )}
              </button>
              <button
                onClick={exportToPDF}
                className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </button>
            </div>
          </div>

          <div className="flex gap-8">
            {!previewMode && (
              <div className="w-1/3">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <nav className="space-y-1">
                    {Object.keys(resumeData).map((section) => (
                      <button
                        key={section}
                        onClick={() => setActiveSection(section as keyof ResumeData)}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                          activeSection === section
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {section.charAt(0).toUpperCase() + section.slice(1)}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            )}

            <div className={previewMode ? 'w-full' : 'w-2/3'}>
              <div className="bg-white rounded-lg shadow-lg p-6">
                {previewMode ? (
                  <div id="resume-preview" className="max-w-4xl mx-auto">
                    {/* Resume Preview */}
                    <div className="text-center mb-8">
                      <h1 className="text-3xl font-bold text-gray-900">
                        {resumeData.personalInfo.fullName}
                      </h1>
                      <p className="text-xl text-gray-600 mt-2">
                        {resumeData.personalInfo.title}
                      </p>
                      <div className="flex justify-center items-center space-x-4 mt-4 text-gray-600">
                        {resumeData.personalInfo.email && (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {resumeData.personalInfo.email}
                          </div>
                        )}
                        {resumeData.personalInfo.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {resumeData.personalInfo.phone}
                          </div>
                        )}
                        {resumeData.personalInfo.location && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {resumeData.personalInfo.location}
                          </div>
                        )}
                      </div>
                    </div>

                    {resumeData.personalInfo.bio && (
                      <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">About</h2>
                        <p className="text-gray-600">{resumeData.personalInfo.bio}</p>
                      </div>
                    )}

                    {resumeData.experience.length > 0 && (
                      <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Experience</h2>
                        <div className="space-y-6">
                          {resumeData.experience.map((exp) => (
                            <div key={exp.id}>
                              <h3 className="text-lg font-medium text-gray-900">
                                {exp.position} at {exp.company}
                              </h3>
                              <p className="text-gray-600">
                                {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                              </p>
                              <p className="text-gray-600 mt-2">{exp.description}</p>
                              {exp.achievements.length > 0 && (
                                <ul className="mt-2 list-disc list-inside text-gray-600">
                                  {exp.achievements.map((achievement, index) => (
                                    <li key={index}>{achievement}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {resumeData.education.length > 0 && (
                      <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Education</h2>
                        <div className="space-y-6">
                          {resumeData.education.map((edu) => (
                            <div key={edu.id}>
                              <h3 className="text-lg font-medium text-gray-900">
                                {edu.degree} in {edu.field}
                              </h3>
                              <p className="text-gray-600">{edu.school}</p>
                              <p className="text-gray-600">
                                {edu.startDate} - {edu.endDate}
                              </p>
                              {edu.description && (
                                <p className="text-gray-600 mt-2">{edu.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {resumeData.skills.length > 0 && (
                      <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                          {resumeData.skills.map((skill) => (
                            <span
                              key={skill.id}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                            >
                              {skill.name} - {skill.level}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {resumeData.certifications.length > 0 && (
                      <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Certifications</h2>
                        <div className="space-y-4">
                          {resumeData.certifications.map((cert) => (
                            <div key={cert.id}>
                              <h3 className="text-lg font-medium text-gray-900">
                                {cert.name}
                              </h3>
                              <p className="text-gray-600">
                                {cert.issuer} - {cert.issueDate}
                              </p>
                              {cert.credentialUrl && (
                                <a
                                  href={cert.credentialUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  View Credential
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {/* Edit Forms */}
                    {activeSection === 'personalInfo' && (
                      <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={resumeData.personalInfo.fullName}
                              onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Professional Title
                            </label>
                            <input
                              type="text"
                              value={resumeData.personalInfo.title}
                              onChange={(e) => handlePersonalInfoChange('title', e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Email
                            </label>
                            <input
                              type="email"
                              value={resumeData.personalInfo.email}
                              onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Phone
                            </label>
                            <input
                              type="tel"
                              value={resumeData.personalInfo.phone}
                              onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Location
                            </label>
                            <input
                              type="text"
                              value={resumeData.personalInfo.location}
                              onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Professional Summary
                            </label>
                            <textarea
                              value={resumeData.personalInfo.bio}
                              onChange={(e) => handlePersonalInfoChange('bio', e.target.value)}
                              rows={4}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSection === 'experience' && (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <h2 className="text-xl font-semibold text-gray-900">Experience</h2>
                          <button
                            onClick={addExperience}
                            className="flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Experience
                          </button>
                        </div>
                        
                        {resumeData.experience.map((exp) => (
                          <div key={exp.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Company
                                </label>
                                <input
                                  type="text"
                                  value={exp.company}
                                  onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Position
                                </label>
                                <input
                                  type="text"
                                  value={exp.position}
                                  onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Start Date
                                </label>
                                <input
                                  type="date"
                                  value={exp.startDate}
                                  onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  End Date
                                </label>
                                <input
                                  type="date"
                                  value={exp.endDate}
                                  disabled={exp.current}
                                  onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <div className="mt-2">
                                  <label className="inline-flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={exp.current}
                                      onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">Current Position</span>
                                  </label>
                                </div>
                              </div>
                              <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  Description
                                </label>
                                <textarea
                                  value={exp.description}
                                  onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                                  rows={4}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                              <button
                                onClick={() => removeExperience(exp.id)}
                                className="flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeSection === 'education' && (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <h2 className="text-xl font-semibold text-gray-900">Education</h2>
                          <button
                            onClick={addEducation}
                            className="flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Education
                          </button>
                        </div>
                        
                        {resumeData.education.map((edu) => (
                          <div key={edu.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  School
                                </label>
                                <input
                                  type="text"
                                  value={edu.school}
                                  onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Degree
                                </label>
                                <input
                                  type="text"
                                  value={edu.degree}
                                  onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Field of Study
                                </label>
                                <input
                                  type="text"
                                  value={edu.field}
                                  onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Start Date
                                </label>
                                <input
                                  type="date"
                                  value={edu.startDate}
                                  onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  End Date
                                </label>
                                <input
                                  type="date"
                                  value={edu.endDate}
                                  onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                              <button
                                onClick={() => removeEducation(edu.id)}
                                className="flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeSection === 'skills' && (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <h2 className="text-xl font-semibold text-gray-900">Skills</h2>
                          <button
                            onClick={addSkill}
                            className="flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Skill
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                          {resumeData.skills.map((skill) => (
                            <div key={skill.id} className="flex items-center space-x-4">
                 ```tsx
                              <input
                                type="text"
                                value={skill.name}
                                onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                                placeholder="Skill name"
                                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                              <select
                                value={skill.level}
                                onChange={(e) => updateSkill(skill.id, 'level', e.target.value as ResumeData['skills'][0]['level'])}
                                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Expert">Expert</option>
                              </select>
                              <input
                                type="text"
                                value={skill.category}
                                onChange={(e) => updateSkill(skill.id, 'category', e.target.value)}
                                placeholder="Category"
                                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                              <button
                                onClick={() => removeSkill(skill.id)}
                                className="p-2 text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!previewMode && (
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={saveResumeData}
                      disabled={saving}
                      className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResumeBuilder;