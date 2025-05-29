// import { OrbitControls } from "three/examples/jsm/Addons.js";
import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { RGBELoader } from "three/examples/jsm/Addons.js";
import { EffectComposer } from "three/examples/jsm/Addons.js";
import { RenderPass } from "three/examples/jsm/Addons.js";
import { ShaderPass } from "three/examples/jsm/Addons.js";
import { RGBShiftShader } from "three/examples/jsm/Addons.js";
import gsap from 'gsap';

// creating Scene
const scene = new THREE.Scene();

// creating Camera
const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 4;
scene.add(camera);

// creating Renderer
const canvas = document.querySelector("#canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

// Environment map
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileCubemapShader();

let model;
new RGBELoader().load(
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/pond_bridge_night_1k.hdr",
  function (texture) {
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    scene.environment = envMap;
    texture.dispose();
    pmremGenerator.dispose();

    // Load model
    const loader = new GLTFLoader();
    loader.load(
      "./DamagedHelmet.gltf",
      (gltf) => {
        model = gltf.scene
        scene.add(model);
      },
      undefined,
      (error) => {
        console.log("error --> ", error);
      }
    );
  }
);

window.addEventListener("mousemove", (e) =>{
  if(model){
    const rotationX = (e.clientX / window.innerWidth - 0.5) * (Math.PI * 0.3)
    const rotationY = (e.clientY / window.innerHeight - 0.5) * (Math.PI * 0.3)
    gsap.to(model.rotation, {
      x: rotationY,
      y: rotationX,
      duration: 0.8,
      ease: "power2.out"
    })
  }
})

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  composer.setSize(window.innerWidth, window.innerHeight)
})

// // Orbit Controls
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;

// Post-processing
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms["amount"].value = 0.0015; // tweak for more/less effect
composer.addPass(rgbShiftPass);

// Animate loop
function animate() {
  requestAnimationFrame(animate);
  // controls.update();
  composer.render();
}
animate();

// Responsive resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});
