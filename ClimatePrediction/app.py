from flask import Flask, render_template, request, jsonify
import numpy as np
import pickle
import os
import json
from datetime import datetime, timedelta
from config import Config
from models.climate_model import make_prediction

app = Flask(__name__)
app.config.from_object(Config)

# Load the trained model
model_path = os.path.join('models', 'trained_climate_model.pkl')
with open(model_path, 'rb') as f:
    model = pickle.load(f)

@app.route('/')
def index():
    current_year = datetime.now().year
    return render_template('index.html', year=current_year)

@app.route('/about')
def about():
    current_year = datetime.now().year
    return render_template('about.html', year=current_year)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get current date as reference
        current_date = datetime.now()
        
        # Get the number of days to predict
        days = int(request.form.get('days', 7))
        if days < 1 or days > 7:
            days = 7  # Default to 7 if out of range
            
        # Get current location data or use default
        lat = float(request.form.get('latitude', 28.6139))  # Default: Delhi
        lon = float(request.form.get('longitude', 77.2090))
        
        # Make predictions for each day
        predictions = []
        for i in range(days):
            # Calculate the target date
            target_date = current_date + timedelta(days=i+1)
            date_str = target_date.strftime('%Y-%m-%d')
            
            # Get prediction from model
            prediction_data = make_prediction(model, lat, lon, target_date)
            
            # Format the prediction for the frontend
            predictions.append({
                'date': date_str,
                'temperature': round(prediction_data['temperature'], 1),
                'humidity': round(prediction_data['humidity'], 1),
                'precipitation': round(prediction_data['precipitation'], 2),
                'wind_speed': round(prediction_data['wind_speed'], 1)
            })
        
        return jsonify({
            'success': True,
            'predictions': predictions
        })
        
    except Exception as e:
        app.logger.error(f"Prediction error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)