"use client";

import * as THREE from "three";
import { DragControls } from "three/examples/jsm/controls/DragControls.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { WiggleBone } from "wiggle/spring";

export class WiggleRenderer {
  container;

  constructor() {
    this.cameraPerspective = null;
    this.currentCamera = null;
    this.scene = null;
    this.renderer = null;
    this.orbit = null;
    this.dragControl = null;
    this.loader = new GLTFLoader();
    this.wiggleBones = [];
    this.resizeHandler = null;
    this.animationFrameId = null;
    this.loadedModel = null;
  }

  init(container) {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setClearColor("#ddd");

    // Enable shadow
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional: use PCFSoftShadowMap for softer shadows

    this.container.appendChild(this.renderer.domElement);

    const aspect = this.container.clientWidth / this.container.clientHeight;

    this.cameraPerspective = new THREE.PerspectiveCamera(
      25,
      aspect,
      0.01,
      30000
    );
    this.currentCamera = this.cameraPerspective;

    this.currentCamera.position.set(4, 8, 5);

    this.scene = new THREE.Scene();

    // Ambient Light with increased intensity
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Increased intensity
    this.scene.add(ambientLight);

    // Directional Light with shadow enabled
    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(0, 1, 0).normalize();
    light.castShadow = true; // Enable shadow casting
    this.scene.add(light);

    // Additional Directional Light with shadow enabled
    const light2 = new THREE.DirectionalLight(0xffffff, 1);
    light2.position.set(-1, -1, 1).normalize();
    light2.castShadow = true; // Enable shadow casting
    this.scene.add(light2);

    // Create a plane to receive shadows
    const planeGeometry = new THREE.PlaneGeometry(100, 100); // Large plane to cover the area
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff }); // Pure white color
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2; // Rotate the plane to be horizontal
    plane.position.y = 0; // Position it below the object
    plane.receiveShadow = true; // Enable shadow receiving
    this.scene.add(plane);

    this.resizeHandler = this.onWindowResize.bind(this);
    window.addEventListener("resize", this.resizeHandler);

    // Create and add grid to the plane
    const gridHelper = new THREE.GridHelper(40, 40, 0x000000, 0xcccccc); // size, divisions, color1, color2
    gridHelper.position.y = 0; // Position the grid at the same level as the plane
    this.scene.add(gridHelper);

    this.orbit = new OrbitControls(
      this.currentCamera,
      this.renderer.domElement
    );
    this.orbit.update();

    this.loader.load("/playground/mobbin.glb", (gltf) => {
      this.loadedModel = gltf.scene;
      this.scene.add(this.loadedModel);

      // Ensure that all meshes cast and receive shadows
      const draggableObjects = [];
      this.loadedModel.traverse((object) => {
        if (object.isMesh) {
          object.castShadow = true; // Enable shadow casting
          object.receiveShadow = true; // Enable shadow receiving
          draggableObjects.push(object);
        }
      });

      // Create drag controls with all draggable objects
      this.dragControl = new DragControls(
        draggableObjects,
        this.currentCamera,
        this.renderer.domElement
      );

      // Bone names corresponds to glb file in blender.
      const rootBone = this.scene.getObjectByName("Root");
      const b1 = this.scene.getObjectByName("Wiggle1");
      const b2 = this.scene.getObjectByName("Wiggle2");
      const b3 = this.scene.getObjectByName("Wiggle3");
      const b4 = this.scene.getObjectByName("Wiggle4");

      // Comment out wiggle by velocity, using wiggle by spring.
      // this.wiggleBones.push(new WiggleBone(b1, { velocity: 0.01 }));
      // this.wiggleBones.push(new WiggleBone(b2, { velocity: 0.01 }));
      // this.wiggleBones.push(new WiggleBone(b3, { velocity: 0.01 }));
      // this.wiggleBones.push(new WiggleBone(b4, { velocity: 0.01 }));
      this.wiggleBones.push(
        new WiggleBone(b1, { stiffness: 8000, damping: 200 })
      );
      this.wiggleBones.push(
        new WiggleBone(b2, { stiffness: 8000, damping: 200 })
      );
      this.wiggleBones.push(
        new WiggleBone(b3, { stiffness: 8000, damping: 200 })
      );
      this.wiggleBones.push(
        new WiggleBone(b4, { stiffness: 8000, damping: 200 })
      );

      // Optionally handle events
      this.dragControl.addEventListener("dragstart", () => {
        this.orbit.enabled = false; // Disable orbit controls while dragging
        gltf.scene.position.y = 0.2;
      });

      this.dragControl.addEventListener("dragend", () => {
        this.orbit.enabled = true; // Re-enable orbit controls after dragging
        gltf.scene.position.y = 0.05;
      });

      this.dragControl.addEventListener("drag", (event) => {
        this.orbit.enabled = false;
        // Maintain the object's original Y position
        event.object.position.z = 0.2;
        rootBone.position.copy(event.object.position);
      });
    });
  }

  onWindowResize() {
    const aspect = this.container.clientWidth / this.container.clientHeight;

    this.cameraPerspective.aspect = aspect;
    this.cameraPerspective.updateProjectionMatrix();

    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );

    this.render();
  }

  loop() {
    this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
    this.wiggleBones.forEach((wb) => wb.update());
    this.render();
  }

  render() {
    this.renderer.render(this.scene, this.currentCamera);
  }

  dispose() {
    // Cancel animation frame
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Remove event listeners
    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);
      this.resizeHandler = null;
    }

    // Dispose controls
    if (this.orbit) {
      this.orbit.dispose();
      this.orbit = null;
    }

    if (this.dragControl) {
      this.dragControl.dispose();
      this.dragControl = null;
    }

    // Dispose wiggle bones
    this.wiggleBones = [];

    // Dispose scene and its children
    if (this.scene) {
      // Remove loaded model from scene first
      if (this.loadedModel) {
        this.scene.remove(this.loadedModel);
        this.loadedModel = null;
      }

      // Then dispose all objects in the scene
      this.scene.traverse((object) => {
        if (object.isMesh) {
          object.geometry.dispose();

          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });

      // Clear scene before nullifying the reference
      this.scene.clear();
      this.scene = null;
    }

    // Dispose renderer
    if (this.renderer) {
      this.renderer.dispose();
      if (this.container && this.renderer.domElement) {
        this.container.removeChild(this.renderer.domElement);
      }
      this.renderer = null;
    }

    // Clear references
    this.cameraPerspective = null;
    this.currentCamera = null;
    this.container = null;
  }
}
