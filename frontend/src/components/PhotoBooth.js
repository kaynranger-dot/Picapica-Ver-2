import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/supabase";

const PhotoBooth = ({ setCapturedImages }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [capturedImages, setImages] = useState([]);
  const [filter, setFilter] = useState("none");
  const [countdown, setCountdown] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [layout, setLayout] = useState("3x2"); // default layout
  const [currentSession, setCurrentSession] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    startCamera();
    const handleVisibilityChange = () => {
      if (!document.hidden) startCamera();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Create a new session when component mounts
  useEffect(() => {
    if (user) {
      createNewSession();
    }
  }, [user, layout]);

  const createNewSession = async () => {
    if (!user) return;
    
    try {
      const sessionData = {
        user_id: user.id,
        layout: layout,
        filter_applied: filter,
        metadata: {
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      };
      
      const { data, error } = await db.createSession(sessionData);
      if (error) {
        console.error('Error creating session:', error);
        return;
      }
      
      setCurrentSession(data);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };
  const startCamera = async () => {
    try {
      if (videoRef.current?.srcObject) return;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      videoRef.current.style.transform = "scaleX(-1)"; // mirror preview
      videoRef.current.style.objectFit = "cover";
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const startCountdown = () => {
    if (capturing) return;
    setCapturing(true);

    let photosTaken = 0;
    const newCapturedImages = [];

    // 3x2 → 6 photos, 4x2 → 4 photos, 2x2 → 4 photos
    const maxPhotos = layout === "3x2" ? 6 : 4;

    const captureSequence = () => {
      if (photosTaken >= maxPhotos) {
        setCapturing(false);
        setCapturedImages([...newCapturedImages]);
        setImages([...newCapturedImages]);
        
        // Save the photo strip to database
        await savePhotoStrip(newCapturedImages);
        
        setTimeout(() => navigate("/preview", { 
          state: { 
            layout,
            sessionId: currentSession?.session_id,
            capturedImages: newCapturedImages
          } 
        }), 200);
        return;
      }

      let timeLeft = 3;
      setCountdown(timeLeft);

      const timer = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);

        if (timeLeft === 0) {
          clearInterval(timer);
          const imageUrl = capturePhoto();
          if (imageUrl) {
            newCapturedImages.push(imageUrl);
            setImages((prev) => [...prev, imageUrl]);
          }
          photosTaken += 1;
          setTimeout(captureSequence, 500);
        }
      }, 1000);
    };

    captureSequence();
  };

  const savePhotoStrip = async (images) => {
    if (!user || !currentSession || images.length === 0) return;
    
    try {
      setSaving(true);
      
      // Create the photo strip canvas
      const stripCanvas = document.createElement('canvas');
      const stripCtx = stripCanvas.getContext('2d');
      
      // Set canvas dimensions based on layout
      const stripWidth = 1240;
      const stripHeight = 1845;
      stripCanvas.width = stripWidth;
      stripCanvas.height = stripHeight;
      
      // Fill background
      stripCtx.fillStyle = '#ffffff';
      stripCtx.fillRect(0, 0, stripWidth, stripHeight);
      
      // Draw images based on layout (simplified version)
      const imagePromises = images.map(src => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.src = src;
        });
      });
      
      const loadedImages = await Promise.all(imagePromises);
      
      // Draw images in grid layout
      if (layout === '3x2') {
        const cols = 2, rows = 3;
        const gapX = 30, gapY = 30;
        const frameWidth = (stripWidth - (cols + 1) * gapX) / cols;
        const frameHeight = (stripHeight - (rows + 1) * gapY - 80) / rows;
        
        loadedImages.slice(0, 6).forEach((img, index) => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          const x = gapX + col * (frameWidth + gapX);
          const y = gapY + row * (frameHeight + gapY);
          
          const ratio = Math.min(frameWidth / img.width, frameHeight / img.height);
          const drawWidth = img.width * ratio;
          const drawHeight = img.height * ratio;
          const offsetX = x + (frameWidth - drawWidth) / 2;
          const offsetY = y + (frameHeight - drawHeight) / 2;
          
          stripCtx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        });
      }
      
      // Add watermark
      stripCtx.fillStyle = '#000';
      stripCtx.font = '30px Arial';
      stripCtx.textAlign = 'center';
      stripCtx.fillText('Picapica © 2025', stripWidth / 2, stripHeight - 40);
      
      // Convert to data URL
      const imageDataUrl = stripCanvas.toDataURL('image/png');
      
      // Save to database
      const imageData = {
        user_id: user.id,
        session_id: currentSession.session_id,
        image_url: imageDataUrl,
        image_data: imageDataUrl,
        layout: layout,
        background_color: '#ffffff',
        sticker_applied: null,
        file_size: Math.round(imageDataUrl.length * 0.75) // Approximate file size
      };
      
      const { data, error } = await db.saveGeneratedImage(imageData);
      if (error) {
        console.error('Error saving image:', error);
      }
      
    } catch (error) {
      console.error('Error saving photo strip:', error);
    } finally {
      setSaving(false);
    }
  };
  /** Capture photo — different crop based on layout */
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");

    const isFourByTwo = layout === "4x2";
    const isTwoByTwo = layout === "2x2";

    // ✅ 3x2 → square 600×600
    // ✅ 4x2 → landscape 900×600
    // ✅ 2x2 → portrait 590×832
    let targetWidth, targetHeight;
    if (isFourByTwo) {
      targetWidth = 900;
      targetHeight = 600;
    } else if (isTwoByTwo) {
      targetWidth = 590;
      targetHeight = 832;
    } else {
      targetWidth = 600;
      targetHeight = 600;
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    if (isFourByTwo) {
      // landscape crop 3:2 ratio
      const cropWidth = videoWidth;
      const cropHeight = videoWidth * (2 / 3);
      const startX = 0;
      const startY = (videoHeight - cropHeight) / 2;

      ctx.save();
      ctx.translate(canvas.width, 0); // mirror
      ctx.scale(-1, 1);
      ctx.filter = filter;

      ctx.drawImage(
        video,
        startX,
        startY,
        cropWidth,
        cropHeight,
        0,
        0,
        targetWidth,
        targetHeight
      );

      ctx.restore();
    } else if (isTwoByTwo) {
      // portrait crop 590:832 ratio
      const targetRatio = 590 / 832;
      let cropWidth = videoWidth;
      let cropHeight = videoWidth / targetRatio;
      if (cropHeight > videoHeight) {
        cropHeight = videoHeight;
        cropWidth = videoHeight * targetRatio;
      }
      const startX = (videoWidth - cropWidth) / 2;
      const startY = (videoHeight - cropHeight) / 2;

      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.filter = filter;

      ctx.drawImage(
        video,
        startX,
        startY,
        cropWidth,
        cropHeight,
        0,
        0,
        targetWidth,
        targetHeight
      );

      ctx.restore();
    } else {
      // square crop for 3x2
      const size = Math.min(videoWidth, videoHeight);
      const startX = (videoWidth - size) / 2;
      const startY = (videoHeight - size) / 2;

      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.filter = filter;

      ctx.drawImage(video, startX, startY, size, size, 0, 0, targetWidth, targetHeight);

      ctx.restore();
    }

    ctx.filter = "none";

    return canvas.toDataURL("image/png");
  };

  return (
    <div className="photo-booth">
      {countdown !== null && <h2 className="countdown animate">{countdown}</h2>}
      
      {saving && (
        <div className="saving-indicator">
          <p>Saving your photo strip...</p>
        </div>
      )}

      <div className="photo-container" style={{ display: "flex", gap: "30px" }}>
        {/* Camera preview */}
        <div className="camera-container">
          <video
            ref={videoRef}
            autoPlay
            className="video-feed"
            style={{
              width: layout === "4x2" ? "450px" : "600px",
              height: layout === "4x2" ? "300px" : "600px",
              objectFit: "cover",
              filter: filter,
            }}
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Side previews */}
        <div
          className="preview-side"
          style={{
            display: "grid",
            gridTemplateColumns: layout === "4x2" ? "repeat(2, 180px)" : "repeat(2, 100px)",
            gridTemplateRows:
              layout === "3x2"
                ? "repeat(3, 100px)"
                : "repeat(2, 100px)", // 4x2 and 2x2 both 2 rows
            gap: layout === "4x2" ? "18px" : "15px",
          }}
        >
          {capturedImages.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Captured ${i + 1}`}
              style={{
                width: layout === "4x2" ? "180px" : "100px",
                height: layout === "4x2" ? "160px" : "100px",
                objectFit: "cover",
                borderRadius: "5px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Layout selection */}
      <div className="layout-options" style={{ marginTop: "15px" }}>
        <button
          onClick={() => setLayout("3x2")}
          style={{
            marginRight: 10,
            backgroundColor: layout === "3x2" ? "#000" : "#fff",
            color: layout === "3x2" ? "#fff" : "#000",
            border: "2px solid #000",
            padding: "5px 10px",
            cursor: "pointer",
          }}
        >
          3×2 Layout
        </button>
        <button
          onClick={() => setLayout("4x2")}
          style={{
            marginRight: 10,
            backgroundColor: layout === "4x2" ? "#000" : "#fff",
            color: layout === "4x2" ? "#fff" : "#000",
            border: "2px solid #000",
            padding: "5px 10px",
            cursor: "pointer",
          }}
        >
          4×2 Layout
        </button>
        <button
          onClick={() => setLayout("2x2")}
          style={{
            backgroundColor: layout === "2x2" ? "#000" : "#fff",
            color: layout === "2x2" ? "#fff" : "#000",
            border: "2px solid #000",
            padding: "5px 10px",
            cursor: "pointer",
          }}
        >
          2×2 Layout
        </button>
      </div>

      {/* Capture button */}
      <div className="controls" style={{ marginTop: "20px" }}>
        <button onClick={startCountdown} disabled={capturing}>
          {capturing ? "Capturing..." : saving ? "Saving..." : "Start Capture :)"}
        </button>
      </div>

      {/* Filters */}
      <div className="filters" style={{ marginTop: "15px" }}>
        <button onClick={() => setFilter("none")}>No Filter</button>
        <button onClick={() => setFilter("grayscale(100%)")}>Grayscale</button>
        <button onClick={() => setFilter("sepia(100%)")}>Sepia</button>
        <button
          onClick={() =>
            setFilter(
              "grayscale(100%) contrast(120%) brightness(110%) sepia(30%) hue-rotate(10deg) blur(0.4px)"
            )
          }
        >
          Vintage
        </button>
        <button
          onClick={() =>
            setFilter("brightness(130%) contrast(105%) saturate(80%) blur(0.3px)")
          }
        >
          Soft
        </button>
      </div>
    </div>
  );
};

export default PhotoBooth;

