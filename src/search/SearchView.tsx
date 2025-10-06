import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Meal, mealApi } from '../api';
import styles from './SearchView.module.css';

interface SearchViewProps {
  searchQuery?: string;
}

type SortField = 'strMeal' | 'strCategory' | 'strArea';
type SortOrder = 'asc' | 'desc';

const SearchView: React.FC<SearchViewProps> = ({ searchQuery = '' }) => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState(searchQuery);
  const [sortField, setSortField] = useState<SortField>('strMeal');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const navigate = useNavigate();

  useEffect(() => {
    const loadDefaultMeals = async () => {
      setLoading(true);
      try {
        // 使用不同的方法获取多样化的菜品
        const [randomMeal1, randomMeal2, randomMeal3, randomMeal4] = await Promise.all([
          mealApi.getRandomMeal(),
          mealApi.getRandomMeal(),
          mealApi.getRandomMeal(),
          mealApi.getRandomMeal(),
        ]);
        
            // 获取一些按分类的菜品来增加多样性
            const [beefMeals, chickenMeals, dessertMeals] = await Promise.all([
              mealApi.filterByCategory('Beef'),
              mealApi.filterByCategory('Chicken'),
              mealApi.filterByCategory('Dessert'),
            ]);
            
            // 为分类筛选的菜品获取完整信息
            const beefDetails = await Promise.all(
              beefMeals.slice(0, 2).map(meal => mealApi.getMealById(meal.idMeal))
            );
            const chickenDetails = await Promise.all(
              chickenMeals.slice(0, 2).map(meal => mealApi.getMealById(meal.idMeal))
            );
            const dessertDetails = await Promise.all(
              dessertMeals.slice(0, 2).map(meal => mealApi.getMealById(meal.idMeal))
            );
            
            // 合并所有菜品并去重
            const allMeals = [
              randomMeal1,
              randomMeal2,
              randomMeal3,
              randomMeal4,
              ...beefDetails.filter(meal => meal !== null),
              ...chickenDetails.filter(meal => meal !== null),
              ...dessertDetails.filter(meal => meal !== null),
            ].filter(meal => meal !== null) as Meal[];
        
        // 去重：基于idMeal去重
        const uniqueMeals = allMeals.filter((meal, index, self) => 
          index === self.findIndex(m => m.idMeal === meal.idMeal)
        );
        
        // 取前8个
        setMeals(uniqueMeals.slice(0, 8));
      } catch (err) {
        console.error('Error loading default meals:', err);
        // 如果出错，至少尝试获取一些随机菜品
        try {
          const fallbackMeals = await Promise.all([
            mealApi.getRandomMeal(),
            mealApi.getRandomMeal(),
            mealApi.getRandomMeal(),
            mealApi.getRandomMeal(),
          ]);
          const validMeals = fallbackMeals.filter(meal => meal !== null) as Meal[];
          setMeals(validMeals);
        } catch (fallbackErr) {
          console.error('Fallback loading failed:', fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadDefaultMeals();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        searchMeals(query);
      } else if (query === '') {
        const loadDefaultMeals = async () => {
          setLoading(true);
          try {
            // 使用不同的方法获取多样化的菜品
            const [randomMeal1, randomMeal2, randomMeal3, randomMeal4] = await Promise.all([
              mealApi.getRandomMeal(),
              mealApi.getRandomMeal(),
              mealApi.getRandomMeal(),
              mealApi.getRandomMeal(),
            ]);
            
            // 获取一些按分类的菜品来增加多样性
            const [beefMeals, chickenMeals, dessertMeals] = await Promise.all([
              mealApi.filterByCategory('Beef'),
              mealApi.filterByCategory('Chicken'),
              mealApi.filterByCategory('Dessert'),
            ]);
            
            // 为分类筛选的菜品获取完整信息
            const beefDetails = await Promise.all(
              beefMeals.slice(0, 2).map(meal => mealApi.getMealById(meal.idMeal))
            );
            const chickenDetails = await Promise.all(
              chickenMeals.slice(0, 2).map(meal => mealApi.getMealById(meal.idMeal))
            );
            const dessertDetails = await Promise.all(
              dessertMeals.slice(0, 2).map(meal => mealApi.getMealById(meal.idMeal))
            );
            
            // 合并所有菜品并去重
            const allMeals = [
              randomMeal1,
              randomMeal2,
              randomMeal3,
              randomMeal4,
              ...beefDetails.filter(meal => meal !== null),
              ...chickenDetails.filter(meal => meal !== null),
              ...dessertDetails.filter(meal => meal !== null),
            ].filter(meal => meal !== null) as Meal[];
            
            // 去重：基于idMeal去重
            const uniqueMeals = allMeals.filter((meal, index, self) => 
              index === self.findIndex(m => m.idMeal === meal.idMeal)
            );
            
            // 取前8个
            setMeals(uniqueMeals.slice(0, 8));
          } catch (err) {
            console.error('Error loading default meals:', err);
            // 如果出错，至少尝试获取一些随机菜品
            try {
              const fallbackMeals = await Promise.all([
                mealApi.getRandomMeal(),
                mealApi.getRandomMeal(),
                mealApi.getRandomMeal(),
                mealApi.getRandomMeal(),
              ]);
              const validMeals = fallbackMeals.filter(meal => meal !== null) as Meal[];
              setMeals(validMeals);
            } catch (fallbackErr) {
              console.error('Fallback loading failed:', fallbackErr);
            }
          } finally {
            setLoading(false);
          }
        };
        loadDefaultMeals();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const searchMeals = async (searchTerm: string) => {
    setLoading(true);
    setError(null);
    try {
      const results = await mealApi.searchMeals(searchTerm);
      setMeals(results);
    } catch (err) {
      setError('Search failed, please try again later');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const sortedMeals = useMemo(() => {
    return [...meals].sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      
      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [meals, sortField, sortOrder]);

  const handleMealClick = (meal: Meal) => {
    navigate(`/meal/${meal.idMeal}`);
  };

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className={styles.searchView}>
      <div className={styles.header}>
        <h1>Search Meals</h1>
        <div className={styles.searchContainer}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter meal name to search..."
            className={styles.searchInput}
          />
        </div>
        
        {meals.length > 0 && (
          <div className={styles.sortControls}>
            <span>Sort by:</span>
            <button
              className={`${styles.sortButton} ${sortField === 'strMeal' ? styles.active : ''}`}
              onClick={() => handleSortChange('strMeal')}
            >
              Name {sortField === 'strMeal' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              className={`${styles.sortButton} ${sortField === 'strCategory' ? styles.active : ''}`}
              onClick={() => handleSortChange('strCategory')}
            >
              Category {sortField === 'strCategory' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              className={`${styles.sortButton} ${sortField === 'strArea' ? styles.active : ''}`}
              onClick={() => handleSortChange('strArea')}
            >
              Area {sortField === 'strArea' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className={styles.loading}>
          <p>Searching...</p>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && meals.length === 0 && query && (
        <div className={styles.noResults}>
          <p>No meals found, please try different keywords</p>
        </div>
      )}

      {!loading && !error && meals.length === 0 && !query && (
        <div className={styles.placeholder}>
          <p>Loading some delicious meals for you...</p>
        </div>
      )}

      {sortedMeals.length > 0 && (
        <div className={styles.results}>
          <p className={styles.resultCount}>
            {query ? `Found ${sortedMeals.length} results` : `Showing ${sortedMeals.length} delicious meals`}
          </p>
          <div className={styles.mealList}>
            {sortedMeals.map((meal) => (
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
                </div>
                <div className={styles.mealInfo}>
                  <h3 className={styles.mealName}>{meal.strMeal}</h3>
                  <div className={styles.mealMeta}>
                    <span className={styles.category}>{meal.strCategory}</span>
                    <span className={styles.area}>{meal.strArea}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchView;
