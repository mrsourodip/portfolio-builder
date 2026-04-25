import { create } from 'zustand';
import { PortfolioData, PortfolioExperience, PortfolioProject, PortfolioCertification, defaultPortfolioData } from '../types/schema';

interface PortfolioState {
  data: PortfolioData;
  setData: (data: PortfolioData) => void;
  updateField: (field: keyof PortfolioData, value: any) => void;
  updateContact: (field: keyof PortfolioData['contact'], value: string) => void;
  // Skills
  addSkill: (value: string) => void;
  removeSkill: (index: number) => void;
  updateSkill: (index: number, value: string) => void;
  // Experience
  updateExperience: (index: number, exp: PortfolioExperience) => void;
  addExperience: () => void;
  removeExperience: (index: number) => void;
  reorderExperience: (from: number, to: number) => void;
  // Projects
  updateProject: (index: number, proj: PortfolioProject) => void;
  addProject: () => void;
  removeProject: (index: number) => void;
  reorderProjects: (from: number, to: number) => void;
  // Certifications
  updateCertification: (index: number, cert: PortfolioCertification) => void;
  addCertification: () => void;
  removeCertification: (index: number) => void;
  reorderCertifications: (from: number, to: number) => void;
  // Resume file
  resumeUrl: string | null;
  setResumeUrl: (url: string | null) => void;
  // Upload state
  isUploading: boolean;
  setIsUploading: (val: boolean) => void;
}

function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const newArr = [...arr];
  const [item] = newArr.splice(from, 1);
  newArr.splice(to, 0, item);
  return newArr;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  data: defaultPortfolioData,
  setData: (data) => set({ data }),
  updateField: (field, value) => set((state) => ({ data: { ...state.data, [field]: value } })),
  updateContact: (field, value) => set((state) => ({
    data: { ...state.data, contact: { ...state.data.contact, [field]: value } }
  })),
  // Skills
  addSkill: (value) => set((state) => ({ data: { ...state.data, skills: [...state.data.skills, value] } })),
  removeSkill: (index) => set((state) => ({
    data: { ...state.data, skills: state.data.skills.filter((_, i) => i !== index) }
  })),
  updateSkill: (index, value) => set((state) => {
    const s = [...state.data.skills]; s[index] = value;
    return { data: { ...state.data, skills: s } };
  }),
  // Experience
  updateExperience: (index, exp) => set((state) => {
    const e = [...state.data.experience]; e[index] = exp;
    return { data: { ...state.data, experience: e } };
  }),
  addExperience: () => set((state) => ({
    data: { ...state.data, experience: [...state.data.experience, { id: `e${Date.now()}`, company: "", role: "", date: "", description: [""], source: "manual" as const }] }
  })),
  removeExperience: (index) => set((state) => ({
    data: { ...state.data, experience: state.data.experience.filter((_, i) => i !== index) }
  })),
  reorderExperience: (from, to) => set((state) => ({
    data: { ...state.data, experience: arrayMove(state.data.experience, from, to) }
  })),
  // Projects
  updateProject: (index, proj) => set((state) => {
    const p = [...state.data.projects]; p[index] = proj;
    return { data: { ...state.data, projects: p } };
  }),
  addProject: () => set((state) => ({
    data: { ...state.data, projects: [...state.data.projects, { id: `p${Date.now()}`, title: "", description: "", tech: [], source: "manual" as const, link: "" }] }
  })),
  removeProject: (index) => set((state) => ({
    data: { ...state.data, projects: state.data.projects.filter((_, i) => i !== index) }
  })),
  reorderProjects: (from, to) => set((state) => ({
    data: { ...state.data, projects: arrayMove(state.data.projects, from, to) }
  })),
  // Certifications
  updateCertification: (index, cert) => set((state) => {
    const c = [...(state.data.certifications || [])]; c[index] = cert;
    return { data: { ...state.data, certifications: c } };
  }),
  addCertification: () => set((state) => ({
    data: { ...state.data, certifications: [...(state.data.certifications || []), { id: `c${Date.now()}`, title: "", issuer: "", date: "", link: "", source: "manual" as const }] }
  })),
  removeCertification: (index) => set((state) => ({
    data: { ...state.data, certifications: (state.data.certifications || []).filter((_, i) => i !== index) }
  })),
  reorderCertifications: (from, to) => set((state) => ({
    data: { ...state.data, certifications: arrayMove((state.data.certifications || []), from, to) }
  })),
  // Resume
  resumeUrl: null,
  setResumeUrl: (url) => set({ resumeUrl: url }),
  // Upload
  isUploading: false,
  setIsUploading: (val) => set({ isUploading: val }),
}));
