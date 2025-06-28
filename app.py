from flask import Flask, render_template, request, jsonify
import pandas as pd
import numpy as np
import joblib
from datetime import datetime
import json

app = Flask(__name__)

# Load the trained model
model = joblib.load('models/sleep_model.pkl')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get data from the request
        data = request.json
        
        # Create a DataFrame from the input data
        input_data = pd.DataFrame([{
            'heart_rate': data['heartRate'],
            'steps': data['steps'],
            'active_minutes': data['activeMinutes'],
            'calories': data['calories'],
            'stress_level': data['stressLevel'],
            'time_in_bed': data['timeInBed'],
            'sleep_interruptions': data['sleepInterruptions']
        }])
        
        # Make prediction
        prediction = model.predict(input_data)
        sleep_quality = int(prediction[0])
        
        # Generate sleep stages data for visualization
        sleep_stages = generate_sleep_stages(sleep_quality)
        
        return jsonify({
            'sleepQuality': sleep_quality,
            'sleepStages': sleep_stages,
            'recommendations': get_recommendations(sleep_quality)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

def generate_sleep_stages(quality):
    """Generate simulated sleep stage data based on quality"""
    np.random.seed(42 + quality)
    
    if quality > 80:  # Excellent sleep
        rem = np.random.normal(25, 3)
        deep = np.random.normal(30, 3)
        light = 100 - rem - deep
    elif quality > 60:  # Good sleep
        rem = np.random.normal(20, 4)
        deep = np.random.normal(25, 4)
        light = 100 - rem - deep
    else:  # Poor sleep
        rem = np.random.normal(15, 5)
        deep = np.random.normal(20, 5)
        light = 100 - rem - deep
    
    return {
        'REM': round(rem, 1),
        'Deep': round(deep, 1),
        'Light': round(light, 1)
    }

def get_recommendations(quality):
    """Get personalized recommendations based on sleep quality"""
    if quality > 80:
        return [
            "Maintain your excellent routine!",
            "Consider tracking your diet to see if it affects your sleep."
        ]
    elif quality > 60:
        return [
            "Try going to bed 30 minutes earlier for a week.",
            "Reduce screen time 1 hour before bed.",
            "Consider a relaxing pre-sleep routine."
        ]
    else:
        return [
            "Consult with a sleep specialist if this persists.",
            "Establish a consistent sleep schedule.",
            "Avoid caffeine after 2 PM.",
            "Create a dark, quiet sleep environment."
        ]

if __name__ == '__main__':
    app.run(debug=True)