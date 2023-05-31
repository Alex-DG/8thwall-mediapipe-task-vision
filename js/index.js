import '../styles/index.css'

import { initThreeScenePipelineModule } from './pipelines/threeScenePipelineModule'
import { initWorldPipelineModule } from './pipelines/worldPipelineModule'

const onxrloaded = () => {
  XR8.FaceController.configure({
    meshGeometry: [
      XR8.FaceController.MeshGeometry.FACE,
      XR8.FaceController.MeshGeometry.EYES,
      XR8.FaceController.MeshGeometry.MOUTH,
    ],
    coordinates: { mirroredDisplay: false },
    maxDetections: 1,
  })

  XR8.addCameraPipelineModules([
    XR8.GlTextureRenderer.pipelineModule(), // Draws the camera feed.

    initThreeScenePipelineModule(), // Create custom Three.js scene and camera.
    initWorldPipelineModule(), // Create World object(s)

    // XR8.XrController.pipelineModule(), // Enables SLAM tracking.
    XR8.FaceController.pipelineModule(),

    XRExtras.AlmostThere.pipelineModule(), // Detects unsupported browsers and gives hints.
    XRExtras.RuntimeError.pipelineModule(), // Shows an error image on runtime error.
    XRExtras.Loading.pipelineModule(), // Manages the loading screen on startup.
    XRExtras.FullWindowCanvas.pipelineModule(), // Modifies the canvas to fill the window.
  ])

  // Open the camera and start running the camera run loop.
  XR8.run({
    canvas: document.getElementById('experience'),
    cameraConfig: { direction: XR8.XrConfig.camera().FRONT },
  })

  console.log('✅', 'XR8 running')
}

window.onload = () => {
  window.XR8 ? onxrloaded() : window.addEventListener('xrloaded', onxrloaded)
}
