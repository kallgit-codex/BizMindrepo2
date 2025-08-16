import { ObjectStorageService } from "./objectStorage";
// Import the library directly from its implementation file to avoid
// running the debug code in the package's default entry point, which
// tries to read a non-existent test PDF and crashes in production.
import pdfParse from "pdf-parse/lib/pdf-parse.js";

export async function extractRealFileContent(fileUrl: string, fileName: string): Promise<string> {
  try {
    const objectStorageService = new ObjectStorageService();
    const objectFile = await objectStorageService.getObjectEntityFile(fileUrl);
    
    // Download file content as buffer
    const [buffer] = await objectFile.download();
    
    const extension = fileName.split('.').pop()?.toLowerCase();

    // Dedicated PDF parsing using pdf-parse
    if (extension === 'pdf') {
      try {
        const { text } = await pdfParse(buffer);
        const cleaned = text.replace(/\s+/g, ' ').trim();
        if (cleaned.length > 20) {
          return cleaned;
        }
      } catch (err) {
        console.error(`Error parsing PDF ${fileName}:`, err);
      }
    }

    // For text-based files, try UTF-8 first
    if (['txt', 'md', 'csv', 'json', 'html', 'xml'].includes(extension || '')) {
      const content = buffer.toString('utf-8');
      if (content && content.trim().length > 0) {
        return content;
      }
    }

    // For all files, try to extract readable text
    let content = buffer.toString('utf-8');

    // If it appears to be binary or corrupted, try different approaches
    if (content.includes('\uFFFD') || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(content.substring(0, 1000))) {
      // Try Latin1 encoding for PDFs and other files
      content = buffer.toString('latin1');
    }

    // For PDFs, extract readable text portions as a fallback
    if (extension === 'pdf') {
      const textMatches = content.match(/(?:[\x20-\x7E][\x20-\x7E\s]*[\x20-\x7E])/g);
      if (textMatches && textMatches.length > 0) {
        const extractedText = textMatches
          .filter(match => match.length > 3)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (extractedText.length > 20) {
          return extractedText;
        }
      }
    }
    
    // Final fallback - try to find any readable content
    const readableChars = content.replace(/[^\x20-\x7E\n\r\t]/g, '').replace(/\s+/g, ' ').trim();
    if (readableChars.length > 20) {
      return readableChars;
    }
    
    return `Content extracted from ${fileName}. The file may require specialized processing for full text extraction.`;
    
  } catch (error) {
    console.error(`Error extracting real content from ${fileName}:`, error);
    return `Failed to extract content from ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}