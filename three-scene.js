// THREE.JS 3D ENGINE MODULE
let scene, camera, renderer, orb, particles;
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;
let time = 0;
let lastScrollTop = 0;
let scrollSpeed = 0;
let currentWarp = 0;
const canvas = document.getElementById('three-canvas');

// Window dimensions
const winHalfX = window.innerWidth / 2;
const winHalfY = window.innerHeight / 2;

// Initialize scene
function init() {
  if (!canvas) return;

  // 1. Create Scene
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x030712, 0.015);

  // 2. Create Camera
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 8;

  // 3. Create WebGL Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // 4. Create Morphing Holographic Orb
  createOrb();

  // 5. Create Background Neural Particles
  createParticles();

  // 6. Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0x3b82f6, 2.5); // Blue
  dirLight1.position.set(5, 5, 5);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0x8b5cf6, 2.5); // Purple
  dirLight2.position.set(-5, -5, 5);
  scene.add(dirLight2);

  const pointLight = new THREE.PointLight(0x06b6d4, 3, 15); // Cyan
  pointLight.position.set(0, 0, 2);
  scene.add(pointLight);

  // 7. Event Listeners
  document.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('resize', onWindowResize);

  // Initial positioning
  updateObjectPositions();
  lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;

  // Start Animation Loop
  animate();
}

// Custom Shader for the Morphing Glowing Wireframe Orb
function createOrb() {
  const orbGeometry = new THREE.IcosahedronGeometry(2, 6);

  const customShaderMaterial = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      uniform float uTime;
      
      float noise(vec3 p) {
        return sin(p.x * 1.5 + uTime * 1.2) * cos(p.y * 1.5 + uTime * 1.2) * 0.15 +
               sin(p.z * 2.0 + uTime * 1.8) * cos(p.x * 2.0 + uTime * 1.5) * 0.1;
      }
      
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        vec3 displaced = position + normal * noise(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      uniform float uTime;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform float uWireframe;
      
      void main() {
        float fresnel = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 3.0);
        vec3 baseColor = mix(uColorA, uColorB, sin(vPosition.y * 1.5 + uTime) * 0.5 + 0.5);
        vec3 finalColor = baseColor + vec3(fresnel * 0.7);
        
        float alpha = 0.15 + fresnel * 0.65;
        if(uWireframe > 0.5) {
          alpha = 0.35 + fresnel * 0.5;
        }
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(0x3b82f6) }, // Blue
      uColorB: { value: new THREE.Color(0x8b5cf6) }, // Purple
      uWireframe: { value: 1.0 }
    },
    transparent: true,
    wireframe: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const innerGeometry = new THREE.IcosahedronGeometry(1.95, 4);
  const innerMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x090d16,
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.6,
    thickness: 1.5,
    transparent: true,
    opacity: 0.3,
    depthWrite: false
  });

  orb = new THREE.Group();
  
  const wireMesh = new THREE.Mesh(orbGeometry, customShaderMaterial);
  const solidMesh = new THREE.Mesh(innerGeometry, innerMaterial);
  
  orb.add(wireMesh);
  orb.add(solidMesh);
  
  scene.add(orb);
}

// Background Space-Warp Neural Particles (Cylindrical Tunnel Layout)
function createParticles() {
  // Dynamically set particle count based on device width to ensure 60fps on mobile
  const isMobile = window.innerWidth <= 768;
  const particleCount = isMobile ? 150 : 400; 
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  
  const colorPalette = [
    new THREE.Color(0x3b82f6), // Blue
    new THREE.Color(0x06b6d4), // Cyan
    new THREE.Color(0x8b5cf6), // Purple
    new THREE.Color(0xec4899)  // Pink (Extra premium glow)
  ];

  for (let i = 0; i < particleCount * 3; i += 3) {
    // Lay particles out in a circular tube surrounding the user viewport
    const r = 2.0 + Math.random() * 6.0; // Radius between 2.0 and 8.0 units
    const theta = Math.random() * Math.PI * 2;
    const z = -40 + Math.random() * 50; // Distributed along depth axis (-40 to +10)

    positions[i] = r * Math.cos(theta);
    positions[i + 1] = r * Math.sin(theta);
    positions[i + 2] = z;

    const randColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i] = randColor.r;
    colors[i + 1] = randColor.g;
    colors[i + 2] = randColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.09,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);
}

function onMouseMove(event) {
  mouseX = (event.clientX - winHalfX) / 100;
  mouseY = (event.clientY - winHalfY) / 100;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  updateObjectPositions();
}

function updateObjectPositions() {
  if (!orb) return;

  const w = window.innerWidth;
  if (w > 1200) {
    orb.position.set(2.2, 0.2, 0);
    orb.scale.set(1.1, 1.1, 1.1);
  } else if (w > 1024) {
    orb.position.set(1.8, 0.1, 0);
    orb.scale.set(0.9, 0.9, 0.9);
  } else if (w > 768) {
    orb.position.set(0, -0.6, 0);
    orb.scale.set(0.85, 0.85, 0.85);
  } else {
    orb.position.set(0, -0.75, 0);
    orb.scale.set(0.7, 0.7, 0.7);
  }
}

function animate() {
  requestAnimationFrame(animate);

  time += 0.01;

  if (orb) {
    const wireframeMesh = orb.children[0];
    if (wireframeMesh && wireframeMesh.material.uniforms) {
      wireframeMesh.material.uniforms.uTime.value = time;
    }

    // Snappier mouse easing (0.05 -> 0.08)
    targetX += (mouseX - targetX) * 0.08;
    targetY += (mouseY - targetY) * 0.08;

    // Smooth absolute rotations based on time + mouse target
    orb.rotation.y = time * 0.12 + targetX * 0.6;
    orb.rotation.x = time * 0.06 - targetY * 0.6;

    // Smooth hover float based on sine wave to prevent frame rate drift
    const w = window.innerWidth;
    const basePositionY = w > 1024 ? (w > 1200 ? 0.2 : 0.1) : (w > 768 ? -0.6 : -0.75);
    orb.position.y = basePositionY + Math.sin(time * 1.5) * 0.08;
  }

  if (particles) {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    scrollSpeed = Math.abs(currentScroll - lastScrollTop);
    lastScrollTop = currentScroll;

    // Calculate speed factor based on how fast the page is scrolling, capped at 6.0
    const targetWarp = Math.min(scrollSpeed * 0.08, 6.0);
    currentWarp += (targetWarp - currentWarp) * 0.06; // Smooth easing interpolation

    // Slowly spin the tunnel, accelerating rotation speed when scroll warp is active
    particles.rotation.z += 0.001 + currentWarp * 0.005;

    // Subtle parallax shift linked to mouse movement
    particles.position.x += (targetX * 0.4 - particles.position.x) * 0.05;
    particles.position.y += (-targetY * 0.4 - particles.position.y) * 0.05;

    // Update individual particle positions along depth (Z) axis
    const positions = particles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      // Base speed (0.03) + dynamic scroll-linked warp velocity
      positions[i + 2] += 0.02 + currentWarp * 0.35;

      // Wrap particles that zoom past the camera (Z > 8) back to the far end of the tunnel
      if (positions[i + 2] > 8) {
        positions[i + 2] = -42;

        // Re-distribute the looped particle on a random point along the cylindrical boundary
        const r = 2.0 + Math.random() * 6.0;
        const theta = Math.random() * Math.PI * 2;
        positions[i] = r * Math.cos(theta);
        positions[i + 1] = r * Math.sin(theta);
      }
    }
    particles.geometry.attributes.position.needsUpdate = true;
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(init, 500);
});

window.updateThreeTheme = function(isLightTheme) {
  if (!orb) return;
  const wireframeMesh = orb.children[0];
  if (wireframeMesh && wireframeMesh.material.uniforms) {
    if (isLightTheme) {
      wireframeMesh.material.uniforms.uColorA.value.setHex(0x2563eb);
      wireframeMesh.material.uniforms.uColorB.value.setHex(0x7c3aed);
    } else {
      wireframeMesh.material.uniforms.uColorA.value.setHex(0x3b82f6);
      wireframeMesh.material.uniforms.uColorB.value.setHex(0x8b5cf6);
    }
  }
  if (renderer) {
    if (isLightTheme) {
      renderer.setClearColor(0xf3f4f6, 0);
      if (scene) scene.fog.color.setHex(0xf3f4f6);
    } else {
      renderer.setClearColor(0x030712, 0);
      if (scene) scene.fog.color.setHex(0x030712);
    }
  }
};
