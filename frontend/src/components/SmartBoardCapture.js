import React, { useEffect, useRef, useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

const SmartBoardCapture = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [model, setModel] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [status, setStatus] = useState("Loading AI model...");

  // Load AI model
  useEffect(() => {
    cocoSsd.load().then((loadedModel) => {
      setModel(loadedModel);
      setStatus("Model Loaded ✅");
    });
  }, []);

  // Start camera
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      });
  }, []);

  // Detection loop
  useEffect(() => {
    if (!model) return;

    const interval = setInterval(async () => {
      if (!videoRef.current) return;

      const predictions = await model.detect(videoRef.current);

      const personDetected = predictions.some(
        (p) => p.class === "person" && p.score > 0.6
      );

      if (personDetected) {
        setStatus("❌ Person blocking board");
      } else {
        setStatus("✅ Board clear - capturing...");
        captureImage();
      }
    }, 3000); // every 3 sec

    return () => clearInterval(interval);
  }, [model]);

  const [isSaving, setIsSaving] = useState(false);

  // Capture frame
  const captureImage = async () => {
    if (isSaving) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const ctx = canvas.getContext("2d");
    canvas.width = Math.min(800, video.videoWidth);
    canvas.height = Math.min(600, video.videoHeight);

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Blob conversion failed"));
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        },
        "image/webp",
        0.6
      );
    });

    setCapturedImage(imageData);
    setIsSaving(true);

    // Save image to backend
    try {
      const response = await fetch("/api/save-image", {
        method: "POST",
        body: JSON.stringify({ image: imageData }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        console.log("✅ Image saved to backend:", result.filename);
        setStatus("✅ Board captured and saved!");
      } else {
        console.error("❌ Failed to save image:", result.error);
        setStatus("❌ Capture failed to save");
      }
    } catch (error) {
      console.error("❌ Save error:", error);
      setStatus("❌ Error saving image");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>📸 Smart Board Capture</h2>
      <p>{status}</p>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        width="400"
        style={{ borderRadius: "10px" }}
      />

      <canvas ref={canvasRef} style={{ display: "none" }} />

      {capturedImage && (
        <div>
          <h3>Latest Clean Board</h3>
          <img src={capturedImage} width="400" />
        </div>
      )}
    </div>
  );
};

export default SmartBoardCapture;