from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image, ImageOps
from datetime import datetime
import uuid
import os
import cv2

app = Flask(__name__)
CORS(app)

# Load models
xray_model = tf.keras.models.load_model("models/xray_detector_v2.keras")
leg_model = tf.keras.models.load_model("models/leg_xray_classifier.keras")
fracture_model = tf.keras.models.load_model("models/fracture_final_best.keras")

IMG_SIZE = (224, 224)

# Grad-CAM settings
GRADCAM_FOLDER = "static/gradcam"
os.makedirs(GRADCAM_FOLDER, exist_ok=True)

LAST_CONV_LAYER_NAME = "top_activation"

print("Models loaded successfully")
print("Fracture model input shape:", fracture_model.input_shape)
print("Fracture model output shape:", fracture_model.output_shape)


def preprocess_for_xray(image):
    image = ImageOps.exif_transpose(image)
    image = image.convert("L")
    image = image.resize(IMG_SIZE)

    img_array = np.array(image, dtype=np.float32) / 255.0
    img_array = np.stack([img_array, img_array, img_array], axis=-1)
    img_array = np.expand_dims(img_array, axis=0)
    return img_array


def preprocess_for_leg(image):
    image = ImageOps.exif_transpose(image)
    image = image.convert("RGB")
    image = image.resize(IMG_SIZE)

    img_array = np.array(image, dtype=np.float32) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array


def preprocess_for_fracture(image):
    # Fix orientation based on EXIF data
    image = ImageOps.exif_transpose(image)
    image = image.convert("RGB")
    image = image.resize(IMG_SIZE)

    img_array = np.array(image, dtype=np.float32) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array


def make_gradcam_heatmap(img_array, model, last_conv_layer_name, class_index=1):
    grad_model = tf.keras.models.Model(
        inputs=model.inputs,
        outputs=[
            model.get_layer(last_conv_layer_name).output,
            model.output
        ]
    )

    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(img_array)

        if class_index == 1:
            class_channel = predictions[:, 0]
        else:
            class_channel = 1 - predictions[:, 0]

    grads = tape.gradient(class_channel, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    conv_outputs = conv_outputs[0]
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)

    heatmap = tf.maximum(heatmap, 0) / (tf.reduce_max(heatmap) + 1e-8)
    return heatmap.numpy()


def build_bone_mask(img_bgr):
    """
    Estimate likely bone regions from X-ray contrast so XAI borders stay on bone areas.
    """
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    denoised = cv2.GaussianBlur(gray, (5, 5), 0)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(denoised)

    otsu_thr, _ = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    percentile_thr = int(np.percentile(enhanced, 74))
    bone_thr = int(max(otsu_thr, percentile_thr))
    _, bone_mask = cv2.threshold(enhanced, bone_thr, 255, cv2.THRESH_BINARY)

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    bone_mask = cv2.morphologyEx(bone_mask, cv2.MORPH_OPEN, kernel)
    bone_mask = cv2.morphologyEx(bone_mask, cv2.MORPH_CLOSE, kernel)
    bone_mask = cv2.dilate(bone_mask, kernel, iterations=1)

    # Remove near-border artifacts (labels/markers often appear on image edges).
    h, w = gray.shape
    border_margin = max(6, int(min(h, w) * 0.06))
    valid_roi = np.zeros_like(bone_mask)
    valid_roi[border_margin:h - border_margin, border_margin:w - border_margin] = 255
    bone_mask = cv2.bitwise_and(bone_mask, valid_roi)

    # Keep meaningful bright structures and drop tiny noisy blobs.
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(bone_mask, connectivity=8)
    cleaned = np.zeros_like(bone_mask)
    min_area = max(150, int(gray.shape[0] * gray.shape[1] * 0.0008))
    candidates = []
    for lbl in range(1, num_labels):
        area = int(stats[lbl, cv2.CC_STAT_AREA])
        if area >= min_area:
            x = int(stats[lbl, cv2.CC_STAT_LEFT])
            y = int(stats[lbl, cv2.CC_STAT_TOP])
            bw = int(stats[lbl, cv2.CC_STAT_WIDTH])
            bh = int(stats[lbl, cv2.CC_STAT_HEIGHT])
            aspect = max(bw / max(1, bh), bh / max(1, bw))
            component = labels == lbl
            mean_intensity = float(enhanced[component].mean())
            # Prefer larger, brighter, elongated structures like tibia/fibula.
            score = (area ** 0.6) * (mean_intensity / 255.0) * max(1.0, aspect)
            candidates.append((score, lbl))

    # Keep strongest bone-like components only.
    candidates.sort(reverse=True, key=lambda x: x[0])
    keep = {lbl for _, lbl in candidates[:3]}
    for lbl in keep:
        cleaned[labels == lbl] = 255

    return cleaned, enhanced


def save_xai_box_image(original_pil_image, heatmap, out_path):
    # Ensure original image matches clinical orientation
    original_pil_image = ImageOps.exif_transpose(original_pil_image)
    img = np.array(original_pil_image.convert("RGB"))
    img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

    # Resize and smooth attention map to reduce noise before region extraction
    heatmap = cv2.resize(heatmap, (img.shape[1], img.shape[0]))
    heatmap = cv2.GaussianBlur(heatmap, (0, 0), sigmaX=2.0, sigmaY=2.0)
    heatmap_uint8 = np.uint8(np.clip(heatmap * 255.0, 0, 255))

    # Use a high threshold so only strongest fracture-relevant areas remain
    _, peak_value, _, peak_loc = cv2.minMaxLoc(heatmap_uint8)
    percentile_thr = int(np.percentile(heatmap_uint8, 93))
    adaptive_thr = int(max(peak_value * 0.72, percentile_thr))
    heat_mask = np.where(heatmap_uint8 >= adaptive_thr, 255, 0).astype(np.uint8)

    # Restrict XAI highlight to probable bone regions.
    bone_mask, enhanced = build_bone_mask(img)

    # Weight the heatmap by bright bone structures before thresholding fallback.
    enhanced_norm = enhanced.astype(np.float32) / 255.0
    weighted_heat = np.clip((heatmap_uint8.astype(np.float32) / 255.0) * (0.6 + 0.4 * enhanced_norm), 0.0, 1.0)
    weighted_heat_uint8 = np.uint8(weighted_heat * 255.0)

    mask = cv2.bitwise_and(heat_mask, bone_mask)

    # Relax threshold if too sparse, but keep strictly inside bone.
    if cv2.countNonZero(mask) < 120:
        relaxed_thr = int(max(110, np.percentile(weighted_heat_uint8, 88)))
        relaxed_heat_mask = np.where(weighted_heat_uint8 >= relaxed_thr, 255, 0).astype(np.uint8)
        mask = cv2.bitwise_and(relaxed_heat_mask, bone_mask)

    # Final safety: never draw outside bone area.
    mask = cv2.bitwise_and(mask, bone_mask)

    # Morphological cleanup
    kernel = np.ones((5, 5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
    h, w = heatmap_uint8.shape
    image_area = h * w

    selected_label = 0
    px, py = peak_loc
    hotspot_label = labels[py, px]
    min_area = max(40, int(image_area * 0.0003))
    max_area = int(image_area * 0.45)

    # Prefer the component that contains the global hotspot
    if hotspot_label > 0:
        area = int(stats[hotspot_label, cv2.CC_STAT_AREA])
        if min_area <= area <= max_area:
            selected_label = int(hotspot_label)

    # Fallback: choose the highest-importance connected component
    if selected_label == 0:
        best_score = -1.0
        for lbl in range(1, num_labels):
            area = int(stats[lbl, cv2.CC_STAT_AREA])
            if area < min_area or area > max_area:
                continue
            component_mask = labels == lbl
            mean_heat = float(heatmap_uint8[component_mask].mean())
            score = mean_heat * np.sqrt(area)
            if score > best_score:
                best_score = score
                selected_label = lbl

    if selected_label > 0:
        x = int(stats[selected_label, cv2.CC_STAT_LEFT])
        y = int(stats[selected_label, cv2.CC_STAT_TOP])
        bw = int(stats[selected_label, cv2.CC_STAT_WIDTH])
        bh = int(stats[selected_label, cv2.CC_STAT_HEIGHT])

        # Slight padding for visibility while staying focused on the fracture zone
        pad = max(4, int(min(w, h) * 0.01))
        x1 = max(0, x - pad)
        y1 = max(0, y - pad)
        x2 = min(w - 1, x + bw + pad)
        y2 = min(h - 1, y + bh + pad)

        component_mask = np.where(labels == selected_label, 255, 0).astype(np.uint8)
        contours, _ = cv2.findContours(component_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        if contours:
            # Draw a border around the focused fracture region (more precise than a full box).
            cv2.drawContours(img, contours, -1, (0, 0, 255), 3)
            # Add a subtle support rectangle for readability in low-contrast cases.
            cv2.rectangle(img, (x1, y1), (x2, y2), (0, 0, 255), 1)
        else:
            cv2.rectangle(img, (x1, y1), (x2, y2), (0, 0, 255), 4)

    cv2.imwrite(out_path, img)


@app.route("/static/gradcam/<filename>")
def serve_gradcam(filename):
    return send_from_directory(GRADCAM_FOLDER, filename)


@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]

    try:
        image = Image.open(file.stream)
    except Exception:
        return jsonify({"error": "Invalid image file"}), 400

    report_id = f"AI-{str(uuid.uuid4().int)[:4]}"
    generated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # 1) X-ray check
    xray_input = preprocess_for_xray(image)
    xray_pred = float(xray_model.predict(xray_input, verbose=0)[0][0])
    print("xray_pred:", xray_pred)

    if xray_pred >= 0.60:
        pass
    elif xray_pred <= 0.40:
        return jsonify({
            "report_id": report_id,
            "generated_at": generated_at,
            "stage": "xray_check",
            "is_xray": False,
            "is_leg_xray": None,
            "message": "Uploaded image is not an X-ray",
            "xray_confidence": xray_pred,
            "leg_confidence": None,
            "fracture_prediction": None,
            "fracture_confidence": None,
            "fracture_raw_prediction": None,
            "recommendation": "Please upload a valid radiological X-ray image.",
            "gradcam_image": None
        })
    else:
        return jsonify({
            "report_id": report_id,
            "generated_at": generated_at,
            "stage": "xray_check",
            "is_xray": False,
            "is_leg_xray": None,
            "message": "Unclear image",
            "xray_confidence": xray_pred,
            "leg_confidence": None,
            "fracture_prediction": None,
            "fracture_confidence": None,
            "fracture_raw_prediction": None,
            "recommendation": "Please upload a clearer X-ray image.",
            "gradcam_image": None
        })

    # 2) Leg check
    leg_input = preprocess_for_leg(image)
    leg_pred = float(leg_model.predict(leg_input, verbose=0)[0][0])
    print("leg_pred:", leg_pred)

    # mapping: {'leg_xray': 0, 'not_leg_xray': 1}
    is_leg_xray = leg_pred < 0.5
    leg_confidence = float(1 - leg_pred if is_leg_xray else leg_pred)

    if not is_leg_xray:
        return jsonify({
            "report_id": report_id,
            "generated_at": generated_at,
            "stage": "leg_check",
            "is_xray": True,
            "is_leg_xray": False,
            "message": "Valid X-ray, but not a leg X-ray",
            "xray_confidence": xray_pred,
            "leg_confidence": leg_confidence,
            "fracture_prediction": None,
            "fracture_confidence": None,
            "fracture_raw_prediction": None,
            "recommendation": "Please upload a leg X-ray image for fracture analysis.",
            "gradcam_image": None
        })

    # 3) Fracture check
    fracture_input = preprocess_for_fracture(image)
    fracture_pred = float(fracture_model.predict(fracture_input, verbose=0)[0][0])
    print("fracture_pred:", fracture_pred)

    # IMPORTANT:
    # For your current saved model, >= 0.5 behaves as fractured
    fractured = fracture_pred >= 0.5

    fracture_prediction = "Fractured" if fractured else "Not Fractured"
    fracture_confidence = float(fracture_pred if fractured else 1 - fracture_pred)

    print("fractured boolean:", fractured)
    print("fracture_prediction:", fracture_prediction)
    print("fracture_confidence:", fracture_confidence)

    recommendation = (
        "Potential fracture detected. Please consult an orthopedic specialist."
        if fractured
        else "No fracture detected by AI screening. Clinical confirmation is still recommended."
    )

    gradcam_image = None

    if fractured:
        try:
            heatmap = make_gradcam_heatmap(
                fracture_input,
                fracture_model,
                LAST_CONV_LAYER_NAME,
                class_index=1
            )

            filename = f"{uuid.uuid4().hex}_gradcam.jpg"
            out_path = os.path.join(GRADCAM_FOLDER, filename)

            save_xai_box_image(image, heatmap, out_path)

            gradcam_image = f"http://127.0.0.1:5001/static/gradcam/{filename}"
        except Exception as e:
            print("Grad-CAM generation error:", str(e))
            gradcam_image = None

    return jsonify({
        "report_id": report_id,
        "generated_at": generated_at,
        "stage": "fracture_check",
        "is_xray": True,
        "is_leg_xray": True,
        "message": "Valid leg X-ray image",
        "xray_confidence": xray_pred,
        "leg_confidence": leg_confidence,
        "fracture_prediction": fracture_prediction,
        "fracture_confidence": fracture_confidence,
        "fracture_raw_prediction": fracture_pred,
        "recommendation": recommendation,
        "gradcam_image": gradcam_image
    })


if __name__ == "__main__":
    app.run(port=5001, debug=True)
