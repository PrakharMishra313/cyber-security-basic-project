import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";

// 🟩 Matrix Rain Animation - Fullscreen Background
(function initMatrix() {
  const canvas = document.getElementById("matrix");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>/\\ｦｧｨｩｪｫｬｭｮｯ".split("");
  const fontSize = 16;
  let drops = Array(Math.floor(canvas.width / fontSize)).fill(1);

  function syncDropsToCanvas() {
    const n = Math.floor(canvas.width / fontSize);
    if (n === drops.length) return;
    drops = Array(n).fill(1);
  }

  function draw() {
    ctx.fillStyle = "rgba(2, 6, 23, 0.08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#00ff9f";
    ctx.font = `${fontSize}px 'Courier New', monospace`;
    ctx.globalAlpha = 0.9;

    drops.forEach((y, i) => {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(char, i * fontSize, y * fontSize);
      
      if (y * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    });
    
    ctx.globalAlpha = 1;
  }

  function animate() {
    draw();
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    syncDropsToCanvas();
  });
})();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
