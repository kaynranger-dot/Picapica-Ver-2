import React, { useRef, useState, useEffect, useCallback } from "react";
import fishSticker from "../assets/fish.png";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/supabase";

const PhotoPreview = ({ capturedImages: propCapturedImages, stickerImage: propStickerImage }) => {
  const { user } = useAuth();
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [bgColor, setBgColor] = useState("#ffffff");
  const [stickerImage, setStickerImage] = useState(propStickerImage || null);
  const [capturedImages, setCapturedImages] = useState(propCapturedImages || []);
  const [currentImageData, setCurrentImageData] = useState(null);
  const [saving, setSaving] = useState(false);

  const layout = location.state?.layout || "3x2";
  const sessionId = location.state?.sessionId;
  const stateCapturedImages = location.state?.capturedImages;

  // Use images from state if available, otherwise use props
  useEffect(() => {
    if (stateCapturedImages && stateCapturedImages.length > 0) {
      setCapturedImages(stateCapturedImages);
    } else if (propCapturedImages && propCapturedImages.length > 0) {
      setCapturedImages(propCapturedImages);
    }
  }, [stateCapturedImages, propCapturedImages]);

  const drawPhotoStrip = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || capturedImages.length === 0) return;
    const ctx = canvas.getContext("2d");

    const stripWidth = 1240;  // ~4.13" @ 300dpi
    const stripHeight = 1845; // ~6.15" @ 300dpi
    canvas.width = stripWidth;
    canvas.height = stripHeight;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, stripWidth, stripHeight);

    // === 3x2 Layout ===
    if (layout === "3x2") {
      const cols = 2;
      const rows = 3;
      const gapX = 30;
      const gapY = 30;
      const bottomGap = 80;

      const frameWidth = (stripWidth - (cols + 1) * gapX) / cols;
      const frameHeight =
        (stripHeight - (rows + 1) * gapY - bottomGap) / rows;

      capturedImages.slice(0, 6).forEach((src, index) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          const col = index % cols;
          const row = Math.floor(index / cols);

          const x = gapX + col * (frameWidth + gapX);
          const y = gapY + row * (frameHeight + gapY);

          const ratio = Math.min(
            frameWidth / img.width,
            frameHeight / img.height
          );
          const drawWidth = img.width * ratio;
          const drawHeight = img.height * ratio;
          const offsetX = x + (frameWidth - drawWidth) / 2;
          const offsetY = y + (frameHeight - drawHeight) / 2;

          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

          if (stickerImage && index === 5) {
            const sticker = new Image();
            sticker.src = stickerImage;
            sticker.onload = () => {
              ctx.drawImage(sticker, 0, 0, stripWidth, stripHeight - bottomGap);
            };
          }

          if (index === 5) {
            ctx.fillStyle = "#000";
            ctx.font = "30px Arial";
            ctx.textAlign = "center";
            ctx.fillText(
              "Picapica © 2025",
              stripWidth / 2,
              stripHeight - bottomGap / 2
            );
          }
        };
      });
    }

    // === 4x2 Layout ===
    else if (layout === "4x2") {
  const singleStripWidth = (stripWidth - 20) / 2; // middle gap now 20px
  const rows = 4;

  const sideGap = 10;   // even smaller left/right inside gap for bigger images
  const topGap = 10;    // even smaller top margin
  const photoGap = 1;   // minimal gap between photos
  const logoHeight = 10; // even smaller footer/logo area

  const photoStackHeight = stripHeight - topGap - logoHeight;
  const frameWidth = singleStripWidth - (2 * sideGap);
  // Increase frameHeight by adding 10px to photoStackHeight
  const frameHeight = ((photoStackHeight + 40) - (rows - 1) * photoGap) / rows;

      const imagePromises = capturedImages.slice(0, 4).map(src => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      });

      Promise.all(imagePromises).then(images => {
        for (let strip = 0; strip < 2; strip++) {
          const stripOffsetX = strip * (singleStripWidth + 20);

          images.forEach((img, index) => {
            const y = topGap + index * (frameHeight + photoGap);

            const ratio = Math.min(frameWidth / img.width, frameHeight / img.height);
            const drawWidth = img.width * ratio;
            const drawHeight = img.height * ratio;

            const offsetX = stripOffsetX + sideGap + (frameWidth - drawWidth) / 2;
            const offsetY = y + (frameHeight - drawHeight) / 2;

            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
          });

          ctx.fillStyle = "#000";
          ctx.font = "24px Arial";
          ctx.textAlign = "center";
          ctx.fillText(
            "Picapica © 2025",
            stripOffsetX + singleStripWidth / 2,
            stripHeight - logoHeight / 2
          );
        }
      });
    }

    // === 2x2 Layout (BeautyPlus style, fixed gaps) ===
    else if (layout === "2x2") {
      const cols = 2;
      const rows = 2;

  const gap = 20; // 20px gap between images (not after last row)
  const topGap = 60; // 20px gap at top + 40px top footer
  const footerHeight = 120;

  // Each image 590x732px
  const frameWidth = 590;
  const frameHeight = 732;
  const blockWidth = cols * frameWidth + (cols - 1) * gap;
  const blockHeight = rows * frameHeight + (rows - 1) * gap;

  // Center the block horizontally, and position above the footer
  const startX = (stripWidth - blockWidth) / 2;
  const startY = topGap;

  // Adjust canvas height if needed (if not already set elsewhere)
  // If you want the canvas to fit exactly, set:
  // canvas.height = blockHeight + topGap + footerHeight;

      const imagePromises = capturedImages.slice(0, 4).map(src => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      });

      Promise.all(imagePromises).then(images => {
        images.forEach((img, index) => {
          const col = index % cols;
          const row = Math.floor(index / cols);

          const x = startX + col * (frameWidth + gap);
          // Only add gap below first row, not after last row (before footer)
          const y = startY + row * frameHeight + (row > 0 ? gap : 0);

          const ratio = Math.min(frameWidth / img.width, frameHeight / img.height);
          const drawWidth = img.width * ratio;
          const drawHeight = img.height * ratio;

          const offsetX = x + (frameWidth - drawWidth) / 2;
          const offsetY = y + (frameHeight - drawHeight) / 2;

          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        });

        // Draw sticker overlay if selected
        if (stickerImage) {
          const sticker = new window.Image();
          sticker.src = stickerImage;
          sticker.onload = () => {
            ctx.drawImage(sticker, 0, 0, stripWidth, stripHeight);
          };
        }
      });
    }
  }, [capturedImages, bgColor, layout, stickerImage]);

  useEffect(() => {
    drawPhotoStrip();
  }, [drawPhotoStrip]);

  // Save updated image when background or sticker changes
  const saveUpdatedImage = async () => {
    if (!sessionId || !canvasRef.current) return;
    
    try {
      setSaving(true);
      const imageDataUrl = canvasRef.current.toDataURL('image/png');
      
      const imageData = {
        user_id: user?.id || null,
        session_id: sessionId,
        image_url: imageDataUrl,
        image_data: imageDataUrl,
        layout: layout,
        background_color: bgColor,
        sticker_applied: stickerImage,
        file_size: Math.round(imageDataUrl.length * 0.75)
      };
      
      const { data, error } = await db.saveGeneratedImage(imageData);
      if (error) {
        console.error('Error saving updated image:', error);
      } else {
        setCurrentImageData(data);
      }
      
    } catch (error) {
      console.error('Error saving updated image:', error);
    } finally {
      setSaving(false);
    }
  };
  const downloadStrip = () => {
    // Update download count if we have current image data
    if (currentImageData) {
      db.updateImageDownloadCount(currentImageData.id);
    }
    
    const link = document.createElement("a");
    link.download = "photostrip.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Auto-save when background color or sticker changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (capturedImages.length > 0) {
        saveUpdatedImage();
      }
    }, 1000); // Debounce saves by 1 second
    
    return () => clearTimeout(timeoutId);
  }, [bgColor, stickerImage]);
  return (
    <>
      <header style={{ width: '100%', background: '#fff', borderBottom: '1.5px solid #eee', marginBottom: 24, padding: '12px 0', boxShadow: '0 2px 8px #0001' }}>
        <nav style={{ display: 'flex', justifyContent: 'center', gap: 32 }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#222', fontWeight: 600, fontSize: '1.1rem' }}>Home</Link>
          <Link to="/post" style={{ textDecoration: 'none', color: '#222', fontWeight: 600, fontSize: '1.1rem' }}>Post</Link>
          <Link to="/contact" style={{ textDecoration: 'none', color: '#222', fontWeight: 600, fontSize: '1.1rem' }}>Contact</Link>
          <Link to="/login" style={{ textDecoration: 'none', color: '#222', fontWeight: 600, fontSize: '1.1rem' }}>Login</Link>
          <Link to="/register" style={{ textDecoration: 'none', color: '#222', fontWeight: 600, fontSize: '1.1rem' }}>Register</Link>
        </nav>
      </header>

      <div className="photo-preview">
        <h2>Photo Strip Preview ({layout.toUpperCase()})</h2>
        
        {saving && (
          <div className="saving-indicator">
            <p>Saving changes...</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 32 }}>
          <div>
            <canvas
              ref={canvasRef}
              style={{
                border: "1px solid #000",
                marginTop: 10,
                width: "300px",
                height: "450px",
              }}
            />
            <div className="strip-buttons" style={{ marginTop: 10 }}>
              <button onClick={downloadStrip}>📥 Download Photo Strip</button>
             <button onClick={() => navigate("/photobooth")}>🔄 Take New Photos</button>
             
             {!user ? (
               <button 
                 onClick={() => navigate("/login", { state: { from: { pathname: "/dashboard" } } })}
                 className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
               >
                 🔐 Login to Save & Share
               </button>
             ) : (
               <button onClick={() => navigate("/dashboard")}>📊 Dashboard</button>
             )}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-end', minWidth: 240 }}>
            <div className="color-options" style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 220 }}>
              <span style={{ fontWeight: 'bold', marginBottom: 4, alignSelf: 'flex-end' }}>Wallpaper:</span>
              <div style={{ display: 'flex', flexDirection: 'row', gap: 4, marginBottom: 4 }}>
                <button className="custom-btn" onClick={() => setBgColor("#ffffff")}>White</button>
                <button className="custom-btn" onClick={() => setBgColor("#ffd6d9")}>Pink</button>
                <button className="custom-btn" onClick={() => setBgColor("#d6ffe8")}>Mint</button>
                <button className="custom-btn" onClick={() => setBgColor("#f0d6ff")}>Lavender</button>
                <button className="custom-btn" onClick={() => setBgColor("#fff0d6")}>Peach</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
                <button className="custom-btn" onClick={() => setBgColor("#d6f0ff")}>Sky Blue</button>
                <button className="custom-btn" onClick={() => setBgColor("#fff6d6")}>Yellow</button>
                <button className="custom-btn" onClick={() => setBgColor("#e6d6ff")}>Lilac</button>
                <button className="custom-btn" onClick={() => setBgColor("#d6fff6")}>Aqua</button>
                <button className="custom-btn" onClick={() => setBgColor("#ffd6ff")}>Rose</button>
              </div>
            </div>
            <div className="sticker-options" style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 220, marginTop: 12 }}>
              <span style={{ fontWeight: 'bold', marginBottom: 4, alignSelf: 'flex-end' }}>Sticker:</span>
              <div style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
                <button className="custom-btn" onClick={() => setStickerImage(fishSticker)}>🐟 Fish Sticker</button>
                <button className="custom-btn" onClick={() => setStickerImage(null)}>❌ No Sticker</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PhotoPreview;
