import * as React from 'react';
import { useDocumen } from './useDocument';
import { DocumentContext } from './documentContext';
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
type DocumentProps = {
  URL: string;
  onSuccess?: (PDF: PDFDocumentProxy) => void;
  onError?: (e: any) => void;
};

export const Document: React.FC<DocumentProps> = ({
  URL,
  onSuccess,
  onError,
  ...rest
}) => {
  const [PDF] = useDocumen({ URL, onSuccess, onError });
  return (
    <DocumentContext.Provider value={PDF}>
      {rest.children}
    </DocumentContext.Provider>
  );
};
