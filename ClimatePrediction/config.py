import os

class Config:
    """Configuration settings for the application."""
    # Flask settings
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'hard-to-guess-string'
    
    # Data settings
    HISTORICAL_DATA_PATH = os.path.join('models', 'data', 'historical_climate_data.csv')
    
    # Model settings
    MODEL_PATH = os.path.join('models', 'trained_climate_model.pkl')
    FEATURES = ['latitude', 'longitude', 'day_of_year', 'year']
    TARGETS = ['temperature', 'humidity', 'precipitation', 'wind_speed']
    
    # API keys for potential external services
    # In a production app, these would be environment variables
    WEATHER_API_KEY = os.environ.get('WEATHER_API_KEY', '')