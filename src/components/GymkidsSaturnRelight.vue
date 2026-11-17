<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const host = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

let disposeScene: (() => void) | undefined

const vertexSource = `#version 300 es
in vec2 aPosition;

void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`

const fragmentSource = `#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform vec2 uLight;
uniform float uTime;
out vec4 outColor;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

mat2 rotate2d(float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat2(c, -s, s, c);
}

vec3 saturnAlbedo(vec3 normal, vec2 surface) {
  float latitude = normal.y;
  float grain = hash21(floor(surface * 780.0)) - 0.5;
  float broad = 0.5 + 0.5 * sin(latitude * 36.0 + sin(latitude * 9.0) * 1.7);
  float fine = 0.5 + 0.5 * sin(latitude * 118.0 + grain * 0.9);
  float belt = smoothstep(0.18, 0.84, broad) * 0.6 + fine * 0.17;

  vec3 umber = vec3(0.185, 0.105, 0.057);
  vec3 ochre = vec3(0.61, 0.39, 0.18);
  vec3 cream = vec3(0.91, 0.74, 0.48);
  vec3 color = mix(umber, ochre, smoothstep(-0.92, 0.72, latitude));
  color = mix(color, cream, belt * (0.54 + 0.22 * normal.z));

  float equatorialHaze = exp(-pow(latitude * 3.1, 2.0));
  color += vec3(0.16, 0.09, 0.035) * equatorialHaze;
  return color * (0.92 + grain * 0.055);
}

vec3 lightSurface(vec3 albedo, vec3 normal, vec2 point, float roughness) {
  vec3 lightPosition = vec3(uLight, 0.76);
  vec3 surfacePosition = vec3(point, normal.z * 0.12);
  vec3 lightDirection = normalize(lightPosition - surfacePosition);
  float diffuse = max(dot(normal, lightDirection), 0.0);
  float wrap = max((dot(normal, lightDirection) + 0.16) / 1.16, 0.0);
  float rim = pow(max(1.0 - normal.z, 0.0), 3.0);
  vec3 warmLight = vec3(1.0, 0.79, 0.56);
  vec3 coolAmbient = vec3(0.014, 0.017, 0.024);
  vec3 lit = albedo * (coolAmbient + warmLight * pow(wrap, 1.42) * 1.02);
  lit += warmLight * pow(diffuse, mix(24.0, 5.0, roughness)) * 0.05;
  lit += coolAmbient * rim * 0.16;
  return lit;
}

vec4 ringLayer(vec2 localPoint, vec2 point, float planetRadius, bool front) {
  vec2 ringSpace = rotate2d(-0.155) * localPoint;
  float planeY = ringSpace.y / 0.265;
  float radius = length(vec2(ringSpace.x, planeY)) / planetRadius;
  float outer = 1.98;
  float inner = 1.13;
  float edge = fwidth(radius) * 1.5;
  float alpha = smoothstep(inner, inner + edge, radius) * (1.0 - smoothstep(outer - edge, outer, radius));

  bool isFront = ringSpace.y < 0.0;
  if (isFront != front || alpha <= 0.0)
    return vec4(0.0);

  float radial = clamp((radius - inner) / (outer - inner), 0.0, 1.0);
  float bands = 0.5 + 0.5 * sin(radius * 103.0 + sin(radius * 31.0) * 1.3);
  float gaps = smoothstep(0.18, 0.88, 0.5 + 0.5 * sin(radius * 42.0));
  float cassini = 1.0 - smoothstep(0.018, 0.045, abs(radius - 1.62));
  vec3 darkBand = vec3(0.19, 0.13, 0.075);
  vec3 lightBand = vec3(0.73, 0.57, 0.35);
  vec3 albedo = mix(darkBand, lightBand, 0.26 + bands * 0.54);
  albedo *= mix(0.72, 1.0, gaps) * mix(1.0, 0.22, cassini);
  albedo *= 0.96 - radial * 0.22;

  vec3 ringNormal = normalize(vec3(0.0, 0.43, 0.9));
  vec3 color = lightSurface(albedo, ringNormal, point, 0.92);
  float sideFade = smoothstep(0.06, 0.32, abs(ringSpace.y) / max(abs(ringSpace.x), 0.001));

  return vec4(color, alpha * mix(0.62, 1.0, sideFade) * 0.94);
}

void composite(inout vec3 color, inout float alpha, vec4 layer) {
  color = mix(color, layer.rgb, layer.a);
  alpha = layer.a + alpha * (1.0 - layer.a);
}

void main() {
  vec2 point = (gl_FragCoord.xy - uResolution * 0.5) / uResolution.y;
  float aspect = uResolution.x / uResolution.y;
  vec2 center = vec2(aspect > 1.18 ? 0.15 : 0.0, aspect > 1.18 ? 0.015 : 0.06);
  float planetRadius = aspect > 1.18 ? 0.315 : 0.285;
  vec2 localPoint = point - center;
  vec3 color = vec3(0.0);
  float alpha = 0.0;

  composite(color, alpha, ringLayer(localPoint, point, planetRadius, false));

  float sphereDistance = dot(localPoint, localPoint) / (planetRadius * planetRadius);
  if (sphereDistance <= 1.0) {
    vec2 sphereXY = localPoint / planetRadius;
    float sphereZ = sqrt(max(1.0 - dot(sphereXY, sphereXY), 0.0));
    vec3 normal = normalize(vec3(sphereXY, sphereZ));
    vec3 sphereColor = lightSurface(saturnAlbedo(normal, sphereXY), normal, point, 0.78);

    vec2 ringSpace = rotate2d(-0.155) * localPoint;
    float ringShadow = exp(-pow(ringSpace.y / (planetRadius * 0.055), 2.0));
    ringShadow *= smoothstep(-0.2, 0.74, normal.z);
    sphereColor *= 1.0 - ringShadow * 0.44;

    float limb = smoothstep(1.0, 0.985, sphereDistance);
    composite(color, alpha, vec4(sphereColor, limb));
  }

  composite(color, alpha, ringLayer(localPoint, point, planetRadius, true));

  float objectDistance = length(localPoint) / (planetRadius * 2.08);
  float halo = exp(-pow(max(objectDistance - 0.47, 0.0) * 8.5, 2.0)) * 0.018;
  color += vec3(0.42, 0.31, 0.19) * halo;
  alpha = max(alpha, halo * 2.4);

  float dither = (hash21(gl_FragCoord.xy + uTime) - 0.5) / 255.0;
  color = pow(max((color + dither) * 0.76, 0.0), vec3(0.94));
  outColor = vec4(color, alpha);
}`

onMounted(() => {
  const hostElement = host.value
  const canvasElement = canvas.value

  if (!hostElement || !canvasElement)
    return

  const gl = canvasElement.getContext('webgl2', {
    alpha: true,
    antialias: false,
    depth: false,
    powerPreference: 'high-performance',
    premultipliedAlpha: false,
  })

  if (!gl) {
    hostElement.dataset.fallback = 'true'

    return
  }

  const compileShader = (type: number, source: string) => {
    const shader = gl.createShader(type)

    if (!shader)
      throw new Error('Unable to create the Saturn shader')

    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader) || 'Unable to compile the Saturn shader'

      gl.deleteShader(shader)
      throw new Error(message)
    }

    return shader
  }

  const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSource)
  const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSource)
  const program = gl.createProgram()

  if (!program)
    throw new Error('Unable to create the Saturn program')

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(program) || 'Unable to link the Saturn program')

  const positionLocation = gl.getAttribLocation(program, 'aPosition')
  const resolutionLocation = gl.getUniformLocation(program, 'uResolution')
  const lightLocation = gl.getUniformLocation(program, 'uLight')
  const timeLocation = gl.getUniformLocation(program, 'uTime')
  const quad = gl.createBuffer()

  if (!quad || !resolutionLocation || !lightLocation || !timeLocation)
    throw new Error('Unable to initialize the Saturn scene')

  gl.bindBuffer(gl.ARRAY_BUFFER, quad)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  gl.useProgram(program)
  gl.enableVertexAttribArray(positionLocation)
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const finePointer = window.matchMedia('(pointer: fine)')
  const targetLight = { x: 0.42, y: 0.16 }
  const currentLight = { ...targetLight }
  let animationFrame = 0
  let visible = true

  const resize = () => {
    const bounds = hostElement.getBoundingClientRect()
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75)
    const width = Math.max(1, Math.round(bounds.width * pixelRatio))
    const height = Math.max(1, Math.round(bounds.height * pixelRatio))

    if (canvasElement.width !== width || canvasElement.height !== height) {
      canvasElement.width = width
      canvasElement.height = height
      gl.viewport(0, 0, width, height)
    }
  }

  const draw = () => {
    resize()

    const deltaX = targetLight.x - currentLight.x
    const deltaY = targetLight.y - currentLight.y
    const settled = Math.abs(deltaX) < 0.0015 && Math.abs(deltaY) < 0.0015
    const easing = reducedMotion.matches || settled ? 1 : 0.11

    currentLight.x += deltaX * easing
    currentLight.y += deltaY * easing

    gl.uniform2f(resolutionLocation, canvasElement.width, canvasElement.height)
    gl.uniform2f(lightLocation, currentLight.x, currentLight.y)
    gl.uniform1f(timeLocation, 0)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    animationFrame = 0

    if (visible && !reducedMotion.matches && !settled)
      animationFrame = window.requestAnimationFrame(draw)
  }

  const requestDraw = () => {
    if (!visible)
      return

    window.cancelAnimationFrame(animationFrame)
    animationFrame = window.requestAnimationFrame(draw)
  }

  const updateTarget = (event: PointerEvent) => {
    if (!finePointer.matches)
      return

    const bounds = hostElement.getBoundingClientRect()

    targetLight.x = (event.clientX - bounds.left - bounds.width * 0.5) / bounds.height
    targetLight.y = (bounds.height * 0.5 - (event.clientY - bounds.top)) / bounds.height
    requestDraw()
  }

  const resetTarget = () => {
    targetLight.x = 0.42
    targetLight.y = 0.16
    requestDraw()
  }

  const visibilityObserver = new IntersectionObserver(entries => {
    visible = entries[0]?.isIntersecting ?? true

    if (visible) {
      requestDraw()
    }
    else {
      window.cancelAnimationFrame(animationFrame)
      animationFrame = 0
    }
  }, { threshold: 0.02 })

  const resizeObserver = new ResizeObserver(requestDraw)

  window.addEventListener('pointermove', updateTarget, { passive: true })
  window.addEventListener('blur', resetTarget)
  reducedMotion.addEventListener('change', requestDraw)
  visibilityObserver.observe(hostElement)
  resizeObserver.observe(hostElement)
  requestDraw()

  disposeScene = () => {
    window.cancelAnimationFrame(animationFrame)
    window.removeEventListener('pointermove', updateTarget)
    window.removeEventListener('blur', resetTarget)
    reducedMotion.removeEventListener('change', requestDraw)
    visibilityObserver.disconnect()
    resizeObserver.disconnect()
    gl.deleteBuffer(quad)
    gl.deleteProgram(program)
    gl.deleteShader(vertexShader)
    gl.deleteShader(fragmentShader)
  }
})

onBeforeUnmount(() => disposeScene?.())
</script>

<template>
  <div
    ref="host"
    class="saturn-relight"
  >
    <canvas ref="canvas" />
  </div>
</template>

<style scoped>
.saturn-relight,
.saturn-relight canvas {
  inline-size: 100%;
  block-size: 100%;
}

.saturn-relight {
  position: relative;
  isolation: isolate;
  cursor: crosshair;
}

.saturn-relight canvas {
  display: block;
}

.saturn-relight[data-fallback="true"]::before,
.saturn-relight[data-fallback="true"]::after {
  position: absolute;
  inset: 50% auto auto 50%;
  border-radius: 50%;
  content: "";
  transform: translate(-50%, -50%);
}

.saturn-relight[data-fallback="true"]::before {
  inline-size: 31%;
  aspect-ratio: 1;
  background: radial-gradient(circle at 72% 32%, #d7a967, #422515 54%, #090706 74%);
}

.saturn-relight[data-fallback="true"]::after {
  inline-size: 66%;
  block-size: 17%;
  border: 7px double rgb(199 157 96 / 56%);
  transform: translate(-50%, -50%) rotate(-9deg);
}

@media (prefers-reduced-motion: reduce) {
  .saturn-relight { cursor: default; }
}
</style>
