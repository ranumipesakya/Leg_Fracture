from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
from datetime import datetime
import uuid

app = Flask(__name__)
CORS(app)

# Load models
xray_model = tf.keras.models.load_model("models/xray_detector.keras")
fracture_model = tf.keras.models.load_model("models/fracture_single.keras")

IMG_SIZE = (224, 224)

def preprocess_image(image):
    image = image.convert("RGB")
    image = image.resize(IMG_SIZE)
    img_array = np.array(image) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]

    try:
        image = Image.open(file.stream)
    except Exception:
        return jsonify({"error": "Invalid image file"}), 400

    processed = preprocess_image(image)

    # 1. Check whether image is X-ray
    xray_pred = float(xray_model.predict(processed, verbose=0)[0][0])
    is_xray = xray_pred > 0.5

    report_id = f"AI-{str(uuid.uuid4().int)[:4]}"
    generated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if not is_xray:
        return jsonify({
            "report_id": report_id,
            "generated_at": generated_at,
            "is_xray": False,
            "message": "Uploaded image is not an X-ray",
            "xray_confidence": xray_pred,
            "fracture_prediction": None,
            "fracture_confidence": None,
            "recommendation": "Please upload a valid radiological X-ray image."
        })

    # 2. Predict fracture
    fracture_pred = float(fracture_model.predict(processed, verbose=0)[0][0])

    # Adjust this depending on your model labeling
    fractured = fracture_pred < 0.5

    fracture_prediction = "Fractured" if fractured else "Not Fractured"
    fracture_confidence = float(1 - fracture_pred if fractured else fracture_pred)

    recommendation = (
        "Potential fracture detected. Please consult an orthopedic specialist."
        if fractured
        else "No fracture detected by AI screening. Clinical confirmation is still recommended."
    )

    return jsonify({
        "report_id": report_id,
        "generated_at": generated_at,
        "is_xray": True,
        "message": "Valid X-ray image",
        "xray_confidence": xray_pred,
        "fracture_prediction": fracture_prediction,
        "fracture_confidence": fracture_confidence,
        "recommendation": recommendation
    })

if __name__ == "__main__":
    app.run(port=5001, debug=True)