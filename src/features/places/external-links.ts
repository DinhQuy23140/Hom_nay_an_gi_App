import * as WebBrowser from 'expo-web-browser';
import { Linking, Share } from 'react-native';

import type { Food } from '@/features/foods/types';

/** V1: tìm quán bằng deep link Google Maps, không tốn phí Places API. */
export function openMapsSearch(food: Food) {
  const query = encodeURIComponent(`${food.nameVi} gần đây`);
  return Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
}

export function openRecipe(food: Food) {
  const query = encodeURIComponent(`cách nấu ${food.nameVi}`);
  return WebBrowser.openBrowserAsync(`https://www.youtube.com/results?search_query=${query}`);
}

export function openDelivery(food: Food) {
  const query = encodeURIComponent(food.nameVi);
  return WebBrowser.openBrowserAsync(`https://food.grab.com/vn/vi/restaurants?search=${query}`);
}

export function shareFood(food: Food) {
  return Share.share({ message: `Hôm nay mình ăn ${food.nameVi}! Gợi ý từ app Hôm nay ăn gì.` });
}
