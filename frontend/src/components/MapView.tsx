"use client";

import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import 'ol/ol.css';
import { fromLonLat, toLonLat } from 'ol/proj';

type ForecastData = {
  temperature: number;
  lat: number;
  lon: number;
  suggestions: string[];
};

const getForecast = async (lat: number, lon: number): Promise<ForecastData> => {
  const response = await fetch(`http://localhost:8000/forecast?lat=${lat}&lon=${lon}`);
  if (!response.ok) {
    throw new Error('Failed to fetch forecast');
  }
  return response.json();
};

const MapView: React.FC = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([121.0, 14.0]), // Philippines
        zoom: 6,
      }),
    });

    map.on('click', async function (event) {
      const coordinate = map.getCoordinateFromPixel(event.pixel);
      if (!coordinate) return;

      const [lon, lat] = toLonLat(coordinate);
      console.log('Clicked at:', lat.toFixed(4), lon.toFixed(4));

      try {
        const data = await getForecast(lat, lon);
        setForecast(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch forecast.');
        setForecast(null);
      }
    });

    return () => map.setTarget(undefined); // Cleanup on unmount
  }, []);

  return (
    <div className="space-y-4">
      <div ref={mapRef} className="h-[500px] w-full border rounded" />

      {error && <p className="text-red-600">{error}</p>}

      {forecast && (
        <div className="p-4 border rounded bg-gray-50">
          <h3 className="text-lg font-bold">Forecast at ({forecast.lat.toFixed(2)}, {forecast.lon.toFixed(2)})</h3>
          <p>Temperature: {forecast.temperature}°C</p>
          <h4 className="mt-2 font-semibold">Crop Suggestions:</h4>
          <ul className="list-disc list-inside">
            {forecast.suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MapView;
