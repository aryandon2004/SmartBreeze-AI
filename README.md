# 🌿 SmartBreeze AI – Intelligent AC Automation System

SmartBreeze AI is an AI-powered smart climate control system that automatically manages air conditioning based on real-time human presence using computer vision.

---

## 🚀 Features

- 👁️ Real-time People Detection using YOLOv8
- ❄️ Smart AC Automation (AUTO & MANUAL modes)
- 📊 Heatmap Analytics for movement tracking
- 🕒 Schedule Control for meetings
- 🌡️ AI-based Temperature Simulation
- 📡 Live Dashboard with React UI

---

## 🧠 How It Works

1. Webcam captures live video  
2. YOLOv8 detects people in the room  
3. Python backend sends data to Node.js server  
4. Backend decides AC state (ON/OFF)  
5. React dashboard displays real-time updates  

---

## 🏗️ System Architecture

```
Camera → YOLOv8 → Flask API → Node.js Backend → React Frontend
```

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Axios

### Backend
- Node.js
- Express.js

### AI / ML
- Python
- OpenCV
- YOLOv8 (Ultralytics)

---

## 📂 Project Structure

```
SmartBreeze-AI/
├── backend/              # Node.js/Express API server
├── frontend/             # React dashboard UI
├── ai-service/           # Flask API for AI detection
├── .gitignore
├── README.md
└── requirements.txt
```

---

## ▶️ How to Run

### 1️⃣ Start Backend

```bash
cd backend
npm install
npm start
```

### 2️⃣ Start Frontend

```bash
cd frontend
npm install
npm start
```

### 3️⃣ Start AI Detection

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install flask flask-cors opencv-python ultralytics requests pymongo python-dotenv

# Run AI service
cd ai-service
python app.py
```

---

## ⚠️ Note

Dataset and model files are not included due to large size. You can download YOLO model manually:
- [YOLOv8 - Ultralytics](https://github.com/ultralytics/ultralytics)

---


## 🔮 Future Improvements

- IoT-based real AC control
- Multi-room support
- Cloud deployment
- Advanced ML temperature prediction
- Mobile app integration

---

## 🎯 Impact

This system helps in:

- ⚡ Reducing energy consumption
- 🤖 Automating climate control
- 📊 Improving smart building efficiency

---

## ⭐ If you like this project

Give it a star ⭐ on GitHub!

---

**Last Updated:** April 2026  
**Status:** Active Development
