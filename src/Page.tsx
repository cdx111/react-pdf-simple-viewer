import React, { useCallback, useContext, useRef, useState } from 'react';
import styled from 'styled-components';
import { DocumentContext } from './documentContext';
import * as pdfjs from 'pdfjs-dist';

const PageStyle = styled.div`
  position: relative;
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
  }

  .textLayer ::-moz-selection {
    background: rgba(0, 0, 255, 1);
  }

  .textLayer ::selection {
    background: rgba(0, 0, 255, 1);
  }

  /* Avoids https://github.com/mozilla/pdf.js/issues/13840 in Chrome */
  .textLayer br::-moz-selection {
    background: transparent;
  }
  .textLayer br::selection {
    background: transparent;
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

type PageProps = {
  index: number;
};

export const Page: React.FC<PageProps> = ({ index }) => {
  const [textLayerStyle, setTextLayerStyle] = useState<React.CSSProperties>({});
  const PDF = useContext(DocumentContext);
  const refTextLayer = useRef<HTMLDivElement>(null);
  const callRefCanvas = useCallback(
    async (node: HTMLCanvasElement) => {
      if (!node || !PDF) return;
      const page = await PDF.getPage(index);
      async function render() {
        // 根据width计算实际缩放比
        const scale = 857 / page._pageInfo.view[2];

        const viewport = page.getViewport({ scale: scale });
        const outputScale = window.devicePixelRatio || 1;
        const context = node.getContext('2d');

        // 高宽比，计算实际高度
        const ratioHW = page._pageInfo.view[3] / page._pageInfo.view[2];
        node.width = Math.floor(857 * outputScale);
        node.height = Math.floor(857 * ratioHW * outputScale);
        node.style.width = Math.floor(857) + 'px';
        node.style.height = Math.floor(857 * ratioHW) + 'px';
        const transform =
          outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;
        const renderContext = {
          canvasContext: context as any,
          transform: transform as any,
          viewport: viewport,
        };
        page.render(renderContext);

        async function renderTextLayer() {
          const textContent = await page.getTextContent();
          const nodeOffset = node.getBoundingClientRect();
          setTextLayerStyle({
            left: 0,
            top: 0,
            height: nodeOffset.height,
            width: nodeOffset.width,
          });

          pdfjs.renderTextLayer({
            textContent: textContent,
            container: refTextLayer.current as HTMLElement,
            viewport: viewport,
            textDivs: [],
          });
        }

        renderTextLayer();
      }
      render();
    },
    [PDF]
  );
  return (
    <PageStyle>
      <canvas ref={callRefCanvas}></canvas>
      <div
        className="textLayer"
        ref={refTextLayer}
        style={textLayerStyle}
      ></div>
    </PageStyle>
  );
};
