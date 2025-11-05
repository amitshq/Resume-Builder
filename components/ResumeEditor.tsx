import React, { useState, useCallback } from 'react';
import type { ResumeData, ExperienceData, ProjectData, EducationData, CertificationData, SkillData } from '../types';
import { enhanceWithAI } from '../services/geminiService';
import { AddIcon, DeleteIcon, MagicIcon, ArrowUpIcon, ArrowDownIcon } from './icons';

interface ResumeEditorProps {
  data: ResumeData;
  setData: React.Dispatch<React.SetStateAction<ResumeData>>;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
    <h2 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 text-indigo-600 dark:text-indigo-400 uppercase">{title}</h2>
    {children}
  </div>
);

const EditableSection: React.FC<{ title: string; onMoveUp: () => void; onMoveDown: () => void; isFirst: boolean; isLast: boolean; children: React.ReactNode }> = ({ title, children, onMoveUp, onMoveDown, isFirst, isLast }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6 relative">
      <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
        <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 uppercase">{title}</h2>
        <div className="flex space-x-1">
          <button onClick={onMoveUp} disabled={isFirst} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed" aria-label={`Move ${title} section up`}>
            <ArrowUpIcon />
          </button>
          <button onClick={onMoveDown} disabled={isLast} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed" aria-label={`Move ${title} section down`}>
            <ArrowDownIcon />
          </button>
        </div>
      </div>
      {children}
    </div>
  );

const InputField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string, required?: boolean }> = ({ label, name, value, onChange, placeholder, required }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
    />
  </div>
);

const TextAreaField: React.FC<{ label:string; name?:string; value:string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>)=>void; placeholder?:string; rows?:number; onEnhance?:()=>void; isEnhancing?: boolean; }> = ({label, name, value, onChange, placeholder, rows=3, onEnhance, isEnhancing}) => (
    <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            {onEnhance && (
                 <button onClick={onEnhance} disabled={isEnhancing} className="flex items-center text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:opacity-50 disabled:cursor-wait">
                     <MagicIcon />
                     <span className="ml-1">{isEnhancing ? 'Enhancing...' : 'Enhance with AI'}</span>
                 </button>
            )}
        </div>
        <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
    </div>
);


export const ResumeEditor: React.FC<ResumeEditorProps> = ({ data, setData }) => {
    const [enhancingField, setEnhancingField] = useState<string | null>(null);

    const handleEnhance = useCallback(async (field: keyof ResumeData | `experience.${string}` | `projects.${string}`, originalText: string) => {
        if (!originalText.trim()) {
            alert("Please provide some text to enhance.");
            return;
        }
        setEnhancingField(field);
        try {
            let promptContext = "";
            if (field === 'summary') promptContext = "professional summary";
            if (field.startsWith('experience.')) promptContext = "work experience description";
            if (field.startsWith('projects.')) promptContext = "project description";

            const enhancedText = await enhanceWithAI(originalText, promptContext);

            if (field === 'summary' || field === 'miscellaneous') {
                setData(prev => ({ ...prev, [field]: enhancedText }));
            } else if (field.startsWith('experience.')) {
                const id = field.split('.')[1];
                setData(prev => ({
                    ...prev,
                    experience: prev.experience.map(exp => exp.id === id ? { ...exp, description: enhancedText } : exp)
                }));
            } else if (field.startsWith('projects.')) {
                const id = field.split('.')[1];
                setData(prev => ({
                    ...prev,
                    projects: prev.projects.map(proj => proj.id === id ? { ...proj, description: enhancedText } : proj)
                }));
            }

        } catch (error) {
            console.error("AI enhancement failed:", error);
            alert("Failed to enhance text. Please check your API key and try again.");
        } finally {
            setEnhancingField(null);
        }
    }, [setData]);


  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, header: { ...prev.header, [name]: value } }));
  };
  
  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setData(prev => ({ ...prev, summary: e.target.value }));
  };
  
  const handleDynamicChange = <T extends { id: string }>(section: keyof ResumeData, id: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(prev => {
        // FIX: Cast to 'unknown' first to resolve the complex type inference issue.
        // This is safe because this function is only called for sections that are arrays of objects with an 'id'.
        const list = prev[section] as unknown as T[];
        return {
            ...prev,
            [section]: list.map(item => item.id === id ? { ...item, [name]: value } : item)
        };
    });
  };

  const addDynamicItem = <T extends object>(section: keyof ResumeData, newItem: T) => {
    setData(prev => ({ ...prev, [section]: [...(prev[section] as T[]), newItem] }));
  };
  
  const removeDynamicItem = (section: keyof ResumeData, id: string) => {
    setData(prev => ({ ...prev, [section]: (prev[section] as {id:string}[]).filter(item => item.id !== id) }));
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    setData(prev => {
      const newOrder = [...prev.sectionOrder];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      if (targetIndex < 0 || targetIndex >= newOrder.length) return prev;
      
      [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
      
      return { ...prev, sectionOrder: newOrder };
    });
  };

  const sectionComponents: { [key: string]: {title: string; content: React.ReactNode} } = {
    summary: {
      title: "Professional Summary",
      content: <TextAreaField 
          label="Summary" 
          value={data.summary} 
          onChange={handleSummaryChange} 
          rows={5}
          onEnhance={() => handleEnhance('summary', data.summary)}
          isEnhancing={enhancingField === 'summary'}
      />
    },
    experience: {
      title: "Work Experience",
      content: <>
        {data.experience.map((exp) => (
            <div key={exp.id} className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md relative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Job Title" name="title" value={exp.title} onChange={e => handleDynamicChange<ExperienceData>('experience', exp.id, e)} />
                    <InputField label="Company" name="company" value={exp.company} onChange={e => handleDynamicChange<ExperienceData>('experience', exp.id, e)} />
                    <InputField label="Start Date" name="startDate" value={exp.startDate} onChange={e => handleDynamicChange<ExperienceData>('experience', exp.id, e)} placeholder="YYYY-MM" />
                    <InputField label="End Date" name="endDate" value={exp.endDate} onChange={e => handleDynamicChange<ExperienceData>('experience', exp.id, e)} placeholder="YYYY-MM or Present"/>
                </div>
                <div className="mt-4">
                    <TextAreaField
                        label="Description & Achievements"
                        value={exp.description}
                        name="description"
                        onChange={e => handleDynamicChange<ExperienceData>('experience', exp.id, e)}
                        rows={4}
                        onEnhance={() => handleEnhance(`experience.${exp.id}`, exp.description)}
                        isEnhancing={enhancingField === `experience.${exp.id}`}
                    />
                </div>
                <button onClick={() => removeDynamicItem('experience', exp.id)} className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><DeleteIcon /></button>
            </div>
        ))}
        <button onClick={() => addDynamicItem<ExperienceData>('experience', {id: crypto.randomUUID(), title:'', company:'', startDate:'', endDate:'', description:''})} className="mt-2 text-indigo-600 dark:text-indigo-400 font-medium flex items-center space-x-1"><AddIcon /><span>Add Experience</span></button>
      </>
    },
    projects: {
        title: "Projects",
        content: <>
        {data.projects.map((proj) => (
            <div key={proj.id} className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md relative">
                <InputField label="Project Name" name="name" value={proj.name} onChange={e => handleDynamicChange<ProjectData>('projects', proj.id, e)} />
                <InputField label="Your Role" name="role" value={proj.role} onChange={e => handleDynamicChange<ProjectData>('projects', proj.id, e)} />
                <TextAreaField
                    label="Description"
                    name="description"
                    value={proj.description}
                    onChange={e => handleDynamicChange<ProjectData>('projects', proj.id, e)}
                    rows={3}
                    onEnhance={() => handleEnhance(`projects.${proj.id}`, proj.description)}
                    isEnhancing={enhancingField === `projects.${proj.id}`}
                />
                <button onClick={() => removeDynamicItem('projects', proj.id)} className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><DeleteIcon /></button>
            </div>
        ))}
        <button onClick={() => addDynamicItem<ProjectData>('projects', {id: crypto.randomUUID(), name:'', description:'', role:''})} className="mt-2 text-indigo-600 dark:text-indigo-400 font-medium flex items-center space-x-1"><AddIcon /><span>Add Project</span></button>
      </>
    },
    skills: {
        title: "Skills",
        content: <>
            {data.skills.map((skill) => (
                <div key={skill.id} className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md relative">
                    <InputField label="Skill Category" name="name" value={skill.name} onChange={e => handleDynamicChange<SkillData>('skills', skill.id, e)} placeholder="e.g. Programming Languages" />
                    <InputField label="Specific Skills (comma-separated)" name="subtypes" value={skill.subtypes} onChange={e => handleDynamicChange<SkillData>('skills', skill.id, e)} placeholder="e.g. JavaScript, React, Leadership"/>
                    <button onClick={() => removeDynamicItem('skills', skill.id)} className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><DeleteIcon /></button>
                </div>
            ))}
            <button onClick={() => addDynamicItem<SkillData>('skills', {id: crypto.randomUUID(), name:'', subtypes:''})} className="mt-2 text-indigo-600 dark:text-indigo-400 font-medium flex items-center space-x-1"><AddIcon /><span>Add Skill Category</span></button>
      </>
    },
    education: {
        title: "Education",
        content: <>
        {data.education.map((edu) => (
            <div key={edu.id} className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md relative">
                <InputField label="Institution" name="institution" value={edu.institution} onChange={e => handleDynamicChange<EducationData>('education', edu.id, e)} />
                <InputField label="Degree/Major" name="degree" value={edu.degree} onChange={e => handleDynamicChange<EducationData>('education', edu.id, e)} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Start Date" name="startDate" value={edu.startDate} onChange={e => handleDynamicChange<EducationData>('education', edu.id, e)} placeholder="YYYY-MM"/>
                  <InputField label="End Date" name="endDate" value={edu.endDate} onChange={e => handleDynamicChange<EducationData>('education', edu.id, e)} placeholder="YYYY-MM"/>
                </div>
                <button onClick={() => removeDynamicItem('education', edu.id)} className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><DeleteIcon /></button>
            </div>
        ))}
        <button onClick={() => addDynamicItem<EducationData>('education', {id: crypto.randomUUID(), institution:'', degree:'', startDate:'', endDate:''})} className="mt-2 text-indigo-600 dark:text-indigo-400 font-medium flex items-center space-x-1"><AddIcon /><span>Add Education</span></button>
      </>
    },
    certifications: {
        title: "Certifications",
        content: <>
        {data.certifications.map((cert) => (
            <div key={cert.id} className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md relative">
                <InputField label="Certification Name" name="name" value={cert.name} onChange={e => handleDynamicChange<CertificationData>('certifications', cert.id, e)} />
                <InputField label="Issuing Organization" name="issuer" value={cert.issuer} onChange={e => handleDynamicChange<CertificationData>('certifications', cert.id, e)} />
                <InputField label="Date Obtained" name="date" value={cert.date} onChange={e => handleDynamicChange<CertificationData>('certifications', cert.id, e)} placeholder="YYYY-MM" />
                <button onClick={() => removeDynamicItem('certifications', cert.id)} className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><DeleteIcon /></button>
            </div>
        ))}
        <button onClick={() => addDynamicItem<CertificationData>('certifications', {id: crypto.randomUUID(), name:'', issuer:'', date:''})} className="mt-2 text-indigo-600 dark:text-indigo-400 font-medium flex items-center space-x-1"><AddIcon /><span>Add Certification</span></button>
      </>
    },
    miscellaneous: {
        title: "Miscellaneous",
        content: <TextAreaField label="Additional Information" value={data.miscellaneous} onChange={e => setData(prev => ({...prev, miscellaneous: e.target.value}))} rows={4}/>
    }
  }


  return (
    <div>
      <Section title="Header">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Full Name" name="name" value={data.header.name} onChange={handleHeaderChange} placeholder="John Doe" required/>
            <InputField label="Professional Title" name="title" value={data.header.title} onChange={handleHeaderChange} placeholder="Senior Frontend Developer" />
            <InputField label="Phone Number" name="phone" value={data.header.phone} onChange={handleHeaderChange} />
            <InputField label="Email Address" name="email" value={data.header.email} onChange={handleHeaderChange} required/>
            <InputField label="LinkedIn Profile" name="linkedin" value={data.header.linkedin} onChange={handleHeaderChange} />
            <InputField label="Personal Website/Portfolio" name="website" value={data.header.website} onChange={handleHeaderChange} />
        </div>
      </Section>

      {data.sectionOrder.map((sectionKey, index) => {
        const section = sectionComponents[sectionKey];
        if (!section) return null;

        return (
            <EditableSection
                key={sectionKey}
                title={section.title}
                isFirst={index === 0}
                isLast={index === data.sectionOrder.length - 1}
                onMoveUp={() => handleMoveSection(index, 'up')}
                onMoveDown={() => handleMoveSection(index, 'down')}
            >
                {section.content}
            </EditableSection>
        )
      })}
    </div>
  );
};