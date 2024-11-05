// /app/utils/mapHelpers.ts
import * as atlas from 'azure-maps-control';

export function measureShape(shape: atlas.Shape): string {
  let msg = '';

  if (shape.isCircle()) {
    const radius = shape.getProperties().radius;
    const perimeter = 2 * Math.PI * radius;
    const area = Math.PI * Math.pow(radius, 2);

    msg = `Circle Measurements:<br/>Radius: ${radius.toFixed(2)} m<br/>Perimeter: ${perimeter.toFixed(2)} m<br/>Area: ${area.toFixed(2)} m²`;
  } else {
    const geometry = shape.toJson().geometry;

    if (geometry.type === 'LineString') {
      const length = atlas.math.getLengthOfPath(geometry.coordinates as atlas.data.Position[], 'meters');
      msg = `Line Measurements:<br/>Length: ${length.toFixed(2)} m`;
    } else if (geometry.type === 'Polygon') {
      const perimeter = atlas.math.getLengthOfPath(geometry.coordinates[0] as atlas.data.Position[], 'meters');
      const areaInSquareMeters = atlas.math.getArea(geometry, atlas.math.AreaUnits.squareMeters);

      msg = `Polygon Measurements:<br/>Perimeter: ${perimeter.toFixed(2)} m<br/>Area: ${areaInSquareMeters.toFixed(2)} m²`;
    }
  }

  return msg;
}
