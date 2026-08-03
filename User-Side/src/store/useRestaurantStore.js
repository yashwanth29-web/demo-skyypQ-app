import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import restaurantsData from '../mock/restaurants.json';

const useRestaurantStore = create(
  persist(
    (set, get) => ({
      restaurants: restaurantsData,

      getRestaurantById: (id) => {
        return get().restaurants.find((r) => r.id === id);
      },

      addRestaurant: (newRest) => {
        set((state) => {
          // Generate a unique ID for the new restaurant
          const idNumber = state.restaurants.length + 1;
          const newId = `r${idNumber}_${Date.now()}`;
          
          const restaurantEntry = {
            id: newId,
            name: newRest.name || 'New Restaurant',
            cuisine: newRest.cuisine || 'Various',
            rating: newRest.rating || 4.5,
            deliveryTime: newRest.deliveryTime || '30-45 min',
            minOrder: newRest.minOrder || 15,
            image: newRest.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600',
            tags: newRest.tags || ['New'],
            address: newRest.address || '123 Test St',
            valetEnabled: true,
            featured: false
          };

          return { restaurants: [restaurantEntry, ...state.restaurants] };
        });
      }
    }),
    {
      name: 'takeaway-restaurants-storage'
    }
  )
);

export default useRestaurantStore;
