"use client";

import React, { useEffect, useRef } from "react";
import * as atlas from "azure-maps-control";
import { Dropdown } from "carbon-components-react";

interface PropertySelectorProps {
  properties: string[];
  selectedProperty: string;
  setSelectedProperty: React.Dispatch<React.SetStateAction<string>>;
  setProperties: React.Dispatch<React.SetStateAction<string[]>>;
  selectedPropertyValues: string[];
  setSelectedPropertyValues: React.Dispatch<React.SetStateAction<string[]>>;
  valueColorMap: { [key: string]: string };
  setValueColorMap: React.Dispatch<
    React.SetStateAction<{ [key: string]: string }>
  >;
  dataSources: atlas.source.DataSource[];
  mapRef: React.MutableRefObject<atlas.Map | null>;
}

const PropertySelector: React.FC<PropertySelectorProps> = ({
  properties,
  selectedProperty,
  setSelectedProperty,
  setProperties,
  selectedPropertyValues,
  setSelectedPropertyValues,
  valueColorMap,
  setValueColorMap,
  dataSources,
  mapRef,
}) => {
  const layerMapRef = useRef<{ [key: string]: atlas.layer.Layer[] }>({});

  useEffect(() => {
    if (selectedProperty) {
      const valuesSet = new Set<string>();
      dataSources.forEach((dataSource) => {
        dataSource.getShapes().forEach((shape) => {
          const value = shape.getProperties()[selectedProperty];
          if (value != null) {
            valuesSet.add(value);
          }
        });
      });
      setSelectedPropertyValues(Array.from(valuesSet));
    }
  }, [selectedProperty, dataSources, setSelectedPropertyValues]);

  useEffect(() => {
    const propertiesSet = new Set<string>();

    dataSources.forEach((dataSource) => {
      dataSource.getShapes().forEach((shape) => {
        const shapeProperties = shape.getProperties();
        for (const key in shapeProperties) {
          if (shapeProperties.hasOwnProperty(key)) {
            propertiesSet.add(key);
          }
        }
      });
    });

    setProperties((prev) => {
      const newProperties = Array.from(propertiesSet);

      if (JSON.stringify(prev) !== JSON.stringify(newProperties)) {
        return newProperties;
      }
      return prev;
    });
  }, [dataSources, setProperties]);

  const handleColorChange = (value: string, color: string) => {
    setValueColorMap((prev) => ({ ...prev, [value]: color }));

    if (mapRef.current) {
      dataSources.forEach((dataSource) => {
        dataSource.getShapes().forEach((shape) => {
          const shapeValue = shape.getProperties()[selectedProperty];
          if (shapeValue != null && shapeValue === value) {
            shape.setProperties({ ...shape.getProperties(), color });
          }
        });

        const dataSourceId = dataSource.getId();
        if (layerMapRef.current[dataSourceId]) {
          layerMapRef.current[dataSourceId].forEach((layer) => {
            if (mapRef.current) {
              mapRef.current.layers.remove(layer);
            }
          });
        }

        const bubbleLayer = new atlas.layer.BubbleLayer(dataSource, undefined, {
          filter: ["==", "$type", "Point"],
          color: ["get", "color"],
        });
        const lineLayer = new atlas.layer.LineLayer(dataSource, undefined, {
          filter: ["==", "$type", "LineString"],
          strokeColor: ["get", "color"],
        });
        const polygonLayer = new atlas.layer.PolygonLayer(
          dataSource,
          undefined,
          {
            filter: ["==", "$type", "Polygon"],
            fillColor: ["get", "color"],
          }
        );

        if (mapRef.current) {
          mapRef.current.layers.add([bubbleLayer, lineLayer, polygonLayer]);
          layerMapRef.current[dataSourceId] = [
            bubbleLayer,
            lineLayer,
            polygonLayer,
          ];
        }
      });
    }
  };

  return (
    <div>
      <div>
        <Dropdown
          id="property-select"
          titleText="Choose Property"
          helperText="Select a property to visualize"
          label="Select Property"
          items={properties.map((property) => ({ text: property }))}
          itemToString={(item) => (item ? item.text : "")}
          selectedItem={selectedProperty ? { text: selectedProperty } : null}
          onChange={({ selectedItem }) =>
            setSelectedProperty(selectedItem ? selectedItem.text : "")
          }
          className="custom-scroll-dropdown"
        />
      </div>

      {selectedPropertyValues.map((value) => (
        <div key={value}>
          <span>{value}</span>
          <input
            type="color"
            value={valueColorMap[value] || "#000000"}
            onChange={(e) => handleColorChange(value, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
};

export default PropertySelector;
