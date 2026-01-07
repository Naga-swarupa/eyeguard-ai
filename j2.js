import { FaceLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.js";

const video = document.getElementById("webcam");
const startButton = document.getElementById("startButton");
const distanceText = document.getElementById("distance-text");
let faceLandmarker;
let isAlertActive = false;

// Initialize Google AI Model
async function initModel() {
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm");
    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: { 
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU" 
        },
        runningMode: "VIDEO"
    });
    console.log("Model Ready");
}

// Request permissions and Start
startButton.addEventListener("click", async () => {
    // Request Notification permission for "Inbuilt" feel
    if (Notification.permission !== "granted") {
        await Notification.requestPermission();
    }
    
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
    startButton.style.display = "none";
});

async function predictWebcam() {
    const results = faceLandmarker.detectForVideo(video, performance.now());
    
    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];
        const leftEye = landmarks[33];
        const rightEye = landmarks[263];
        
        // Calculate Distance
        const dist = Math.sqrt(Math.pow(leftEye.x - rightEye.x, 2) + Math.pow(leftEye.y - rightEye.y, 2));
        distanceText.innerText = `Distance: ${dist.toFixed(2)}`;

        // Trigger Alert if closer than 0.28
        if (dist > 0.28) {
            triggerAlert();
        } else {
            stopAlert();
        }
    }
    requestAnimationFrame(predictWebcam);
}

function triggerAlert() {
    if (isAlertActive) return;
    isAlertActive = true;
    
    document.body.classList.add("too-close");
    
    // Vibrate Phone
    if (navigator.vibrate) navigator.vibrate([400, 200, 400]);

    // Send System Notification (Works like an inbuilt app)
    if (Notification.permission === "granted") {
        new Notification("⚠️ TOO CLOSE", { body: "Please move the phone away!" });
    }
}

function stopAlert() {
    isAlertActive = false;
    document.body.classList.remove("too-close");
}

initModel();