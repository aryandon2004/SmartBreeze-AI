from flask import Flask, Response
from flask_cors import CORS
import cv2
from ultralytics import YOLO
import requests

app = Flask(__name__)
CORS(app)

model = YOLO("yolov8n.pt")
cap = cv2.VideoCapture(0)

def generate_frames():
    while True:
        success, frame = cap.read()
        if not success:
            break

        results = model(frame)

        # ✅ Count people
        people_count = 0

        # 🔥 store positions
        positions = []

        # ✅ FIX: safe check (ONLY REQUIRED CHANGE)
        if results and len(results) > 0 and results[0].boxes is not None:
            for box in results[0].boxes:
                cls = int(box.cls[0])
                if model.names[cls] == "person":
                    people_count += 1

                    # center point
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    cx = int((x1 + x2) / 2)
                    cy = int((y1 + y2) / 2)

                    positions.append({"x": cx, "y": cy})

        # ✅ FIX: always send positions
        try:
            requests.post("http://127.0.0.1:5001/api/detection", json={
                "people": people_count,
                "positions": positions if positions else []
            })
        except:
            pass

        # ✅ Draw clean boxes (UNCHANGED)
        if results and len(results) > 0 and results[0].boxes is not None:
            for box in results[0].boxes:
                cls = int(box.cls[0])
                if model.names[cls] != "person":
                    continue

                x1, y1, x2, y2 = map(int, box.xyxy[0])
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0,255,0), 2)
                cv2.putText(frame, "Person", (x1, y1-10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0,255,0), 2)

        # ✅ Show count (UNCHANGED)
        cv2.putText(frame, f"People: {people_count}",
                    (20, 40),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    1, (0,255,0), 3)

        _, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.route('/video')
def video():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)