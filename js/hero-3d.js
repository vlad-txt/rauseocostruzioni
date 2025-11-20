// Three.js Hero Scene
document.addEventListener('DOMContentLoaded', () => {
    const canvasContainer = document.getElementById('hero-canvas');
    if (!canvasContainer) return;

    // Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, 10, 50);
    scene.background = new THREE.Color(0xf0f0f0); // Light grey background matching site theme

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 2, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    canvasContainer.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Materials
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const greyMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const redMat = new THREE.MeshStandardMaterial({ color: 0xb91d1d }); // Brand Red
    const blueMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.5, roughness: 0.1 }); // Solar panel blue

    // Group for all objects
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // Ground
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xe5e7eb });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    worldGroup.add(ground);

    // --- Wind Turbines ---
    const turbines = [];

    function createTurbine(x, z, scale = 1) {
        const turbineGroup = new THREE.Group();
        turbineGroup.position.set(x, 0, z);
        turbineGroup.scale.set(scale, scale, scale);

        // Pole
        const poleGeo = new THREE.CylinderGeometry(0.2, 0.4, 8, 8);
        const pole = new THREE.Mesh(poleGeo, whiteMat);
        pole.position.y = 2; // Half height - 2 (ground is at -2) -> actually base is at -2, height 8 means center at 2
        turbineGroup.add(pole);

        // Hub
        const hubGeo = new THREE.SphereGeometry(0.3, 8, 8);
        const hub = new THREE.Mesh(hubGeo, whiteMat);
        hub.position.y = 6;
        hub.position.z = 0.3;

        // Blades Group (to rotate)
        const bladesGroup = new THREE.Group();
        bladesGroup.position.y = 6;
        bladesGroup.position.z = 0.3;

        // Blade Geometry
        const bladeGeo = new THREE.BoxGeometry(0.3, 3.5, 0.1);

        for (let i = 0; i < 3; i++) {
            const blade = new THREE.Mesh(bladeGeo, whiteMat);
            const angle = (i * 2 * Math.PI) / 3;
            blade.position.x = Math.sin(angle) * 1.5;
            blade.position.y = Math.cos(angle) * 1.5;
            blade.rotation.z = -angle;
            bladesGroup.add(blade);
        }

        turbineGroup.add(hub);
        turbineGroup.add(bladesGroup);

        worldGroup.add(turbineGroup);
        turbines.push({ group: turbineGroup, blades: bladesGroup, speed: 0.02 + Math.random() * 0.02 });
    }

    createTurbine(-8, -5, 1.2);
    createTurbine(-12, -2, 0.9);
    createTurbine(10, -8, 1.5);

    // --- Solar Panels ---
    function createSolarPanel(x, z) {
        const panelGroup = new THREE.Group();
        panelGroup.position.set(x, -1.5, z);

        // Stand
        const standGeo = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
        const stand1 = new THREE.Mesh(standGeo, greyMat);
        stand1.position.set(-0.5, 0, 0);
        const stand2 = new THREE.Mesh(standGeo, greyMat);
        stand2.position.set(0.5, 0, 0);

        // Panel
        const panelGeo = new THREE.BoxGeometry(1.5, 0.1, 1);
        const panel = new THREE.Mesh(panelGeo, blueMat);
        panel.position.y = 0.5;
        panel.rotation.x = Math.PI / 6; // Tilt

        panelGroup.add(stand1);
        panelGroup.add(stand2);
        panelGroup.add(panel);

        worldGroup.add(panelGroup);
    }

    for (let i = 0; i < 5; i++) {
        createSolarPanel(5 + i * 1.8, 2);
        createSolarPanel(5 + i * 1.8, 4);
    }

    // --- Abstract Buildings ---
    function createBuilding(x, z, width, height, depth) {
        const geo = new THREE.BoxGeometry(width, height, depth);
        const mesh = new THREE.Mesh(geo, whiteMat);
        mesh.position.set(x, height / 2 - 2, z);

        // Add some red accents
        const accentGeo = new THREE.BoxGeometry(width + 0.1, 0.2, depth + 0.1);
        const accent = new THREE.Mesh(accentGeo, redMat);
        accent.position.set(x, height - 2, z);

        worldGroup.add(mesh);
        worldGroup.add(accent);
    }

    createBuilding(-5, 5, 3, 4, 3);
    createBuilding(-2, 2, 2, 6, 2);
    createBuilding(2, -3, 4, 3, 4);


    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        // Rotate Turbines
        turbines.forEach(t => {
            t.blades.rotation.z -= t.speed;
        });

        // Gentle Camera Movement
        const time = Date.now() * 0.0005;
        camera.position.x = Math.sin(time) * 2;
        camera.position.y = 5 + Math.cos(time * 0.5) * 1;
        camera.lookAt(0, 2, 0);

        renderer.render(scene, camera);
    }

    animate();

    // Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});
