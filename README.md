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

这里是[Code Sandbox demo](https://codesandbox.io/s/i4p9x?file=/src/App.tsx).

## 例子 2

配合 react-window(虚拟滚动提升性能) + react-virtualized-auto-sizer 实现全屏滚动预览。

```tsx
import React, { useState } from 'react';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Document, getPageHeight, Page } from 'react-pdf-simple-viewer';
import { createGlobalStyle } from 'styled-components';

// 给body设置高度，AutoSizer才可以获取到实际高度
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
  }
  html,
  body,
  #root {
  height: 100%;
  overflow-x: hidden;
  background: #f2f5f8;
}
`;

const Row: React.FC<{
  index: number;
  style: React.CSSProperties;
  data: number;
}> = ({ style, index, data }) => {
  return (
    <div style={style}>
      {/* //注意，这里我们给每页增加了7px的边框，高度计算那边也需要计算上 */}
      <Page
        index={index + 1}
        width={data}
        style={{ margin: '0px auto', borderBottom: 'solid 7px #f2f5f8' }}
      ></Page>
    </div>
  );
};

const Example2: React.FC = () => {
  const WIDTH = 864;
  const [pagesHeight, setPagesHeight] = useState<number[]>([]);
  async function successHandler(pdf: any) {
    const { numPages } = pdf;
    const array = Array.from({ length: numPages }).fill(0);
    // 计算每一页的高度
    const pagesHeight = await Promise.all(
      array.map((i, index) => {
        return getPageHeight(pdf, { index: index + 1, width: WIDTH });
      })
    );
    setPagesHeight(pagesHeight);
  }

  function getItemSize(index: number): number {
    // 为什么加7看Row组件注释
    return pagesHeight[index] + 7;
  }

  return (
    <>
      <GlobalStyle></GlobalStyle>
      <AutoSizer>
        {({ height, width }) => (
          <Document URL="/0410100.pdf" onSuccess={successHandler}>
            {pagesHeight.length !== 0 && (
              <List
                height={height}
                width={width}
                itemCount={pagesHeight.length}
                itemSize={getItemSize}
                itemData={WIDTH}
              >
                {Row}
              </List>
            )}
          </Document>
        )}
      </AutoSizer>
    </>
  );
};

export default function App() {
  return <Example2 />;
}
```

这里是[Code Sanbox demo](https://codesandbox.io/s/elegant-black-tmvej?file=/src/App.tsx).

## 例子 3

实现 pagination 功能

```tsx
import 'react-app-polyfill/ie11';
import * as React from 'react';
import { useState } from 'react';
import { ListOnScrollProps, VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Document, getPageHeight, Page } from '../dist/index';
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import { createGlobalStyle } from 'styled-components';
import Tool from './Tool';
// 给body设置高度，AutoSizer才可以获取到实际高度
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
  }
  html,
  body,
  #root {
  height: 100%;
  overflow-x: hidden;
  background: #f2f5f8;
}
`;

const Row: React.FC<{
  index: number;
  style: React.CSSProperties;
  data: number;
}> = ({ style, index, data }) => {
  return (
    <div style={style}>
      {/* //注意，这里我们给每页增加了7px的边框，高度计算那边也需要计算上 */}
      <Page
        index={index + 1}
        width={data}
        style={{ margin: '0px auto', borderBottom: 'solid 7px #f2f5f8' }}
      ></Page>
    </div>
  );
};

const Example3: React.FC = () => {
  const WIDTH = 864;
  const listRef = React.useRef<List<number>>(null);
  const [pagesHeight, setPagesHeight] = useState<number[]>([]);
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  async function successHandler(pdf: PDFDocumentProxy) {
    const { numPages } = pdf;
    const array = Array.from({ length: numPages }).fill(0);
    // 计算每一页的高度
    const pagesHeight = await Promise.all(
      array.map((i, index) => {
        return getPageHeight(pdf, { index: index + 1, width: WIDTH });
      })
    );
    setPagesHeight(pagesHeight);
  }

  function onScroll(event: ListOnScrollProps) {
    //每一页的开始位置和结束位置
    const pagesOffset = pagesHeight.map((height, index) => {
      const start = (height + 7) * index;
      return [start, start + height + 7];
    });

    function binary(): number {
      let low = 0;
      let high = pagesOffset.length - 1;
      while (low <= high) {
        const mid = Math.floor((high + low) / 2);
        const offset = event.scrollOffset + containerHeight / 2;
        const start = pagesOffset[mid][0];
        const end = pagesOffset[mid][1];
        if (start <= offset && offset <= end) {
          return mid;
        }
        if (start > offset) {
          high = mid - 1;
        } else if (start < offset) {
          low = mid + 1;
        }
      }
      return -1;
    }
    const index = binary();
    setCurrentPage(index + 1);
  }

  function getItemSize(index: number): number {
    // 为什么加7看Row组件注释
    return pagesHeight[index] + 7;
  }

  return (
    <>
      <GlobalStyle></GlobalStyle>
      <AutoSizer onResize={size => setContainerHeight(size.height)}>
        {({ height, width }) => {
          return (
            <Document
              URL="http://localhost:1234/123.pdf"
              onSuccess={successHandler}
            >
              {pagesHeight.length !== 0 && (
                <List
                  ref={listRef}
                  onScroll={onScroll}
                  height={height}
                  width={width}
                  itemCount={pagesHeight.length}
                  itemSize={getItemSize}
                  itemData={WIDTH}
                >
                  {Row}
                </List>
              )}
            </Document>
          );
        }}
      </AutoSizer>
      {pagesHeight.length !== 0 && (
        <Tool
          pagination={{
            total: pagesHeight.length,
            current: currentPage,
            onChange: page => {
              if (page > pagesHeight.length) {
                setCurrentPage(pagesHeight.length);
                listRef.current?.scrollToItem(pagesHeight.length - 1);
              } else {
                setCurrentPage(page);
                listRef.current?.scrollToItem(page - 1);
              }
            },
          }}
        ></Tool>
      )}
    </>
  );
};

export default Example3;
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
- Default: 默认为读取 PDF 页面 viewport 的宽度

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

**`style`:**

- Type: Object
- Required: false
- Description: 自定义 Page 组件样式
- Default: {}
