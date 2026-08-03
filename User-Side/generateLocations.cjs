const fs = require('fs');

const areas = [
  { name: 'Banjara Hills', lat: 17.4138, lng: 78.4326 },
  { name: 'Jubilee Hills', lat: 17.4325, lng: 78.4070 },
  { name: 'Madhapur', lat: 17.4483, lng: 78.3915 },
  { name: 'Gachibowli', lat: 17.4401, lng: 78.3489 },
  { name: 'Kondapur', lat: 17.4610, lng: 78.3587 },
  { name: 'Ameerpet', lat: 17.4375, lng: 78.4482 },
  { name: 'Begumpet', lat: 17.4447, lng: 78.4664 },
  { name: 'Secunderabad', lat: 17.4399, lng: 78.4983 },
  { name: 'Charminar', lat: 17.3616, lng: 78.4747 },
  { name: 'Kukatpally', lat: 17.4948, lng: 78.3996 }
];

const types = ['Hospital', 'Mall', 'Cafe', 'Restaurant', 'Apartments', 'Tech Park', 'Metro Station', 'Park', 'Theater', 'School'];
const adjectives = ['Apollo', 'City', 'Grand', 'Royal', 'Sunshine', 'Blue', 'Green', 'Elite', 'Prime', 'Central'];

const locations = [];
let idCounter = 1;

for (let i = 0; i < 100; i++) {
  const area = areas[Math.floor(Math.random() * areas.length)];
  const type = types[Math.floor(Math.random() * types.length)];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  
  // Random offset for coordinates (approx +/- 2km)
  const latOffset = (Math.random() - 0.5) * 0.02;
  const lngOffset = (Math.random() - 0.5) * 0.02;
  
  // Random distance
  const dist = (Math.random() * 15 + 1).toFixed(1);
  
  locations.push({
    id: `loc_${idCounter++}`,
    name: `${adj} ${type}`,
    address: `${Math.floor(Math.random() * 100) + 1}, ${area.name}, Hyderabad, Telangana`,
    distance: `${dist} km`,
    lat: area.lat + latOffset,
    lng: area.lng + lngOffset
  });
}

// Add some real famous landmarks as well to guarantee them
const landmarks = [
  { id: 'loc_l1', name: 'Charminar', address: 'Charminar Rd, Hyderabad', distance: '12 km', lat: 17.3616, lng: 78.4747 },
  { id: 'loc_l2', name: 'Golconda Fort', address: 'Khair Complex, Ibrahim Bagh, Hyderabad', distance: '14 km', lat: 17.3833, lng: 78.4011 },
  { id: 'loc_l3', name: 'Ramoji Film City', address: 'Anaspur Village, Hayathnagar Mandal, Hyderabad', distance: '30 km', lat: 17.2543, lng: 78.6808 },
  { id: 'loc_l4', name: 'Hussain Sagar Lake', address: 'Tank Bund Rd, Hyderabad', distance: '5 km', lat: 17.4239, lng: 78.4738 },
  { id: 'loc_l5', name: 'Salar Jung Museum', address: 'Salar Jung Rd, Darulshifa, Hyderabad', distance: '10 km', lat: 17.3713, lng: 78.4804 },
  { id: 'loc_l6', name: 'Inorbit Mall', address: 'APIIC Software Layout, Madhapur, Hyderabad', distance: '4 km', lat: 17.4337, lng: 78.3866 },
  { id: 'loc_l7', name: 'IKEA Hyderabad', address: 'Raidurg, Serilingampally, Hyderabad', distance: '3 km', lat: 17.4389, lng: 78.3764 },
  { id: 'loc_l8', name: 'Rajiv Gandhi International Airport', address: 'Shamshabad, Hyderabad', distance: '25 km', lat: 17.2403, lng: 78.4294 }
];

const finalLocations = [...landmarks, ...locations];

fs.writeFileSync('./src/mock/hyderabad_locations.json', JSON.stringify(finalLocations, null, 2));
console.log(`Generated ${finalLocations.length} locations`);
