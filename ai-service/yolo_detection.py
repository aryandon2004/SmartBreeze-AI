from ultralytics import YOLO
import cv2
from flask import Flask, Response
import requests

app = Flask(__name__)

model = YOLO("yolov8s.pt")
API_URL = "http://127.0.0.1:5002/api/control/occupancy"

cap = cv2.VideoCapture(0)

last_count = -1

def generate_frames():
    global last_count

    while True:
        success, frame = cap.read()
        if not success:
            break

        results = model.track(frame, persist=True, classes=[0], conf=0.4)

        person_count = 0

        if results[0].boxes.id is not None:
            ids = results[0].boxes.id.cpu()
            person_count = len(ids)

        # send to backend
        if person_count != last_count:
            try:
                requests.post(API_URL, json={"count": person_count})
                last_count = person_count
            except:
                pass

        annotated = results[0].plot()

        _, buffer = cv2.imencode(".jpg", annotated)
        frame = buffer.tobytes()

        yield (b"--frame\r\n"
               b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n")

@app.route("/video_feed")
def video_feed():
    return Response(generate_frames(),
                    mimetype="multipart/x-mixed-replace; boundary=frame")

if __name__ == "__main__":
    print("🔥 YOLO Streaming Server Running at 5003")
    app.run(host="0.0.0.0", port=5003)