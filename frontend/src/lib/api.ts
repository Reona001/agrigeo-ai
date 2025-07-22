// src/lib/api.ts
// providing latitude and longitude to the mapbox api

export async function getForecast(lat: number, lon: number) {
  const response = await fetch(`http://localhost:8000/forecast?lat=${lat}&lon=${lon}`);
  if (!response.ok) throw new Error("Failed to fetch forecast");
  return await response.json();
}
