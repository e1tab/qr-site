import io
from urllib.parse import urlparse

import qrcode

MAX_LEN = 2000


def make_qr_png(url):
    url = url.strip()

    if not url:
        raise ValueError("Please enter a link.")
    if len(url) > MAX_LEN:
        raise ValueError("Link is too long.")

    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise ValueError("Enter a valid link starting with http:// or https://")

    qr = qrcode.QRCode(
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return buffer.getvalue()