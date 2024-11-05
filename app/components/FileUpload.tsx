import React, { useState } from "react";
import * as atlas from "azure-maps-control";
import {
  FormItem,
  FileUploaderDropContainer,
  Button,
} from "carbon-components-react";
import { CloseLarge } from "@carbon/icons-react";

interface FileUploadProps {
  mapRef: React.MutableRefObject<atlas.Map | null>;
  setProperties: React.Dispatch<React.SetStateAction<string[]>>;
  setDataSources: (
    dataSource: atlas.source.DataSource,
    fileName: string
  ) => void;
  onClose: () => void;
  onFileUploaded: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  mapRef,
  setProperties,
  setDataSources,
  onClose,
  onFileUploaded,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (mapRef.current) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const geoJson = JSON.parse(e.target?.result as string);
            const dataSource = new atlas.source.DataSource();
            dataSource.add(geoJson);
            mapRef.current?.sources.add(dataSource);

            // Add different types of layers for different geometry types
            const pointLayer = new atlas.layer.BubbleLayer(
              dataSource,
              undefined,
              {
                filter: ["==", "$type", "Point"],
              }
            );
            const lineLayer = new atlas.layer.LineLayer(dataSource, undefined, {
              filter: ["==", "$type", "LineString"],
            });
            const polygonLayer = new atlas.layer.PolygonLayer(
              dataSource,
              undefined,
              {
                filter: ["==", "$type", "Polygon"],
              }
            );

            mapRef.current?.layers.add([pointLayer, lineLayer, polygonLayer]);

            // Store data source and file name for display and removal
            setDataSources(dataSource, file.name);

            // Extract properties for PropertySelector
            const propertiesSet = new Set<string>();
            dataSource.getShapes().forEach((shape) => {
              const properties = shape.getProperties();
              for (const key in properties) {
                propertiesSet.add(key);
              }
            });
            setProperties(Array.from(propertiesSet));

            // Set the camera to the bounds of the uploaded data
            const bbox = atlas.data.BoundingBox.fromData(geoJson);
            mapRef.current?.setCamera({
              bounds: bbox,
              padding: 40,
            });
            // Notify parent component about successful file upload
            onFileUploaded(); // Added this line

            // Close the file upload overlay
            setIsVisible(false);
            onClose();
          } catch (error) {
            console.error("Error parsing GeoJSON file:", error);
          }
        };
        reader.readAsText(file);
      }
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        zIndex: 1000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "8px",
          width: "90%",
          maxWidth: "500px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <FormItem>
          <p className="cds--file--label">Upload GeoJSON File</p>
          <p className="cds--label-description">
            Max file size is 500kb. Supported file types are .json.
          </p>
          <FileUploaderDropContainer
            accept={[]}
            labelText="Drag and drop a file here or click to upload"
            onAddFiles={(evt, { addedFiles }) => {
              if (addedFiles.length > 0) {
                const fileInputEvent = {
                  target: { files: addedFiles },
                } as unknown as React.ChangeEvent<HTMLInputElement>;
                handleFileUpload(fileInputEvent);
              }
            }}
          />
          <div className="cds--file-container cds--file-container--drop" />
        </FormItem>
        <Button
          kind="ghost"
          hasIconOnly
          renderIcon={CloseLarge}
          iconDescription="Close"
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          style={{
            position: "relative",
            zIndex: 1001,
          }}
        />
      </div>
    </div>
  );
};

export default FileUpload;
