let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let review = document.getElementById('review');
let photoStrip = document.getElementById('photoStrip');
let takePhotoBtn = document.getElementById('takePhoto');
let retakeBtn = document.getElementById('retake');
let usePhotoBtn = document.getElementById('usePhoto');
let toggleFilterBtn = document.getElementById('toggleFilter');
let downloadStripBtn = document.getElementById('downloadStrip');
let useBWFilter = false;
let photoCount = 0;
const maxPhotos = 4;
const photos = [];

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    alert('Camera access denied or not available.');
  });

toggleFilterBtn.addEventListener('click', () => {
  useBWFilter = !useBWFilter;
  video.style.filter = useBWFilter ? 'grayscale(100%)' : 'none';
});

takePhotoBtn.addEventListener('click', () => {
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  if (useBWFilter) {
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = data[i + 1] = data[i + 2] = avg;
    }
    context.putImageData(imageData, 0, 0);
  }
  review.classList.remove('hidden');
});

retakeBtn.addEventListener('click', () => {
  review.classList.add('hidden');
});

usePhotoBtn.addEventListener('click', () => {
  if (photoCount < maxPhotos) {
    let img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');
    photoStrip.appendChild(img);
    photos.push(canvas.toDataURL('image/png'));
    photoCount++;
    review.classList.add('hidden');
  }
});

downloadStripBtn.addEventListener('click', () => {
  let finalCanvas = document.createElement('canvas');
  finalCanvas.width = 320;
  finalCanvas.height = 240 * photoCount;
  let ctx = finalCanvas.getContext('2d');

  photos.forEach((src, index) => {
    let img = new Image();
    img.src = src;
    img.onload = () => {
      ctx.drawImage(img, 0, 240 * index);
      if (index === photos.length - 1) {
        let link = document.createElement('a');
        link.download = 'photostrip.png';
        link.href = finalCanvas.toDataURL();
        link.click();
      }
    };
  });
});
