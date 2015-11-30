var scene, camera, renderer;

scene = new THREE.Scene();

camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.z = 150;

var sphereGeometry = new THREE.SphereBufferGeometry(70, 40, 40);
var lava = THREE.ImageUtils.loadTexture('/lava2.png');
lava.wrapS = THREE.ClampToEdgeWrapping;
lava.wrapT = THREE.ClampToEdgeWrapping;
sphereGeometry.computeVertexNormals();

var vertices = [];
var len = sphereGeometry.attributes.position.count * 3;
var t = 0;

for (var i = 0; i < len; i++) {
    t = i / Math.PI;
    if (i % 2 === 0) {
        vertices.push(Math.sin(t));
    } else {
        vertices.push(Math.cos(t));
    }
}

sphereGeometry.addAttribute('displacement', new THREE.BufferAttribute(new Float32Array(vertices), 3));

var material = new THREE.ShaderMaterial({
    uniforms: {
        time: { type: "f", value: 1.0 },
        rtime: { type: "f", value: 1.0 },
        resolution: { type: "v2", value: new THREE.Vector2(70,70) },
        texture: { type: "t", value: lava }
    },
    vertexShader: window.shader.vertex,
    fragmentShader: window.shader.fragment
});

var mesh = new THREE.Mesh( sphereGeometry, material );
scene.add( mesh );

renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );

document.body.appendChild( renderer.domElement );

var renderPass = new THREE.RenderPass( scene, camera );
var copyPass = new THREE.ShaderPass( THREE.CopyShader );
var bloomPass = new THREE.BloomPass(15, 5.5, 25, 256);
var composer = new THREE.EffectComposer(renderer);
composer.addPass(renderPass);
composer.addPass(bloomPass);
composer.addPass(copyPass);
copyPass.renderToScreen = true;

var clock = new THREE.Clock();
var t = 0;
var n = 0;

function renderLoop() {
    requestAnimationFrame(renderLoop);

    t += 0.0005;
    n += 0.005;

    material.uniforms.time.value = Math.sin(t);
    material.uniforms.rtime.value += clock.getDelta();
    mesh.position.x = Math.sin(n) * 30;
    mesh.position.y = Math.cos(n) * 30;

    composer.render(0.1);
}

renderLoop();

