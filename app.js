// DOM Elements
const startCaptureBtn = document.getElementById('startCapture');
const stopCaptureBtn = document.getElementById('stopCapture');
const switchCameraBtn = document.getElementById('switchCamera');
const takePhotoBtn = document.getElementById('takePhoto');
const zoomBtns = document.querySelectorAll('[id^="zoom"]');
const processMediaBtn = document.getElementById('processMedia');
const saveMediaBtn = document.getElementById('saveMedia');
const loadingIndicator = document.getElementById('loadingIndicator');
const cameraContainer = document.getElementById('cameraContainer');

let stream;
let mediaRecorder;
let recordedChunks = [];
let currentZoom = 1;

// Start video capture
startCaptureBtn.addEventListener('click', async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 }, audio: true });
        const videoElement = document.createElement('video');
        videoElement.srcObject = stream;
        videoElement.play();
        cameraContainer.innerHTML = ''; // Clear any existing content
        cameraContainer.appendChild(videoElement);

        // Set up MediaRecorder
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };
        mediaRecorder.start();
    } catch (err) {
        console.error('Error accessing camera:', err);
    }
});

// Stop video capture
stopCaptureBtn.addEventListener('click', () => {
    if (stream) {
        mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
        cameraContainer.innerHTML = ''; // Remove the video element
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
                video: { facingMode: newFacingMode, width: 320, height: 240 },
                audio: true
            });
            const videoElement = cameraContainer.querySelector('video');
            if (videoElement) {
                videoElement.srcObject = stream;
                videoElement.play();
            }
            // Set up new MediaRecorder
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };
            mediaRecorder.start();
        } catch (err) {
            console.error('Error switching camera:', err);
        }
    }
});

// Take photo
takePhotoBtn.addEventListener('click', () => {
    if (stream) {
        const videoElement = cameraContainer.querySelector('video');
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        canvas.getContext('2d').drawImage(videoElement, 0, 0);
        
        // Try to save to photo library
        canvas.toBlob(async (blob) => {
            try {
                const newHandle = await window.showSaveFilePicker({
                    suggestedName: 'photo.png',
                    types: [{
                        description: 'PNG Files',
                        accept: {'image/png': ['.png']},
                    }],
                });
                const writableStream = await newHandle.createWritable();
                await writableStream.write(blob);
                await writableStream.close();
                alert('Photo saved to library successfully!');
            } catch (err) {
                console.error('Error saving to library:', err);
                // Fallback: offer download
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = 'photo.png';
                link.click();
            }
        }, 'image/png');
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

// Process media (now saves video)
processMediaBtn.addEventListener('click', async () => {
    loadingIndicator.style.display = 'block';
    
    if (recordedChunks.length === 0) {
        alert('No video recorded yet!');
        loadingIndicator.style.display = 'none';
        return;
    }

    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    
    try {
        const newHandle = await window.showSaveFilePicker({
            suggestedName: 'video.webm',
            types: [{
                description: 'WebM Files',
                accept: {'video/webm': ['.webm']},
            }],
        });
        const writableStream = await newHandle.createWritable();
        await writableStream.write(blob);
        await writableStream.close();
        alert('Video saved to library successfully!');
    } catch (err) {
        console.error('Error saving to library:', err);
        // Fallback: offer download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style = 'display: none';
        a.href = url;
        a.download = 'video.webm';
        a.click();
        window.URL.revokeObjectURL(url);
    }

    loadingIndicator.style.display = 'none';
    document.getElementById('processedControls').style.display = 'block';
    recordedChunks = []; // Clear recorded chunks for next recording
});

// Save processed media button is now redundant, so we'll remove its functionality
saveMediaBtn.addEventListener('click', () => {
    alert('Media has already been saved.');
});
