import { useRef } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { TransformComponent, TransformWrapper, useControls } from 'react-zoom-pan-pinch';

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

function CompassViewport({ children, markerDragging, onZoom, onTransformed }) {
  const wrapperRef = useRef(null);

  return (
    <div className="viewport-shell" ref={wrapperRef}>
      <TransformWrapper
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
        onZoom={onZoom}
        onTransformed={onTransformed}
      >
        <TransformComponent wrapperClass="zoom-wrapper" contentClass="zoom-content">
          {children}
        </TransformComponent>
        <ZoomControls />
      </TransformWrapper>
    </div>
  );
}

export default CompassViewport;
