import ParticlesSystem from '../classes/ParticlesSystem'

import * as THREE from 'three'

import { Pane } from 'tweakpane'
import * as EssentialsPlugin from '@tweakpane/plugin-essentials'

import {
  FilesetResolver,
  FaceLandmarker,
} from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.1.0-alpha-16'
import Avatar from '../classes/Avatar'
import Lights from '../classes/Lights'

export const initWorldPipelineModule = () => {
  // Debug: FPS graph
  const pane = new Pane()
  pane.registerPlugin(EssentialsPlugin)
  const fpsGraph = pane.addBlade({
    view: 'fpsgraph',
    label: 'fpsgraph',
  })

  const clock = new THREE.Clock()

  let faceLandmarker = null

  const initXRScene = () => {
    Lights.init()
    ParticlesSystem.init()
    Avatar.init()

    console.log('✨', 'World ready')
  }

  const initMediapipe = async () => {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.1.0-alpha-16/wasm'
    )

    faceLandmarker = await FaceLandmarker.createFromModelPath(
      vision,
      'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task'
    )

    await faceLandmarker.setOptions({
      baseOptions: {
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true,
    })

    console.log('Finished Loading MediaPipe Model.')

    initXRScene()
  }

  const init = () => {
    initMediapipe()
  }

  const retarget = (blendshapes) => {
    const categories = blendshapes[0].categories
    let coefsMap = new Map()
    for (let i = 0; i < categories.length; ++i) {
      const blendshape = categories[i]

      // Adjust certain blendshape values to be less prominent.
      switch (blendshape.categoryName) {
        case 'browOuterUpLeft':
          blendshape.score *= 1.2
          break
        case 'browOuterUpRight':
          blendshape.score *= 1.2
          break
        case 'eyeBlinkLeft':
          blendshape.score *= 1.2
          break
        case 'eyeBlinkRight':
          blendshape.score *= 1.2
          break
        // case 'tongueOut':
        //   blendshape.score *= 1.2
        //   break
        // case 'noseSneerLeft':
        //   blendshape.score *= 1.2
        //   break
        // case 'noseSneerRight':
        //   blendshape.score *= 1.2
        //   break
        default:
      }
      coefsMap.set(categories[i].categoryName, categories[i].score)
    }
    return coefsMap
  }

  const render = () => {
    ParticlesSystem?.update()
  }

  return {
    name: 'mediapipe',

    onStart: () => init(),

    onRender: () => render(),

    onUpdate: () => {
      fpsGraph.begin()

      if (faceLandmarker) {
        const video = document.querySelector('video')

        const time = clock.getElapsedTime()
        const landmarks = faceLandmarker.detectForVideo(video, time * 1000)

        // Apply transformation
        const transformationMatrices = landmarks.facialTransformationMatrixes
        if (transformationMatrices && transformationMatrices.length > 0) {
          let matrix = new THREE.Matrix4().fromArray(
            transformationMatrices[0].data
          )
          // Example of applying matrix directly to the avatar
          Avatar.applyMatrix(matrix, { scale: 50 })
        }

        // Apply Blendshapes
        const blendshapes = landmarks.faceBlendshapes

        if (blendshapes && blendshapes.length > 0) {
          const coefsMap = retarget(blendshapes)
          Avatar.updateBlendshapes(coefsMap)
        }
      }

      fpsGraph.end()
    },
  }
}
