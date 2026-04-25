const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

async function extractTextFromFile(fileBuffer, mimetype, originalname = '') {
  const isPDF = mimetype === 'application/pdf' || originalname.toLowerCase().endsWith('.pdf');
  const isDOCX = mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword' ||
    originalname.toLowerCase().endsWith('.docx') ||
    originalname.toLowerCase().endsWith('.doc');

  if (isPDF) {
    const data = await pdfParse(fileBuffer);
    let text = data.text;

    // Improved fallback: Scan buffer for various PDF link patterns
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

    // Clean up potential null terminators in PDF strings
    const cleanUrls = foundUrls.map(u => u.replace(/\0/g, '')).filter(u => u.startsWith('http'));

    if (cleanUrls.length > 0) {
      text += "\n\nEXTRACTED_HYPERLINKS:\n" + cleanUrls.join("\n");
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
