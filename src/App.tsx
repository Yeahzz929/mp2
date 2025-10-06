import React from 'react';
import { Routes, Route } from 'react-router-dom';
import 'normalize.css';
import { Navigation } from './common/index';
import SearchView from './search/index';
import GalleryView from './gallery/index';
import MealDetail from './meal/index';
import './App.css';

function App() {
  return (
    <div className="App">
      <Navigation />
      <main>
        <Routes>
          <Route path="/" element={<SearchView />} />
          <Route path="/gallery" element={<GalleryView />} />
          <Route path="/meal/:id" element={<MealDetail />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
