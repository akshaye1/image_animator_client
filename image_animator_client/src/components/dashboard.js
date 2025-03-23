import React, { useEffect, useRef, useState } from "react";
import { Canvas, config, Image } from "fabric";
import axios from 'axios';


const ImageCanvas = () => {
  const canvasRef = useRef(null);
  const [fabricCanvas, setFabricCanvas] = useState(null);
  const [curFile, setCurFile] = useState(null);

  useEffect(() => {
    // Initialize Fabric.js canvas
    const canvas = new Canvas("fabricCanvas", {
      width: 500,
      height: 400,
      backgroundColor: "#317171",
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose(); // Cleanup on unmount
    };
  }, []);

  const handleSelectFile = (e) => {
    if (!fabricCanvas) return;

    const file = e.target.files?.[0];

    if (!file) return;

    setCurFile(file);

    if (!file.type.match(/image.*/)) {
      alert("Please upload an image file");
      return;
    }

    console.log("file===", file)
    const reader = new FileReader();
    reader.onload = (event) => {
      console.log("event", event)
      const data = event.target?.result;
      if (!data) return;

      console.log("data===", data, fabricCanvas)
      const imgElement = document.createElement("img");
      imgElement.src = data;

      imgElement.onload = () => {
        console.log("loading img element")
        const imgInstance = new Image(imgElement, {
          scaleX: Math.min((fabricCanvas.width - 20) / imgElement.width, 1),
          scaleY: Math.min((fabricCanvas.height - 20) / imgElement.height, 1),
          left: fabricCanvas.width / 2,
          top: fabricCanvas.height / 2,
          originX: "center",
          originY: "center",
        });

        console.log("loading img element 22")
        fabricCanvas.clear();
        fabricCanvas.add(imgInstance);
        fabricCanvas.setActiveObject(imgInstance);
        fabricCanvas.renderAll();
      };
    };

    reader.readAsDataURL(file);
    e.target.value = ""; // Reset file input
  };

  const handleAddBorder = async (e) => {
    
    const formData = new FormData();
    formData.append("file", curFile);

    var resFileData = null;
    await axios.post("http://127.0.0.1:5000/images/add_border", formData, {
      responseType: "blob"
    }).then(async (res) => {
        console.log("result ======= ", res);
        // const blob = await res.blob();
        resFileData = new File([res.data], "downloaded_file.png", { type: curFile.type });
    });



    

    console.log("File object:", resFileData);


    const reader = new FileReader();
    reader.onload = (event) => {
      console.log("event", event)
      const data = event.target?.result;
      if (!data) return;

      console.log("data===", data, fabricCanvas)
      const imgElement = document.createElement("img");
      imgElement.src = data;

      imgElement.onload = () => {
        console.log("loading img element")
        const imgInstance = new Image(imgElement, {
          scaleX: Math.min((fabricCanvas.width - 20) / imgElement.width, 1),
          scaleY: Math.min((fabricCanvas.height - 20) / imgElement.height, 1),
          left: fabricCanvas.width / 2,
          top: fabricCanvas.height / 2,
          originX: "center",
          originY: "center",
        });

        console.log("loading img element 22")
        fabricCanvas.clear();
        fabricCanvas.add(imgInstance);
        fabricCanvas.setActiveObject(imgInstance);
        fabricCanvas.renderAll();
      };
    };

    reader.readAsDataURL(resFileData);
    e.target.value = ""; // Reset file input
  }

  return (
    <div>
      <h2>Upload & Display Image on Canvas</h2>
      <input type="file" onChange={handleSelectFile} accept="image/*" />
      <button onClick={handleAddBorder}>
        Add border
      </button>
      <canvas id="fabricCanvas" />
    </div>
  );
};

export default ImageCanvas;
