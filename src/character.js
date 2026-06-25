import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Lane positions (matches Subway Surfers style 3-lane)
// Note: camera looks in +Z direction, so visually "right" = -X. Flipped array
// so LANES[0]=left-lane, LANES[2]=right-lane from the player's perspective.
const LANES = [2.5, 0, -2.5];

export class Character {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.mesh = null;
    this.mixer = null;
    this.actions = {};
    this.currentAction = null;

    this.laneIndex = 1; // center
    this.targetX = 0;
    this.isJumping = false;
    this.isSliding = false;
    this.jumpVel = 0;
    this.baseY = 0;

    // Bounding box for collision
    this.bbox = new THREE.Box3();
    this.bboxSize = new THREE.Vector3(0.8, 1.8, 0.8);
  }

  async load() {
    // Try to load real GLB model, fall back to placeholder
    const modelPath = '/models/characters/tralalero.glb';

    try {
      const loader = new GLTFLoader();
      const gltf = await new Promise((resolve, reject) => {
        loader.load(modelPath, resolve, undefined, reject);
      });

      this.mesh = gltf.scene;
      this.mesh.scale.set(1, 1, 1);
      this.mesh.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      // Setup animations
      if (gltf.animations && gltf.animations.length > 0) {
        this.mixer = new THREE.AnimationMixer(this.mesh);
        gltf.animations.forEach((clip) => {
          const name = clip.name.toLowerCase();
          this.actions[name] = this.mixer.clipAction(clip);
        });
        const runAction = this.actions['run'] || this.actions['running'] ||
                         this.actions['armature|run'] || Object.values(this.actions)[0];
        if (runAction) {
          runAction.play();
          this.currentAction = runAction;
        }
      }

      this.group.add(this.mesh);
      console.log('Loaded real character model');
    } catch (err) {
      console.log('No GLB model found, using Tralalero placeholder.');
      this.createPlaceholder();
    }

    this.scene.add(this.group);
    this.group.position.set(0, 0, 0);
  }

  createPlaceholder() {
    // TRALALERO TRALALA - the iconic Italian Brainrot blue shark-crocodile
    // Signature: shark body, shark teeth, big meme eyes, 3 legs, Nike sneakers

    const bodyMat = new THREE.MeshToonMaterial({ color: 0x1e40af });
    const bellyMat = new THREE.MeshToonMaterial({ color: 0x93c5fd });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x0a0611 });
    const toothMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const gumMat = new THREE.MeshBasicMaterial({ color: 0x7f1d1d });
    const shoeMat = new THREE.MeshToonMaterial({ color: 0xffffff });
    const swooshMat = new THREE.MeshToonMaterial({ color: 0xdc2626 });
    const soleMat = new THREE.MeshToonMaterial({ color: 0x111827 });

    // TORSO - shark torpedo shape
    const torso = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.4, 0.75, 6, 16),
      bodyMat
    );
    torso.position.y = 1.15;
    torso.scale.set(1, 1, 1.25);
    torso.castShadow = true;
    this.group.add(torso);
    this.torso = torso;

    // BELLY - lighter underside
    const belly = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.33, 0.55, 6, 12),
      bellyMat
    );
    belly.position.set(0, 1.08, 0.08);
    belly.scale.set(0.92, 0.9, 1.25);
    this.group.add(belly);

    // HEAD
    const headGroup = new THREE.Group();

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 20, 14),
      bodyMat
    );
    head.scale.set(1.15, 0.8, 1.45);
    head.castShadow = true;
    headGroup.add(head);

    const upperJaw = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.22, 0.6),
      bodyMat
    );
    upperJaw.position.set(0, 0.03, 0.42);
    upperJaw.castShadow = true;
    headGroup.add(upperJaw);

    const mouthInside = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.1, 0.55),
      gumMat
    );
    mouthInside.position.set(0, -0.09, 0.4);
    headGroup.add(mouthInside);

    const lowerJaw = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.16, 0.52),
      bodyMat
    );
    lowerJaw.position.set(0, -0.22, 0.4);
    lowerJaw.castShadow = true;
    headGroup.add(lowerJaw);
    this.lowerJaw = lowerJaw;

    // TEETH - upper row
    for (let i = 0; i < 6; i++) {
      const tooth = new THREE.Mesh(
        new THREE.ConeGeometry(0.04, 0.09, 4),
        toothMat
      );
      tooth.rotation.x = Math.PI;
      tooth.position.set(-0.22 + i * 0.09, -0.03, 0.66);
      headGroup.add(tooth);
    }
    // TEETH - lower row
    for (let i = 0; i < 6; i++) {
      const tooth = new THREE.Mesh(
        new THREE.ConeGeometry(0.04, 0.09, 4),
        toothMat
      );
      tooth.position.set(-0.22 + i * 0.09, -0.15, 0.66);
      headGroup.add(tooth);
    }

    // EYES
    const eyeGeo = new THREE.SphereGeometry(0.13, 14, 10);
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.24, 0.24, 0.15);
    headGroup.add(eyeL);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.24, 0.24, 0.15);
    headGroup.add(eyeR);

    const pupilGeo = new THREE.SphereGeometry(0.065, 10, 8);
    const pupilL = new THREE.Mesh(pupilGeo, pupilMat);
    pupilL.position.set(-0.24, 0.24, 0.27);
    headGroup.add(pupilL);
    const pupilR = new THREE.Mesh(pupilGeo, pupilMat);
    pupilR.position.set(0.24, 0.24, 0.27);
    headGroup.add(pupilR);

    const shineGeo = new THREE.SphereGeometry(0.022, 6, 5);
    const shineL = new THREE.Mesh(shineGeo, eyeMat);
    shineL.position.set(-0.22, 0.27, 0.32);
    headGroup.add(shineL);
    const shineR = new THREE.Mesh(shineGeo, eyeMat);
    shineR.position.set(0.26, 0.27, 0.32);
    headGroup.add(shineR);

    // Nostrils
    const nostrilGeo = new THREE.SphereGeometry(0.03, 6, 5);
    const nostrilL = new THREE.Mesh(nostrilGeo, pupilMat);
    nostrilL.position.set(-0.08, 0.08, 0.68);
    headGroup.add(nostrilL);
    const nostrilR = new THREE.Mesh(nostrilGeo, pupilMat);
    nostrilR.position.set(0.08, 0.08, 0.68);
    headGroup.add(nostrilR);

    headGroup.position.y = 1.78;
    this.group.add(headGroup);
    this.headGroup = headGroup;

    // DORSAL FIN
    const dorsalFin = new THREE.Mesh(
      new THREE.ConeGeometry(0.22, 0.55, 3),
      bodyMat
    );
    dorsalFin.position.set(0, 1.72, -0.15);
    dorsalFin.scale.set(1, 1, 0.3);
    dorsalFin.castShadow = true;
    this.group.add(dorsalFin);

    // TAIL FIN
    const tailFin = new THREE.Mesh(
      new THREE.ConeGeometry(0.32, 0.65, 3),
      bodyMat
    );
    tailFin.rotation.x = -Math.PI / 2;
    tailFin.position.set(0, 1.15, -0.9);
    tailFin.scale.set(0.25, 1, 1.2);
    tailFin.castShadow = true;
    this.group.add(tailFin);
    this.tailFin = tailFin;

    // 3 LEGS - iconic Tralalero signature
    const legGeo = new THREE.CapsuleGeometry(0.11, 0.5, 4, 8);

    this.leg1 = new THREE.Mesh(legGeo, bodyMat);
    this.leg1.position.set(-0.22, 0.45, 0.15);
    this.leg1.castShadow = true;
    this.group.add(this.leg1);

    this.leg2 = new THREE.Mesh(legGeo, bodyMat);
    this.leg2.position.set(0.22, 0.45, 0.15);
    this.leg2.castShadow = true;
    this.group.add(this.leg2);

    this.leg3 = new THREE.Mesh(legGeo, bodyMat);
    this.leg3.position.set(0, 0.45, -0.3);
    this.leg3.castShadow = true;
    this.group.add(this.leg3);

    // 3 NIKE SNEAKERS
    this.shoe1 = this.makeSneaker(shoeMat, swooshMat, soleMat);
    this.shoe1.position.set(-0.22, 0.09, 0.22);
    this.group.add(this.shoe1);

    this.shoe2 = this.makeSneaker(shoeMat, swooshMat, soleMat);
    this.shoe2.position.set(0.22, 0.09, 0.22);
    this.group.add(this.shoe2);

    this.shoe3 = this.makeSneaker(shoeMat, swooshMat, soleMat);
    this.shoe3.position.set(0, 0.09, -0.22);
    this.group.add(this.shoe3);
  }

  makeSneaker(shoeMat, swooshMat, soleMat) {
    const shoe = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.13, 0.38),
      shoeMat
    );
    body.position.y = 0.03;
    body.castShadow = true;
    shoe.add(body);

    const sole = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.05, 0.4),
      soleMat
    );
    sole.position.y = -0.05;
    shoe.add(sole);

    const toe = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.11, 0.06),
      shoeMat
    );
    toe.position.set(0, 0.04, 0.2);
    shoe.add(toe);

    const swooshL = new THREE.Mesh(
      new THREE.BoxGeometry(0.015, 0.05, 0.18),
      swooshMat
    );
    swooshL.position.set(-0.113, 0.04, 0.02);
    swooshL.rotation.y = 0.15;
    shoe.add(swooshL);

    const swooshR = new THREE.Mesh(
      new THREE.BoxGeometry(0.015, 0.05, 0.18),
      swooshMat
    );
    swooshR.position.set(0.113, 0.04, 0.02);
    swooshR.rotation.y = -0.15;
    shoe.add(swooshR);

    for (let i = 0; i < 3; i++) {
      const lace = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.015, 0.02),
        swooshMat
      );
      lace.position.set(0, 0.1, -0.08 + i * 0.06);
      shoe.add(lace);
    }

    return shoe;
  }

  moveLeft() {
    if (this.laneIndex > 0) {
      this.laneIndex--;
      this.targetX = LANES[this.laneIndex];
    }
  }

  moveRight() {
    if (this.laneIndex < 2) {
      this.laneIndex++;
      this.targetX = LANES[this.laneIndex];
    }
  }

  jump() {
    if (this.isJumping || this.isSliding) return;
    this.isJumping = true;
    this.jumpVel = 8;
  }

  slide() {
    if (this.isJumping || this.isSliding) return;
    this.isSliding = true;
    setTimeout(() => { this.isSliding = false; }, 600);
  }

  reset() {
    this.laneIndex = 1;
    this.targetX = 0;
    this.group.position.set(0, 0, 0);
    this.group.rotation.set(0, 0, 0);
    this.isJumping = false;
    this.isSliding = false;
    this.jumpVel = 0;
    this.group.visible = true;
  }

  die() {
    this.group.rotation.x = -Math.PI / 3;
    this.group.position.y = 0.3;
  }

  updateIdle(dt) {
    const t = performance.now() / 1000;
    this.group.position.y = Math.sin(t * 1.5) * 0.05;
    if (this.headGroup) this.headGroup.rotation.y = Math.sin(t * 0.8) * 0.1;
    if (this.mixer) this.mixer.update(dt);
  }

  update(dt) {
    // Smooth lane switching
    const dx = this.targetX - this.group.position.x;
    this.group.position.x += dx * Math.min(1, dt * 12);

    // Jump physics
    if (this.isJumping) {
      this.group.position.y += this.jumpVel * dt;
      this.jumpVel -= 22 * dt;
      if (this.group.position.y <= this.baseY) {
        this.group.position.y = this.baseY;
        this.isJumping = false;
        this.jumpVel = 0;
      }
    }

    // Slide scale
    const targetScaleY = this.isSliding ? 0.5 : 1.0;
    this.group.scale.y += (targetScaleY - this.group.scale.y) * Math.min(1, dt * 15);

    // 3-leg trot animation for Tralalero placeholder
    if (!this.mesh && this.leg1) {
      const t = performance.now() / 1000;
      const speed = 13;

      const phase1 = t * speed;
      const phase2 = t * speed + (Math.PI * 2 / 3);
      const phase3 = t * speed + (Math.PI * 4 / 3);

      const swing1 = Math.sin(phase1);
      const swing2 = Math.sin(phase2);
      const swing3 = Math.sin(phase3);

      this.leg1.rotation.x = swing1 * 0.5;
      this.leg2.rotation.x = swing2 * 0.5;
      this.leg3.rotation.x = swing3 * 0.5;

      this.shoe1.position.z = 0.22 + swing1 * 0.18;
      this.shoe2.position.z = 0.22 + swing2 * 0.18;
      this.shoe3.position.z = -0.22 + swing3 * 0.18;
      this.shoe1.position.y = 0.09 + Math.max(0, swing1) * 0.13;
      this.shoe2.position.y = 0.09 + Math.max(0, swing2) * 0.13;
      this.shoe3.position.y = 0.09 + Math.max(0, swing3) * 0.13;

      if (this.tailFin) this.tailFin.rotation.y = Math.sin(t * 7) * 0.35;
      if (this.lowerJaw) this.lowerJaw.position.y = -0.22 + Math.sin(t * 4) * 0.015;
      if (this.headGroup) this.headGroup.rotation.x = Math.sin(t * speed) * 0.05;

      this.group.position.y = this.isJumping ? this.group.position.y : Math.abs(Math.sin(t * speed * 0.5)) * 0.06;
    }

    if (this.mixer) this.mixer.update(dt);

    // Bounding box for collision
    const pos = this.group.position;
    const heightMult = this.isSliding ? 0.5 : 1;
    this.bbox.min.set(
      pos.x - this.bboxSize.x / 2,
      pos.y,
      pos.z - this.bboxSize.z / 2
    );
    this.bbox.max.set(
      pos.x + this.bboxSize.x / 2,
      pos.y + this.bboxSize.y * heightMult,
      pos.z + this.bboxSize.z / 2
    );
  }
}
