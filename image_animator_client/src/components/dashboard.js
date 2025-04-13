import React, { useEffect, useRef, useState } from "react";
import { Canvas, Image } from "fabric";
import axios from "axios";

const ImageCanvas = () => {
  const canvasRef = useRef(null);
  const [fabricCanvas, setFabricCanvas] = useState(null);
  const [curFile, setCurFile] = useState(null);
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const [animationSettings, setAnimationSettings] = useState({
    borderSize: 50,
    strokeWidth: 35,
    roughness: 50,
    blurRadius: 50,
    cutoutStyle: 50,
    textureOpacity: 30,
    shadowOffsetX: 50,
    shadowOffsetY: 50,
    shadowBlur: 20,
    shadowOpacity: 50,
    movement: 50
  });
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);

  useEffect(() => {
    const canvas = new Canvas("fabricCanvas", {
      width: 600,
      height: 600,
      backgroundColor: "#f0f4f8",
    });
    setFabricCanvas(canvas);

    const canvasContainer = document.querySelector(".canvas-wrapper");

    const handleDragOver = (e) => {
      e.preventDefault();
      canvasContainer.classList.add("drag-over");
    };

    const handleDragLeave = () => {
      canvasContainer.classList.remove("drag-over");
    };

    const handleDrop = (e) => {
      e.preventDefault();
      canvasContainer.classList.remove("drag-over");
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    };

    canvasContainer.addEventListener("dragover", handleDragOver);
    canvasContainer.addEventListener("dragleave", handleDragLeave);
    canvasContainer.addEventListener("drop", handleDrop);
    console.log("drop event fired");

    return () => {
      canvas.dispose();
      canvasContainer.removeEventListener("dragover", handleDragOver);
      canvasContainer.removeEventListener("dragleave", handleDragLeave);
      canvasContainer.removeEventListener("drop", handleDrop);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (processedImageUrl) URL.revokeObjectURL(processedImageUrl);
    };
  }, [processedImageUrl]);

  const handleFile = (file) => {
    if (!fabricCanvas) return;

    setCurFile(file);
    setProcessedImageUrl(null);

    if (!file.type.match(/image.*/)) {
      alert("Please upload a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result;
      if (!data) return;

      const imgElement = document.createElement("img");
      imgElement.src = data;

      imgElement.onload = () => {
        const imgInstance = new Image(imgElement, {
          scaleX: Math.min((fabricCanvas.width - 20) / imgElement.width, 1),
          scaleY: Math.min((fabricCanvas.height - 20) / imgElement.height, 1),
          left: fabricCanvas.width / 2,
          top: fabricCanvas.height / 2,
          originX: "center",
          originY: "center",
        });

        fabricCanvas.clear();
        fabricCanvas.add(imgInstance);
        fabricCanvas.setActiveObject(imgInstance);
        fabricCanvas.renderAll();
      };
    };
    reader.readAsDataURL(file);
  };

  const handleSelectFile = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleAddBorder = async () => {
    if (!curFile) return;

    try {
      const formData = new FormData();
      formData.append("file", curFile);
      
      // Add all animation settings to the form data
      formData.append("borderSize", animationSettings.borderSize);
      formData.append("strokeWidth", animationSettings.strokeWidth);
      formData.append("roughness", animationSettings.roughness);
      formData.append("blurRadius", animationSettings.blurRadius);
      formData.append("cutoutStyle", animationSettings.cutoutStyle);
      formData.append("textureOpacity", animationSettings.textureOpacity);
      formData.append("shadowOffsetX", animationSettings.shadowOffsetX);
      formData.append("shadowOffsetY", animationSettings.shadowOffsetY);
      formData.append("shadowBlur", animationSettings.shadowBlur);
      formData.append("shadowOpacity", animationSettings.shadowOpacity);
      formData.append("movement", animationSettings.movement);

      const response = await axios.post("http://127.0.0.1:5000/images/add_border", formData, {
        responseType: "blob",
      });

      if (response.status !== 200) throw new Error("Failed to process image");

      const blobUrl = URL.createObjectURL(response.data);
      const imgElement = document.createElement("img");
      imgElement.src = blobUrl;

      imgElement.onload = () => {
        const imgInstance = new Image(imgElement, {
          scaleX: Math.min((fabricCanvas.width - 20) / imgElement.width, 1),
          scaleY: Math.min((fabricCanvas.height - 20) / imgElement.height, 1),
          left: fabricCanvas.width / 2,
          top: fabricCanvas.height / 2,
          originX: "center",
          originY: "center",
        });

        fabricCanvas.clear();
        fabricCanvas.add(imgInstance);
        fabricCanvas.setActiveObject(imgInstance);
        fabricCanvas.renderAll();

        setProcessedImageUrl(blobUrl);
      };
    } catch (error) {
      console.error("Error processing image:", error);
    }
  };

  const handleSettingChange = (settingName, value) => {
    setAnimationSettings(prev => ({
      ...prev,
      [settingName]: value
    }));
  };

  const AnimationSettingSlider = ({ name, value, label }) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <label className="text-gray-300">{label}</label>
        <span className="bg-gray-800 text-white rounded px-2 py-1 text-sm">{value}</span>
      </div>
      <div className="flex items-center">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => handleSettingChange(name, parseInt(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-tr from-white to-sky-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Image Animator</h1>
      
      <div className="w-full max-w-6xl flex flex-col justify-between md:flex-row gap-6">
        {/* Main Canvas Area */}
        <div className="">
          <div className="canvas-wrapper border-4 border-dashed border-gray-300 bg-white rounded-xl shadow-lg p-4 mb-4 relative">
            <canvas id="fabricCanvas" ref={canvasRef} className="rounded" />
            <p className="text-gray-500 text-sm mt-2 text-center">Drag & drop image or use file picker below</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-4">
            {/* Choose File */}
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-sm text-gray-700 rounded-md shadow-sm cursor-pointer hover:bg-gray-50 transition">
              📁
              <input
                type="file"
                accept="image/*"
                onChange={handleSelectFile}
                className="hidden"
              />
              Choose Image
            </label>

            {/* Toggle Settings Panel (Mobile) */}
            <button
              onClick={() => setIsSettingsPanelOpen(!isSettingsPanelOpen)}
              className="md:hidden inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition"
            >
              ⚙️ {isSettingsPanelOpen ? 'Hide Settings' : 'Show Settings'}
            </button>

            {/* Add Border */}
            <button
              onClick={handleAddBorder}
              disabled={!curFile}
              className={`inline-flex items-center gap-2 px-4 py-2 ${!curFile ? 'bg-gray-400' : 'bg-black hover:bg-gray-800'} text-white text-sm font-medium rounded-md transition`}
            >
              ✨ Add Border
            </button>

            {/* Download */}
            {processedImageUrl && (
              <a
                href={processedImageUrl}
                download="processed_image.png"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition"
              >
                ⬇️ Download
              </a>
            )}
          </div>
        </div>
        
        {/* Animation Settings Panel (Desktop) */}
        <div className={`md:w-80 md:block ${isSettingsPanelOpen ? 'block' : 'hidden'} bg-gray-900 rounded-xl shadow-lg p-6 text-white max-h-fit`}>
          <h2 className="text-xl font-bold mb-6">Animation Settings</h2>
          
          <AnimationSettingSlider name="borderSize" value={animationSettings.borderSize} label="Size" />
          <AnimationSettingSlider name="strokeWidth" value={animationSettings.strokeWidth} label="Edge thickness" />
          <AnimationSettingSlider name="roughness" value={animationSettings.roughness} label="Edge intensity" />
          <AnimationSettingSlider name="blurRadius" value={animationSettings.blurRadius} label="Edge details" />
          <AnimationSettingSlider name="cutoutStyle" value={animationSettings.cutoutStyle} label="Cutout style" />
          <AnimationSettingSlider name="textureOpacity" value={animationSettings.textureOpacity} label="Texture strength" />
          {/* <AnimationSettingSlider name="shadowOffsetX" value={animationSettings.shadowOffsetX} label="Shadow offset X" />
          <AnimationSettingSlider name="shadowOffsetY" value={animationSettings.shadowOffsetY} label="Shadow offset Y" />
          <AnimationSettingSlider name="shadowBlur" value={animationSettings.shadowBlur} label="Shadow blur" />
          <AnimationSettingSlider name="shadowOpacity" value={animationSettings.shadowOpacity} label="Shadow strength" /> */}
          {/* <AnimationSettingSlider name="movement" value={animationSettings.movement} label="Movement" /> */}
        </div>
      </div>
    </div>
  );
};

export default ImageCanvas;