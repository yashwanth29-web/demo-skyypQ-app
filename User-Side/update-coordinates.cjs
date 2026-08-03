const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'mock', 'restaurants.json');
const rawData = fs.readFileSync(filePath, 'utf-8');
const restaurants = JSON.parse(rawData);

// Bounding box for Hyderabad (approximate)
const minLat = 17.36;
const maxLat = 17.43;
const minLng = 78.43;
const maxLng = 78.50;

restaurants.forEach(r => {
  // Generate random lat/lng within the bounding box
  const lat = minLat + Math.random() * (maxLat - minLat);
  const lng = minLng + Math.random() * (maxLng - minLng);
  
  // Replace old x/y with lat/lng
  r.coordinates = {
    lat: parseFloat(lat.toFixed(6)),
    lng: parseFloat(lng.toFixed(6))
  };
});

fs.writeFileSync(filePath, JSON.stringify(restaurants, null, 2));
console.log('Successfully updated coordinates.');
