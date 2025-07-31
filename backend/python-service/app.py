from flask import Flask, request, jsonify
from textblob import TextBlob
import os

app = Flask(__name__)

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    message = data.get('message', '')
    if not message:
        return jsonify({'error': 'No message provided'}), 400

    blob = TextBlob(message)
    polarity = blob.sentiment.polarity
    print(polarity)
    # Simple sentiment logics
    if polarity > 0.1: 
        sentiment = "positive"
    elif polarity < -0.1:
        sentiment = "negative"
    else:
        sentiment = "neutral"

    return jsonify({'sentiment': sentiment, 'polarity': polarity})

@app.route('/')
def home():
    return "Flask Sentiment Service is running."

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv("PORT", 5000)))