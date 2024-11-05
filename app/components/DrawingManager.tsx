'use client'
import React, { useEffect } from 'react';
import * as atlas from 'azure-maps-control';
import 'azure-maps-drawing-tools';
import { measureShape } from '../utils/mapHelpers';

interface DrawingManagerProps {
  mapRef: React.MutableRefObject<atlas.Map | null>;
}

const DrawingManager: React.FC<DrawingManagerProps> = ({ mapRef }) => {
  useEffect(() => {
    if (mapRef.current) {
      const drawingTools = (window as any).atlas.drawing.DrawingManager;
      const drawingManager = new drawingTools(mapRef.current, {
        toolbar: new (window as any).atlas.drawing.control.DrawingToolbar({
          buttons: ['draw-line', 'draw-polygon', 'draw-circle'],
          position: 'top-right',
          style: 'light'
        })
      });

      const updateMeasurement = (shape: atlas.Shape) => {
        const measurement = measureShape(shape);
        if (measurement) {
          document.getElementById('measurementInfo')!.innerHTML = measurement;
        }
      };

      mapRef.current.events.add('drawingchanging', drawingManager, updateMeasurement);
      mapRef.current.events.add('drawingchanged', drawingManager, updateMeasurement);

      return () => drawingManager.dispose();
    }
  }, [mapRef]);

  return null;
};

export default DrawingManager;
