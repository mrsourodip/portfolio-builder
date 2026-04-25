"use client";

import React, { useRef, useState } from 'react';
import { usePortfolioStore } from '../store/portfolioStore';
import { Upload, Download, Loader2, X, Plus, Trash2, ChevronDown, ChevronRight, GripVertical, Sparkles, Pencil, Library } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PortfolioExperience, PortfolioProject } from '../types/schema';

const GithubIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
    <path d="M9 18c-4.51 2-5-2-7-2"></path>
  </svg>
);

// Full-screen loading overlay
function LoadingOverlay({ message }: { message: string }) {
  return (
    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-slate-700 border-t-teal-400 animate-spin" />
      </div>
      <p className="text-sm text-slate-300 font-medium animate-pulse">{message}</p>
    </div>
  );
}

// Subcomponents for sorting
function SortableExpCard({ id, index, exp, expandedExp, toggleExp, updateExperience, removeExperience, inputClass, handleImprove }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 1, opacity: isDragging ? 0.6 : 1, position: 'relative' as const };

  return (
    <div ref={setNodeRef} style={style} className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
       <div className="flex items-center p-1 border-b border-slate-800/50 bg-slate-900/40">
          <button {...attributes} {...listeners} className="p-2 cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300 touch-none">
             <GripVertical className="w-4 h-4" />
          </button>
          <div role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && toggleExp(index)} onClick={() => toggleExp(index)} className="flex-1 flex items-center justify-between p-2 pl-0 text-left hover:bg-slate-800/50 transition-colors cursor-pointer outline-none focus:bg-slate-800/50">
            <div className="flex items-center gap-2 truncate">
              <span className="text-sm text-slate-300 truncate">{exp.role || exp.company || `Experience ${index + 1}`}</span>
              {exp.source && (
                <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  exp.source === 'manual' ? 'bg-orange-400/10 text-orange-400' :
                  'bg-emerald-400/10 text-emerald-400'
                }`}>
                  {exp.source === 'manual' ? 'MANUAL' : 'RESUME'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button disabled={isDragging} onClick={(e) => { e.stopPropagation(); removeExperience(index); }} className="text-slate-600 hover:text-red-400 transition-colors z-10 relative">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              {expandedExp.has(index) ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
            </div>
          </div>
       </div>
       {expandedExp.has(index) && !isDragging && (
         <div className="p-4 pt-3 space-y-3 bg-slate-900">
             <input type="text" value={exp.role} onChange={(e) => updateExperience(index, { ...exp, role: e.target.value })} placeholder="Role" className={inputClass} />
             <input type="text" value={exp.company} onChange={(e) => updateExperience(index, { ...exp, company: e.target.value })} placeholder="Company" className={inputClass} />
             <input type="text" value={exp.date} onChange={(e) => updateExperience(index, { ...exp, date: e.target.value })} placeholder="Date range" className={inputClass} />
             <div className="space-y-2 relative">
               <label className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-2">
                 Bullet Points
               </label>
               {(Array.isArray(exp.description) ? exp.description : [exp.description || ""]).map((point: string, pi: number) => (
                 <div key={pi} className="flex gap-2 items-start relative">
                   <span className="text-slate-600 text-xs mt-3">•</span>
                   <div className="flex-1 relative flex flex-col gap-1">
                     <textarea
                       value={point}
                       onChange={(e) => {
                         const newDesc = [...(Array.isArray(exp.description) ? exp.description : [exp.description || ""])];
                         newDesc[pi] = e.target.value;
                         updateExperience(index, { ...exp, description: newDesc });
                       }}
                       className={`${inputClass} min-h-[60px] text-sm`}
                       placeholder={`Point ${pi + 1}`}
                     />
                     <button
                       onClick={() => handleImprove('experience_bullet', point, (imp: string) => {
                         const newDesc = [...(Array.isArray(exp.description) ? exp.description : [exp.description || ""])];
                         newDesc[pi] = imp;
                         updateExperience(index, { ...exp, description: newDesc });
                       })}
                       className="self-start flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded text-purple-400 hover:bg-purple-500/20 transition-colors -mt-0.5 mb-1"
                     >
                       {(!point || point.trim() === '' || exp.source === 'manual') ? (
                         <>Write <Pencil className="w-3 h-3" /></>
                       ) : (
                         <>Improve <Sparkles className="w-3 h-3" /></>
                       )}
                     </button>
                   </div>
                   <button
                     onClick={() => {
                       const newDesc = (Array.isArray(exp.description) ? exp.description : [exp.description || ""]).filter((_: string, idx: number) => idx !== pi);
                       updateExperience(index, { ...exp, description: newDesc });
                     }}
                     className="text-slate-600 hover:text-red-400 mt-2 p-1"
                   >
                     <X className="w-4 h-4" />
                   </button>
                 </div>
               ))}
               <button onClick={() => {
                   const newDesc = [...(Array.isArray(exp.description) ? exp.description : [exp.description || ""]), ""];
                   updateExperience(index, { ...exp, description: newDesc });
                 }}
                 className="text-[10px] text-teal-500 hover:text-teal-400 flex items-center gap-1 mt-2"
               >
                 <Plus className="w-3 h-3" /> Add bullet
               </button>
             </div>
         </div>
       )}
    </div>
  );
}

function SortableCertCard({ id, index, cert, expandedCert, toggleCert, updateCertification, removeCertification, inputClass }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 1, opacity: isDragging ? 0.6 : 1, position: 'relative' as const };

  return (
    <div ref={setNodeRef} style={style} className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
       <div className="flex items-center p-1 border-b border-slate-800/50 bg-slate-900/40">
          <button {...attributes} {...listeners} className="p-2 cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300 touch-none">
             <GripVertical className="w-4 h-4" />
          </button>
          <div role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && toggleCert(index)} onClick={() => toggleCert(index)} className="flex-1 flex items-center justify-between p-2 pl-0 text-left hover:bg-slate-800/50 transition-colors cursor-pointer outline-none focus:bg-slate-800/50">
            <div className="flex items-center gap-2 truncate">
              <span className="text-sm text-slate-300 truncate">{cert.title || `Certification ${index + 1}`}</span>
              {cert.source && (
                <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  cert.source === 'manual' ? 'bg-orange-400/10 text-orange-400' :
                  'bg-emerald-400/10 text-emerald-400'
                }`}>
                  {cert.source === 'manual' ? 'MANUAL' : 'RESUME'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button disabled={isDragging} onClick={(e) => { e.stopPropagation(); removeCertification(index); }} className="text-slate-600 hover:text-red-400 transition-colors z-10 relative">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              {expandedCert.has(index) ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
            </div>
          </div>
       </div>
       {expandedCert.has(index) && !isDragging && (
         <div className="p-4 pt-3 space-y-3 bg-slate-900">
             <input type="text" value={cert.title} onChange={(e) => updateCertification(index, { ...cert, title: e.target.value })} placeholder="Certification Title" className={inputClass} />
             <input type="text" value={cert.issuer} onChange={(e) => updateCertification(index, { ...cert, issuer: e.target.value })} placeholder="Issuer (e.g. Coursera, AWS)" className={inputClass} />
             <input type="text" value={cert.date} onChange={(e) => updateCertification(index, { ...cert, date: e.target.value })} placeholder="Date / Year" className={inputClass} />
             <input type="text" value={cert.link || ''} onChange={(e) => updateCertification(index, { ...cert, link: e.target.value })} placeholder="Credential URL" className={inputClass} />
         </div>
       )}
    </div>
  );
}

function SortableProjCard({ id, index, proj, expandedProj, toggleProj, updateProject, removeProject, inputClass, handleImprove }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 1, opacity: isDragging ? 0.6 : 1, position: 'relative' as const };

  return (
    <div ref={setNodeRef} style={style} className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
       <div className="flex items-center p-1 border-b border-slate-800/50 bg-slate-900/40">
          <button {...attributes} {...listeners} className="p-2 cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300 touch-none">
             <GripVertical className="w-4 h-4" />
          </button>
          <div role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && toggleProj(index)} onClick={() => toggleProj(index)} className="flex-1 flex items-center justify-between p-2 pl-0 text-left hover:bg-slate-800/50 transition-colors cursor-pointer outline-none focus:bg-slate-800/50">
            <div className="flex items-center gap-2 truncate">
              <span className="text-sm text-slate-300 truncate">{proj.title || `Project ${index + 1}`}</span>
              {proj.source && (
                <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  proj.source === 'manual' ? 'bg-orange-400/10 text-orange-400' :
                  proj.source === 'ai_generated' ? 'bg-purple-400/10 text-purple-400' :
                  proj.source === 'derived_from_experience' ? 'bg-blue-400/10 text-blue-400' :
                  'bg-emerald-400/10 text-emerald-400'
                }`}>
                  {proj.source === 'manual' ? 'MANUAL' : proj.source === 'ai_generated' ? 'AI' : proj.source === 'derived_from_experience' ? 'EXP' : 'RESUME'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button disabled={isDragging} onClick={(e) => { e.stopPropagation(); removeProject(index); }} className="text-slate-600 hover:text-red-400 transition-colors z-10 relative">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              {expandedProj.has(index) ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
            </div>
          </div>
       </div>
       {expandedProj.has(index) && !isDragging && (
         <div className="p-4 pt-3 space-y-3 bg-slate-900">
             <input type="text" value={proj.title} onChange={(e) => updateProject(index, { ...proj, title: e.target.value })} placeholder="Project title" className={inputClass} />
               <div className="flex items-center justify-between mb-1">
                 <label className="text-[10px] text-slate-500 uppercase tracking-wider">Description</label>
                 <button
                   onClick={() => handleImprove('project_description', proj.description, (imp: string) => {
                     updateProject(index, { ...proj, description: imp });
                   })}
                   className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded text-purple-400 hover:bg-purple-500/20 transition-colors"
                 >
                   {(!proj.description || proj.description.trim() === '' || proj.source === 'manual') ? (
                     <>Write <Pencil className="w-3 h-3" /></>
                   ) : (
                     <>Improve <Sparkles className="w-3 h-3" /></>
                   )}
                 </button>
               </div>
               <textarea value={proj.description} onChange={(e) => updateProject(index, { ...proj, description: e.target.value })} placeholder="Description" className={`${inputClass} min-h-[80px] text-sm`} />
             <input type="text" value={proj.link || ''} onChange={(e) => updateProject(index, { ...proj, link: e.target.value })} placeholder="Link (optional)" className={inputClass} />
             <input
               type="text"
               value={proj.tech?.join(', ') || ''}
               onChange={(e) => updateProject(index, { ...proj, tech: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
               placeholder="Tech stack (comma-separated)"
               className={inputClass}
             />
         </div>
       )}
    </div>
  );
}

export default function EditorSidebar() {
  const {
    data, updateField, updateContact, addSkill, removeSkill,
    updateExperience, addExperience, removeExperience, reorderExperience,
    updateProject, addProject, removeProject, reorderProjects,
    updateCertification, addCertification, removeCertification, reorderCertifications,
    isUploading, setIsUploading, setData, setResumeUrl
  } = usePortfolioStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newSkill, setNewSkill] = useState("");
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [githubToken, setGithubToken] = useState("");
  const [showTokenHelp, setShowTokenHelp] = useState(false);
  const [repoName, setRepoName] = useState("my-portfolio");
  const [isDeploying, setIsDeploying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [deployUrl, setDeployUrl] = useState("");
  const [deployRepoUrl, setDeployRepoUrl] = useState("");
  const [deployStatus, setDeployStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [expandedExp, setExpandedExp] = useState<Set<number>>(new Set([0]));
  const [expandedProj, setExpandedProj] = useState<Set<number>>(new Set([0]));
  const [expandedCert, setExpandedCert] = useState<Set<number>>(new Set([0]));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const toggleExp = (i: number) => {
    setExpandedExp(prev => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; });
  };
  const toggleProj = (i: number) => {
    setExpandedProj(prev => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; });
  };
  const toggleCert = (i: number) => {
    setExpandedCert(prev => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);
    const formData = new FormData();
    formData.append("resume", file);
    try {
      const res = await fetch("http://localhost:3005/api/upload", { method: "POST", body: formData });
      const parsedData = await res.json();
      if (res.ok) {
        setData(parsedData.data);
        if (parsedData.resumeUrl) setResumeUrl(parsedData.resumeUrl);
        toast.success('Resume parsed successfully!');
      } else {
        toast.error(parsedData.error || "Upload failed. Ensure backend is running and Gemini API key is set.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to backend API.");
    } finally {
      setIsUploading(false);
    }
  };

  const downloadZip = async () => {
    setIsExporting(true);
    const exportPromise = fetch("http://localhost:3005/api/export", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ portfolioData: data })
    }).then(async (res) => {
      if (!res.ok) throw new Error("Failed to export");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "portfolio.zip"; a.click();
      window.URL.revokeObjectURL(url);
    });

    toast.promise(exportPromise, {
      loading: 'Generating portfolio ZIP...',
      success: 'Downloaded successfully!',
      error: 'Error generating ZIP.',
    }).finally(() => setIsExporting(false));
  };

  const handleDeploy = async () => {
    if (!githubToken || !repoName) return toast.error("Please enter token and repo name.");
    setIsDeploying(true); setDeployStatus('idle');
    
    const deployPromise = fetch("http://localhost:3005/api/deploy", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ portfolioData: data, githubToken, repoName })
    }).then(async (res) => {
      const result = await res.json();
      if (!res.ok) {
        setDeployStatus('error');
        throw new Error(result.error || "Deploy failed");
      }
      setDeployUrl(result.url);
      setDeployRepoUrl(result.repoUrl || '');
      setDeployStatus('success');
      return result;
    });

    toast.promise(deployPromise, {
      loading: 'Deploying to GitHub...',
      success: 'Your portfolio is live! GitHub Pages may take 1–2 minutes to build.',
      error: (err) => err.message,
    }).finally(() => setIsDeploying(false));
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim()) { addSkill(newSkill.trim()); setNewSkill(""); }
  };

  const handleImprove = async (type: string, text: string, onSuccess: (improved: string) => void) => {
    if (!text || text.trim() === '') {
       toast.error("Please enter some text to improve first.");
       return;
    }
    const promise = fetch("http://localhost:3005/api/improve", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ type, text })
    }).then(async res => {
       const result = await res.json();
       if (!res.ok) throw new Error(result.error);
       onSuccess(result.improved);
    });
  
    toast.promise(promise, {
       loading: 'Improving with AI...',
       success: 'Improved successfully! ✨',
       error: 'Failed to improve text.',
    });
  }

  const handleDragEndExp = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = data.experience.findIndex((e) => e.id === active.id);
      const newIndex = data.experience.findIndex((e) => e.id === over.id);
      reorderExperience(oldIndex, newIndex);
    }
  };

  const handleDragEndProj = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = data.projects.findIndex((p) => p.id === active.id);
      const newIndex = data.projects.findIndex((p) => p.id === over.id);
      reorderProjects(oldIndex, newIndex);
    }
  };

  const handleDragEndCert = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = (data.certifications || []).findIndex((c) => c.id === active.id);
      const newIndex = (data.certifications || []).findIndex((c) => c.id === over.id);
      reorderCertifications(oldIndex, newIndex);
    }
  };

  const inputClass = "w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none text-slate-200 placeholder:text-slate-600";

  return (
    <div className="w-full h-full bg-slate-900 border-r border-slate-800 flex flex-col text-slate-200 overflow-hidden relative">

      {/* Loading overlays */}
      {isUploading && <LoadingOverlay message="Parsing resume with AI..." />}

      {/* Header */}
      <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/95 backdrop-blur-sm sticky top-0 z-20 shadow-sm">
        <h1 className="text-lg font-bold tracking-tight text-white">Portfolio Builder</h1>
        <div className="flex gap-2">
          <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors" title="Upload Resume">
            <Upload className="w-4 h-4" />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx" onChange={handleUpload} />
          <button disabled={isExporting} onClick={downloadZip} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors" title="Download ZIP">
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          </button>
          <button onClick={() => setShowDeployModal(true)} className="p-2 bg-teal-600 hover:bg-teal-500 rounded-md transition-colors text-white flex items-center gap-2 px-3" title="Deploy to GitHub">
            <GithubIcon className="w-4 h-4" />
            <span className="text-xs font-semibold hidden xl:inline">Deploy</span>
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">

        {/* Basic Info */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Basic Info</h2>
          <div>
            <label className="block text-[10px] text-slate-600 uppercase tracking-wider mb-1">Name</label>
            <input type="text" value={data.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Name" className={inputClass} />
          </div>
          <div>
            <label className="block text-[10px] text-slate-600 uppercase tracking-wider mb-1">Title</label>
            <input type="text" value={data.title} onChange={(e) => updateField('title', e.target.value)} placeholder="Title" className={inputClass} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] text-slate-600 uppercase tracking-wider">Tagline <span className="text-slate-700">(left sidebar)</span></label>
              <button
                 onClick={() => handleImprove('summary', data.summary, (imp) => updateField('summary', imp))}
                 className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded text-purple-400 hover:bg-purple-500/20 transition-colors"
               >
                 {(!data.summary || data.summary.trim() === '') ? (
                   <>Write <Pencil className="w-3 h-3" /></>
                 ) : (
                   <>Improve <Sparkles className="w-3 h-3" /></>
                 )}
              </button>
            </div>
            <textarea value={data.summary} onChange={(e) => updateField('summary', e.target.value)} placeholder="Short professional tagline" className={`${inputClass} h-20 resize-none`} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] text-slate-600 uppercase tracking-wider">About Bio <span className="text-slate-700">(About section)</span></label>
              <button
                 onClick={() => handleImprove('about', data.about, (imp) => updateField('about', imp))}
                 className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded text-purple-400 hover:bg-purple-500/20 transition-colors"
               >
                 {(!data.about || data.about.trim() === '') ? (
                   <>Write <Pencil className="w-3 h-3" /></>
                 ) : (
                   <>Improve <Sparkles className="w-3 h-3" /></>
                 )}
              </button>
            </div>
            <textarea value={data.about || ''} onChange={(e) => updateField('about', e.target.value)} placeholder="Detailed bio for the About section..." className={`${inputClass} h-32 resize-none`} />
          </div>
        </section>

        {/* Contact */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</h2>
          <input type="email" value={data.contact?.email || ''} onChange={(e) => updateContact('email', e.target.value)} placeholder="Email" className={inputClass} />
          <input type="text" value={data.contact?.github || ''} onChange={(e) => updateContact('github', e.target.value)} placeholder="GitHub URL" className={inputClass} />
          <input type="text" value={data.contact?.linkedin || ''} onChange={(e) => updateContact('linkedin', e.target.value)} placeholder="LinkedIn URL" className={inputClass} />
        </section>

        {/* Skills */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Skills</h2>
          <div className="flex flex-wrap gap-1.5">
            {data.skills?.map((skill: string, index: number) => (
              <span key={index} className="bg-slate-800 px-2.5 py-1 rounded-full text-xs flex items-center gap-1.5 text-slate-300">
                {skill}
                <button onClick={() => removeSkill(index)} className="text-slate-500 hover:text-red-400 text-[10px]">✕</button>
              </span>
            ))}
          </div>
          <form onSubmit={handleAddSkill} className="flex gap-2">
            <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Add a skill" className={`flex-1 ${inputClass}`} />
            <button type="submit" className="bg-slate-800 hover:bg-slate-700 px-3 rounded-md text-xs transition-colors">Add</button>
          </form>
        </section>

        {/* Experience with DnD */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Experience</h2>
            <button onClick={addExperience} className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 transition-colors">
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
          <DndContext id="dnd-context-experience" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndExp}>
            <SortableContext items={data.experience?.map(e => e.id) || []} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {data.experience?.map((exp, i) => (
                  <SortableExpCard
                    key={exp.id}
                    id={exp.id}
                    index={i}
                    exp={exp}
                    expandedExp={expandedExp}
                    toggleExp={toggleExp}
                    updateExperience={updateExperience}
                    removeExperience={removeExperience}
                    inputClass={inputClass}
                    handleImprove={handleImprove}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </section>

        {/* Projects with DnD */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Projects</h2>
            <button onClick={addProject} className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 transition-colors">
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
          <DndContext id="dnd-context-projects" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndProj}>
            <SortableContext items={data.projects?.map(p => p.id) || []} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {data.projects?.map((proj, i) => (
                  <SortableProjCard
                    key={proj.id}
                    id={proj.id}
                    index={i}
                    proj={proj}
                    expandedProj={expandedProj}
                    toggleProj={toggleProj}
                    updateProject={updateProject}
                    removeProject={removeProject}
                    inputClass={inputClass}
                    handleImprove={handleImprove}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </section>

        {/* Certifications with DnD */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Certifications</h2>
            <button onClick={addCertification} className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 transition-colors">
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
          <DndContext id="dnd-context-certifications" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndCert}>
            <SortableContext items={(data.certifications || []).map(c => c.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {(data.certifications || []).map((cert, i) => (
                  <SortableCertCard
                    key={cert.id}
                    id={cert.id}
                    index={i}
                    cert={cert}
                    expandedCert={expandedCert}
                    toggleCert={toggleCert}
                    updateCertification={updateCertification}
                    removeCertification={removeCertification}
                    inputClass={inputClass}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </section>

      </div>

      {/* Deploy Modal */}
      {showDeployModal && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl w-full shadow-2xl relative">
            <button onClick={() => setShowDeployModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <GithubIcon className="w-5 h-5" /> Deploy to GitHub
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Repository Name</label>
                <input type="text" value={repoName} onChange={(e) => setRepoName(e.target.value)} className={inputClass} />
              </div>
              <div className="relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-slate-400">Personal Access Token (repo scope)</label>
                  <button 
                    onClick={() => setShowTokenHelp(!showTokenHelp)}
                    className="text-[10px] text-teal-400 hover:underline flex items-center gap-1"
                  >
                    How to get a token?
                  </button>
                </div>
                <input type="password" value={githubToken} onChange={(e) => setGithubToken(e.target.value)} placeholder="ghp_xxxxxxxxxxxx" className={inputClass} />
                
                {showTokenHelp && (
                  <div className="mt-3 p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-slate-400 mb-2">Generate a token at <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="text-teal-400 underline">Github Settings</a></p>
                    <div className="space-y-3">
                      <div>
                        <p className="text-white font-bold mb-1 border-l-2 border-teal-500 pl-2">Option 1: Classic Token (Recommended)</p>
                        <p className="text-slate-500 mb-1">Enable scopes: <code className="text-teal-400">repo</code>, <code className="text-teal-400">workflow</code></p>
                      </div>
                      <div>
                        <p className="text-white font-bold mb-1 border-l-2 border-teal-500 pl-2">Option 2: Fine-grained Token</p>
                        <p className="text-slate-500 mb-1">Read/Write: <code className="text-teal-400">Administration, Contents, Pages, Workflows</code></p>
                      </div>
                    </div>
                  </div>
                )}
                <p className="text-[10px] text-slate-500 mt-1">We do not store your token.</p>
              </div>
              {deployStatus === 'success' ? (
                <div className="mt-2 space-y-4">
                  <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-lg p-4 space-y-3">
                    <p className="text-sm font-semibold text-emerald-400">Deployment Complete</p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Live Site</p>
                        <a href={deployUrl} target="_blank" rel="noreferrer" className="text-sm text-teal-400 hover:text-teal-300 underline underline-offset-2 break-all transition-colors">{deployUrl}</a>
                      </div>
                      {deployRepoUrl && (
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Repository</p>
                          <a href={deployRepoUrl} target="_blank" rel="noreferrer" className="text-sm text-slate-400 hover:text-slate-300 underline underline-offset-2 break-all transition-colors">{deployRepoUrl}</a>
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">GitHub Pages may take 1–2 minutes to build. If the site isn't ready yet, refresh shortly.</p>
                  </div>
                  <button
                    onClick={() => window.open(deployUrl, '_blank')}
                    className="w-full font-semibold py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-900/20"
                  >
                    Visit Live Site
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleDeploy} 
                  disabled={isDeploying} 
                  className={`w-full font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 mt-2 shadow-lg ${
                    deployStatus === 'error'
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-900/20'
                  }`}
                >
                  {isDeploying ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Deploying...</>
                  ) : deployStatus === 'error' ? (
                    <>Try again</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Deploy Now</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
