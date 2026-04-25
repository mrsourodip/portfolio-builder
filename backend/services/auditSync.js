const { getTransformedAppCode } = require('./syncTemplate');

(async () => {
  try {
    const code = await getTransformedAppCode();
    const issues = [];

    // 1. Should NOT have 'use client'
    if (code.includes('"use client"')) issues.push('Still has "use client"');

    // 2. Should NOT have store import
    if (code.includes('portfolioStore')) issues.push('Still imports portfolioStore');
    if (code.includes('usePortfolioStore')) issues.push('Still calls usePortfolioStore');

    // 3. Should have fetch logic
    if (!code.includes("fetch('./data.json')")) issues.push('Missing fetch(./data.json)');

    // 4. Should be renamed to App
    if (!code.includes('export default function App()')) issues.push('Not renamed to App()');

    // 5. Should NOT have localhost references
    if (code.includes('localhost:3005')) issues.push('Still has localhost:3005 references');
    if (code.includes('localhost:3000')) issues.push('Still has localhost:3000 references');

    // 6. Should have loading guard
    if (!code.includes('if (loading)')) issues.push('Missing loading guard');

    // 7. Check for bare resumeUrl (not data.resumeUrl and not the const declaration)
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('const resumeUrl = data.resumeUrl')) continue;
      if (/\bresumeUrl\b/.test(line) && !line.includes('data.resumeUrl') && !line.includes('const resumeUrl')) {
        issues.push('L' + (i + 1) + ' has bare resumeUrl: ' + line.trim().substring(0, 80));
      }
    }

    // 8. Check for .map(s => without type annotation
    if (/\.map\(s\s*=>/g.test(code)) issues.push('Has .map(s => without type annotation');

    // 9. Balanced braces
    const openB = (code.match(/\{/g) || []).length;
    const closeB = (code.match(/\}/g) || []).length;
    if (openB !== closeB) issues.push('Unbalanced braces: ' + openB + ' { vs ' + closeB + ' }');

    if (issues.length === 0) {
      console.log('✅ ALL CHECKS PASSED');
    } else {
      console.log('❌ ISSUES FOUND:');
      issues.forEach(i => console.log('  - ' + i));
    }

    // Write out the transformed code for manual inspection
    require('fs').writeFileSync('/tmp/transformed_app.tsx', code);
    console.log('\nTransformed code written to /tmp/transformed_app.tsx (' + lines.length + ' lines)');
  } catch (err) {
    console.error('TRANSFORMATION FAILED:', err.message);
  }
  process.exit(0);
})();
