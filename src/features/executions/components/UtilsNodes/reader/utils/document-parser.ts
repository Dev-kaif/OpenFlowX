import ky from 'ky';
import mammoth from 'mammoth';
import { parse } from 'csv-parse/sync';
import { extractText } from 'unpdf';


function sanitizeText(text: string): string {
    // Postgres cannot store null bytes (\x00). We must strip them.
    return text.replace(/\u0000/g, '');
}

// Helper to fix Google Drive / Dropbox links
function sanitizeUrl(url: string): string {
    if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
        const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (idMatch) {
            return `https://docs.google.com/uc?export=download&id=${idMatch[1]}`;
        }
    }
    if (url.includes('dropbox.com')) {
        return url.replace('dl=0', 'dl=1');
    }
    return url;
}

export async function executeDocumentReader(input: { file: string | Buffer; mimeType?: string }) {
    let processingBuffer: Buffer;
    let detectedMime: string = input.mimeType || 'application/octet-stream';

    if (typeof input.file === 'string' && input.file.startsWith('http')) {
        const cleanUrl = sanitizeUrl(input.file);

        const response = await ky.get(cleanUrl);

        if (!input.mimeType) {
            detectedMime = response.headers.get('content-type') || detectedMime;
        }

        const arrayBuffer = await response.arrayBuffer();
        processingBuffer = Buffer.from(arrayBuffer);

    } else if (Buffer.isBuffer(input.file)) {
        processingBuffer = input.file;
    } else {
        throw new Error("Invalid input: Expected a valid URL.");
    }

    if (processingBuffer.length > 20 * 1024 * 1024) {
        throw new Error("File too large. Limit is 20MB.");
    }

    if (processingBuffer.toString('ascii', 0, 5) === '%PDF-') {
        detectedMime = 'application/pdf';
    }

    let text = "";

    if (detectedMime.includes('pdf')) {
        const uint8Array = new Uint8Array(
            processingBuffer.buffer,
            processingBuffer.byteOffset,
            processingBuffer.byteLength
        );
        const pdfData = await extractText(uint8Array);
        text = Array.isArray(pdfData.text) ? pdfData.text.join("\n") : pdfData.text;
    }
    else if (detectedMime.includes('word') || detectedMime.includes('docx') || detectedMime.includes('officedocument')) {
        const result = await mammoth.extractRawText({ buffer: processingBuffer });
        text = result.value;
    }
    else if (detectedMime.includes('csv')) {
        const records = parse(processingBuffer, { columns: true, skip_empty_lines: true });
        text = JSON.stringify(records, null, 2);
    }
    else {
        text = processingBuffer.toString('utf-8');
    }
    const cleanText = sanitizeText(text).trim();

    return {
        text: cleanText,
        char_count: text.length,
        source: typeof input.file === 'string' ? 'url' : 'buffer',
        type: detectedMime
    };
}