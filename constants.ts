import type { ResumeData } from './types';

export const initialResumeData: ResumeData = {
  header: {
    name: 'Your Name',
    title: 'Professional Title',
    phone: '(123) 456-7890',
    email: 'your.email@example.com',
    linkedin: 'linkedin.com/in/yourprofile',
    website: 'yourportfolio.com',
  },
  summary: 'A brief overview of your professional background, skills, and career objectives. Highlight your most relevant qualifications and experience that match the job you are applying for. Keep it concise and impactful.',
  experience: [
    {
      id: crypto.randomUUID(),
      title: 'Job Title',
      company: 'Company Name',
      startDate: '2020-01',
      endDate: 'Present',
      description: '- Describe your responsibilities and achievements.\n- Use bullet points to make it easy to read.\n- Quantify your accomplishments with numbers and metrics where possible.',
    },
  ],
  projects: [
    {
      id: crypto.randomUUID(),
      name: 'Project Name',
      description: 'A short description of the project, its goals, and the technologies used.',
      role: 'Your Role/Contributions',
    },
  ],
  certifications: [
    {
      id: crypto.randomUUID(),
      name: 'Certification Name',
      issuer: 'Issuing Organization',
      date: '2021-06',
    },
  ],
  skills: [
    { id: crypto.randomUUID(), name: 'Programming Languages', subtypes: 'JavaScript, TypeScript, Python' },
    { id: crypto.randomUUID(), name: 'Frameworks & Libraries', subtypes: 'React, Node.js, Tailwind CSS' },
    { id: crypto.randomUUID(), name: 'Soft Skills', subtypes: 'Problem Solving, Communication, Teamwork' }
  ],
  education: [
    {
      id: crypto.randomUUID(),
      institution: 'University Name',
      degree: 'Degree and Major',
      startDate: '2016-09',
      endDate: '2020-05',
    },
  ],
  miscellaneous: 'Hobbies, languages, or volunteer experiences.',
  sectionOrder: [
    'summary',
    'experience',
    'projects',
    'education',
    'skills',
    'certifications',
    'miscellaneous',
  ],
};
