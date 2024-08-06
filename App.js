import React, { useState } from "react";
import Cropper from "react-easy-crop";
import "./App.css"; // Import the CSS file

// Utility function to get the cropped image as a blob
const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await new Promise((resolve) => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => resolve(img);
  });

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/jpeg");
  });
};

// Utility function to convert blob to base64
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const App = () => {
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [croppedImageBase64, setCroppedImageBase64] = useState(null);
  console.log(croppedImageBase64)

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const imageFile = e.target.files[0];
      setImage(URL.createObjectURL(imageFile));
      setCroppedImage(null); // Reset cropped image on new upload
      setCroppedImageBase64(null); // Reset base64 image on new upload
    }
  };

  const handleSave = async () => {
    try {
        const croppedImageBlob = await getCroppedImg(image, croppedAreaPixels);
        const croppedImageUrl = URL.createObjectURL(croppedImageBlob);
        setCroppedImage(croppedImageUrl); // Set the cropped image for preview
        const base64 = await blobToBase64(croppedImageBlob);
        setCroppedImageBase64(base64); // Set the base64 string
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    if (!croppedImageBase64) {
      alert("Please crop the image before submitting.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: croppedImageBase64 }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      console.log("Image uploaded successfully:", data);
      alert("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    }
  };

  return (
    <div className="container">
      <input
        type="file"
        onChange={handleFileChange}
        accept="image/*"
        className="file-input"
      />
      {image && (
        <div className="cropper-container">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={4 / 3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            minZoom={1}
            restrictPosition={false}
            cropShape="rect"
            showGrid={false}
          />
        </div>
      )}
      <button onClick={handleSave} disabled={!image} className="save-button">
        Save
      </button>
      {croppedImage && (
        <div className="cropped-image-preview">
          <h3>Cropped Image Preview:</h3>
          <img
            src={croppedImage}
            alt="Cropped"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </div>
      )}
      <button
        onClick={handleSubmit}
        disabled={!croppedImageBase64}
        className="submit-button"
      >
        Submit
      </button>
    </div>
  );
};

export default App;
