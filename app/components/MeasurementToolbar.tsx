'use client'
import React, { useEffect, useState } from 'react';
import * as atlas from 'azure-maps-control';
import 'azure-maps-drawing-tools'; // Ensure drawing tools are imported

interface MeasurementToolbarProps {
  mapRef: React.MutableRefObject<atlas.Map | null>;
  setMeasurementInfo: React.Dispatch<React.SetStateAction<string>>;
}

const MeasurementToolbar: React.FC<MeasurementToolbarProps> = ({ mapRef, setMeasurementInfo }) => {
  useEffect(() => {
    if (mapRef.current) {
      // Initialize DrawingManager with a toolbar
      const drawingManager = new (window as any).atlas.drawing.DrawingManager(mapRef.current, {
        toolbar: new (window as any).atlas.drawing.control.DrawingToolbar({
          buttons: ['draw-line', 'draw-polygon', 'draw-circle', 'edit-geometry', 'delete-selected'],
          position: 'top-right',
          style: 'light'
        })
      });

      // Set up the 'drawingcomplete' event to calculate measurement info
      mapRef.current.events.add('drawingcomplete', drawingManager, (shape: atlas.Shape) => {
        const measurement = calculateMeasurement(shape);
        setMeasurementInfo(measurement);
        drawingManager.setOptions({ mode: null }); // Reset mode after drawing is complete
      });
    }
  }, [mapRef, setMeasurementInfo]);

  const calculateMeasurement = (shape: atlas.Shape): string => {
    let measurement = '';
    const geometry = shape.toJson().geometry;

    if (geometry.type === 'Polygon' && Array.isArray(geometry.coordinates)) {
      const area = atlas.math.getArea(geometry as atlas.data.Polygon, atlas.math.AreaUnits.squareMeters);
      const perimeter = atlas.math.getLengthOfPath(geometry.coordinates[0] as atlas.data.Position[], 'meters');
      measurement = `Area: ${area.toFixed(2)} m², Perimeter: ${perimeter.toFixed(2)} m`;
    } else if (geometry.type === 'LineString' && Array.isArray(geometry.coordinates)) {
      const length = atlas.math.getLengthOfPath(geometry.coordinates as atlas.data.Position[], 'meters');
      measurement = `Length: ${length.toFixed(2)} m`;
    } else if (geometry.type === 'Point') {
      measurement = 'No measurement for points';
    }

    return measurement;
  };

  return null; // Toolbar is rendered on the map by DrawingManager, so no visible JSX is needed here
};

export default MeasurementToolbar;
