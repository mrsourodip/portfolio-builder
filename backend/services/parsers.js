const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extracts hyperlink URLs from PDF annotations using pdfjs-dist.
 * This catches links that are displayed as text (e.g. "GitHub", "LinkedIn")
 * but have the actual URL in the annotation metadata.
 */
async function extractPdfAnnotationLinks(fileBuffer) {
  const urls = [];
  try {
    // Dynamic import for ESM-only pdfjs-dist
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(fileBuffer) });
    const pdf = await loadingTask.promise;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const annotations = await page.getAnnotations();

      for (const ann of annotations) {
        if (ann.subtype === 'Link' && ann.url) {
          const cleanUrl = ann.url.replace(/\0/g, '');
          if (cleanUrl.startsWith('http') && !urls.includes(cleanUrl)) {
            urls.push(cleanUrl);
          }
        }
      }
    }
  } catch (err) {
    console.warn('pdfjs-dist annotation extraction failed, falling back to regex:', err.message);
  }
  return urls;
}

/**
 * Fallback: scan raw PDF binary buffer for /URI patterns.
 * Works for uncompressed PDFs but misses compressed streams.
 */
function extractPdfUriFromBinary(fileBuffer) {
  const bufferString = fileBuffer.toString('binary');
  const foundUrls = [];

  // Pattern 1: Standard URI annotations /URI (URL)
  const uriRegex = /\/URI\s*\((.*?)\)/g;
  // Pattern 2: HEX encoded URIs
  const hexUriRegex = /\/URI\s*<(.*?)>/g;

  let match;
  while ((match = uriRegex.exec(bufferString)) !== null) {
    if (match[1] && !foundUrls.includes(match[1])) foundUrls.push(match[1]);
  }
  while ((match = hexUriRegex.exec(bufferString)) !== null) {
    try {
      const decoded = Buffer.from(match[1].replace(/\s/g, ''), 'hex').toString();
      if (decoded && !foundUrls.includes(decoded)) foundUrls.push(decoded);
    } catch (e) {}
  }

  return foundUrls.map(u => u.replace(/\0/g, '')).filter(u => u.startsWith('http'));
}

async function extractTextFromFile(fileBuffer, mimetype, originalname = '') {
  const isPDF = mimetype === 'application/pdf' || originalname.toLowerCase().endsWith('.pdf');
  const isDOCX = mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword' ||
    originalname.toLowerCase().endsWith('.docx') ||
    originalname.toLowerCase().endsWith('.doc');

  if (isPDF) {
    const data = await pdfParse(fileBuffer);
    let text = data.text;

    // Extract hyperlinks from PDF annotations (primary method)
    let hyperlinks = await extractPdfAnnotationLinks(fileBuffer);

    // Fallback: if pdfjs-dist found nothing, try raw binary scan
    if (hyperlinks.length === 0) {
      hyperlinks = extractPdfUriFromBinary(fileBuffer);
    }

    // Deduplicate
    const uniqueLinks = [...new Set(hyperlinks)];

    if (uniqueLinks.length > 0) {
      text += "\n\nEXTRACTED_HYPERLINKS:\n" + uniqueLinks.join("\n");
    }

    return text;
  } else if (isDOCX) {
    const result = await mammoth.convertToHtml({ buffer: fileBuffer });
    return result.value; // Returns HTML string, preserving <a href="..."> tags
  }
  throw new Error('Unsupported file format. Please upload a PDF or DOCX file.');
}

module.exports = {
  extractTextFromFile
};
