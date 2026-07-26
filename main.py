from fastapi import FastAPI, Request, UploadFile, File
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from ultralytics import YOLO
import shutil
import os
import uuid
import cv2

app = FastAPI()
model = YOLO("yolov8s.pt")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "static", "uploads")
RESULTS_DIR = os.path.join(BASE_DIR, "static", "results")

try:
    os.makedirs(UPLOAD_DIR, exist_ok=True)
except FileExistsError:
    pass

try:
    os.makedirs(RESULTS_DIR, exist_ok=True)
except FileExistsError:
    pass

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

model = YOLO("yolov8n.pt")


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html"
    )


@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    results = model(filepath)

    detections = []
    result_filename = None

    for r in results:
        for box in r.boxes:
            label = model.names[int(box.cls[0])]
            confidence = round(float(box.conf[0]) * 100)
            detections.append({"label": label, "confidence": confidence})

        annotated = r.plot()

        result_filename = f"result_{uuid.uuid4().hex}.jpg"
        result_path = os.path.join(RESULTS_DIR, result_filename)

        print(f"Attempting to write to: {result_path}")
        success = cv2.imwrite(result_path, annotated)
        print(f"cv2.imwrite success: {success}")

        if not success:
            print(f"FAILED TO WRITE: {result_path}")
            return JSONResponse(
                status_code=500,
                content={"error": "Failed to save annotated image"}
            )

    return JSONResponse({
        "image_url": f"/static/results/{result_filename}",
        "objects": detections
    })


@app.get("/result", response_class=HTMLResponse)
async def result_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="result.html"
    )