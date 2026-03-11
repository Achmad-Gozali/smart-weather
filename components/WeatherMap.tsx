'use client';

import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface WeatherMapProps {
  lat: number;
  lon: number;
  city: string;
  temp: number;
  // unique id so two instances never share the same container
  mapId?: string;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center && !isNaN(center[0]) && !isNaN(center[1])) {
      map.flyTo(center, 12, { duration: 2 });
    }
  }, [center, map]);
  return null;
}

const WeatherMap: React.FC<WeatherMapProps> = ({
  lat,
  lon,
  city,
  temp,
  mapId = 'default',
}) => {
  const safeLat = isNaN(lat) ? -6.2088 : lat;
  const safeLon = isNaN(lon) ? 106.8456 : lon;
  const position: [number, number] = [safeLat, safeLon];

  // Unique container id prevents "Map container is being reused" error
  const containerId = `leaflet-map-${mapId}`;

  // Cleanup: destroy any existing Leaflet instance on this container before mount
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    return () => {
      if (containerRef.current) {
        // @ts-ignore — Leaflet attaches _leaflet_id to the DOM node
        delete containerRef.current._leaflet_id;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[300px] rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm relative z-0"
    >
      <MapContainer
        key={containerId}
        id={containerId}
        center={position}
        zoom={12}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', minHeight: '300px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={position} />
        {!isNaN(position[0]) && !isNaN(position[1]) && (
          <Marker position={position} icon={icon}>
            <Popup>
              <div className="text-center">
                <p className="font-bold text-slate-900 m-0">{city}</p>
                <p className="text-blue-600 font-black m-0">{temp}°C</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default WeatherMap;