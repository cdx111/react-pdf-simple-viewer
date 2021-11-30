import 'react-app-polyfill/ie11';
import * as React from 'react';
import { useState } from 'react';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Document, getPageHeight, Page } from '../dist/index';
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
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

  function getItemSize(index: number): number {
    // 为什么加7看Row组件注释
    return pagesHeight[index] + 7;
  }

  return (
    <>
      <GlobalStyle></GlobalStyle>
      <AutoSizer>
        {({ height, width }) => (
          <Document
            URL="http://localhost:1234/123.pdf"
            onSuccess={successHandler}
          >
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

export default Example2;
