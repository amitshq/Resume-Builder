export interface HeaderData {
  name: string;
  title: string;
  phone: string;
  email: string;
  linkedin: string;
  website: string;
}

export interface ExperienceData {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  role: string;
}

export interface CertificationData {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface EducationData {
  id:string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface SkillData {
  id: string;
  name: string;
  subtypes: string;
}

export interface ResumeData {
  header: HeaderData;
  summary: string;
  experience: ExperienceData[];
  projects: ProjectData[];
  certifications: CertificationData[];
  skills: SkillData[];
  education: EducationData[];
  miscellaneous: string;
  sectionOrder: (keyof Omit<ResumeData, 'header' | 'sectionOrder'>)[];
}
