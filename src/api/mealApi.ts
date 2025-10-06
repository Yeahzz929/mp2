import axios from 'axios';
import {
  MealSearchResponse,
  CategoriesResponse,
  AreasResponse,
  IngredientsResponse,
  MealFilterResponse,
  RandomMealResponse,
  Meal
} from './types';

const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const mealApi = {
  // 搜索餐点
  searchMeals: async (query: string): Promise<Meal[]> => {
    try {
      const response = await api.get<MealSearchResponse>(`/search.php?s=${encodeURIComponent(query)}`);
      return response.data.meals || [];
    } catch (error) {
      console.error('Error searching meals:', error);
      return [];
    }
  },

  // 按首字母搜索餐点
  searchMealsByFirstLetter: async (letter: string): Promise<Meal[]> => {
    try {
      const response = await api.get<MealSearchResponse>(`/search.php?f=${letter}`);
      return response.data.meals || [];
    } catch (error) {
      console.error('Error searching meals by letter:', error);
      return [];
    }
  },

  // 获取餐点详情
  getMealById: async (id: string): Promise<Meal | null> => {
    try {
      const response = await api.get<MealSearchResponse>(`/lookup.php?i=${id}`);
      return response.data.meals?.[0] || null;
    } catch (error) {
      console.error('Error getting meal by ID:', error);
      return null;
    }
  },

  // 获取随机餐点
  getRandomMeal: async (): Promise<Meal | null> => {
    try {
      const response = await api.get<RandomMealResponse>('/random.php');
      return response.data.meals?.[0] || null;
    } catch (error) {
      console.error('Error getting random meal:', error);
      return null;
    }
  },

  // 获取所有分类
  getCategories: async (): Promise<any[]> => {
    try {
      const response = await api.get<CategoriesResponse>('/categories.php');
      return response.data.categories || [];
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  },

  // 获取所有地区
  getAreas: async (): Promise<string[]> => {
    try {
      const response = await api.get<AreasResponse>('/list.php?a=list');
      return response.data.meals?.map((area: { strArea: string }) => area.strArea) || [];
    } catch (error) {
      console.error('Error getting areas:', error);
      return [];
    }
  },

  // 获取所有食材
  getIngredients: async (): Promise<string[]> => {
    try {
      const response = await api.get<IngredientsResponse>('/list.php?i=list');
      return response.data.meals?.map((ingredient: { strIngredient: string }) => ingredient.strIngredient) || [];
    } catch (error) {
      console.error('Error getting ingredients:', error);
      return [];
    }
  },

  // 按分类筛选餐点
  filterByCategory: async (category: string): Promise<Meal[]> => {
    try {
      const response = await api.get<MealFilterResponse>(`/filter.php?c=${encodeURIComponent(category)}`);
      return response.data.meals || [];
    } catch (error) {
      console.error('Error filtering by category:', error);
      return [];
    }
  },

  // 按地区筛选餐点
  filterByArea: async (area: string): Promise<Meal[]> => {
    try {
      const response = await api.get<MealFilterResponse>(`/filter.php?a=${encodeURIComponent(area)}`);
      return response.data.meals || [];
    } catch (error) {
      console.error('Error filtering by area:', error);
      return [];
    }
  },

  // 按食材筛选餐点
  filterByIngredient: async (ingredient: string): Promise<Meal[]> => {
    try {
      const response = await api.get<MealFilterResponse>(`/filter.php?i=${encodeURIComponent(ingredient)}`);
      return response.data.meals || [];
    } catch (error) {
      console.error('Error filtering by ingredient:', error);
      return [];
    }
  }
};

export default mealApi;
