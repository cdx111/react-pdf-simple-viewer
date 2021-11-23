import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import React from 'react';

export const DocumentContext = React.createContext<PDFDocumentProxy | null>(
  null
);
