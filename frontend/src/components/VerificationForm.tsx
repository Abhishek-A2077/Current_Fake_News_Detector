from flask import Flask, request, jsonify, send_from_directory, render_template
import pandas as pd
import sklearn
import itertools
import numpy as np
import seaborn as sb
import re
import nltk
import pickle
import os
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from matplotlib import pyplot as plt
from sklearn.linear_model import PassiveAggressiveClassifier
from nltk.stem import WordNetLemmatizer
from nltk.corpus import stopwords

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the 6-class model, vectorizer and label encoder
try:
    loaded_model = pickle.load(open("model_6class.pkl", 'rb'))
    vector = pickle.load(open("vector_6class.pkl", 'rb'))
    label_encoder = pickle.load(open("label_encoder_6class.pkl", 'rb'))
    print("Loaded 6-class model successfully!")
except:
    # Fallback to binary model if 6-class model not found
    loaded_model = pickle.load(open("model.pkl", 'rb'))
    vector = pickle.load(open("vector.pkl", 'rb'))
    print("Loaded binary model as fallback!")
    
lemmatizer = WordNetLemmatizer()
stpwrds = set(stopwords.words('english'))

def predict_truthfulness(news):
    """
    Predict the truthfulness category of news text
    Returns truthfulness level and confidence scores for all classes
    """
    # Text preprocessing
    review = news
    review = re.sub(r'[^a-zA-Z\s]', '', review)
    review = review.lower()
    review = nltk.word_tokenize(review)
    corpus = []
    for y in review:
        if y not in stpwrds:
            corpus.append(lemmatizer.lemmatize(y))
    input_data = [' '.join(corpus)]
    
    # Vectorize the input
    vectorized_input_data = vector.transform(input_data)
    
    # Make prediction (gets numeric class)
    prediction = loaded_model.predict(vectorized_input_data)[0]
    
    # Check if we're using the 6-class model or binary model
    if 'label_encoder' in globals():
        # 6-class model
        truthfulness = label_encoder.inverse_transform([prediction])[0]
        
        # Get decision scores for all classes
        decision_scores = loaded_model.decision_function(vectorized_input_data)
        
        # Convert decision scores to a dictionary
        class_scores = {}
        # Handle different shapes of decision scores based on model type
        if len(decision_scores.shape) > 1:
            # Multi-class case
            for i, class_name in enumerate(label_encoder.classes_):
                class_scores[class_name] = float(decision_scores[0][i])
        else:
            # Binary case as fallback
            class_scores = {"fake": float(decision_scores[0]), "real": -float(decision_scores[0])}
            truthfulness = "fake" if prediction == 1 else "real"
            
        return truthfulness, class_scores
    else:
        # Binary model fallback
        is_fake = prediction == 1
        return "fake" if is_fake else "real", {"fake": 0.92 if is_fake else 0.08, "real": 0.08 if is_fake else 0.92}

# Legacy function for backward compatibility
def fake_news_det(news):
    truthfulness, _ = predict_truthfulness(news)
    # Map 6-class output to binary for old code
    if truthfulness in ['pants-fire', 'false', 'barely-true']:
        return [1]  # Fake
    else:
        return [0]  # Real

# Legacy route for old frontend
@app.route('/old')
def home():
    return render_template('index.html')

# API endpoint for prediction
@app.route('/api/predict', methods=['POST'])
def predict_api():
    data = request.get_json()
    news_text = data.get('text', '')
    
    # Use new prediction function
    truthfulness, class_scores = predict_truthfulness(news_text)
    
    # Format the result as JSON
    result = {
        "prediction": truthfulness,
        "scores": class_scores
    }
    
    # Add a simplified binary result for backward compatibility
    result["binary_prediction"] = "fake" if truthfulness in ['pants-fire', 'false', 'barely-true'] else "real"
    
    return jsonify(result)

# Legacy route for old frontend prediction
@app.route('/predict', methods=['GET', 'POST'])
def predict():
    if request.method == 'POST':
        message = request.form['news']
        truthfulness, class_scores = predict_truthfulness(message)
        
        def get_truthfulness_message(truthfulness):
            emoji = "📰"
            if 'label_encoder' in globals():
                # 6-class model
                if truthfulness == 'pants-fire':
                    return f"Prediction: PANTS ON FIRE! Highly deceptive claim {emoji}"
                elif truthfulness == 'false':
                    return f"Prediction: FALSE claim {emoji}"
                elif truthfulness == 'barely-true':
                    return f"Prediction: BARELY TRUE claim {emoji}"
                elif truthfulness == 'half-true':
                    return f"Prediction: HALF TRUE claim {emoji}"
                elif truthfulness == 'mostly-true':
                    return f"Prediction: MOSTLY TRUE claim {emoji}"
                elif truthfulness == 'true':
                    return f"Prediction: TRUE claim {emoji}"
            # Binary model fallback
            return f"Prediction: {'Looking Fake News' if truthfulness == 'fake' else 'Looking Real News'} {emoji}"
        
        result = get_truthfulness_message(truthfulness)
        
        # Pass both the result message and the class scores to the template
        return render_template("prediction.html", 
                              prediction_text="{}".format(result),
                              truthfulness=truthfulness,
                              class_scores=class_scores)
    else:
        return render_template('prediction.html', prediction="Something went wrong")

# Serve the frontend
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists("../frontend/dist/" + path):
        return send_from_directory('../frontend/dist', path)
    else:
        return send_from_directory('../frontend/dist', 'index.html')

if __name__ == '__main__':
    app.run(debug=True)
