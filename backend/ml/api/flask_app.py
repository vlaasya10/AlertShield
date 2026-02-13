from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from scripts.predict import RiskPredictor

app = Flask(__name__)
CORS(app)

# Initialize LightGBM predictor
predictor = RiskPredictor(model_dir='models')

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'model': 'LightGBM-Calibrated',
        'version': '2.0'
    })

@app.route('/api/ml/predict', methods=['POST'])
def predict_risk():
    """POST /api/ml/predict - Single prediction"""
    try:
        data = request.json
        result = predictor.predict(data)
        
        if result['status'] == 'success':
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 400

@app.route('/api/ml/batch-predict', methods=['POST'])
def batch_predict():
    """POST /api/ml/batch-predict - Batch predictions"""
    try:
        data = request.json
        events = data.get('events', [])
        
        results = []
        for event in events:
            result = predictor.predict(event)
            results.append(result)
        
        return jsonify({
            'results': results,
            'count': len(results),
            'model': 'LightGBM',
            'status': 'success'
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 400

if __name__ == '__main__':
    print("="*70)
    print("LIGHTGBM ML API SERVER")
    print("="*70)
    print("\nRoutes:")
    print("  GET  /health")
    print("  POST /api/ml/predict")
    print("  POST /api/ml/batch-predict")
    print("\nServer running at http://localhost:5000\n")
    
    app.run(debug=True, port=5000)