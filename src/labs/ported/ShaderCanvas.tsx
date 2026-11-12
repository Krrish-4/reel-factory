import { useLayoutEffect, useRef } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

/**
 * A full-canvas fragment shader driven by the Remotion frame, not by a clock.
 *
 * The web originals (ogl / react-three-fiber) advance `iTime` from
 * requestAnimationFrame, which a Remotion render does not tick in real time.
 * Here the shader source is untouched and only the time source changes: the
 * caller gets `seconds = frame / fps` and returns the uniforms for that frame.
 *
 * Draws in a layout effect, so the frame is on the canvas before Remotion takes
 * its screenshot. `preserveDrawingBuffer` keeps it there.
 */

export type Uniform = number | [number, number] | [number, number, number];

const VERT = `
attribute vec2 position;
varying vec2 vUv;
varying vec3 vPosition;
void main() {
  vUv = position * 0.5 + 0.5;
  vPosition = vec3(position, 0.0);
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const compile = (gl: WebGLRenderingContext, type: number, src: string) => {
  const s = gl.createShader(type);
  if (!s) throw new Error("createShader failed");
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    throw new Error(`shader compile: ${gl.getShaderInfoLog(s)}`);
  }
  return s;
};

type GLState = {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  locs: Map<string, WebGLUniformLocation | null>;
};

export const ShaderCanvas: React.FC<{
  frag: string;
  uniforms: (seconds: number, w: number, h: number) => Record<string, Uniform>;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}> = ({ frag, uniforms, width, height, style }) => {
  const frame = useCurrentFrame();
  const { fps, width: cw, height: ch } = useVideoConfig();
  const w = width ?? cw;
  const h = height ?? ch;
  const canvas = useRef<HTMLCanvasElement>(null);
  const state = useRef<GLState | null>(null);

  useLayoutEffect(() => {
    const c = canvas.current;
    if (!c) return;
    if (!state.current) {
      const gl = c.getContext("webgl", {
        alpha: true,
        premultipliedAlpha: true,
        preserveDrawingBuffer: true,
        antialias: false,
      });
      if (!gl) throw new Error("WebGL unavailable in this renderer");
      const program = gl.createProgram();
      if (!program) throw new Error("createProgram failed");
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, frag));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(`link: ${gl.getProgramInfoLog(program)}`);
      }
      gl.useProgram(program);
      // One oversized triangle covers the viewport.
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW,
      );
      const pos = gl.getAttribLocation(program, "position");
      gl.enableVertexAttribArray(pos);
      gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
      state.current = { gl, program, locs: new Map() };
    }

    const { gl, program, locs } = state.current;
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (const [name, v] of Object.entries(uniforms(frame / fps, w, h))) {
      if (!locs.has(name)) locs.set(name, gl.getUniformLocation(program, name));
      const loc = locs.get(name) ?? null;
      if (typeof v === "number") gl.uniform1f(loc, v);
      else if (v.length === 2) gl.uniform2f(loc, v[0], v[1]);
      else gl.uniform3f(loc, v[0], v[1], v[2]);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.finish();
  }, [frame, fps, frag, uniforms, w, h]);

  return (
    <canvas
      ref={canvas}
      width={w}
      height={h}
      style={{ position: "absolute", inset: 0, width: w, height: h, ...style }}
    />
  );
};

export const hexToRgb = (hex: string): [number, number, number] => {
  const x = hex.replace("#", "");
  return [
    parseInt(x.slice(0, 2), 16) / 255,
    parseInt(x.slice(2, 4), 16) / 255,
    parseInt(x.slice(4, 6), 16) / 255,
  ];
};
