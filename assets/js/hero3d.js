(function () {
    const canvas = document.getElementById('hero-canvas');
    const heroSection = document.getElementById('hero');

    if (!canvas || !heroSection || !window.THREE) return;

    const THREE = window.THREE;

    // ── Scene ────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        60,
        heroSection.clientWidth / heroSection.clientHeight,
        0.1,
        2000
    );
    camera.position.z = 350;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(heroSection.clientWidth, heroSection.clientHeight);
    renderer.setClearColor(0x000000, 0); // fully transparent — CSS background shows through

    // ── Node config ──────────────────────────────────────────────────────────
    const NODE_COUNT = 72;
    const BOUNDS = { x: 420, y: 260, z: 180 };
    const CONNECT_DIST = 130;
    const MAX_SEGMENTS = 250;
    const REPULSION_RADIUS = 90;

    // Flat arrays: [x0, y0, z0, x1, y1, z1, ...]
    const pos = new Float32Array(NODE_COUNT * 3);
    const vel = new Float32Array(NODE_COUNT * 3);
    const phase = new Float32Array(NODE_COUNT);

    for (let i = 0; i < NODE_COUNT; i++) {
        const b = i * 3;
        pos[b]     = (Math.random() - 0.5) * BOUNDS.x * 2;
        pos[b + 1] = (Math.random() - 0.5) * BOUNDS.y * 2;
        pos[b + 2] = (Math.random() - 0.5) * BOUNDS.z * 2;

        vel[b]     = (Math.random() - 0.5) * 0.25;
        vel[b + 1] = (Math.random() - 0.5) * 0.25;
        vel[b + 2] = (Math.random() - 0.5) * 0.12;

        phase[i] = Math.random() * Math.PI * 2;
    }

    // ── Points (nodes) ───────────────────────────────────────────────────────
    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const pointsMat = new THREE.PointsMaterial({
        color: 0x4ecdc4,
        size: 4,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.9,
    });

    const points = new THREE.Points(pointsGeo, pointsMat);
    scene.add(points);

    // ── Lines (edges) ────────────────────────────────────────────────────────
    const linePositions = new Float32Array(MAX_SEGMENTS * 2 * 3);
    const linesGeo = new THREE.BufferGeometry();
    linesGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

    const linesMat = new THREE.LineBasicMaterial({
        color: 0x64c8dc,
        transparent: true,
        opacity: 0.28,
    });

    const lines = new THREE.LineSegments(linesGeo, linesMat);
    scene.add(lines);

    // ── Colours ──────────────────────────────────────────────────────────────
    function applyColors() {
        const dark = document.body.classList.contains('dark-mode');
        pointsMat.color.set(dark ? 0x4ecdc4 : 0x5b8bd0);
        linesMat.color.set(dark ? 0x64c8dc : 0x5080c8);
        linesMat.opacity = dark ? 0.28 : 0.18;
    }

    applyColors();

    new MutationObserver(applyColors).observe(document.body, {
        attributes: true,
        attributeFilter: ['class'],
    });

    // ── Mouse repulsion ───────────────────────────────────────────────────────
    let mouseX = 0;
    let mouseY = 0;

    heroSection.addEventListener('mousemove', function (e) {
        const rect = heroSection.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / rect.width  - 0.5) * BOUNDS.x * 2;
        mouseY = -((e.clientY - rect.top)  / rect.height - 0.5) * BOUNDS.y * 2;
    });

    heroSection.addEventListener('mouseleave', function () {
        mouseX = 0;
        mouseY = 0;
    });

    // ── Resize ────────────────────────────────────────────────────────────────
    window.addEventListener('resize', function () {
        const w = heroSection.clientWidth;
        const h = heroSection.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });

    // ── Animation loop ────────────────────────────────────────────────────────
    let animId = null;
    let time = 0;

    function animate() {
        animId = requestAnimationFrame(animate);
        time += 0.008;

        // Update node positions
        for (let i = 0; i < NODE_COUNT; i++) {
            const b = i * 3;

            // Mouse repulsion (XY plane only)
            const dx = pos[b]     - mouseX;
            const dy = pos[b + 1] - mouseY;
            const dist2D = Math.sqrt(dx * dx + dy * dy);

            if (dist2D < REPULSION_RADIUS && dist2D > 0.01) {
                const force = ((REPULSION_RADIUS - dist2D) / REPULSION_RADIUS) * 0.6;
                vel[b]     += (dx / dist2D) * force;
                vel[b + 1] += (dy / dist2D) * force;
            }

            // Damping
            vel[b]     *= 0.97;
            vel[b + 1] *= 0.97;
            vel[b + 2] *= 0.97;

            // Drift
            pos[b]     += vel[b];
            pos[b + 1] += vel[b + 1];
            pos[b + 2] += vel[b + 2];

            // Bounce off bounds
            if (pos[b]     >  BOUNDS.x || pos[b]     < -BOUNDS.x) vel[b]     *= -1;
            if (pos[b + 1] >  BOUNDS.y || pos[b + 1] < -BOUNDS.y) vel[b + 1] *= -1;
            if (pos[b + 2] >  BOUNDS.z || pos[b + 2] < -BOUNDS.z) vel[b + 2] *= -1;
        }

        pointsGeo.attributes.position.needsUpdate = true;

        // Pulse node size
        pointsMat.size = 3.5 + Math.sin(time * 1.2) * 0.8;

        // Rebuild line segments between nearby nodes
        let segIdx = 0;

        outer: for (let i = 0; i < NODE_COUNT; i++) {
            const ib = i * 3;
            for (let j = i + 1; j < NODE_COUNT; j++) {
                if (segIdx >= MAX_SEGMENTS * 6) break outer;

                const jb = j * 3;
                const ex = pos[ib]     - pos[jb];
                const ey = pos[ib + 1] - pos[jb + 1];
                const ez = pos[ib + 2] - pos[jb + 2];
                const d  = Math.sqrt(ex * ex + ey * ey + ez * ez);

                if (d < CONNECT_DIST) {
                    linePositions[segIdx++] = pos[ib];
                    linePositions[segIdx++] = pos[ib + 1];
                    linePositions[segIdx++] = pos[ib + 2];
                    linePositions[segIdx++] = pos[jb];
                    linePositions[segIdx++] = pos[jb + 1];
                    linePositions[segIdx++] = pos[jb + 2];
                }
            }
        }

        // Zero out unused buffer tail and set draw range
        for (let k = segIdx; k < MAX_SEGMENTS * 6; k++) linePositions[k] = 0;
        linesGeo.attributes.position.needsUpdate = true;
        linesGeo.setDrawRange(0, segIdx / 3);

        // Slow scene rotation
        scene.rotation.y += 0.0008;

        renderer.render(scene, camera);
    }

    // Pause when tab is hidden
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            cancelAnimationFrame(animId);
            animId = null;
        } else {
            animate();
        }
    });

    animate();
})();
