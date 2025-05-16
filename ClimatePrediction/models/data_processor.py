import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def process_historical_data(df):
    # Convert the date to datetime if it is not already
    if 'date' in df.columns and not pd.api.types.is_datetime64_any_dtype(df['date']):
        df['date'] = pd.to_datetime(df['date'])
    
    # Extract date components
    df['day_of_year'] = df['date'].dt.dayofyear
    df['year'] = df['date'].dt.year
    
    # Handle missing values
    for col in ['temperature', 'humidity', 'precipitation', 'wind_speed']:
        if col in df.columns:
            # Fill missing values with the median for that day of year
            df[col] = df.groupby('day_of_year')[col].transform(
                lambda x: x.fillna(x.median())
            )
    
    return df

def generate_feature_vector(latitude, longitude, target_date):
    day_of_year = target_date.timetuple().tm_yday
    year = target_date.year
    
    return np.array([[latitude, longitude, day_of_year, year]])