import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import joblib
import os  # Add this import

# Create models directory if it doesn't exist
os.makedirs('models', exist_ok=True)

# Generate synthetic sleep data
np.random.seed(42)
num_samples = 1000

data = {
    'heart_rate': np.random.normal(65, 10, num_samples),
    'steps': np.random.randint(3000, 15000, num_samples),
    'active_minutes': np.random.randint(20, 120, num_samples),
    'calories': np.random.randint(1800, 3000, num_samples),
    'stress_level': np.random.randint(1, 10, num_samples),
    'time_in_bed': np.random.normal(480, 60, num_samples),  # minutes
    'sleep_interruptions': np.random.poisson(2, num_samples),
    'sleep_quality': np.random.normal(70, 15, num_samples)  # target (0-100)
}

# Ensure sleep quality is within bounds
data['sleep_quality'] = np.clip(data['sleep_quality'], 0, 100)

df = pd.DataFrame(data)

# Split data
X = df.drop('sleep_quality', axis=1)
y = df['sleep_quality']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate
predictions = model.predict(X_test)
mae = mean_absolute_error(y_test, predictions)
print(f"Model MAE: {mae:.2f}")

# Save model
joblib.dump(model, 'models/sleep_model.pkl')
print("Model saved to models/sleep_model.pkl")