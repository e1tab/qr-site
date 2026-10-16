const form = document.getElementById("qr-form");
const input = document.getElementById("url-input");
const btn = document.getElementById("submit-btn");
const statusEl = document.getElementById("status");
const message = document.getElementById("message");
const result = document.getElementById("result");
const img = document.getElementById("qr-img");
const download = document.getElementById("download-link");

let makeQr = null;
let currentObjectUrl = null;

// Load Python once, when the page opens
async function init() {
  try {
    const pyodide = await loadPyodide();
    await pyodide.loadPackage(["micropip", "pillow"]);
    await pyodide.pyimport("micropip").install("qrcode");

    const code = await (await fetch("qr.py")).text();
    pyodide.runPython(code);
    makeQr = pyodide.globals.get("make_qr_png");

    statusEl.textContent = "Ready.";
    btn.disabled = false;
  } catch (err) {
    statusEl.textContent = "";
    message.textContent = "Could not load Python. Refresh the page.";
    console.error(err);
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  message.textContent = "";
  result.hidden = true;

  try {
    const proxy = makeQr(input.value.trim());
    const bytes = proxy.toJs();
    proxy.destroy();

    const blob = new Blob([bytes], { type: "image/png" });
    if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = URL.createObjectURL(blob);

    img.src = currentObjectUrl;
    download.href = currentObjectUrl;
    result.hidden = false;
  } catch (err) {
    // Python errors come with a long traceback; show only the last line
    const last = String(err.message).trim().split("\n").pop();
    message.textContent = last.replace(/^ValueError:\s*/, "");
  }
});

init();