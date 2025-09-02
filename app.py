print("👀 app.py is running...")

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)

# In-memory store (for demo purposes)
registrations = []

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    # Validate required fields
    required_fields = ['clinicName', 'childName', 'dob', 'motherName', 'phone']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing fields"}), 400

    # Add timestamp and store
    data['timestamp'] = datetime.now().isoformat()
    registrations.append(data)

    return jsonify({"message": "✅ Registration received!", "data": data}), 200

@app.route('/registrations', methods=['GET'])
def get_registrations():
    return jsonify(registrations)

if __name__ == '__main__':
    print("✅ Flask server is starting...")
    app.run(host='0.0.0.0', port=5000, debug=True)