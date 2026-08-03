import api from '../lib/api';
import restaurantsData from '../mock/restaurants.json';
import menuData from '../mock/menu.json';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// ─── Real API calls (default) ─────────────────────────────────────────────────

export const fetchRestaurants = async () => {
  if (USE_MOCK) return restaurantsData;
  try {
    const { data } = await api.get('/restaurants');
    return data;
  } catch {
    console.warn('[restaurantApi] Falling back to mock restaurants');
    return restaurantsData;
  }
};

export const fetchRestaurantById = async (id) => {
  if (USE_MOCK) {
    return restaurantsData.find((r) => r.id === id) || restaurantsData[0];
  }
  try {
    const { data } = await api.get(`/restaurants/${id}`);
    return data;
  } catch {
    return restaurantsData.find((r) => r.id === id) || restaurantsData[0];
  }
};

export const fetchMenuByRestaurantId = async (id) => {
  if (USE_MOCK) {
    const menu = menuData.filter((m) => m.restaurantId === id);
    return menu.length > 0 ? menu : menuData.slice(0, 8);
  }
  try {
    const { data } = await api.get(`/restaurants/${id}/menu`);
    return data;
  } catch {
    const menu = menuData.filter((m) => m.restaurantId === id);
    return menu.length > 0 ? menu : menuData.slice(0, 8);
  }
};

// Fetch all menu data for cart calculations (client-side price lookup)
export const fetchAllMenuData = async () => {
  if (USE_MOCK) return menuData;
  try {
    // Fetch from backend — returns all menu items across all restaurants
    const { data } = await api.get('/restaurants');
    // Fetch menus in parallel for all restaurants and flatten
    const menus = await Promise.all(
      data.map((r) => api.get(`/restaurants/${r.id}/menu`).then((res) => res.data))
    );
    return menus.flat();
  } catch {
    return menuData;
  }
};
