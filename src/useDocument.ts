import * as pdfjs from 'pdfjs-dist';
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';

import { useEffect, useState } from 'react';
pdfjs.GlobalWorkerOptions.workerSrc = `http://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.js`;

type useDocumenParams = {
  URL: string;
  onSuccess?: (PDF: PDFDocumentProxy) => void;
  onError?: (e: any) => void;
};

export function useDocumen({ URL, onSuccess, onError }: useDocumenParams) {
  const [PDF, setPDF] = useState<PDFDocumentProxy | null>(null);
  useEffect(() => {
    async function getPDF() {
      try {
        const P = await pdfjs.getDocument(URL).promise;
        setPDF(P);
        onSuccess?.(P);
      } catch (e) {
        console.log(e);
        onError?.(e);
      }
    }
    if (URL) {
      getPDF();
    }
  }, [URL]);
  return [PDF];
}
