import * as THREE from 'three'

import ParticlesMaterial from './Materials/ParticlesMaterial'

class _ParticlesSystem {
  setInstance() {
    const count = this.options.count

    const particleGeometry = new THREE.BufferGeometry()
    this.particleMaterial = new ParticlesMaterial()

    const positionArray = new Float32Array(count * 3)
    const scaleArray = new Float32Array(count) // add scale randomness

    for (let i = 0; i < count; i++) {
      positionArray.set(
        [
          Math.random() * 20 - 10,
          Math.random() * 10 - 2,
          Math.random() * 20 - 10,
        ],
        i * 3
      )

      scaleArray[i] = Math.random()
    }

    particleGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positionArray, 3)
    )
    particleGeometry.setAttribute(
      'aScale',
      new THREE.BufferAttribute(scaleArray, 1)
    )

    this.instance = new THREE.Points(particleGeometry, this.particleMaterial)

    const { scene } = XR8.Threejs.xrScene()
    scene.add(this.instance)
  }

  init(options) {
    this.options = options?.count || { count: 600 }
    this.setInstance()
  }

  update() {
    if (this.particleMaterial) {
      this.particleMaterial.uniforms.uTime.value = performance.now()
    }
  }
}

const ParticlesSystem = new _ParticlesSystem()
export default ParticlesSystem
