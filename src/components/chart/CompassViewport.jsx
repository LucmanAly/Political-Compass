import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { TransformComponent, TransformWrapper, useControls } from 'react-zoom-pan-pinch';

function ZoomControls({ compact }) {
  const { zoomIn, zoomOut, resetTransform } = useControls();

  return (
    <div className={`chart-zoom-controls${compact ? ' is-compact' : ''}`} aria-label="Chart zoom controls">
      <button type="button" onClick={() => zoomIn()} aria-label="Zoom in" title="Zoom in">
        <Plus size={16} strokeWidth={1.75} />
      </button>
      <button type="button" onClick={() => zoomOut()} aria-label="Zoom out" title="Zoom out">
        <Minus size={16} strokeWidth={1.75} />
      </button>
      <button type="button" onClick={() => resetTransform()} aria-label="Fit chart to screen" title="Fit to screen">
        <RotateCcw size={15} strokeWidth={1.75} />
      </button>
    </div>
  );
}

const CompassViewport = forwardRef(function CompassViewport({
  children,
  markerDragging = false,
  compactControls = false,
  onTransformed,
}, ref) {
  const transformRef = useRef(null);
  const shellRef = useRef(null);
  const [chartSize, setChartSize] = useState(480);

  useEffect(() => {
    const node = shellRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return undefined;

    const update = () => {
      const rect = node.getBoundingClientRect();
      // Use nearly the full shorter side so the compass dominates the workspace.
      const next = Math.max(240, Math.floor(Math.min(rect.width, rect.height) - 4));
      setChartSize((current) => (Math.abs(current - next) > 1 ? next : current));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    reset() {
      transformRef.current?.resetTransform();
    },
    zoomIn() {
      transformRef.current?.zoomIn();
    },
    zoomOut() {
      transformRef.current?.zoomOut();
    },
    centerOnSvgPoint(x, y, scale) {
      const instance = transformRef.current;
      if (!instance) return;
      const wrapper = instance.instance?.wrapperComponent;
      if (!wrapper) {
        instance.centerView?.(scale);
        return;
      }
      const rect = wrapper.getBoundingClientRect();
      const contentScale = scale ?? instance.state?.scale ?? 1;
      const contentSize = chartSize * contentScale;
      const offsetX = rect.width / 2 - (x / 1000) * contentSize;
      const offsetY = rect.height / 2 - (y / 1000) * contentSize;
      instance.setTransform(offsetX, offsetY, contentScale, 200);
    },
    zoomToElement(element) {
      if (element) transformRef.current?.zoomToElement(element, undefined, 200);
    },
  }), [chartSize]);

  return (
    <div className="viewport-shell" ref={shellRef}>
      <TransformWrapper
        ref={transformRef}
        minScale={1}
        maxScale={8}
        initialScale={1}
        centerOnInit
        limitToBounds
        centerZoomedOut
        wheel={{ step: 0.12, smoothStep: 0.01 }}
        pinch={{ step: 4 }}
        panning={{ disabled: markerDragging, velocityDisabled: true }}
        doubleClick={{ disabled: true }}
        onTransformed={onTransformed}
      >
        <TransformComponent wrapperClass="zoom-wrapper" contentClass="zoom-content">
          <div className="chart-size-box" style={{ width: chartSize, height: chartSize }}>
            {children}
          </div>
        </TransformComponent>
        <ZoomControls compact={compactControls} />
      </TransformWrapper>
    </div>
  );
});

export default CompassViewport;
