const video = document.querySelector("video");
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const takePhotoBtn = document.getElementById("capture");
const toggleFilterBtn = document.getElementById("toggleFilter");
const stripContainer = document.getElementById("strip");
const downloadBtn = document.getElementById("download");
const restartBtn = document.getElementById("restart");
const countdown = document.getElementById("countdown");

let photosTaken = 0;
let photoStrip = [];
let isBlackAndWhite = false;

// Access the user's webcam
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    alert("Camera access denied or not available. Please allow camera access in your browser settings.");
    console.error(err);
  });

// Start countdown
function startCountdown(callback) {
  let timeLeft = 3;
  countdown.innerText = timeLeft;
  const timer = setInterval(() => {
    timeLeft--;
    if (timeLeft > 0) {
      countdown.innerText = timeLeft;
    } else {
      clearInterval(timer);
      countdown.innerText = "";
      callback();
    }
  }, 1000);
}

// Capture photo from video
function capturePhoto() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  if (isBlackAndWhite) {
    ctx.filter = "grayscale(100%)";
  } else {
    ctx.filter = "none";
  }

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  showReviewOptions();
}

// Show "Use" and "Retake" options
function showReviewOptions() {
  takePhotoBtn.style.display = "none";

  const useBtn = document.createElement("button");
  useBtn.textContent = "Use";
  useBtn.className = "action-btn";
  useBtn.onclick = () => {
    addToStrip(canvas.toDataURL("image/png"));
    resetButtons();
  };

  const retakeBtn = document.createElement("button");
  retakeBtn.textContent = "Retake";
  retakeBtn.className = "action-btn";
  retakeBtn.onclick = () => {
    resetButtons();
  };

  document.querySelector(".controls").appendChild(useBtn);
  document.querySelector(".controls").appendChild(retakeBtn);
}

// Reset to initial photo capture state
function resetButtons() {
  document.querySelectorAll(".action-btn").forEach(btn => btn.remove());
  takePhotoBtn.style.display = "inline-block";
}

// Add photo to strip
function addToStrip(dataURL) {
  if (photosTaken >= 4) return;

  const img = document.createElement("img");
  img.src = dataURL;
  img.className = "strip-photo";
  stripContainer.appendChild(img);
  photoStrip.push(dataURL);
  photosTaken++;

  if (photosTaken === 4) {
    downloadBtn.style.display = "inline-block";
  }
}

// Download full strip
function downloadStrip() {
  const stripCanvas = document.createElement("canvas");
  const photoWidth = 300;
  const photoHeight = 225;
  stripCanvas.width = photoWidth;
  stripCanvas.height = photoHeight * 4 + 50;

  const stripCtx = stripCanvas.getContext("2d");

  photoStrip.forEach((dataURL, i) => {
    const img = new Image();
    img.src = dataURL;
    img.onload = () => {
      stripCtx.drawImage(img, 0, i * photoHeight, photoWidth, photoHeight);
      if (i === 3) {
        // Add watermark text
        stripCtx.font = "20px 'Great Vibes', cursive";
        stripCtx.fillStyle = "#800020"; // Burgundy
        stripCtx.fillText("Sabby's cam", 80, stripCanvas.height - 15);

        const finalDataURL = stripCanvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = finalDataURL;
        link.download = "sabbys_strip.png";
        link.click();
      }
    };
  });
}

// Reset everything
function restartPhotobooth() {
  photosTaken = 0;
  photoStrip = [];
  stripContainer.innerHTML = "";
  downloadBtn.style.display = "none";
  resetButtons();
}

// Toggle B&W Filter
toggleFilterBtn.addEventListener("click", () => {
  isBlackAndWhite = !isBlackAndWhite;
  toggleFilterBtn.textContent = isBlackAndWhite ? "Black & White: ON" : "Black & White: OFF";
});

takePhotoBtn.addEventListener("click", () => {
  startCountdown(capturePhoto);
});

downloadBtn.addEventListener("click", downloadStrip);
restartBtn.addEventListener("click", restartPhotobooth);
