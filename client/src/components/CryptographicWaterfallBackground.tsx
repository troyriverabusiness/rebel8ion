import { useEffect, useRef } from "react";
import * as THREE from "three";

const WATERFALL_SETTINGS = {
  columns: 72,
  pointsPerColumn: 64,
  xRange: 34,
  zRange: 16,
  minY: -14,
  maxY: 14,
  minSpeed: 0.6,
  maxSpeed: 1.25,
  wobble: 0.045,
  pointSize: 5,
  opacity: 0.4,
  centerSoftness: 11,
  centerDim: 0.32,
  centerBlur: 0.24,
  centerDeadZone: 6.2,
  centerRejectChance: 0.55,
  dotCount: 1400,
  dotSize: 0.06,
} as const;

const HEX_CHARS = "0123456789ABCDEF";

const createHexAtlasTexture = () => {
  const cellSize = 64;
  const gridSize = 4;
  const canvas = document.createElement("canvas");
  canvas.width = cellSize * gridSize;
  canvas.height = cellSize * gridSize;

  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "#ffffff";
  context.font = "700 44px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace";

  for (let i = 0; i < HEX_CHARS.length; i += 1) {
    const col = i % gridSize;
    const row = Math.floor(i / gridSize);
    const x = col * cellSize + cellSize / 2;
    const y = row * cellSize + cellSize / 2;
    context.fillText(HEX_CHARS[i], x, y + 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
};

interface CryptographicWaterfallBackgroundProps {
  hideBackground?: boolean;
  className?: string;
}

function CryptographicWaterfallBackground({ 
  hideBackground = false,
  className = "",
}: CryptographicWaterfallBackgroundProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 2, 22);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    const atlasTexture = createHexAtlasTexture();
    if (!atlasTexture) {
      return () => {};
    }

    const { columns, pointsPerColumn } = WATERFALL_SETTINGS;
    const totalPoints = columns * pointsPerColumn;
    const positions = new Float32Array(totalPoints * 3);
    const colors = new Float32Array(totalPoints * 3);
    const intensities = new Float32Array(totalPoints);
    const glyphs = new Float32Array(totalPoints);
    const baseX = new Float32Array(totalPoints);
    const baseZ = new Float32Array(totalPoints);
    const speeds = new Float32Array(totalPoints);
    const phases = new Float32Array(totalPoints);
    const yOffsets = new Float32Array(totalPoints);
    const glyphChangeAt = new Float32Array(totalPoints);

    const basePurple = new THREE.Color(0x7c3aed);
    const accentGray = new THREE.Color(0xa3a7ad);
    const ySpan = WATERFALL_SETTINGS.maxY - WATERFALL_SETTINGS.minY;
    const lineSpacing = ySpan / WATERFALL_SETTINGS.pointsPerColumn;

    let pointIndex = 0;
    const halfRange = WATERFALL_SETTINGS.xRange / 2;

    for (let column = 0; column < columns; column += 1) {
      let columnX = 0;
      for (let attempt = 0; attempt < 8; attempt += 1) {
        const uniformX = (Math.random() - 0.5) * WATERFALL_SETTINGS.xRange;
        const biasedX =
          Math.sign(uniformX) *
          Math.pow(Math.abs(uniformX) / halfRange, 0.42) *
          halfRange;
        columnX = uniformX * 0.2 + biasedX * 0.8;
        if (
          Math.abs(columnX) > WATERFALL_SETTINGS.centerDeadZone ||
          Math.random() > WATERFALL_SETTINGS.centerRejectChance
        ) {
          break;
        }
      }
      const columnZ =
        -Math.random() * WATERFALL_SETTINGS.zRange +
        Math.cos(column * 0.4) * 1.0;
      const columnSpeed =
        WATERFALL_SETTINGS.minSpeed +
        Math.random() * (WATERFALL_SETTINGS.maxSpeed - WATERFALL_SETTINGS.minSpeed);
      const columnPhase = (column / columns) * ySpan + Math.random() * lineSpacing * 1.5;

      for (let point = 0; point < pointsPerColumn; point += 1) {
        const offset = point * lineSpacing + columnPhase;
        const y = WATERFALL_SETTINGS.maxY - (offset % ySpan);

        baseX[pointIndex] = columnX;
        baseZ[pointIndex] = columnZ;
        speeds[pointIndex] = columnSpeed;
        phases[pointIndex] = Math.random() * Math.PI * 2;
        yOffsets[pointIndex] = offset;

        positions[pointIndex * 3] = columnX;
        positions[pointIndex * 3 + 1] = y;
        positions[pointIndex * 3 + 2] = columnZ;

        const usePurple = Math.random() < 0.08;
        const mix = Math.random() * 0.5 + 0.25;
        const color = usePurple
          ? basePurple.clone().lerp(accentGray, 0.4)
          : accentGray.clone().lerp(basePurple, mix * 0.08);
        colors[pointIndex * 3] = color.r;
        colors[pointIndex * 3 + 1] = color.g;
        colors[pointIndex * 3 + 2] = color.b;

        const centerFactor = THREE.MathUtils.clamp(
          Math.abs(columnX) / WATERFALL_SETTINGS.centerSoftness,
          0,
          1
        );
        intensities[pointIndex] = 0.65 + centerFactor * 0.35;
        glyphs[pointIndex] = Math.floor(Math.random() * HEX_CHARS.length);
        glyphChangeAt[pointIndex] = Math.random() * 3 + 0.6;

        pointIndex += 1;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("intensity", new THREE.BufferAttribute(intensities, 1));
    geometry.setAttribute("glyph", new THREE.BufferAttribute(glyphs, 1));

    const dotPositions = new Float32Array(WATERFALL_SETTINGS.dotCount * 3);
    const dotColors = new Float32Array(WATERFALL_SETTINGS.dotCount * 3);
    for (let i = 0; i < WATERFALL_SETTINGS.dotCount; i += 1) {
      const x = (Math.random() - 0.5) * WATERFALL_SETTINGS.xRange * 1.05;
      const y = WATERFALL_SETTINGS.minY + Math.random() * ySpan;
      const z = -Math.random() * WATERFALL_SETTINGS.zRange * 1.1;
      dotPositions[i * 3] = x;
      dotPositions[i * 3 + 1] = y;
      dotPositions[i * 3 + 2] = z;

      const centerFactor = THREE.MathUtils.clamp(
        Math.abs(x) / WATERFALL_SETTINGS.centerSoftness,
        0,
        1
      );
      const usePurple = Math.random() < 0.06;
      const dotColor = usePurple
        ? basePurple.clone().lerp(accentGray, 0.55)
        : accentGray.clone().lerp(basePurple, 0.05);
      const intensity = 0.25 + centerFactor * 0.35;
      dotColors[i * 3] = dotColor.r * intensity;
      dotColors[i * 3 + 1] = dotColor.g * intensity;
      dotColors[i * 3 + 2] = dotColor.b * intensity;
    }

    const dotGeometry = new THREE.BufferGeometry();
    dotGeometry.setAttribute("position", new THREE.BufferAttribute(dotPositions, 3));
    dotGeometry.setAttribute("color", new THREE.BufferAttribute(dotColors, 3));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        atlas: { value: atlasTexture },
        pointSize: { value: WATERFALL_SETTINGS.pointSize },
        opacity: { value: WATERFALL_SETTINGS.opacity },
        centerSoftness: { value: WATERFALL_SETTINGS.centerSoftness },
        centerDim: { value: WATERFALL_SETTINGS.centerDim },
        centerBlur: { value: WATERFALL_SETTINGS.centerBlur },
        zRange: { value: WATERFALL_SETTINGS.zRange },
      },
      vertexShader: `
        uniform float pointSize;
        uniform float centerSoftness;
        uniform float centerDim;
        uniform float centerBlur;
        uniform float zRange;
        attribute vec3 color;
        attribute float intensity;
        attribute float glyph;
        varying vec3 vColor;
        varying float vGlyph;
        varying float vBlur;
        void main() {
          float centerFactor = smoothstep(0.0, centerSoftness, abs(position.x));
          float dim = mix(1.0 - centerDim, 1.0, centerFactor);
          float depthFactor = smoothstep(-zRange, 0.0, position.z);
          vColor = color * intensity * dim * (0.7 + depthFactor * 0.3);
          vGlyph = glyph;
          vBlur = (1.0 - centerFactor) * centerBlur;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = pointSize * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D atlas;
        uniform float opacity;
        varying vec3 vColor;
        varying float vGlyph;
        varying float vBlur;
        void main() {
          float gridSize = 4.0;
          float col = mod(vGlyph, gridSize);
          float row = floor(vGlyph / gridSize);
          vec2 uv = (gl_PointCoord + vec2(col, row)) / gridSize;
          vec4 tex = texture2D(atlas, uv);
          float edge = 0.24 + vBlur * 0.28;
          float alpha = smoothstep(edge, 1.0, tex.r) * opacity;
          if (alpha < 0.02) discard;
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
    });

    const points = new THREE.Points(geometry, material);
    points.rotation.x = -0.08;
    scene.add(points);

    const dotMaterial = new THREE.PointsMaterial({
      size: WATERFALL_SETTINGS.dotSize,
      transparent: true,
      opacity: 0.22,
      vertexColors: true,
      depthWrite: false,
    });
    const dots = new THREE.Points(dotGeometry, dotMaterial);
    dots.rotation.x = -0.08;
    scene.add(dots);

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    resize();

    let animationFrame = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.elapsedTime;
      let glyphsChanged = false;

      for (let i = 0; i < totalPoints; i += 1) {
        const y = WATERFALL_SETTINGS.maxY - ((time * speeds[i] + yOffsets[i]) % ySpan);
        const wobble = Math.sin(time * 0.6 + phases[i]) * WATERFALL_SETTINGS.wobble;
        positions[i * 3] = baseX[i] + wobble;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = baseZ[i] + Math.cos(time * 0.4 + phases[i]) * 0.18;

        glyphChangeAt[i] -= delta;
        if (glyphChangeAt[i] <= 0) {
          glyphs[i] = Math.floor(Math.random() * HEX_CHARS.length);
          glyphChangeAt[i] = Math.random() * 3 + 0.6;
          glyphsChanged = true;
        }
      }

      (geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      if (glyphsChanged) {
        (geometry.attributes.glyph as THREE.BufferAttribute).needsUpdate = true;
      }
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(animate);
    };

    if (!prefersReducedMotion) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      renderer.render(scene, camera);
    }

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      geometry.dispose();
      material.dispose();
      dotGeometry.dispose();
      dotMaterial.dispose();
      atlasTexture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className={`fixed inset-0 z-0 pointer-events-none ${className}`}>
      {!hideBackground && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.85)_0%,rgba(17,17,17,0.6)_35%,rgba(124,58,237,0.12)_70%,rgba(124,58,237,0.2)_100%)]" />
      )}
      <div ref={containerRef} className="absolute inset-0" />
    </div>
  );
}

export default CryptographicWaterfallBackground;
