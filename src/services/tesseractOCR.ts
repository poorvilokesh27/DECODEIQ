import { createWorker } from 'tesseract.js';

/**
 * Extracts text from an image file using Tesseract.js client-side OCR.
 */
export async function extractTextFromImage(
  imageInput: File | Blob | string,
  onProgress?: (progress: number, status: string) => void
): Promise<string> {
  try {
    if (onProgress) onProgress(0.1, 'Initializing OCR engine...');

    const worker = await createWorker('eng');

    if (onProgress) onProgress(0.4, 'Scanning text from image...');

    const ret = await worker.recognize(imageInput);

    if (onProgress) onProgress(0.9, 'Processing extracted text...');

    await worker.terminate();

    if (onProgress) onProgress(1.0, 'OCR Complete');

    return ret.data.text.trim();
  } catch (error) {
    console.error('Tesseract OCR Error:', error);
    throw new Error(
      error instanceof Error 
        ? `OCR failed: ${error.message}` 
        : 'Failed to extract text from image. Please enter the text manually.'
    );
  }
}

