import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';

export async function getPageHeight(
  PDF: PDFDocumentProxy,
  options: {
    index: number;
    width?: number;
    scale?: number;
  }
) {
  const page = await PDF.getPage(options.index);
  const WIDTH = options.width ?? page._pageInfo.view[2];
  if (options.scale === undefined) {
    options.scale = 1;
  }

  const SCALE = (WIDTH / page._pageInfo.view[2]) * options.scale;
  const viewport = page.getViewport({
    scale: SCALE,
  });
  return viewport.height;
}
