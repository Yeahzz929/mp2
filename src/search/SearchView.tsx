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

  // 页面加载时获取默认菜品
  useEffect(() => {
    const loadDefaultMeals = async () => {
      setLoading(true);
      try {
        // 获取一些随机菜品作为默认显示
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
        const validMeals = randomMeals.filter(meal => meal !== null) as Meal[];
        setMeals(validMeals);
      } catch (err) {
        console.error('Error loading default meals:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadDefaultMeals();
  }, []);

  // 防抖搜索
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        searchMeals(query);
      } else if (query === '') {
        // 如果搜索框为空，重新加载默认菜品
        const loadDefaultMeals = async () => {
          setLoading(true);
          try {
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
            const validMeals = randomMeals.filter(meal => meal !== null) as Meal[];
            setMeals(validMeals);
          } catch (err) {
            console.error('Error loading default meals:', err);
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

  // 排序逻辑
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
