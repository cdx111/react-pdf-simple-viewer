import * as React from 'react';
import { useCallback, useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import { DocumentContext } from './documentContext';
import * as pdfjs from 'pdfjs-dist';
import { PDFPageProxy } from 'pdfjs-dist/types/src/display/api';
import { Spinner } from './Spinner';
// page高度获取的问题

const PageStyle = styled.div`
  position: relative;
  will-change: scroll-position;
  .textLayer {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    overflow: hidden;
    line-height: 1;
    text-align: initial;
    opacity: 0.2;
  }

  .textLayer span,
  .textLayer br {
    position: absolute;
    color: transparent;
    white-space: pre;
    transform-origin: 0% 0%;
    cursor: text;
  }

  .textLayer .highlight {
    margin: -1px;
    padding: 1px;
    background-color: rgba(180, 0, 170, 1);
    border-radius: 4px;
  }

  .textLayer .highlight.appended {
    position: initial;
  }

  .textLayer .highlight.begin {
    border-radius: 4px 0 0 4px;
  }

  .textLayer .highlight.end {
    border-radius: 0 4px 4px 0;
  }

  .textLayer .highlight.middle {
    border-radius: 0;
  }

  .textLayer .highlight.selected {
    background-color: rgba(0, 100, 0, 1);
    color: transparent;
  }

  .textLayer ::-moz-selection {
    background: rgba(0, 0, 255, 1);
    color: transparent;
  }

  .textLayer ::selection {
    background: rgba(0, 0, 255, 1);
    color: transparent;
  }

  /* Avoids https://github.com/mozilla/pdf.js/issues/13840 in Chrome */
  .textLayer br::-moz-selection {
    background: transparent;
    color: transparent;
  }
  .textLayer br::selection {
    background: transparent;
    color: transparent;
  }

  .textLayer .endOfContent {
    position: absolute;
    top: 100%;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: -1;
    display: block;
    cursor: default;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
  }

  .textLayer .endOfContent.active {
    top: 0;
  }
`;

/*
 @prop index 渲染那一页PDF，默认值1
 @prop rotate 必须是90的倍数, 默认值0
 @prop scale width与实际pdf宽度的比，默认值1
 @prop width page宽度，默认值实际pdf宽度,单位px
*/
type PageProps = {
  index?: number;
  scale?: number;
  width?: number;
  rotate?: number;
  hideTextLayer?: boolean;
};

export const Page: React.FC<PageProps> = ({
  index = 1,
  width,
  scale = 1,
  hideTextLayer = false,
}) => {
  const [textLayerStyle, setTextLayerStyle] = useState<React.CSSProperties>({});
  const PDF = useContext(DocumentContext);
  const [page, setPage] = useState<PDFPageProxy | null>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement>();
  const [textLayer, setTextLayer] = useState<HTMLDivElement>();
  const [pageWidth, setPageWidth] = useState<number | null>(null);

  useEffect(() => {
    if (PDF) {
      PDF.getPage(index).then(p => {
        setPage(p);
      });
    }
    return () => {
      if (PDF) {
        setPage(null);
      }
    };
  }, [PDF]);

  useEffect(() => {
    async function render() {
      if (!page || !PDF || !canvas) return;
      const WIDTH = width ?? page._pageInfo.view[2];
      // 根据width计算实际缩放比
      const SCALE = (WIDTH / page._pageInfo.view[2]) * scale;
      const viewport = page.getViewport({
        scale: SCALE,
      });

      const outputScale = window.devicePixelRatio || 1;
      const context = canvas.getContext('2d');
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = Math.floor(viewport.width) + 'px';
      canvas.style.height = Math.floor(viewport.height) + 'px';
      setPageWidth(Math.floor(viewport.width));
      const transform =
        outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

      page.render({
        canvasContext: context as any,
        transform: transform,
        viewport: viewport,
      });

      async function renderTextLayer() {
        if (!page || !canvas || !textLayer || hideTextLayer) return;
        const textContent = await page.getTextContent();
        const nodeOffset = canvas.getBoundingClientRect();
        setTextLayerStyle({
          left: 0,
          top: 0,
          height: nodeOffset.height,
          width: nodeOffset.width,
        });
        textLayer.innerHTML = '';
        pdfjs.renderTextLayer({
          textContent: textContent,
          container: textLayer as HTMLElement,
          viewport: viewport,
          textDivs: [],
        });
      }
      renderTextLayer();
    }
    render();
  }, [canvas, textLayer, PDF, page, scale]);

  const callRefCanvas = useCallback((node: HTMLCanvasElement) => {
    setCanvas(node);
  }, []);

  const callRefTextLayer = useCallback((node: HTMLDivElement) => {
    setTextLayer(node);
  }, []);

  return (
    <PageStyle style={{ width: pageWidth ? `${pageWidth}px` : 'auto' }}>
      {page ? (
        <>
          <canvas ref={callRefCanvas}></canvas>
          {!hideTextLayer && (
            <div
              className="textLayer"
              ref={callRefTextLayer}
              style={textLayerStyle}
            ></div>
          )}
        </>
      ) : (
        <Spinner></Spinner>
      )}
    </PageStyle>
  );
};
