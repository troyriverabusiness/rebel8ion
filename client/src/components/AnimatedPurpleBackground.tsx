import { useEffect, useRef } from "react";

interface Blob {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  opacity: number;
  hue: number;
  speed: number;
}

export default function AnimatedPurpleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobsRef = useRef<Blob[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize blobs
    const initBlobs = () => {
      const blobs: Blob[] = [
        {
          x: canvas.width * 0.25,
          y: canvas.height * 0.3,
          targetX: canvas.width * 0.25,
          targetY: canvas.height * 0.3,
          size: Math.min(canvas.width, canvas.height) * 0.5,
          opacity: 0.18,
          hue: 270, // Purple
          speed: 0.0008,
        },
        {
          x: canvas.width * 0.75,
          y: canvas.height * 0.2,
          targetX: canvas.width * 0.75,
          targetY: canvas.height * 0.2,
          size: Math.min(canvas.width, canvas.height) * 0.45,
          opacity: 0.14,
          hue: 280, // Purple-violet
          speed: 0.001,
        },
        {
          x: canvas.width * 0.6,
          y: canvas.height * 0.75,
          targetX: canvas.width * 0.6,
          targetY: canvas.height * 0.75,
          size: Math.min(canvas.width, canvas.height) * 0.4,
          opacity: 0.12,
          hue: 265, // Deep purple
          speed: 0.0012,
        },
        {
          x: canvas.width * 0.15,
          y: canvas.height * 0.8,
          targetX: canvas.width * 0.15,
          targetY: canvas.height * 0.8,
          size: Math.min(canvas.width, canvas.height) * 0.35,
          opacity: 0.1,
          hue: 285, // Violet
          speed: 0.0009,
        },
      ];
      blobsRef.current = blobs;
    };
    initBlobs();

    // Animation loop
    let time = 0;
    const animate = () => {
      time += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      blobsRef.current.forEach((blob, index) => {
        // Slow organic movement using sine waves
        const offsetX = Math.sin(time * blob.speed + index * 1.5) * canvas.width * 0.08;
        const offsetY = Math.cos(time * blob.speed * 0.8 + index * 2) * canvas.height * 0.06;
        
        // Smooth interpolation toward target
        blob.x += (blob.targetX + offsetX - blob.x) * 0.01;
        blob.y += (blob.targetY + offsetY - blob.y) * 0.01;

        // Pulsing size
        const pulseSize = blob.size + Math.sin(time * blob.speed * 2 + index) * blob.size * 0.05;

        // Pulsing opacity
        const pulseOpacity = blob.opacity + Math.sin(time * blob.speed * 1.5 + index * 0.5) * 0.03;

        // Draw the blob with radial gradient
        const gradient = ctx.createRadialGradient(
          blob.x,
          blob.y,
          0,
          blob.x,
          blob.y,
          pulseSize
        );

        // OKLCH-inspired purple colors
        const saturation = 70 + Math.sin(time * blob.speed + index) * 10;
        const lightness = 45 + Math.sin(time * blob.speed * 0.5 + index) * 5;
        
        gradient.addColorStop(0, `hsla(${blob.hue}, ${saturation}%, ${lightness}%, ${pulseOpacity})`);
        gradient.addColorStop(0.4, `hsla(${blob.hue}, ${saturation - 10}%, ${lightness - 5}%, ${pulseOpacity * 0.6})`);
        gradient.addColorStop(0.7, `hsla(${blob.hue}, ${saturation - 20}%, ${lightness - 10}%, ${pulseOpacity * 0.3})`);
        gradient.addColorStop(1, `hsla(${blob.hue}, ${saturation - 30}%, ${lightness - 15}%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <>
      {/* Animated purple blobs */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{ filter: "blur(80px)" }}
      />
      {/* Subtle grid overlay */}
      <div className="fixed inset-0 z-[2] bg-[linear-gradient(rgba(168,85,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
    </>
  );
}
