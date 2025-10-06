export interface IngredientMeasure {
  ingredient: string;
  measure: string;
}

export interface Meal {
  idMeal: string;
  strMeal: string;
  strDrinkAlternate?: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags?: string;
  strYoutube?: string;
  strSource?: string;
  strImageSource?: string;
  strCreativeCommonsConfirmed?: string;
  dateModified?: string;
  
  [key: `strIngredient${number}`]: string | undefined;
  [key: `strMeasure${number}`]: string | undefined;
}

export interface MealSearchResponse {
  meals: Meal[] | null;
}

export interface Category {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface Area {
  strArea: string;
}

export interface AreasResponse {
  meals: Area[];
}

export interface Ingredient {
  strIngredient: string;
}

export interface IngredientsResponse {
  meals: Ingredient[];
}

export interface MealFilterResponse {
  meals: Meal[] | null;
}

export interface RandomMealResponse {
  meals: Meal[];
}
