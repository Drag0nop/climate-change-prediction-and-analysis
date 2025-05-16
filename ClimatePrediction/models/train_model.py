import pandas as pd
import numpy as np
import pickle
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import warnings
import sys
import os

# Add the parent directory to path so Python can find the config module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import Config

def load_and_preprocess_data(data_path):
    # Load data
    df = pd.read_csv(data_path)
    
    if not os.path.exists(data_path):
        print("Creating synthetic climate data for demonstration...")

        dates = pd.date_range(start='2010-01-01', end='2023-12-31')
        locations = [
            (28.6139, 77.2090),    # Delhi
            (40.7128, -74.0060),  # New York
            (34.0522, -118.2437),  # Los Angeles
            (51.5074, -0.1278),    # London
            (35.6762, 139.6503),   # Tokyo
        ]
        
        rows = []
        for date in dates:
            for lat, lon in locations:
                day_of_year = date.timetuple().tm_yday
                year = date.year
                
                # Create some seasonal patterns with noise
                season_factor = np.sin(day_of_year / 365 * 2 * np.pi)
                
                # Temperature varies by latitude and season
                base_temp = 25 - 0.5 * abs(lat - 0)  # Equator is warmest
                temp_variation = 15 * season_factor
                temp = base_temp + temp_variation + np.random.normal(0, 3)
                
                # Humidity inversely related to temperature but with regional variations
                humidity = 70 - 0.3 * temp + 0.1 * abs(lon) + np.random.normal(0, 10)
                humidity = max(min(humidity, 100), 10)  # Keeping it between 10-100%
                
                # Precipitation more in humid periods
                precip_prob = humidity / 100
                precipitation = np.random.exponential(5) if np.random.random() < precip_prob else 0
                precipitation = min(precipitation, 50)  # Cap extreme values
                
                # Wind speed with some seasonal and regional patterns
                wind_speed = 10 + 5 * abs(season_factor) + np.random.normal(0, 3)
                wind_speed = max(wind_speed, 0)
                
                # Add climate change trend (warming over time)
                year_factor = (year - 2010) / 10  # Normalize years
                temp += year_factor * 0.8  # Global warming signal
                
                rows.append({
                    'date': date,
                    'latitude': lat,
                    'longitude': lon,
                    'day_of_year': day_of_year,
                    'year': year,
                    'temperature': temp,
                    'humidity': humidity,
                    'precipitation': precipitation,
                    'wind_speed': wind_speed
                })
        
        df = pd.DataFrame(rows)
        
        # Save the synthetic data
        os.makedirs(os.path.dirname(data_path), exist_ok=True)
        df.to_csv(data_path, index=False)
    
    # Extract features and targets
    X = df[['latitude', 'longitude', 'day_of_year', 'year']].values
    y = df[['temperature', 'humidity', 'precipitation', 'wind_speed']].values
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    return X_train, X_test, y_train, y_test

def train_model(X_train, y_train):
    # Train a random forest model
    model = RandomForestRegressor(
        n_estimators=100, 
        max_depth=15,
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X_train, y_train)
    return model

def evaluate_model(model, X_test, y_test):
    # Make predictions
    y_pred = model.predict(X_test)
    
    # Calculate MSE for each target
    mse = np.mean((y_pred - y_test) ** 2, axis=0)
    rmse = np.sqrt(mse)
    
    # Calculate R2 for each target
    ss_total = np.sum((y_test - np.mean(y_test, axis=0)) ** 2, axis=0)
    ss_res = np.sum((y_test - y_pred) ** 2, axis=0)
    r2 = 1 - (ss_res / ss_total)
    
    return {
        'RMSE': rmse,
        'R2': r2
    }

def main():
    warnings.filterwarnings('ignore')

    data_path = os.path.join('models', 'data', 'historical_climate_data.csv') #taking data from historical_climate_data.csv
    model_path = os.path.join('models', 'trained_climate_model.pkl')
    
    print("Loading and preprocessing climate data")
    X_train, X_test, y_train, y_test = load_and_preprocess_data(data_path)
    
    print("Training climate prediction model")
    model = train_model(X_train, y_train)
    
    print("Evaluating model performance")
    metrics = evaluate_model(model, X_test, y_test)
    
    print("Model metrics: ")
    for i, target in enumerate(['Temperature', 'Humidity', 'Precipitation', 'Wind Speed']):
        print(f"{target}:")
        print(f"  RMSE: {metrics['RMSE'][i]:.2f}")
        print(f"  R2: {metrics['R2'][i]:.2f}")
    
    # Saving model
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    main()