# climate-change-prediction-and-analysis

This is a comprehensive web application that uses machine learning to predict climate data for the next 7 days. The application follows a Flask-based backend architecture with HTML/CSS/JavaScript frontend.

### Key Features:

1. **Prediction Interface**
   - User can select from 1-7 days for prediction
   - Location is automatically detected, but can be manually changed
   - Simple prediction button to trigger the ML model

2. **Machine Learning Model**
   - Random Forest Regressor trained on historical climate data
   - Predicts temperature, humidity, precipitation, and wind speed
   - Uses geographical location and date features for predictions
   - Includes synthetic data generation for demonstration

3. **Interactive Visualization**
   - Chart view with interactive Chart.js visualization
   - Table view for detailed numeric data
   - Ability to switch between different climate metrics

4. **Responsive Design**
   - Mobile-friendly interface
   - Clean, modern UI with intuitive controls
   - Proper loading states and error handling

### Project Structure:

```
climate-prediction-app/
│
├── app.py                     # Main Flask application
├── config.py                  # Configuration settings
├── requirements.txt           # Required packages
│
├── models/
│   ├── __init__.py
│   ├── climate_model.py       # ML model definition
│   ├── train_model.py         # Model training script
│   └── data_processor.py      # Data processing utilities
│
├── static/
│   ├── css/
│   │   └── style.css          # Custom CSS
│   ├── js/
│   │   └── main.js            # JavaScript for frontend
│
└── templates/
    ├── index.html             # Main page
    ├── base.html              # Base template
    └── about.html             # About page
```

### How to Run the Application:

1. **Setup the environment**:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Train the model**:
   ```
   python models/train_model.py
   ```

3. **Run the Flask application**:
   ```
   python app.py
   ```

4. **Access the application**:
   Open your browser and go to `http://127.0.0.1:5000/`

### Notes:

- The application includes synthetic data generation for demonstration purposes
- In a production environment, you would replace this with real historical climate data
- The prediction model uses date and geographical features to generate forecasts
- All UI components are built with pure CSS and vanilla JavaScript for simplicity

The application provides an intuitive interface for users to get climate predictions for their location, visualize trends, and understand potential climate changes over time.
