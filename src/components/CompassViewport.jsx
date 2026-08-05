import { useEffect, useRef, useState } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { TransformComponent, TransformWrapper, useControls } from 'react-zoom-pan-pinch';
import { coverScaleForViewport } from '../lib/viewport.js';

function ZoomControls() {
  const { zoomIn, zoomOut, resetTransform } = useControls();

  return (
    <div className="zoom-controls" aria-label="Compass zoom controls">
      <button type="button" onClick={() => zoomIn()} aria-label="Zoom in" title="Zoom in">
        <Plus size={15} strokeWidth={1.5} />
      </button>
      <button type="button" onClick={() => zoomOut()} aria-label="Zoom out" title="Zoom out">
        <Minus size={15} strokeWidth={1.5} />
      </button>
      <span className="zoom-control-divider" aria-hidden="true" />
      <button type="button" onClick={() => resetTransform()} aria-label="Reset compass to fit" title="Reset to fit">
        <RotateCcw size={14} strokeWidth={1.5} />
      </button>
    </div>
  );
}

function FullViewTransform({ active, coverScale }) {
  const { centerView } = useControls();

  useEffect(() => {
    let secondFrame;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        centerView(active ? coverScale : 1, 260, 'easeOut');
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
    };
  }, [active, centerView, coverScale]);

  return null;
}

function CompassViewport({ children, focusMode = false, markerDragging, onZoom, onTransformed }) {
  const wrapperRef = useRef(null);
  const [coverScale, setCoverScale] = useState(1);

  useEffect(() => {
    if (!focusMode) {
      setCoverScale(1);
      return undefined;
    }

    const updateCoverScale = () => {
      const bounds = wrapperRef.current?.getBoundingClientRect();
      setCoverScale(coverScaleForViewport(bounds?.width, bounds?.height));
    };

    updateCoverScale();
    window.addEventListener('resize', updateCoverScale);
    window.addEventListener('orientationchange', updateCoverScale);
    return () => {
      window.removeEventListener('resize', updateCoverScale);
      window.removeEventListener('orientationchange', updateCoverScale);
    };
  }, [focusMode]);

  return (
    <div className="viewport-shell" ref={wrapperRef}>
      <TransformWrapper
        minScale={focusMode ? coverScale : 1}
        maxScale={8}
        initialScale={1}
        centerOnInit
        limitToBounds
        centerZoomedOut
        wheel={{ step: 0.12, smoothStep: 0.01 }}
        pinch={{ step: 4 }}
        panning={{ disabled: markerDragging, velocityDisabled: true }}
        doubleClick={{ disabled: true }}
        onZoom={onZoom}
        onTransformed={onTransformed}
      >
        <TransformComponent wrapperClass="zoom-wrapper" contentClass="zoom-content">
          {children}
        </TransformComponent>
        <FullViewTransform active={focusMode} coverScale={coverScale} />
        <ZoomControls />
      </TransformWrapper>
    </div>
  );
}

export default CompassViewport;
