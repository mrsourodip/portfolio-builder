"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { usePortfolioStore } from '../store/portfolioStore';
import { Mail, Download } from 'lucide-react';

const GithubIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
    <path d="M9 18c-4.51 2-5-2-7-2"></path>
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const MobileMenuButton = ({ isOpen, toggle }: { isOpen: boolean; toggle: () => void }) => (
  <button
    onClick={toggle}
    className="relative w-8 h-8 flex items-center justify-center rounded-full bg-transparent z-50 transition-colors focus:outline-none"
    aria-label="Toggle Navigation"
  >
    <div className="flex flex-col justify-center items-center gap-[4.5px] w-5 h-5">
      <span className={`block h-[2px] w-5 rounded-sm transition-all duration-300 ease-in-out ${isOpen ? 'rotate-45 translate-y-[6.5px] bg-teal-400' : 'bg-slate-400'}`} />
      <span className={`block h-[2px] w-5 bg-slate-400 rounded-sm transition-all duration-300 ease-in-out ${isOpen ? 'opacity-0 translate-x-2' : 'opacity-100'}`} />
      <span className={`block h-[2px] w-5 rounded-sm transition-all duration-300 ease-in-out ${isOpen ? '-rotate-45 -translate-y-[6.5px] bg-teal-400' : 'bg-slate-400'}`} />
    </div>
  </button>
);

const MobileMenuDropdown = ({ isOpen, closeMenu, activeSection, navItems }: { isOpen: boolean; closeMenu: () => void; activeSection: string; navItems: { label: string, href: string }[] }) => {
  if (!isOpen) return null;
  return (
    <nav className="absolute top-full right-6 mt-2 bg-slate-800/95 backdrop-blur-lg border border-slate-700/50 rounded-xl shadow-2xl p-4 min-w-[200px] z-[100] text-right">
      <ul className="flex flex-col gap-4">
        {navItems.map((item) => (
          <li key={item.href}>
            <a
              className={`text-sm font-bold uppercase tracking-widest block transition-colors ${activeSection === item.href.slice(1) ? 'text-teal-300' : 'text-slate-300 hover:text-white'}`}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                closeMenu();
                const el = document.querySelector(item.href);
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};


export default function PortfolioPreview() {
  const { data, resumeUrl } = usePortfolioStore();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeSection, setActiveSection] = useState('about');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  const navItems = [
    { label: 'About', href: '#about' },
    { label: 'Experience', href: '#experience' },
    { label: 'Projects', href: '#projects' },
    ...(data.certifications && data.certifications.length > 0 ? [{ label: 'Certifications', href: '#certifications' }] : [])
  ];

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, []);

  // Intersection observer for active nav highlighting
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -40% 0px' }
    );

    const sections = document.querySelectorAll('#about, #experience, #projects, #certifications');
    sections.forEach((section) => observer.observe(section));
    return () => sections.forEach((section) => observer.unobserve(section));
  }, [data]);

  useEffect(() => {
    const sentinel = document.getElementById('top-scroll-sentinel');
    if (!sentinel) return;
    const sentinelObserver = new IntersectionObserver(([entry]) => {
      setHasScrolled(!entry.isIntersecting);
    }, { rootMargin: '0px' });
    sentinelObserver.observe(sentinel);
    return () => sentinelObserver.disconnect();
  }, []);

  return (
    <div
      className="@container bg-slate-900 min-h-full text-slate-400 font-sans leading-relaxed selection:bg-teal-300 selection:text-teal-900 relative w-full h-full"
      onMouseMove={handleMouseMove}
    >
      <div id="top-scroll-sentinel" className="absolute top-[150px] w-full h-1 pointer-events-none opacity-0" />
      {/* Glowing orb that follows cursor */}
      <div
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 @2xl:block hidden hidden-on-touch"
        style={{
          background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(29, 78, 216, 0.15), transparent 80%)`,
        }}
      />
      {/* Using an inline style to strictly unmount pseudo-states locally for the orb on physical touch-bound layouts */}
      <style>{`@media (hover: none) and (pointer: coarse) { .hidden-on-touch { display: none !important; } }`}</style>

      <div className="mx-auto min-h-screen max-w-screen-xl px-6 py-12 @2xl:px-12 @2xl:py-20 @2xl:px-24 @2xl:py-0">
        <div className="@2xl:flex @2xl:justify-between @2xl:gap-4">

          {/* Left Column - Sticky */}
          <header className="@2xl:sticky @2xl:top-0 @2xl:flex @2xl:max-h-screen @2xl:w-1/2 @2xl:flex-col @2xl:justify-between @2xl:py-24 pb-12 @2xl:pb-24">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-200 @2xl:text-5xl">
                {data.name || "Your Name"}
              </h1>
              <h2 className="mt-3 text-lg font-medium tracking-tight text-slate-200 @2xl:text-xl">
                {data.title || "Your Title"}
              </h2>
              <p className="mt-4 max-w-xs leading-normal">
                {data.summary || "A brief summary about yourself and what you do."}
              </p>

              {/* Grouped Links: Contacts + Download (Visible at top below summary) */}
              <div className="mt-8 flex flex-col gap-6">
                {/* Contact Icons */}
                <ul className="flex items-center gap-5" aria-label="Social media">
                  {data.contact?.github && (
                    <li className="text-xs shrink-0">
                      <a className="block hover:text-slate-200 transition-colors" href={data.contact.github.startsWith('http') ? data.contact.github : `https://${data.contact.github}`} target="_blank" rel="noreferrer" title="GitHub">
                        <span className="sr-only">GitHub</span>
                        <GithubIcon className="h-6 w-6" />
                      </a>
                    </li>
                  )}
                  {data.contact?.linkedin && (
                    <li className="text-xs shrink-0">
                      <a className="block hover:text-slate-200 transition-colors" href={data.contact.linkedin.startsWith('http') ? data.contact.linkedin : `https://${data.contact.linkedin}`} target="_blank" rel="noreferrer" title="LinkedIn">
                        <span className="sr-only">LinkedIn</span>
                        <LinkedinIcon className="h-6 w-6" />
                      </a>
                    </li>
                  )}
                  {data.contact?.email && (
                    <li className="text-xs shrink-0">
                      <a className="block hover:text-slate-200 transition-colors" href={`mailto:${data.contact.email}`} title="Email">
                        <span className="sr-only">Email</span>
                        <Mail className="h-6 w-6" />
                      </a>
                    </li>
                  )}
                </ul>

                {/* Download Button (Always Visible) */}
                <div>
                  <a
                    href={resumeUrl ? `http://localhost:3005${resumeUrl}` : '/resume.pdf'}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={(() => {
                      const ext = resumeUrl ? (resumeUrl.split('.').pop() || 'pdf') : 'pdf';
                      const formatted = data.name.trim().split(/\s+/).map((s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()).join("_");
                      return `${formatted}_Resume.${ext}`;
                    })()}
                    className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-teal-300 transition-colors group"
                  >
                    <Download className="w-5 h-5" />
                    <span className="font-medium border-b border-transparent group-hover:border-teal-300/50">Download Resume</span>
                  </a>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="nav hidden @2xl:block mt-20" aria-label="In-page jump links">
                <ul className="w-max">
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <a
                        className="group flex items-center py-3"
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          const el = document.querySelector(item.href);
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <span className={`mr-4 h-px transition-all group-hover:w-16 group-hover:bg-slate-200 group-focus-visible:w-16 group-focus-visible:bg-slate-200 ${activeSection === item.href.slice(1)
                            ? 'w-16 bg-slate-200'
                            : 'w-8 bg-slate-600'
                          }`} />
                        <span className={`text-xs font-bold uppercase tracking-widest group-hover:text-slate-200 group-focus-visible:text-slate-200 ${activeSection === item.href.slice(1) ? 'text-slate-200' : 'text-slate-500'
                          }`}>
                          {item.label}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </header>

          {/* Right Column - Scrolling Content */}
          <main className="pt-24 @2xl:w-1/2 @2xl:py-24">

            {/* About Section */}
            <section id="about" className="mb-16 scroll-mt-16 @2xl:mb-24 @2xl:mb-36 @2xl:scroll-mt-24">
              <div className="sticky top-0 z-20 -mx-6 mb-4 bg-slate-900/75 px-6 py-5 backdrop-blur @2xl:-mx-12 @2xl:px-12 flex justify-between items-center">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200">About</h2>
                <div className={`@2xl:hidden transition-opacity duration-300 ${hasScrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  <MobileMenuButton isOpen={isMobileMenuOpen && activeSection === 'about'} toggle={() => { setIsMobileMenuOpen(!isMobileMenuOpen); setActiveSection('about'); }} />
                  <MobileMenuDropdown isOpen={isMobileMenuOpen && activeSection === 'about'} closeMenu={() => setIsMobileMenuOpen(false)} activeSection={activeSection} navItems={navItems} />
                </div>
              </div>
              <div className="space-y-4">
                {(data.about || data.summary || "").split('\n').filter(Boolean).map((para: string, i: number) => (
                  <p key={i} className="text-sm leading-relaxed">{para}</p>
                ))}
                {data.skills && data.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-6">
                    {data.skills.map((skill: string, i: number) => (
                      <span key={i} className="flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-5 text-teal-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Experience Section */}
            <section id="experience" className="mb-16 scroll-mt-16 @2xl:mb-24 @2xl:mb-36 @2xl:scroll-mt-24">
              <div className="sticky top-0 z-20 -mx-6 mb-4 bg-slate-900/75 px-6 py-5 backdrop-blur @2xl:-mx-12 @2xl:px-12 flex justify-between items-center">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200">Experience</h2>
                <div className={`@2xl:hidden transition-opacity duration-300 ${hasScrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  <MobileMenuButton isOpen={isMobileMenuOpen && activeSection === 'experience'} toggle={() => { setIsMobileMenuOpen(!isMobileMenuOpen); setActiveSection('experience'); }} />
                  <MobileMenuDropdown isOpen={isMobileMenuOpen && activeSection === 'experience'} closeMenu={() => setIsMobileMenuOpen(false)} activeSection={activeSection} navItems={navItems} />
                </div>
              </div>
              {data.experience && data.experience.length > 0 ? (
                <ol className="group/list space-y-12">
                  {data.experience.map((exp: any, i: number) => (
                    <li key={exp.id || i} className="mb-12">
                      <div className="group relative grid pb-1 transition-all @2xl:grid-cols-8 @2xl:gap-8 @2xl:gap-4 @2xl:hover:!opacity-100 @2xl:group-hover/list:opacity-50">
                        <div className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none @2xl:-inset-x-6 @2xl:block @2xl:group-hover:bg-slate-800/50 @2xl:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] @2xl:group-hover:drop-shadow-lg"></div>
                        <header className="z-10 mb-2 mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 @2xl:col-span-2 " aria-label={exp.date}>
                          {exp.date}
                        </header>
                        <div className="z-10 @2xl:col-span-6">
                          <h3 className="font-medium leading-snug text-slate-200">
                            <span>{exp.role}</span>
                            <span className="text-slate-400"> · </span>
                            <span>{exp.company}</span>
                          </h3>
                          <ul className="mt-2 space-y-1">
                            {(Array.isArray(exp.description) ? exp.description : [exp.description]).map((point: string, pi: number) => (
                              <li key={pi} className="text-sm leading-normal flex gap-2">
                                <span className="text-slate-600 mt-0.5 shrink-0">▹</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-slate-500 italic">No experience data yet. Upload a resume or add experience manually.</p>
              )}
            </section>

            {/* Projects Section */}
            <section id="projects" className="mb-16 scroll-mt-16 @2xl:mb-24 @2xl:mb-36 @2xl:scroll-mt-24">
              <div className="sticky top-0 z-20 -mx-6 mb-4 bg-slate-900/75 px-6 py-5 backdrop-blur @2xl:-mx-12 @2xl:px-12 flex justify-between items-center">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200">Projects</h2>
                <div className={`@2xl:hidden transition-opacity duration-300 ${hasScrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  <MobileMenuButton isOpen={isMobileMenuOpen && activeSection === 'projects'} toggle={() => { setIsMobileMenuOpen(!isMobileMenuOpen); setActiveSection('projects'); }} />
                  <MobileMenuDropdown isOpen={isMobileMenuOpen && activeSection === 'projects'} closeMenu={() => setIsMobileMenuOpen(false)} activeSection={activeSection} navItems={navItems} />
                </div>
              </div>
              {data.projects && data.projects.length > 0 ? (
                <ul className="group/list space-y-12">
                  {data.projects.map((proj: any, i: number) => (
                    <li key={proj.id || i}>
                      <div className="group relative grid gap-4 pb-1 transition-all @2xl:hover:!opacity-100 @2xl:group-hover/list:opacity-50">
                        <div className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none @2xl:-inset-x-6 @2xl:block @2xl:group-hover:bg-slate-800/50 @2xl:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] @2xl:group-hover:drop-shadow-lg"></div>

                        <div className="z-10">
                          <h3 className="font-medium leading-snug text-slate-200">
                            {proj.link ? (
                              <a href={proj.link} target="_blank" rel="noreferrer" className="inline-flex items-baseline font-medium leading-tight text-slate-200 hover:text-teal-300 focus-visible:text-teal-300 group/link text-base">
                                <span>{proj.title}{' '}<span className="inline-block transition-transform group-hover/link:-translate-y-1 group-hover/link:translate-x-1">↗</span></span>
                              </a>
                            ) : (
                              <span>{proj.title}</span>
                            )}
                          </h3>
                          <p className="mt-2 text-sm leading-normal">
                            {proj.description}
                          </p>
                          {proj.tech && proj.tech.length > 0 && (
                            <ul className="mt-2 flex flex-wrap" aria-label="Technologies used">
                              {proj.tech.map((techItem: string, techIndex: number) => (
                                <li key={techIndex} className="mr-1.5 mt-2">
                                  <div className="flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-5 text-teal-300">
                                    {techItem}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 italic">No projects yet. Upload a resume or add projects manually.</p>
              )}
            </section>

            {/* Certifications Section */}
            {data.certifications && data.certifications.length > 0 && (
              <section id="certifications" className="mb-16 scroll-mt-16 @2xl:mb-24 @2xl:mb-36 @2xl:scroll-mt-24">
                <div className="sticky top-0 z-20 -mx-6 mb-4 bg-slate-900/75 px-6 py-5 backdrop-blur @2xl:-mx-12 @2xl:px-12 flex justify-between items-center">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200">Certifications</h2>
                  <div className={`@2xl:hidden transition-opacity duration-300 ${hasScrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <MobileMenuButton isOpen={isMobileMenuOpen && activeSection === 'certifications'} toggle={() => { setIsMobileMenuOpen(!isMobileMenuOpen); setActiveSection('certifications'); }} />
                    <MobileMenuDropdown isOpen={isMobileMenuOpen && activeSection === 'certifications'} closeMenu={() => setIsMobileMenuOpen(false)} activeSection={activeSection} navItems={navItems} />
                  </div>
                </div>
                <ul className="group/list space-y-12">
                  {data.certifications.map((cert: any, i: number) => (
                    <li key={cert.id || i}>
                      <div className="group relative grid gap-4 pb-1 transition-all @2xl:hover:!opacity-100 @2xl:group-hover/list:opacity-50">
                        <div className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none @2xl:-inset-x-6 @2xl:block @2xl:group-hover:bg-slate-800/50 @2xl:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] @2xl:group-hover:drop-shadow-lg"></div>
                        <div className="z-10 flex flex-col sm:flex-row sm:items-baseline gap-2">
                          {cert.date && (
                            <header className="z-10 mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:w-1/4 shrink-0 transition-colors">
                              {cert.date}
                            </header>
                          )}
                          <div className="flex-1">
                            <h3 className="font-medium leading-snug text-slate-200">
                              {cert.link ? (
                                <a href={cert.link} target="_blank" rel="noreferrer" className="inline-flex items-baseline font-medium leading-tight text-slate-200 hover:text-teal-300 focus-visible:text-teal-300 group/link text-base">
                                  <span>{cert.title}{' '}<span className="inline-block transition-transform group-hover/link:-translate-y-1 group-hover/link:translate-x-1">↗</span></span>
                                </a>
                              ) : (
                                <span>{cert.title}</span>
                              )}
                            </h3>
                            <p className="mt-1 text-sm text-slate-400 font-medium">
                              {cert.issuer}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <footer className="mt-20 pb-8 text-center text-sm text-slate-500">
              <p>
                Made with <a href="#" target="_blank" rel="noreferrer" className="text-teal-400 hover:text-teal-300 transition-colors">Portfolio Builder</a> - Try now!
                {/* TODO: Update github URL to the launched repository link */}
              </p>
            </footer>

          </main>
        </div>
      </div>
    </div>
  );
}
