'use client';

import React, { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import 'ol/ol.css';
import { fromLonLat } from 'ol/proj';
import { toStringHDMS } from 'ol/coordinate';

const MapView: React.FC = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);

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
        center: fromLonLat([121.0, 14.0]), // Centered roughly on Philippines
        zoom: 6,
      }),
    });

    map.on('click', function (event) {
      const coordinates = map.getCoordinateFromPixel(event.pixel);
      const hdms = toStringHDMS(coordinates);
      const lonLat = map.getCoordinateFromPixel(event.pixel);
      const [lon, lat] = lonLat || [];

      const [lonDeg, latDeg] = fromLonLat([lon, lat], 'EPSG:4326');
      console.log('Clicked at:', latDeg.toFixed(4), lonDeg.toFixed(4));

      // TODO: call your backend here with lat/lon
    });

    return () => map.setTarget(undefined); // Cleanup
  }, []);

  return (
    <div>
      <div ref={mapRef} className="h-[500px] w-full border rounded" />
    </div>
  );
};

export default MapView;
