# react-pdf-simple-viewer

> 用于在 React 展示 PDF,只需要传递一个 URL。

# Install

```bash
#npm
npm install --save react-pdf-simple-viewer

#yarn
yarn add react-pdf-simple-viewer
```

``

# Getting started

## 例子 1

```tsx
import { Document, Page } from 'react-pdf-simple-viewer';
import { useState } from 'react';

const App = () => {
  const [pages, setPages] = useState<number[]>([]);
  return (
    <div>
      <Document
        URL="http://localhost:1234/123.pdf"
        onSuccess={async PDF => {
          const { numPages } = PDF;
          setPages(
            Array.from({ length: numPages })
              .fill(0)
              .map((val, index) => index + 1)
          );
        }}
      >
        {pages.map(value => {
          return <Page index={value} key={value} width={857} scale={1}></Page>;
        })}
      </Document>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
```
