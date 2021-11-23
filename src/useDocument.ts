import * as pdfjs from 'pdfjs-dist';
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import { useEffect, useState } from 'react';
pdfjs.GlobalWorkerOptions.workerSrc = `http://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.js`;

type useDocumenParams = {
  URL: string;
};

export function useDocumen({ URL }: useDocumenParams) {
  const [PDF, setPDF] = useState<PDFDocumentProxy | null>(null);
  useEffect(() => {
    async function getPDF() {
      setPDF(await pdfjs.getDocument(URL).promise);
    }
    if (URL) {
      getPDF();
    }
  }, [URL]);
  return [PDF];
}
