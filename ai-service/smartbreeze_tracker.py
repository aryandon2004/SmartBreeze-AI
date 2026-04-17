from ultralytics import YOLO
import cv2
import requests
import supervision as sv

# Load YOLO model
model = YOLO("yolov8n.pt")

# ByteTrack tracker
tracker = sv.ByteTrack()

# Backend API
API_URL = "http://localhost:5002/api/control/occupancy"

cap = cv2.VideoCapture(0)

last_sent = -1

while True:

    ret, frame = cap.read()
    if not ret:
        break

    results = model(frame)[0]

    detections = sv.Detections.from_ultralytics(results)

    # Filter only PERSON class
    detections = detections[detections.class_id == 0]

    # Track people
    detections = tracker.update_with_detections(detections)

    person_count = len(detections)

    # Draw boxes
    for xyxy in detections.xyxy:
        x1, y1, x2, y2 = map(int, xyxy)
        cv2.rectangle(frame,(x1,y1),(x2,y2),(0,255,0),2)

    cv2.putText(frame,
                f"People: {person_count}",
                (20,40),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0,255,0),
                2)

    # Send occupancy to backend
    if person_count != last_sent:
        try:
            requests.post(API_URL, json={"occupancy": person_count})
            print("Occupancy sent:", person_count)
            last_sent = person_count
        except:
            print("Backend not reachable")

    cv2.imshow("SmartBreeze AI Tracking", frame)

    if cv2.waitKey(1) == 27:
        break

cap.release()
cv2.destroyAllWindows()