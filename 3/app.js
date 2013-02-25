//-------------------------------------------------//
// 23.02.2013
// Three.js
//-------------------------------------------------//


// Declare shaders
var Shaders = {
	'texture-vertex-simulation-shader': {
		'vertex': [
			"varying vec2 vUv;",

			"void main() {",
				"vUv = vec2(uv.x, 1.0 - uv.y*3.0);",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
			"}"
		].join("\n"),
		'fragment': [
			"varying vec2 vUv;",

			"uniform vec3 origin;",
			"uniform sampler2D tPositions;",
			"uniform float timer;",

			"float rand(vec2 co) {",
				"return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);",
			"}",

			"void main() {",
				"vec3 pos = texture2D( tPositions, vUv ).xyz;",
				"if ( rand( vUv + timer ) > 0.99 ) {",
					"pos = origin;",
					"vec3 random = vec3( rand( vUv + 1.0 ) - 1.0, rand( vUv + 2.0 ) - 1.0, rand( vUv + 3.0 ) - 1.0 );",
					"pos += normalize( random ) * rand( vUv + 1.0 );",
				"} else {",
					"float x = pos.x + timer;",
					"float y = pos.y;",
					"float z = pos.z;",
					"pos.x += sin( y * 3.3 ) * cos( z * 10.3 ) * 0.005;",
					"pos.y += sin( x * 7.5 ) * cos( z * 10.5 ) * 0.005;",
					"pos.z += sin( x * 6.7 ) * cos( y * 10.7 ) * 0.005;",
				"}",
				"gl_FragColor = vec4(pos, 1.0);",
			"}"
		].join("\n")
	},
	"vs-particles": {
		"vertex": [
			"uniform sampler2D map;",
			"uniform float width;",
			"uniform float height;",
			"uniform float pointSize;",

			"varying vec2 vUv;",
			"varying vec4 vPosition;",
			"varying vec4 vColor;",

			"void main() {",
				"vec2 uv = position.xy + vec2( 1.5 / width, 0.5 / height );",
				"vec3 color = texture2D( map, uv ).rgb * 250.0 - 100.0;",
				"gl_PointSize = pointSize;",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( color, 1.0 );",
			"}"
		].join("\n"),
		"fragment": [
			"uniform vec4 pointColor;",

			"void main() {",
				"gl_FragColor = pointColor;",
			"}"
		].join("\n")
	}
};

// application
var App = {
	timer: 0,

	container: null,
	scene: null,
	camera: null,
	light: null,
	renderer: null,
	data: null,
	texture: null,

	geometry: null,
	cube: null,
	mesh: null,
	material: null,

	fboParticles: null,
	rtTexturePos: null,
	rtTexturePos2: null,
	simulationShader: null,

	planeMat: null,
	planeGeo: null,
	plane: null,

	defaults: {
		'SCREEN-WIDTH': window.innerWidth,
		'SCREEN-HEIGHT': window.innerHeight,
		'DEMO-WIDTH': 1024,
		'DEMO-HEIGHT': 1024
	}
};

App.init = function() {
	// Initialize DOM elements
	this.container = document.createElement( 'div' );
	document.body.appendChild( this.container );

	// Creating Scene
	this.scene = new THREE.Scene();

	// Creating Camera
	this.camera = new THREE.PerspectiveCamera(50, this.defaults['SCREEN-WIDTH'] / this.defaults['SCREEN-WIDTH'], 0.1, 1000000);
	this.scene.add(this.camera);

	// Creating Renderer
	this.renderer = new THREE.WebGLRenderer({
		antialias: false
	});
	this.renderer.setSize(this.defaults['SCREEN-WIDTH'], this.defaults['SCREEN-WIDTH']);
	this.container.appendChild( this.renderer.domElement );

	// Creating data texture
	this.data = new Float32Array( this.defaults['DEMO-WIDTH'] * this.defaults['DEMO-HEIGHT'] * 3 );
	this.texture = new THREE.DataTexture(
						this.data,
						this.defaults['DEMO-WIDTH'],
						this.defaults['DEMO-HEIGHT'],
						THREE.RGBFormat,
						THREE.FloatType
					);

	this.texture.minFilter = THREE.NearestFilter;
	this.texture.magFilter = THREE.NearestFilter;
	this.texture.needsUpdate = true;

	this.rtTexturePos = new THREE.WebGLRenderTarget(this.defaults['DEMO-WIDTH'], this.defaults['DEMO-HEIGHT'], {
		wrapS: THREE.RepeatWrapping,
		wrapT: THREE.RepeatWrapping,
		minFilter: THREE.NearestFilter,
		magFilter: THREE.NearestFilter,
		format: THREE.RGBFormat,
		type: THREE.FloatType,
		stencilBuffer: false
	});

	this.rtTexturePos2 = this.rtTexturePos.clone();

	// Shader
	this.simulationShader = new THREE.ShaderMaterial({
		uniforms: {
			tPositions: { type: "t", value: this.texture },
			origin: { type: "v3", value: new THREE.Vector3() },
			timer: { type: "f", value: 0 }
		},
		vertexShader: Shaders['texture-vertex-simulation-shader']['vertex'],
		fragmentShader: Shaders['texture-vertex-simulation-shader']['fragment']
	});

	this.fboParticles = new THREE.FBOUtils( this.defaults['DEMO-WIDTH'], this.renderer, this.simulationShader );
	this.fboParticles.renderToTexture(this.rtTexturePos, this.rtTexturePos2);

	this.fboParticles.in = this.rtTexturePos;
	this.fboParticles.out = this.rtTexturePos2;

	// Objects
	this.geometry = new THREE.Geometry();

	for ( var i = 0, l = this.defaults['DEMO-WIDTH'] * this.defaults['DEMO-HEIGHT']; i < l; i ++ ) {
		var vertex = new THREE.Vector3();
		vertex.x = ( i % this.defaults['DEMO-WIDTH'] ) / this.defaults['DEMO-WIDTH'] ;
		vertex.y = Math.floor( i / this.defaults['DEMO-WIDTH'] ) / this.defaults['DEMO-HEIGHT'];
		this.geometry.vertices.push( vertex );
	}

	this.material = new THREE.ShaderMaterial({
		uniforms: {
			"map": { type: "t", value: this.rtTexturePos },
			"width": { type: "f", value: this.defaults['DEMO-WIDTH'] },
			"height": { type: "f", value: this.defaults['DEMO-HEIGHT'] },
			"pointColor": { type: "v4", value: new THREE.Vector4( 1, 0.2, 0.3, 0.2 ) },
			"pointSize": { type: "f", value: 1 }
		},
		vertexShader: Shaders['vs-particles']['vertex'],
		fragmentShader: Shaders['vs-particles']['fragment'],
		blending: THREE.AdditiveBlending,
		depthWrite: false,
		depthTest: false,
		transparent: true
	});

	this.mesh = new THREE.ParticleSystem( this.geometry, this.material );
	this.scene.add(this.mesh);

	this.mesh2 = new THREE.Mesh(
		new THREE.CubeGeometry(1,1,1),
		new THREE.MeshBasicMaterial({color: 0xffffff, opacity: 0, transparent: true})
	);
	this.scene.add(this.mesh2);

	this.mesh2.position.y = -300;

};

App.animate = function() {
	requestAnimationFrame( this.animate.bind(this) );

	this.timer += 0.01;

	this.simulationShader.uniforms.timer.value = this.timer;
	this.simulationShader.uniforms.origin.value.x = Math.sin( this.timer * 2.3 ) * 0.5 + 0.5;
	this.simulationShader.uniforms.origin.value.y = Math.cos( this.timer * 2.5 ) * 0.5 + 0.5;
	this.simulationShader.uniforms.origin.value.z = Math.sin( this.timer * 3.7 ) * 0.5 + 0.5;

	var tmp = this.fboParticles.in;
	this.fboParticles.in = this.fboParticles.out;
	this.fboParticles.out = tmp;

	this.simulationShader.uniforms.tPositions.value = this.fboParticles.in;
	this.fboParticles.simulate(this.fboParticles.out);
	this.material.uniforms.map.value = this.fboParticles.out;

	this.camera.position.y = Math.sin(this.timer * 0.8) * 600;
	this.camera.position.x = Math.sin(this.timer * 0.8) * 600;
	this.camera.position.z = Math.cos(this.timer * 0.8) * 600;

	this.camera.lookAt(this.mesh2.position);

	this.renderer.render( this.scene, this.camera );
}

App.init.call(App);
App.animate.call(App);