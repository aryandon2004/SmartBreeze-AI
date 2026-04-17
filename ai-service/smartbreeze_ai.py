from ultralytics import YOLO
import requests
import cv2

# Load pretrained YOLO model
model = YOLO("yolov8n.pt")

# Backend API
API_URL = "http://localhost:5002/api/control/occupancy"

# Open webcam
cap = cv2.VideoCapture(0)

last_sent = -1

while True:

    ret, frame = cap.read()
    if not ret:
        break

    results = model(frame)[0]

    person_count = 0

    for box in results.boxes:
        cls = int(box.cls[0])

        # Class 0 = person in COCO dataset
        if cls == 0:
            person_count += 1

            x1, y1, x2, y2 = map(int, box.xyxy[0])
            cv2.rectangle(frame,(x1,y1),(x2,y2),(0,255,0),2)

    # Send occupancy to backend only if changed
    if person_count != last_sent:
        try:
            requests.post(API_URL, json={"occupancy": person_count})
            print(f"Occupancy sent: {person_count}")
            last_sent = person_count
        except:
            print("Backend not reachable")

    cv2.putText(frame,f"People: {person_count}",(20,40),
                cv2.FONT_HERSHEY_SIMPLEX,1,(0,255,0),2)

    cv2.imshow("SmartBreeze AI", frame)

    if cv2.waitKey(1) == 27:
        break

cap.release()
cv2.destroyAllWindows()