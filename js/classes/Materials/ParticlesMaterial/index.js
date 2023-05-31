import { ShaderMaterial, AdditiveBlending } from 'three'

import vertexShader from './vertex.glsl'
import fragmentShader from './fragment.glsl'

class ParticlesMaterial extends ShaderMaterial {
  constructor() {
    super({
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize: { value: 100 },
      },
      vertexShader,
      fragmentShader,
    })
  }
}

export default ParticlesMaterial
