import fs from 'fs';

const cuisines = ["American, Cafe", "Healthy, Salads", "Japanese, Sushi", "Italian, Pizza", "Indian, Curries", "Mexican, Tacos", "Chinese, Noodles", "Thai, Street Food", "Desserts, Bakery", "Fast Food, Burgers"];
const names = ["Bite Route Cafe", "The Salad Station", "Quick Sushi", "Mama's Pizza", "Spice Route", "Taco Fiesta", "Golden Dragon", "Thai Express", "Sweet Tooth", "Burger Hub", "Urban Cafe", "Green Bowl", "Sushi Master", "Pizza Planet", "Curry House", "Taco Time", "Noodle Bar", "Thai Corner", "Bakery Bliss", "Burger Joint", "Cafe Latte", "Salad Bar", "Sushi Shop", "Pizza Hut", "Curry Palace"];
const images = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600&h=400",
  "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=600&h=400",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=600&h=400",
  "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&q=80&w=600&h=400",
  "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=600&h=400"
];

const restaurants = [];

// Generate 5 for < 1km
for(let i=0; i<5; i++) {
  restaurants.push({
    id: `r${i+1}`,
    name: names[i],
    cuisine: cuisines[i % cuisines.length],
    rating: (Math.random() * (5 - 4) + 4).toFixed(1),
    distance: (Math.random() * (1 - 0.1) + 0.1).toFixed(1),
    eta: `${Math.floor(Math.random() * 10 + 5)} mins`,
    preparationTime: Math.floor(Math.random() * 15 + 5),
    pickupReadyTime: "12:15 PM",
    offer: i % 2 === 0 ? "10% off on all orders" : null,
    image: images[i % images.length],
    coordinates: { x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 }
  });
}

// Generate 5 for 1km - 3km
for(let i=5; i<10; i++) {
  restaurants.push({
    id: `r${i+1}`,
    name: names[i],
    cuisine: cuisines[i % cuisines.length],
    rating: (Math.random() * (5 - 4) + 4).toFixed(1),
    distance: (Math.random() * (3 - 1.1) + 1.1).toFixed(1),
    eta: `${Math.floor(Math.random() * 10 + 10)} mins`,
    preparationTime: Math.floor(Math.random() * 15 + 5),
    pickupReadyTime: "12:30 PM",
    offer: i % 3 === 0 ? "Free Drink" : null,
    image: images[i % images.length],
    coordinates: { x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 }
  });
}

// Generate 15 for 3km - 5km
for(let i=10; i<25; i++) {
  restaurants.push({
    id: `r${i+1}`,
    name: names[i],
    cuisine: cuisines[i % cuisines.length],
    rating: (Math.random() * (5 - 3.5) + 3.5).toFixed(1),
    distance: (Math.random() * (5 - 3.1) + 3.1).toFixed(1),
    eta: `${Math.floor(Math.random() * 15 + 15)} mins`,
    preparationTime: Math.floor(Math.random() * 15 + 10),
    pickupReadyTime: "12:45 PM",
    offer: null,
    image: images[i % images.length],
    coordinates: { x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 }
  });
}

fs.writeFileSync('src/mock/restaurants.json', JSON.stringify(restaurants, null, 2));
console.log('Generated restaurants.json with interior images.');
