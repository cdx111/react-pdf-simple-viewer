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
  const [currentPage, setCurrentPage] = useState<number>(1)
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
      return [start, start + height + 7]
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
    setCurrentPage(index + 1)
  }

  function getItemSize(index: number): number {
    // 为什么加7看Row组件注释
    return pagesHeight[index] + 7;
  }

  return (
    <>
      <GlobalStyle></GlobalStyle>
      <AutoSizer onResize={(size) => setContainerHeight(size.height)}>
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
          )
        }}
      </AutoSizer>
      {pagesHeight.length !== 0 && <Tool pagination={{
        total: pagesHeight.length, current: currentPage, onChange: (page) => {
          if (page > pagesHeight.length) {
            setCurrentPage(pagesHeight.length);
            listRef.current?.scrollToItem(pagesHeight.length - 1)
          } else {
            setCurrentPage(page);
            listRef.current?.scrollToItem(page - 1)
          }


        }
      }}></Tool>}
    </>
  );
};

export default Example3;
