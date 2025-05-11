import random
import json
import pickle
import numpy as np
import nltk
import re
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import wordpunct_tokenize
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

# Download necessary NLTK data
nltk.download('punkt')
nltk.download('wordnet')
nltk.download('omw-1.4')

lemmatizer = WordNetLemmatizer()

# Load the intents file
with open('intents.json', 'r') as file:
    intents = json.load(file)

# Prepare data
X = []  # preprocessed patterns
y = []  # tags
classes = []

def preprocess(text):
    tokens = wordpunct_tokenize(text)
    tokens = [lemmatizer.lemmatize(word.lower()) for word in tokens if word.isalpha()]
    return " ".join(tokens)

for intent in intents['intents']:
    for pattern in intent['patterns']:
        processed = preprocess(pattern)
        X.append(processed)
        y.append(intent['tag'])
        if intent['tag'] not in classes:
            classes.append(intent['tag'])

classes = sorted(list(set(classes)))

# Create pipeline without custom tokenizer
model = Pipeline([
    ('vectorizer', CountVectorizer(lowercase=True)),
    ('classifier', MultinomialNB())
])

# Train the model
model.fit(X, y)

# Save model and supporting data
with open('chatbot_model.pickle', 'wb') as f:
    pickle.dump(model, f)

with open('classes.pkl', 'wb') as f:
    pickle.dump(classes, f)

with open('chatbot_data.pickle', 'wb') as f:
    chatbot_data = {
        'classes': classes,
        'model': model,
        'intents': intents
    }
    pickle.dump(chatbot_data, f)

print("Model trained and saved successfully!")
