import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Example1 from './Example1';
import Example2 from './Example2';
import Example3 from './Example3';
const App = () => {
  return <Example3></Example3>;
};

ReactDOM.render(<App />, document.getElementById('root'));
