// Local testing. Change this to your Render URL after deploying.
const API_URL = "http://127.0.0.1:5000/api/qr";

const form = document.getElementById("qr-form");
const input = document.getElementById("url-input");
const btn = document.getElementById("submit-btn");
const message = document.getElementById("message");
const result = document.getElementById("result");
const img = document.getElementById("qr-img");
const download = document.getElementById("download-link");

let currentObjectUrl = null;

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  message.textContent = "";
  result.hidden = true;
  btn.disabled = true;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: input.value.trim() }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Something went wrong.");
    }

    const blob = await res.blob();
    if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = URL.createObjectURL(blob);

    img.src = currentObjectUrl;
    download.href = currentObjectUrl;
    result.hidden = false;
  } catch (err) {
    message.textContent = err.message; // textContent, never innerHTML (prevents XSS)
  } finally {
    btn.disabled = false;
  }
});