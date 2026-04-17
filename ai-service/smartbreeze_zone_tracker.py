from ultralytics import YOLO
import cv2
import supervision as sv
import requests


# Load YOLO model


model = YOLO("yolov8n.pt")


# ByteTrack tracker


tracker = sv.ByteTrack()


# Backend API


API_URL = "http://localhost:5002/api/control/occupancy"


# Open camera


cap = cv2.VideoCapture(0)

last_sent = -1

while True:

    ret, frame = cap.read()
    if not ret:
        break

    
    # Draw Zones
  

    cv2.rectangle(frame,(0,0),(640,240),(255,0,0),2)
    cv2.putText(frame,"Zone A",(10,30),
                cv2.FONT_HERSHEY_SIMPLEX,0.7,(255,0,0),2)

    cv2.rectangle(frame,(0,240),(320,480),(0,255,0),2)
    cv2.putText(frame,"Zone B",(10,270),
                cv2.FONT_HERSHEY_SIMPLEX,0.7,(0,255,0),2)

    cv2.rectangle(frame,(320,240),(640,480),(0,0,255),2)
    cv2.putText(frame,"Zone C",(330,270),
                cv2.FONT_HERSHEY_SIMPLEX,0.7,(0,0,255),2)

   
    # YOLO Detection


    results = model(frame)[0]

    detections = sv.Detections.from_ultralytics(results)

    # Only keep PERSON class
    detections = detections[detections.class_id == 0]

  
    # ByteTrack tracking
   

    detections = tracker.update_with_detections(detections)

    person_count = len(detections)

   
    # Zone counters
   

    zoneA_count = 0
    zoneB_count = 0
    zoneC_count = 0

    for box in detections.xyxy:

        x1, y1, x2, y2 = map(int, box)

        cx = int((x1 + x2) / 2)
        cy = int((y1 + y2) / 2)

        # Draw person box
        cv2.rectangle(frame,(x1,y1),(x2,y2),(0,255,255),2)

        # Check zones
        if 0 < cx < 640 and 0 < cy < 240:
            zoneA_count += 1

        elif 0 < cx < 320 and 240 < cy < 480:
            zoneB_count += 1

        elif 320 < cx < 640 and 240 < cy < 480:
            zoneC_count += 1

   
    # Show counts
 

    cv2.putText(frame,f"People: {person_count}",
                (10,420),
                cv2.FONT_HERSHEY_SIMPLEX,1,(0,255,255),2)

    cv2.putText(frame,f"ZoneA: {zoneA_count}",
                (10,60),
                cv2.FONT_HERSHEY_SIMPLEX,0.7,(255,0,0),2)

    cv2.putText(frame,f"ZoneB: {zoneB_count}",
                (10,320),
                cv2.FONT_HERSHEY_SIMPLEX,0.7,(0,255,0),2)

    cv2.putText(frame,f"ZoneC: {zoneC_count}",
                (330,320),
                cv2.FONT_HERSHEY_SIMPLEX,0.7,(0,0,255),2)

  
    # Send data to backend
   

    if person_count != last_sent:

        try:
            requests.post(
                API_URL,
                json={
                    "occupancy": person_count,
                    "zoneA": zoneA_count,
                    "zoneB": zoneB_count,
                    "zoneC": zoneC_count
                }
            )

            print(
                f"Occupancy:{person_count} | "
                f"ZoneA:{zoneA_count} "
                f"ZoneB:{zoneB_count} "
                f"ZoneC:{zoneC_count}"
            )

            last_sent = person_count

        except:
            print("Backend not reachable")

    # Show camera
   

    cv2.imshow("SmartBreeze AI - Zone Detection", frame)

    if cv2.waitKey(1) == 27:
        break

cap.release()
cv2.destroyAllWindows()