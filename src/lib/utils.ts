import { clsx, type ClassValue } from 'clsx';
import ReactDOMServer from 'react-dom/server';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const encodeSvg = (reactElement: React.ReactElement): string => {
  // 將 React SVG 元素轉換為靜態 SVG 並進行 URL 編碼
  const svgString = ReactDOMServer.renderToStaticMarkup(reactElement);
  return 'data:image/svg+xml;base64,' + btoa(svgString);
};
