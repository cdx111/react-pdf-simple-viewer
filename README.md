# react-pdf-simple-viewer

![License](https://img.shields.io/github/license/cdx0/react-pdf-simple-viewer?style=flat-square) ![NPM](https://img.shields.io/npm/v/react-pdf-simple-viewer?style=flat-square)
![typescript](https://img.shields.io/badge/%E6%94%AF%E6%8C%81-typescript-blue?style=flat-square)

> 用于在 React 展示 PDF,使用起来非常简单。支持缩放、旋转、文本复制。

# 安装

```bash
#npm
npm install --save react-pdf-simple-viewer

#yarn
yarn add react-pdf-simple-viewer
```

``

# 快速开始

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

# 文档

### Document 组件的 prop 类型：

**`URL`:**

- Type: string
- Required: true
- Description: 获取 PDF 资源的链接

**`onSuccess`:**

- Type: function
- Required: false
- Description: PDF 加载成功时调用

**`onError`:**

- Type: function
- Required: false
- Description: PDF 加载失败时调用

### Page 组件的 prop 类型：

**`index`:**

- Type: number
- Required: false
- Description: 需要渲染页面的索引
- Default: 1

**`width`:**

- Type: number
- Required: false
- Description: 页面的宽度，单位默认 px

**`scale`:**

- Type: number
- Required: false
- Description: 控制页面缩放比例
- Default: 1

**`hideTextLayer`:**

- Type: boolean
- Required: false
- Description: 控制是否隐藏文本层
- Default: false
