// Next.js convention - declaring client side files (default = server)
"use client";

import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import 'ol/ol.css';
import { fromLonLat, toLonLat } from 'ol/proj';
import Overlay from 'ol/Overlay';

const isValidCoords = (val: any): val is number =>
  typeof val === 'number' && !isNaN(val);

type ForecastData = {
  forecast: number[]; // 7-day temps
  location: { lat: number; lon: number };
  recommended: string[];
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
  const popupRef = useRef<HTMLDivElement | null>(null);

  const [olMap, setOlMap] = useState<Map | null>(null);
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
        console.log("Forecast fetched:", data);

        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch forecast.');
        setForecast(null);
      }
    });

    setOlMap(map);

    return () => map.setTarget(undefined);
  }, []);

  useEffect(() => {
    if (!olMap || !popupRef.current) return;

    const overlay = new Overlay({
      element: popupRef.current,
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [0, -10],
    });

    olMap.addOverlay(overlay);

    const handleClick = (event: any) => {
      const coordinate = event.coordinate;
      overlay.setPosition(coordinate);
    };

    olMap.on('click', handleClick);
    return () => olMap.un('click', handleClick);
  }, [olMap]);

   <div ref={popupRef} className="ol-popup bg-white text-sm p-2 border rounded shadow">
        {forecast && (
          <>
            <strong>Forecast:</strong><br />
            Temp: {forecast.forecast?.[0] ?? 'N/A'}°C<br />
            Lat: {forecast.location.lat.toFixed(2)}, Lon: {forecast.location.lon.toFixed(2)}
          </>
        )}
    </div>
    // Inside component but before `return (...)`
    useEffect(() => {
      if (!popupRef.current) return;
      document.body.appendChild(popupRef.current); // move it out of React DOM control
    }, []);


  return (
  <div className="space-y-4">
    <div ref={mapRef} className="h-[500px] w-full border rounded" />
    {error && <p className="text-red-600">{error}</p>}
    {forecast && (
      <div className="p-4 border rounded bg-gray-50">
        <h3 className="text-lg font-bold">
          Forecast at ({forecast.location.lat.toFixed(2)}, {forecast.location.lon.toFixed(2)})
        </h3>
        <p>Today’s Temperature: {forecast.forecast?.[0]}°C</p>
        <h4 className="mt-2 font-semibold">Crop Suggestions:</h4>
        <ul className="list-disc list-inside">
          {forecast.recommended?.map((suggestion, idx) => (
            <li key={idx}>{suggestion}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

};

export default MapView;
