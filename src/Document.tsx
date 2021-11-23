import React from 'react';
import { useDocumen } from './useDocument';
import { DocumentContext } from './documentContext';
type DocumentProps = {
  URL: string;
};

export const Document: React.FC<DocumentProps> = ({ URL, ...rest }) => {
  const [PDF] = useDocumen({ URL });
  return (
    <DocumentContext.Provider value={PDF}>
      {rest.children}
    </DocumentContext.Provider>
  );
};
