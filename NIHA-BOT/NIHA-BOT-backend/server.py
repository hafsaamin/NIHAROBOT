from flask import Flask, request, Response
from flask_cors import CORS
import openai
from pymongo import MongoClient
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS

# Set your OpenAI API key


# MongoDB connection
mongo_client = MongoClient("mongodb://localhost:27017/")
db = mongo_client['chatbot_db']
chat_collection = db['chat_sessions']

# Stream responses from OpenAI
def generate_openai_response(prompt):
    try:
        # Call OpenAI API with streaming enabled
        response = openai.ChatCompletion.create(
            model='gpt-3.5-turbo',
            messages=[{'role': 'user', 'content': prompt}],
            stream=True
        )

        chat_output = ''
        for chunk in response:
            # Check if the chunk has content to send
            if 'choices' in chunk and 'delta' in chunk['choices'][0]:
                word = chunk['choices'][0]['delta'].get('content', '')
                chat_output += word
                yield f'data: {word}\n\n'  # Stream word by word

    except Exception as e:
        print(f'Error: {e}')
        yield 'data: [Error]\n\n'  # Send error message in case of failure

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    prompt = data.get('prompt')

    # Save the chat prompt to MongoDB
    chat_collection.insert_one({
        'prompt': prompt,
        'timestamp': datetime.now()
    })

    # Return streamed response
    return Response(generate_openai_response(prompt), content_type='text/event-stream')

if __name__ == '__main__':
    app.run(port=2000, debug=True)
