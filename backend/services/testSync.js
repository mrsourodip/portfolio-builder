const { getTransformedAppCode } = require('./syncTemplate');
const path = require('path');

async function test() {
  try {
    const code = await getTransformedAppCode();
    console.log('--- TRANSFORMED CODE PREVIEW (L100-L130) ---');
    const lines = code.split('\n');
    console.log(lines.slice(100, 130).join('\n'));
    console.log('--- END PREVIEW ---');
    
    // Check for specific markers
    const hasUseClient = code.includes('"use client";');
    const hasStoreImport = code.includes('portfolioStore');
    const hasFetchLogic = code.includes("fetch('./data.json')");
    const hasAppFunc = code.includes('export default function App()');
    
    console.log('Testing transformation markers:');
    console.log('- No "use client":', !hasUseClient);
    console.log('- No store import:', !hasStoreImport);
    console.log('- Has fetch logic:', hasFetchLogic);
    console.log('- Renamed to App:', hasAppFunc);
    
    if (!hasUseClient && !hasStoreImport && hasFetchLogic && hasAppFunc) {
      console.log('\n✅ TEST PASSED: Transformation logic looks correct.');
    } else {
      console.error('\n❌ TEST FAILED: Some transformation markers are missing or incorrect.');
      process.exit(1);
    }
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
}

test();
