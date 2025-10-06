import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Meal, mealApi } from '../api';
import styles from './GalleryView.module.css';

const GalleryView: React.FC = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // 加载分类和地区数据
    const loadFilterData = async () => {
      try {
        const [categoriesData, areasData] = await Promise.all([
          mealApi.getCategories(),
          mealApi.getAreas(),
        ]);
        setCategories(categoriesData.map((cat: { strCategory: string }) => cat.strCategory));
        setAreas(areasData);
      } catch (err) {
        setError('Failed to load filter data, please try again later');
        console.error('Load filter data error:', err);
      }
    };
    
    loadFilterData();
  }, []);

  const loadMealsByFilters = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let allMeals: Meal[] = [];
      
      // 如果没有选择任何筛选条件，加载随机餐点
      if (selectedCategories.length === 0 && selectedAreas.length === 0) {
        const randomMeals = await Promise.all([
          mealApi.getRandomMeal(),
          mealApi.getRandomMeal(),
          mealApi.getRandomMeal(),
          mealApi.getRandomMeal(),
          mealApi.getRandomMeal(),
          mealApi.getRandomMeal(),
          mealApi.getRandomMeal(),
          mealApi.getRandomMeal(),
        ]);
        allMeals = randomMeals.filter(meal => meal !== null) as Meal[];
      } else {
        // 简化筛选逻辑：优先使用分类筛选，如果同时选择了地区，则进行客户端筛选
        if (selectedCategories.length > 0) {
          // 使用第一个选中的分类进行API筛选
          const category = selectedCategories[0];
          const meals = await mealApi.filterByCategory(category);
          
          if (meals.length > 0) {
            // 获取完整详情
            const detailedMeals = await Promise.all(
              meals.map(async (meal: Meal) => {
                const fullMeal = await mealApi.getMealById(meal.idMeal);
                return fullMeal || meal;
              })
            );
            
            allMeals = detailedMeals;
            
            // 如果还选择了地区，进行客户端筛选
            if (selectedAreas.length > 0) {
              allMeals = allMeals.filter(meal => 
                selectedAreas.includes(meal.strArea)
              );
            }
          }
        } else if (selectedAreas.length > 0) {
          // 只按地区筛选
          const area = selectedAreas[0];
          const meals = await mealApi.filterByArea(area);
          
          if (meals.length > 0) {
            // 获取完整详情
            const detailedMeals = await Promise.all(
              meals.map(async (meal: Meal) => {
                const fullMeal = await mealApi.getMealById(meal.idMeal);
                return fullMeal || meal;
              })
            );
            
            allMeals = detailedMeals;
          }
        }
      }
      
      // 确保总是设置结果，即使为空
      setMeals(allMeals);
    } catch (err) {
      setError('Filter failed, please try again later');
      console.error('Filter error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategories, selectedAreas]);

  useEffect(() => {
    // 添加防抖，避免频繁调用
    const timeoutId = setTimeout(() => {
      loadMealsByFilters();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [loadMealsByFilters]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleAreaToggle = (area: string) => {
    setSelectedAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedAreas([]);
  };

  const handleMealClick = (meal: Meal) => {
    navigate(`/meal/${meal.idMeal}`);
  };

  // 直接使用 meals，因为筛选逻辑已经在 loadMealsByFilters 中处理了
  const filteredMeals = meals;

  return (
    <div className={styles.galleryView}>
      <div className={styles.header}>
        <h1>Meal Gallery</h1>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterSection}>
          <h3>Filter by Category</h3>
          <div className={styles.filterTags}>
            {categories.map(category => (
              <button
                key={category}
                className={`${styles.filterTag} ${selectedCategories.includes(category) ? styles.selected : ''}`}
                onClick={() => handleCategoryToggle(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterSection}>
          <h3>Filter by Area</h3>
          <div className={styles.filterTags}>
            {areas.map(area => (
              <button
                key={area}
                className={`${styles.filterTag} ${selectedAreas.includes(area) ? styles.selected : ''}`}
                onClick={() => handleAreaToggle(area)}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterActions}>
          <button className={styles.clearButton} onClick={clearFilters}>
            Clear Filters
          </button>
          <span className={styles.resultCount}>
            Showing {filteredMeals.length} results
          </span>
        </div>
      </div>

      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading...</p>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && filteredMeals.length === 0 && (
        <div className={styles.noResults}>
          <p>No meals found matching your criteria</p>
        </div>
      )}

      {filteredMeals.length > 0 && (
        <div className={styles.gallery}>
          {filteredMeals.map((meal) => (
            <div
              key={meal.idMeal}
              className={styles.mealCard}
              onClick={() => handleMealClick(meal)}
            >
              <div className={styles.mealImage}>
                <img
                  src={meal.strMealThumb}
                  alt={meal.strMeal}
                  loading="lazy"
                />
                <div className={styles.mealOverlay}>
                  <h3 className={styles.mealName}>{meal.strMeal}</h3>
                  <div className={styles.mealMeta}>
                    <span className={styles.category}>
                      {meal.strCategory || 'Unknown'}
                    </span>
                    <span className={styles.area}>
                      {meal.strArea || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryView;
