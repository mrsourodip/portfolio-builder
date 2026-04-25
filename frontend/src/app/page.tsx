"use client";

import { useState } from 'react';
import EditorSidebar from '@/components/EditorSidebar';
import PortfolioPreview from '@/portfolio-theme/PortfolioPreview';
import { Monitor, Smartphone, Tablet } from 'lucide-react';

type ViewportMode = 'desktop' | 'tablet' | 'mobile';

export default function Home() {
  const [viewport, setViewport] = useState<ViewportMode>('desktop');

  const viewportClasses = {
    desktop: 'w-full h-full',
    tablet: 'w-[768px] h-full shadow-2xl ring-1 ring-slate-800 rounded-t-2xl overflow-hidden translate-y-4',
    mobile: 'w-[375px] h-full shadow-2xl ring-1 ring-slate-800 rounded-t-[2.5rem] overflow-hidden translate-y-4',
  };

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-slate-950">
      <div className="w-[400px] h-full flex-shrink-0 z-20 shadow-2xl">
        <EditorSidebar />
      </div>
      
      <div className="flex-1 h-full overflow-hidden relative flex flex-col items-center bg-slate-900 border-l border-slate-800/50">
        
        {/* Device Toggle Header */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center bg-slate-800/80 backdrop-blur border border-slate-700/50 p-1 rounded-full shadow-lg">
          <button
            onClick={() => setViewport('desktop')}
            className={`p-2 rounded-full transition-all ${viewport === 'desktop' ? 'bg-slate-600 text-teal-300' : 'text-slate-400 hover:text-slate-200'}`}
            title="Desktop view"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={`p-2 rounded-full transition-all ${viewport === 'tablet' ? 'bg-slate-600 text-teal-300' : 'text-slate-400 hover:text-slate-200'}`}
            title="Tablet view"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`p-2 rounded-full transition-all ${viewport === 'mobile' ? 'bg-slate-600 text-teal-300' : 'text-slate-400 hover:text-slate-200'}`}
            title="Mobile view"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Scaled Preview Wrapper */}
        <div className={`@container transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] flex-1 overflow-y-auto relative ${viewportClasses[viewport]}`}>
          {/* Internal scroll bar handled normally by browser, but we ensure inner container has the right width.
              Because PortfolioPreview uses mx-auto and max-w-screen-xl, reducing the wrapper width effectively tests responsive styles.
           */}
          <PortfolioPreview />
        </div>
        
      </div>
    </main>
  );
}
