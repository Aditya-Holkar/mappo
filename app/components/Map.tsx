"use client";

import React, { useEffect, useRef, useState } from "react";
import * as atlas from "azure-maps-control";
import DrawingManager from "./DrawingManager";
import FileUpload from "./FileUpload";
import MeasurementDisplay from "./MeasurementDisplay";
import PropertySelector from "./PropertySelector";
import styles from "../styles/Map.module.sass";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  Tile,
  Button,
  Accordion,
  AccordionItem,
} from "carbon-components-react";

interface UploadedFile {
  name: string;
  dataSource: atlas.source.DataSource;
}

const Map: React.FC = () => {
  const mapRef = useRef<atlas.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [properties, setProperties] = useState<string[]>([]);
  const [dataSources, setDataSources] = useState<UploadedFile[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [selectedPropertyValues, setSelectedPropertyValues] = useState<
    string[]
  >([]);
  const [valueColorMap, setValueColorMap] = useState<{ [key: string]: string }>(
    {}
  );
  const [isFileUploadVisible, setIsFileUploadVisible] = useState(true);
  const [fileUploadKey, setFileUploadKey] = useState(0);
  const [isPanelHidden, setIsPanelHidden] = useState(false);

  useEffect(() => {
    if (mapContainerRef.current) {
      mapRef.current = new atlas.Map(mapContainerRef.current, {
        center: [0, 0],
        zoom: 2,
        authOptions: {
          authType: atlas.AuthenticationType.subscriptionKey,
          subscriptionKey: process.env.NEXT_PUBLIC_AZURE_MAPS_KEY || "",
        },
      });

      mapRef.current.events.add("ready", () => {
        mapRef.current?.controls.add(
          [
            new atlas.control.ZoomControl(),
            new atlas.control.PitchControl(),
            new atlas.control.CompassControl(),
            new atlas.control.StyleControl({ mapStyles: "all" }),
          ],
          { position: atlas.ControlPosition.TopRight }
        );

        mapRef.current?.events.add("click", (e) => {
          const features = mapRef.current!.layers.getRenderedShapes(e.position);
          if (features.length > 0) {
            let popupContent =
              '<div id="popupContainer" style="position: relative;">';
            popupContent +=
              '<button onclick="document.getElementById(\'popupContainer\').remove()" style="position: absolute; top: 5px; right: 5px; background: transparent; border: none; font-size: 16px; cursor: pointer;">x</button>';
            popupContent += "<table>";
            features.forEach((feature) => {
              const properties =
                feature instanceof atlas.Shape
                  ? feature.getProperties()
                  : feature.properties;
              for (const key in properties) {
                if (properties[key]) {
                  popupContent += `<tr><td>${key}</td><td>${properties[key]}</td></tr>`;
                }
              }
            });
            popupContent += "</table></div>";

            const popup = new atlas.Popup({
              position: e.position,
              content: popupContent,
              closeButton: false,
            });

            popup.open(mapRef.current!);
          }
        });
      });
    }

    return () => mapRef.current?.dispose();
  }, []);

  const onFileUploaded = () => {
    setIsFileUploadVisible(false);
    setIsPanelHidden(true);
  };

  const openFileUpload = () => {
    setIsFileUploadVisible(true);
    setFileUploadKey((prevKey) => prevKey + 1);
  };

  const togglePanel = () => {
    setIsPanelHidden((prev) => !prev);
  };

  return (
    <div className={styles.mapContainer}>
      <Tile
        id="tile-1"
        className={styles.tileOverlay}
        style={{
          transform: isPanelHidden ? "translateX(-100%)" : "translateX(0)",
          transition: "transform 0.5s ease-in-out",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1000,
          padding: "15px",
          // backgroundColor: "#ccc",
          // border: "1px solid #ccc",
          width: "300px",
          height: "calc(100vh - 0px)",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          overflowY: "auto",
        }}
      >
        <Button onClick={openFileUpload}>Open File Upload</Button>
        {dataSources.length > 0 && (
          <Accordion>
            <AccordionItem title="Uploaded Files">
              {dataSources.map((file, index) => (
                <React.Fragment key={index}>
                  <p>{file.name}</p>
                  <br />
                </React.Fragment>
              ))}
            </AccordionItem>
          </Accordion>
        )}
        <PropertySelector
          setProperties={setProperties}
          properties={properties}
          selectedProperty={selectedProperty}
          setSelectedProperty={setSelectedProperty}
          selectedPropertyValues={selectedPropertyValues}
          setSelectedPropertyValues={setSelectedPropertyValues}
          valueColorMap={valueColorMap}
          setValueColorMap={setValueColorMap}
          dataSources={dataSources.map((file) => file.dataSource)}
          mapRef={mapRef}
        />
      </Tile>

      <Button
        onClick={togglePanel}
        style={{
          position: "fixed",
          top: "10px",
          left: isPanelHidden ? "5px" : "310px",
          zIndex: 1000,
          padding: "10px",
          margin: "5px",
          transition: "left 0.5s ease-in-out",
        }}
      >
        {isPanelHidden ? (
          <span style={{ padding: "5px" }}>&#9654;</span>
        ) : (
          <span style={{ padding: "5px" }}>&#9664;</span>
        )}
      </Button>

      <div ref={mapContainerRef} className={styles.mapInner} />
      {isFileUploadVisible && (
        <FileUpload
          key={fileUploadKey}
          mapRef={mapRef}
          setProperties={setProperties}
          setDataSources={(newDataSource, fileName) => {
            setDataSources((prev) => {
              const fileExists = prev.some((file) => file.name === fileName);
              if (fileExists) {
                return prev;
              }
              return [...prev, { name: fileName, dataSource: newDataSource }];
            });
          }}
          onClose={() => setIsFileUploadVisible(false)}
          onFileUploaded={onFileUploaded}
        />
      )}

      <DrawingManager mapRef={mapRef} />
      <MeasurementDisplay />
    </div>
  );
};

export default Map;
