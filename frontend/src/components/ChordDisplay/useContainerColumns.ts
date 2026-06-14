import { useRef, useEffect, useState, useCallback } from 'react';

export function useContainerColumns(rawHtml: string | undefined) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxCols, setMaxCols] = useState(0);

  const measureCols = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const tabEl = container.querySelector('.tablatura') || container.querySelector('.cnt');
    const measure = document.createElement('span');
    measure.style.fontFamily = '"Roboto Mono", monospace';
    measure.style.fontSize = tabEl
      ? window.getComputedStyle(tabEl).fontSize
      : '14px';
    measure.style.letterSpacing = '0px';
    measure.style.visibility = 'hidden';
    measure.style.position = 'absolute';
    measure.style.whiteSpace = 'pre';
    measure.textContent = 'M';
    container.appendChild(measure);

    const charWidth = measure.getBoundingClientRect().width;
    container.removeChild(measure);

    if (charWidth > 0) {
      const style = window.getComputedStyle(container);
      const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const availableWidth = container.clientWidth - padding;
      setMaxCols(Math.floor(availableWidth / charWidth));
    }
  }, []);

  useEffect(() => {
    measureCols();
    const observer = new ResizeObserver(() => measureCols());
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [measureCols, rawHtml]);

  return { containerRef, maxCols };
}
