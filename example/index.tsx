import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Document, Page } from '../.';

const App = () => {
  return (
    <div>
      <Document URL="http://localhost:1234/%E4%B8%93%E8%AE%BF%E4%B8%8A%E6%B5%B7%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD%E7%A0%94%E7%A9%B6...%E5%9F%BA%E5%BB%BA%E4%B8%8B%E7%9A%84AI%E6%8A%80%E6%9C%AF%E8%90%BD%E5%9C%B0%20(18).pdf">
        <Page index={1}></Page>
      </Document>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
