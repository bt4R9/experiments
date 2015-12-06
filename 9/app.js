var scene = new THREE.Scene();
var camera = new THREE.Camera();
var renderer = new THREE.WebGLRenderer({ antialias: true });

camera.position.z = 1;

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild(renderer.domElement);

var lava = THREE.ImageUtils.loadTexture('lava.jpg');
lava.wrapS = THREE.RepeatWrapping;
lava.wrapT = THREE.RepeatWrapping;

var lavaNRM = THREE.ImageUtils.loadTexture('lava_NRM.png');
lavaNRM.wrapS = THREE.ClampToEdgeWrapping;
lavaNRM.wrapT = THREE.ClampToEdgeWrapping;

var planeGeometry = new THREE.PlaneBufferGeometry(2, 2);
var planeMaterial = new THREE.ShaderMaterial({
    uniforms: {
        texture: { type: "t", value: lava },
        textureNormal: { type: "t", value: lavaNRM },
        light: { type: 'f', value: 0.12 },
        mouse: { type: 'v2', value: new THREE.Vector2() },
        res: { type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    },
    vertexShader: document.getElementById('shaderVertex').innerText,
    fragmentShader: document.getElementById('shaderFragment').innerText
});
var plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);

document.onmousemove = function(e) {
    planeMaterial.uniforms.mouse.value.x = e.clientX;
    planeMaterial.uniforms.mouse.value.y = e.clientY;
};

function renderLoop() {
    requestAnimationFrame(renderLoop);
    renderer.render(scene, camera);
}

renderLoop();
