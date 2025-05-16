import numpy as np
from datetime import datetime

def make_prediction(model, latitude, longitude, target_date):
    # Extract features from the date
    day_of_year = target_date.timetuple().tm_yday  # Day of year (1-366)
    year = target_date.year
    
    # Create feature array for prediction
    X = np.array([[latitude, longitude, day_of_year, year]])
    
    # Make prediction
    prediction = model.predict(X)[0]
    
    # Return formatted prediction
    return {
        'temperature': float(prediction[0]),  # Celsius
        'humidity': float(prediction[1]),     # Percentage
        'precipitation': float(prediction[2]), # mm
        'wind_speed': float(prediction[3])    # km/h
    }