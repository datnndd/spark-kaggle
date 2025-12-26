import { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PredictionPage from './pages/PredictionPage';
import AboutModelsPage from './pages/AboutModelsPage';

function App() {
  // About Models is the default page
  const [currentPage, setCurrentPage] = useState('about');

  const renderPage = () => {
    switch (currentPage) {
      case 'about':
        return <AboutModelsPage />;
      case 'prediction':
        return <PredictionPage />;
      default:
        return <AboutModelsPage />;
    }
  };

  return (
    <div className="bg-background-light font-display text-slate-800 min-h-screen flex flex-col transition-colors duration-200">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {renderPage()}
      <Footer />
    </div>
  );
}

export default App;
