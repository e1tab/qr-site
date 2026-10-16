import io
from urllib.parse import urlparse

import qrcode
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

app = Flask(__name__)

# Only these websites may call your API. Change to your real site after deploying.
CORS(app, origins=["http://127.0.0.1:5500", "http://localhost:5500"])

# Max 30 requests per minute per visitor, to stop spam/abuse.
limiter = Limiter(get_remote_address, app=app, default_limits=["30 per minute"])

MAX_LEN = 2000


@app.route("/api/qr", methods=["POST"])
def make_qr():
    # 1. Read the JSON the frontend sent: {"url": "https://..."}
    data = request.get_json(silent=True) or {}
    url = (data.get("url") or "").strip()

    # 2. Validate: not empty, not too long
    if not url:
        return jsonify(error="Please enter a link."), 400
    if len(url) > MAX_LEN:
        return jsonify(error="Link is too long."), 400

    # 3. Validate: must be a real http/https link
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        return jsonify(error="Enter a valid link starting with http:// or https://"), 400

    # 4. Build the QR code
    qr = qrcode.QRCode(
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,  # pixels per square
        border=4,     # white margin (4 is the standard minimum)
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    # 5. Save the PNG in memory (no file on disk, nothing stored)
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    # 6. Send it back
    return send_file(buffer, mimetype="image/png")


# Friendly JSON message when someone hits the rate limit
@app.errorhandler(429)
def too_many(e):
    return jsonify(error="Too many requests. Wait a minute and try again."), 429


if __name__ == "__main__":
    app.run(debug=True)