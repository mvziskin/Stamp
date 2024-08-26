// DOM Elements
const startCaptureBtn = document.getElementById('startCapture');
const stopCaptureBtn = document.getElementById('stopCapture');
const switchCameraBtn = document.getElementById('switchCamera');
const takePhotoBtn = document.getElementById('takePhoto');
const zoomBtns = document.querySelectorAll('[id^="zoom"]');
const processMediaBtn = document.getElementById('processMedia');
const saveMediaBtn = document.getElementById('saveMedia');
const loadingIndicator = document.getElementById('loadingIndicator');

let stream;
let currentZoom = 1;

// Start video capture
startCaptureBtn.addEventListener('click', async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoElement = document.createElement('video');
        videoElement.srcObject = stream;
        videoElement.play();
        document.body.appendChild(videoElement);
    } catch (err) {
        console.error('Error accessing camera:', err);
    }
});

// Stop video capture
stopCaptureBtn.addEventListener('click', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        const videoElement = document.querySelector('video');
        if (videoElement) videoElement.remove();
    }
});

// Switch camera (if multiple cameras are available)
switchCameraBtn.addEventListener('click', async () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        const currentFacingMode = stream.getVideoTracks()[0].getSettings().facingMode;
        const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
        
        try {
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: newFacingMode } 
            });
            const videoElement = document.querySelector('video');
            if (videoElement) {
                videoElement.srcObject = stream;
                videoElement.play();
            }
        } catch (err) {
            console.error('Error switching camera:', err);
        }
    }
});

// Take photo
takePhotoBtn.addEventListener('click', () => {
    if (stream) {
        const videoElement = document.querySelector('video');
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        canvas.getContext('2d').drawImage(videoElement, 0, 0);
        const img = document.createElement('img');
        img.src = canvas.toDataURL('image/png');
        document.body.appendChild(img);
    }
});

// Zoom functionality
zoomBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        currentZoom = parseFloat(btn.textContent);
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            videoTrack.applyConstraints({ advanced: [{ zoom: currentZoom }] });
        }
    });
});

// Process media (placeholder function)
processMediaBtn.addEventListener('click', () => {
    loadingIndicator.style.display = 'block';
    // Simulating processing time
    setTimeout(() => {
        loadingIndicator.style.display = 'none';
        document.getElementById('processedControls').style.display = 'block';
    }, 2000);
});

// Save processed media (placeholder function)
saveMediaBtn.addEventListener('click', () => {
    alert('Media saved successfully!');
});
