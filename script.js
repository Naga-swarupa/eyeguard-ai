// script.js
import { FaceLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.js";

const video = document.getElementById("webcam");
const startButton = document.getElementById("startButton");
let faceLandmarker;

// 1. Initialize the AI Model
async function initModel() {
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm");
    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task` },
        runningMode: "VIDEO"
    });
}

// 2. Start Camera
startButton.addEventListener("click", async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
    startButton.style.display = "none"; // Hide button after start
});

// 3. Distance Detection Logic
async function predictWebcam() {
    const results = faceLandmarker.detectForVideo(video, performance.now());
    
    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];
        
        // Calculate 3D distance between eyes
        const leftEye = landmarks[33];
        const rightEye = landmarks[263];
        
        const dist = Math.sqrt(
            Math.pow(leftEye.x - rightEye.x, 2) +
            Math.pow(leftEye.y - rightEye.y, 2)
        );

        // Threshold: On mobile, 0.25 - 0.3 is usually "Too Close"
        // You will need to calibrate this during your 8am-10am session!
        if (dist > 0.28) {
            triggerAlert();
        }
    }
    requestAnimationFrame(predictWebcam);
}

function triggerAlert() {
    document.body.classList.add("too-close");
    if (navigator.vibrate) navigator.vibrate(200); // Buzz the phone
}

initModel();