// /app/components/MeasurementDisplay.tsx
import React from 'react';

const MeasurementDisplay: React.FC = () => {
  return (
    <div id="measurementInfo" style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'white', padding: '10px', borderRadius: '10px', zIndex: 1 }}>
      {/* Measurement information will be displayed here */}
    </div>
  );
};

export default MeasurementDisplay;
