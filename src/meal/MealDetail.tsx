import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Meal, mealApi } from '../api';
import styles from './MealDetail.module.css';

const MealDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allMeals, setAllMeals] = useState<Meal[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (id) {
      loadMealDetail(id);
    }
  }, [id]);

  const loadMealDetail = async (mealId: string) => {
    setLoading(true);
    setError(null);
    try {
      const mealData = await mealApi.getMealById(mealId);
      if (mealData) {
        setMeal(mealData);
        const categoryMeals = await mealApi.filterByCategory(mealData.strCategory);
        setAllMeals(categoryMeals);
        setCurrentIndex(categoryMeals.findIndex((m: Meal) => m.idMeal === mealId));
      } else {
        setError('Meal not found');
      }
    } catch (err) {
      setError('Failed to load meal details, please try again later');
      console.error('Load meal detail error:', err);
    } finally {
      setLoading(false);
    }
  };

  const navigateToMeal = (direction: 'prev' | 'next') => {
    if (allMeals.length > 0) {
      const newIndex = direction === 'prev' 
        ? (currentIndex > 0 ? currentIndex - 1 : allMeals.length - 1)
        : (currentIndex < allMeals.length - 1 ? currentIndex + 1 : 0);
      const targetMeal = allMeals[newIndex];
      setCurrentIndex(newIndex);
      navigate(`/meal/${targetMeal.idMeal}`);
    }
  };

  const handlePrevious = () => navigateToMeal('prev');
  const handleNext = () => navigateToMeal('next');
  const handleBackToHome = () => navigate('/');

  const getIngredients = (meal: Meal) => {
    const ingredients: Array<{ingredient: string, measure: string}> = [];
    
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          ingredient: ingredient.trim(),
          measure: measure ? measure.trim() : ''
        });
      }
    }
    
    return ingredients;
  };

  const formatInstructions = (instructions: string): string[] => {
    return instructions
      .split('\r\n')
      .filter(step => step.trim())
      .map(step => step.trim());
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button 
          className={styles.backButton}
          onClick={handleBackToHome}
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (!meal) {
    return (
      <div className={styles.notFound}>
        <p>Meal not found</p>
        <button 
          className={styles.backButton}
          onClick={handleBackToHome}
        >
          Back to Home
        </button>
      </div>
    );
  }

  const ingredients = getIngredients(meal);
  const instructions = formatInstructions(meal.strInstructions);

  return (
    <div className={styles.mealDetail}>
      <div className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={handleBackToHome}
        >
          ← Back
        </button>
        
        {allMeals.length > 1 && (
          <div className={styles.navigation}>
            <button 
              className={styles.navButton}
              onClick={handlePrevious}
              disabled={allMeals.length <= 1}
            >
              ← Previous
            </button>
            <span className={styles.navInfo}>
              {currentIndex + 1} / {allMeals.length}
            </span>
            <button 
              className={styles.navButton}
              onClick={handleNext}
              disabled={allMeals.length <= 1}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.imageSection}>
          <img
            src={meal.strMealThumb}
            alt={meal.strMeal}
            className={styles.mealImage}
          />
          {meal.strYoutube && (
            <a
              href={meal.strYoutube}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.youtubeLink}
            >
              📺 Watch Cooking Video
            </a>
          )}
        </div>

        <div className={styles.infoSection}>
          <h1 className={styles.mealName}>{meal.strMeal}</h1>
          
          <div className={styles.metaInfo}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Category:</span>
              <span className={styles.metaValue}>{meal.strCategory}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Area:</span>
              <span className={styles.metaValue}>{meal.strArea}</span>
            </div>
            {meal.strTags && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Tags:</span>
                <span className={styles.metaValue}>{meal.strTags}</span>
              </div>
            )}
          </div>

          <div className={styles.ingredientsSection}>
            <h2>Ingredients</h2>
            <div className={styles.ingredientsList}>
              {ingredients.map((item, index) => (
                <div key={index} className={styles.ingredientItem}>
                  <span className={styles.measure}>{item.measure}</span>
                  <span className={styles.ingredient}>{item.ingredient}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.instructionsSection}>
            <h2>Instructions</h2>
            <div className={styles.instructionsList}>
              {instructions.map((step, index) => (
                <div key={index} className={styles.instructionStep}>
                  <span className={styles.stepNumber}>{index + 1}</span>
                  <span className={styles.stepText}>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {meal.strSource && (
            <div className={styles.sourceSection}>
              <h2>Source</h2>
              <a
                href={meal.strSource}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.sourceLink}
              >
                {meal.strSource}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealDetail;
