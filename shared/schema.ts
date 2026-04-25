export interface PortfolioData {
  name: string;
  title: string;
  summary: string;
  about: string;
  skills: string[];
  projects: PortfolioProject[];
  experience: PortfolioExperience[];
  certifications?: PortfolioCertification[];
  contact: {
    email: string;
    linkedin: string;
    github: string;
  };
}

export interface PortfolioCertification {
  id: string;
  title: string;
  issuer: string;
  date: string;
  link?: string;
  source?: 'from_resume' | 'manual';
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  tech: string[];
  source?: 'from_resume' | 'derived_from_experience' | 'ai_generated' | 'manual';
  link?: string;
}

export interface PortfolioExperience {
  id: string;
  company: string;
  role: string;
  date: string;
  description: string[];
  source?: 'from_resume' | 'manual';
}
