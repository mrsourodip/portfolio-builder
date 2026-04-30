const fs = require('fs').promises;
const path = require('path');

/**
 * Syncs the frontend PortfolioPreview code and transforms it into a standalone App.tsx
 * for the export/deploy template.
 */
async function getTransformedAppCode() {
  try {
    // 0. Detect actual resume extension from uploads
    const uploadsDir = path.join(__dirname, '../uploads');
    let resumeExtension = 'pdf'; // default
    try {
      const files = await fs.readdir(uploadsDir);
      const resumeFile = files.find(f => f.startsWith('resume.'));
      if (resumeFile) {
        resumeExtension = resumeFile.split('.').pop();
      }
    } catch (e) {
      console.warn('Could not detect resume extension, defaulting to pdf');
    }

    // Path to the source component in the frontend
    const sourcePath = path.join(__dirname, '../../frontend/src/portfolio-theme/PortfolioPreview.tsx');
    
    // Read the source code
    let code = await fs.readFile(sourcePath, 'utf8');

    // 1. Remove "use client";
    code = code.replace(/"use client";\r?\n\r?\n?/, '');

    // 2. Remove the store import
    code = code.replace(/import { usePortfolioStore } from ['"]\.\.\/store\/portfolioStore['"];\r?\n?/, '');

    // 3. Rename component to 'App'
    code = code.replace(/export default function PortfolioPreview\(\)/, 'export default function App()');

    // 4. Replace the store hook with local state and fetch logic
    const storeHookPattern = /const \{ data, resumeUrl \} = usePortfolioStore\(\);/;
    const standaloneStateLogic = `const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('./data.json')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading data:", err);
        setLoading(false);
      });
  }, []);`;

    code = code.replace(storeHookPattern, standaloneStateLogic);

    // 5. Inject loading guard, dynamic title, and dynamic favicon before the main return
    code = code.replace(
      /(\s*)(return \(\s*<div\s+className="@container bg-slate-900)/,
      `$1  useEffect(() => {
    if (!data.name) return;
    
    // 1. Set Page Title
    document.title = "Portfolio";

    // 2. Generate Sleek Squircle Favicon
    const names = data.name.trim().split(/\\s+/);
    const initials = (names[0]?.[0] || '') + (names[names.length - 1]?.[0] || '');
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Squircle background (Teal)
      const r = 16; // border radius
      ctx.fillStyle = '#14b8a6'; // teal-500
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.lineTo(64 - r, 0);
      ctx.quadraticCurveTo(64, 0, 64, r);
      ctx.lineTo(64, 64 - r);
      ctx.quadraticCurveTo(64, 64, 64 - r, 64);
      ctx.lineTo(r, 64);
      ctx.quadraticCurveTo(0, 64, 0, 64 - r);
      ctx.lineTo(0, r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.fill();

      // Initials Text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(initials.toUpperCase(), 32, 32);

      // Update Favicon Link
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = canvas.toDataURL();
    }
  }, [data.name]);

  if (loading) {
    return <div className="h-screen w-screen bg-slate-900 flex items-center justify-center text-slate-400">Loading Portfolio...</div>;
  }

$2`
    );

    // 6. Fix resume URL & Naming
    // Format: FirstName_LastName_Resume.ext (Capitalized)
    // We replace the entire href/download block to be cleaner and fix implicit any
    // Using a broader regex to catch changes within the href like `process.env` dynamic routing
    const resumeLinkPattern = /href=\{resumeUrl \? [\s\S]*?\}\)\(\)\}/g;
    
    const newResumeLink = `href={data.resumeUrl || (data.name ? \`./\${data.name.trim().split(/\\s+/).map((s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()).join("_")}_Resume.${resumeExtension}\` : \`./Resume.${resumeExtension}\`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={data.resumeUrl ? data.resumeUrl.split('/').pop() : \`Resume.${resumeExtension}\`}`;
    
    code = code.replace(resumeLinkPattern, newResumeLink);

    return code;
  } catch (error) {
    console.error('Error transforming App code:', error);
    throw new Error('Failed to sync and transform portfolio template.');
  }
}

module.exports = {
  getTransformedAppCode
};
