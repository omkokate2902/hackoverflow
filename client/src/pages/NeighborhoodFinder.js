import React, { useState, useEffect, useCallback, useContext } from 'react';
import PreferenceForm from '../components/PreferenceForm';
import ReviewSelection from '../components/ReviewSelection';
import NeighborhoodResults from '../components/NeighborhoodResults';
import GoogleLogin from '../components/GoogleLogin';
import { API } from '../utils/api';
import * as userStorage from '../utils/userStorage';
import '../styles/pages/NeighborhoodFinder.css';
import { AuthContext } from '../context/AuthContext';

const NeighborhoodFinder = () => {
  const [preferences, setPreferences] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [currentStep, setCurrentStep] = useState('form'); // 'form', 'review', or 'results'
  const [formData, setFormData] = useState(null);
  const { user } = useContext(AuthContext);

  // Load user preferences from backend when component mounts
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const data = await API.user.getPreferences();
        if (data.preferences) {
          console.log('Loaded user preferences:', data.preferences);
          setPreferences(data.preferences);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };
    
    if (user) {
      loadUserPreferences();
    }
  }, [user]);

  const handlePreferenceSubmit = (data) => {
    console.log('Form submitted with data:', data);
    setFormData(data);
    
    // If recommendations are already included in the data
    if (data.recommendations) {
      setRecommendations(data.recommendations);
      setPreferences(data.preferences);
      setCurrentStep('review');
    } else {
      setPreferences(data);
      setCurrentStep('review');
    }
  };

  const handleTimelineData = (data) => {
    setTimelineData(data);
  };

  const handleReviewBack = () => {
    setCurrentStep('form');
  };

  const handleReviewConfirm = () => {
    // Store the recommended neighborhoods in userStorage
    if (user && user.uid && recommendations && recommendations.length > 0) {
      userStorage.saveRecommendedNeighborhoods(user.uid, recommendations);
      console.log('Saved recommended neighborhoods to user storage:', recommendations);
    }
    
    setCurrentStep('results');
  };

  const handleResultsBack = () => {
    setCurrentStep('review');
  };

  // Render the login section if user is not logged in
  const renderLoginSection = () => {
    return (
      <div className="login-required-section">
        <h2>Sign In Required</h2>
        <p>Please sign in with your Google account to find your perfect neighborhood. We use your preferences to provide personalized recommendations.</p>
        <div className="login-container">
          <GoogleLogin />
        </div>
        <div className="login-benefits">
          <h3>Benefits of signing in:</h3>
          <ul>
            <li>Save your preferences for future visits</li>
            <li>Get personalized neighborhood recommendations</li>
            <li>Upload your timeline data for better insights</li>
            <li>Connect with local communities in your new neighborhood</li>
          </ul>
        </div>
      </div>
    );
  };

  // Render the current step
  const renderCurrentStep = () => {
    // If user is not logged in, show login section
    if (!user) {
      return renderLoginSection();
    }

    switch (currentStep) {
      case 'form':
        return (
          <PreferenceForm 
            onSubmit={handlePreferenceSubmit} 
            onTimelineData={handleTimelineData}
            userId={user?.uid}
          />
        );
      case 'review':
        return (
          <ReviewSelection 
            preferences={formData.preferences || preferences} 
            recommendations={recommendations}
            onConfirm={handleReviewConfirm} 
            onBack={handleReviewBack} 
          />
        );
      case 'results':
        return (
          <NeighborhoodResults
            recommendations={recommendations}
            preferences={formData.preferences || preferences}
            onBack={handleResultsBack}
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="neighborhood-finder">
      {renderCurrentStep()}
    </div>
  );
};

// Helper function to get category name
function getCategoryName(categoryId) {
  const categories = {
    budget: 'Budget Explorer',
    moderate: 'Balanced Dweller',
    comfort: 'Comfort Seeker',
    premium: 'Premium Lifestyle',
    luxury: 'Luxury Connoisseur'
  };
  return categories[categoryId] || categoryId;
}

// Helper function to get category color
function getCategoryColor(categoryId) {
  const colors = {
    budget: '#4cb963',
    moderate: '#4a6fa5',
    comfort: '#f4a261',
    premium: '#e76f51',
    luxury: '#9c6644'
  };
  return colors[categoryId] || '#4a6fa5';
}

// Helper function to get travel mode icon
function getTravelModeIcon(modeId) {
  const icons = {
    walking: '🚶',
    bicycling: '🚲',
    transit: '🚌',
    driving: '🚗'
  };
  return icons[modeId] || '🚗';
}

// Helper function to get travel mode color
function getTravelModeColor(modeId) {
  const colors = {
    walking: '#4cb963', // green
    bicycling: '#f4a261', // orange
    transit: '#4a6fa5', // blue
    driving: '#e76f51' // red
  };
  return colors[modeId] || '#4a6fa5';
}

export default NeighborhoodFinder; 