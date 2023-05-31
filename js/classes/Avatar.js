import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import * as THREE from 'three'

class _Avatar {
  loader = new GLTFLoader()
  scene
  gltf
  root
  morphTargetMeshes = []
  url

  init(url = '/models/rpm.glb') {
    const { scene } = XR8.Threejs.xrScene()

    this.url = url
    this.scene = scene
    this.loadModel(this.url)
  }

  loadModel(url) {
    this.url = url
    this.loader.load(
      // URL of the model you want to load
      url,
      // Callback when the resource is loaded
      (gltf) => {
        if (this.gltf) {
          // Reset GLTF and morphTargetMeshes if a previous model was loaded.
          this.gltf.scene.remove()
          this.morphTargetMeshes = []
        }
        this.gltf = gltf
        this.scene.add(gltf.scene)
        this.start(gltf)

        // const box = new THREE.Mesh(
        //   new THREE.BoxGeometry(0.5, 0.5, 0.5),
        //   new THREE.MeshNormalMaterial()
        // )
        // box.frustumCulled = false
        // this.scene.add(box)
        // this.box = box
      },

      // Called while loading is progressing
      (progress) =>
        console.log(
          'Loading model...',
          100.0 * (progress.loaded / progress.total),
          '%'
        ),
      // Called when loading has errors
      (error) => console.error(error)
    )
  }

  start(gltf) {
    gltf.scene.traverse((object) => {
      // Register first bone found as the root
      if (object.isBone && !this.root) {
        this.root = object
      }
      // Return early if no mesh is found.
      if (!object.isMesh) {
        // console.warn(`No mesh found`);
        return
      }

      const mesh = object
      // Reduce clipping when model is close to camera.
      mesh.frustumCulled = false

      // Return early if mesh doesn't include morphable targets
      if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) {
        // console.warn(`Mesh ${mesh.name} does not have morphable targets`);
        return
      }
      this.morphTargetMeshes.push(mesh)
    })

    gltf.scene.position.y = -10

    console.log({ morphTargetMeshes: this.morphTargetMeshes })
  }

  updateBlendshapes(blendshapes) {
    for (const mesh of this.morphTargetMeshes) {
      if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) {
        console.warn(`Mesh ${mesh.name} does not have morphable targets`)
        continue
      }
      for (const [name, value] of blendshapes) {
        if (!Object.keys(mesh.morphTargetDictionary).includes(name)) {
          console.warn(`Model morphable target ${name} not found`)
          continue
        }

        const idx = mesh.morphTargetDictionary[name]

        mesh.morphTargetInfluences[idx] = value
      }
    }
  }

  /**
   * Apply a position, rotation, scale matrix to current GLTF.scene
   * @param matrix
   * @param matrixRetargetOptions
   * @returns
   */
  applyMatrix(matrix, matrixRetargetOptions) {
    const { decompose = false, scale = 1 } = matrixRetargetOptions || {}
    if (!this.gltf) {
      return
    }
    // Three.js will update the object matrix when it render the page
    // according the object position, scale, rotation.
    // To manually set the object matrix, you have to set autoupdate to false.
    matrix.scale(new THREE.Vector3(scale, scale, scale))
    this.gltf.scene.matrixAutoUpdate = false
    // Set new position and rotation from matrix
    this.gltf.scene.matrix.copy(matrix)

    // this.box.matrixAutoUpdate = false
    // this.box.matrix.copy(matrix)
  }

  /**
   * Takes the root object in the avatar and offsets its position for retargetting.
   * @param offset
   * @param rotation
   */
  offsetRoot(offset, rotation) {
    if (this.root) {
      this.root.position.copy(offset)
      if (rotation) {
        let offsetQuat = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(rotation.x, rotation.y, rotation.z)
        )
        this.root.quaternion.copy(offsetQuat)
      }
    }
  }
}

const Avatar = new _Avatar()
export default Avatar
