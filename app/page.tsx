"use client";
import dynamic from "next/dynamic";

// Dynamically import the Map component with SSR disabled
const Map = dynamic(() => import("./components/Map"), {
  ssr: false,
});

export default function HomePage() {
  return (
    <div>
      <Map />
    </div>
  );
}
