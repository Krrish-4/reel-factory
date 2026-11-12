import { useCallback } from "react";
import { hexToRgb, ShaderCanvas } from "./ShaderCanvas";

/**
 * Silk — ported from React Bits (Backgrounds/Silk, David Haz).
 * License: MIT + Commons Clause. Fine inside our own videos; never redistribute
 * the component itself. Source: C:\Users\rahul\motion-refs\3-commons-clause\react-bits
 *
 * The fragment shader is the original, verbatim. The only change is the clock:
 * the original does `uTime += 0.1 * delta` every rAF, so uTime = 0.1 x seconds.
 */
const FRAG = `
precision highp float;
varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;
uniform float uLightMode;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd        = noise(gl_FragCoord.xy);
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                           sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  float grain = rnd / 15.0 * uNoiseIntensity;
  vec3 result = uColor * pattern - vec3(grain);
if (uLightMode > 0.5) {
  float fold = smoothstep(0.28, 0.9, pattern);
  float specular = smoothstep(0.72, 0.98, pattern);
  vec3 shadowColor = uColor * 0.72;
  vec3 bodyColor = min(uColor * 1.18, vec3(1.0));
  vec3 lightBase = mix(shadowColor, bodyColor, fold);
  lightBase = mix(lightBase, vec3(1.0), specular * 0.92);
  float fineNoise = noise(gl_FragCoord.xy * 0.63 + vec2(17.0, 41.0));
  float grainSignal = (rnd + fineNoise - 1.0);
  float grainStrength = clamp(uNoiseIntensity * 0.038, 0.0, 0.16);
  result = lightBase + grainSignal * grainStrength;
}
  gl_FragColor = vec4(clamp(result, 0.0, 1.0), 1.0);
}
`;

export const Silk: React.FC<{
  speed?: number;
  scale?: number;
  color?: string;
  noiseIntensity?: number;
  rotation?: number;
  lightMode?: boolean;
}> = ({
  speed = 5,
  scale = 1,
  color = "#7B7481",
  noiseIntensity = 1.5,
  rotation = 0,
  lightMode = false,
}) => {
  const uniforms = useCallback(
    (s: number) => ({
      uTime: 0.1 * s,
      uColor: hexToRgb(color),
      uSpeed: speed,
      uScale: scale,
      uRotation: rotation,
      uNoiseIntensity: noiseIntensity,
      uLightMode: lightMode ? 1 : 0,
    }),
    [color, speed, scale, rotation, noiseIntensity, lightMode],
  );
  return <ShaderCanvas frag={FRAG} uniforms={uniforms} />;
};
