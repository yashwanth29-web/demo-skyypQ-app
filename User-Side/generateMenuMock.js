import fs from 'fs';

const items = [
  {
    id: "m1",
    restaurantId: "r1",
    name: "Classic Cheeseburger",
    description: "Juicy beef patty with melted cheddar, lettuce, tomato, and house sauce.",
    price: 8.99,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400&h=400",
    category: "Burgers",
    type: "non-veg",
    rating: 4.8,
    votes: 342,
    bestseller: true
  },
  {
    id: "m2",
    restaurantId: "r1",
    name: "Veggie Delight Burger",
    description: "Crispy plant-based patty with vegan mayo, pickles, and fresh greens.",
    price: 7.99,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=400&h=400",
    category: "Burgers",
    type: "veg",
    rating: 4.5,
    votes: 124,
    bestseller: false
  },
  {
    id: "m3",
    restaurantId: "r1",
    name: "Truffle Parmesan Fries",
    description: "Crispy golden fries tossed in truffle oil and parmesan cheese.",
    price: 4.50,
    image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&q=80&w=400&h=400",
    category: "Sides",
    type: "veg",
    rating: 4.9,
    votes: 512,
    bestseller: true
  },
  {
    id: "m4",
    restaurantId: "r1",
    name: "Spicy Chicken Wings",
    description: "6 pieces of bone-in wings tossed in our signature hot sauce.",
    price: 6.99,
    image: "https://images.unsplash.com/photo-1569691105775-4ca927fb4f07?auto=format&fit=crop&q=80&w=400&h=400",
    category: "Sides",
    type: "non-veg",
    rating: 4.7,
    votes: 210,
    bestseller: false
  },
  {
    id: "m5",
    restaurantId: "r1",
    name: "Margherita Pizza",
    description: "Classic pizza with fresh mozzarella, tomatoes, and basil on a thin crust.",
    price: 12.00,
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=400&h=400",
    category: "Pizza",
    type: "veg",
    rating: 4.6,
    votes: 389,
    bestseller: true
  },
  {
    id: "m6",
    restaurantId: "r1",
    name: "Pepperoni Pizza",
    description: "Loaded with crispy pepperoni and a blend of Italian cheeses.",
    price: 14.50,
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=400&h=400",
    category: "Pizza",
    type: "non-veg",
    rating: 4.8,
    votes: 412,
    bestseller: true
  },
  {
    id: "m7",
    restaurantId: "r1",
    name: "Avocado Toast",
    description: "Sourdough toast with smashed avocado, cherry tomatoes, and feta.",
    price: 8.50,
    image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&q=80&w=400&h=400",
    category: "Breakfast",
    type: "veg",
    rating: 4.4,
    votes: 98,
    bestseller: false
  },
  {
    id: "m8",
    restaurantId: "r1",
    name: "Iced Caramel Macchiato",
    description: "Espresso with milk, vanilla syrup, and caramel drizzle.",
    price: 4.99,
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=400&h=400",
    category: "Beverages",
    type: "veg",
    rating: 4.9,
    votes: 620,
    bestseller: true
  },
  {
    id: "m9",
    restaurantId: "r1",
    name: "Fresh Strawberry Smoothie",
    description: "Blended fresh strawberries, yogurt, and a touch of honey.",
    price: 5.50,
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&q=80&w=400&h=400",
    category: "Beverages",
    type: "veg",
    rating: 4.7,
    votes: 145,
    bestseller: false
  }
];

// Add items to other restaurants so they have food too
const otherItems = items.map(item => ({...item, id: item.id + "b", restaurantId: "r2"}));
const allItems = [...items, ...otherItems];

fs.writeFileSync('src/mock/menu.json', JSON.stringify(allItems, null, 2));
console.log('Generated menu.json with', allItems.length, 'entries.');
