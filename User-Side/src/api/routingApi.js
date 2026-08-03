export const fetchRoute = async (startLng, startLat, endLng, endLat) => {
  const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch route');
    }
    const data = await response.json();
    if (data.code === 'Ok' && data.routes.length > 0) {
      // OSRM returns GeoJSON coordinates in [longitude, latitude] format
      // Leaflet expects [latitude, longitude]
      const geojsonCoordinates = data.routes[0].geometry.coordinates;
      const leafletCoordinates = geojsonCoordinates.map(coord => [coord[1], coord[0]]);
      return leafletCoordinates;
    }
    return null;
  } catch (error) {
    console.error("Error fetching route from OSRM:", error);
    return null;
  }
};
