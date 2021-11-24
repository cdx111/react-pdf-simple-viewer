import * as React from 'react';
import { useCallback, useContext, useRef, useState } from 'react';
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
};

export const Page: React.FC<PageProps> = ({ index = 1, width, scale = 1 }) => {
  const [textLayerStyle, setTextLayerStyle] = useState<React.CSSProperties>({});
  const PDF = useContext(DocumentContext);
  const refTextLayer = useRef<HTMLDivElement>(null);
  const callRefCanvas = useCallback(
    async (node: HTMLCanvasElement) => {
      if (!node || !PDF) return;
      const page = await PDF.getPage(index);
      async function render() {
        const WIDTH = width ?? page._pageInfo.view[2];
        // 根据width计算实际缩放比
        const SCALE = (WIDTH / page._pageInfo.view[2]) * scale;
        const viewport = page.getViewport({
          scale: SCALE,
        });
        const outputScale = window.devicePixelRatio || 1;
        const context = node.getContext('2d');

        node.width = Math.floor(viewport.width * outputScale);
        node.height = Math.floor(viewport.height * outputScale);
        node.style.width = Math.floor(viewport.width) + 'px';
        node.style.height = Math.floor(viewport.height) + 'px';

        const transform =
          outputScale !== 1
            ? [outputScale, 0, 0, outputScale, 0, 0]
            : undefined;

        page.render({
          canvasContext: context as any,
          transform: transform,
          viewport: viewport,
        });

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
