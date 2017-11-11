class App {
	constructor() {
		this.camara = new Camara(0, 0, -50, 0, 0);
		this.keysPressed = {};
		this.mouseX = 0;
		this.mouseY = 0;
		this.TAU = Math.PI * 2;
		this.translateFactor = 15;
		this.rotateFactor = 1000;
		this.translateSpeed = 0.7;
		this.rotateSpeed = 0.03;
		this.mouseLook = false;
		this.timeBased = false;

		this.viewMatrix = new Float32Array(16);
		this.projMatrix = new Float32Array(16);

		this.loadAssets();
	}

	loadAssets() {
		// Identify assets
		this.textureAndLightVert = 'TextureAndLight/Shader/textureAndLight.vert';
		this.textureAndLightFrag = 'TextureAndLight/Shader/textureAndLight.frag';
		this.lightVert = 'Light/Shader/light.vert';
		this.lightFrag = 'Light/Shader/light.frag';
		this.skyBoxVert = 'SkyBox/Shader/skyBox.vert';
		this.skyBoxFrag = 'SkyBox/Shader/skyBox.frag';
		this.terrainVert = 'Terrain/Shader/terrain.vert';
		this.terrainFrag = 'Terrain/Shader/terrain.frag';
		let assetNames = [
			this.textureAndLightVert, this.textureAndLightFrag,
			this.lightVert, this.lightFrag,
			this.skyBoxVert, this.skyBoxFrag,
			this.terrainVert, this.terrainFrag,
		];
		// Load shaders
		let assetPromises = assetNames.map(assetName => Request.makeRequest(assetName));
		this.assetsLoaded = Promise.all(assetPromises).then(function(assetSources) {
			this.assetMap = new Map(
				assetNames.map((asset, index) => {
					return [asset, assetSources[index]];
				})
			);
		}.bind(this));
		this.assetsLoaded.catch(err => {
			console.error('failed to load assets', err);
		});
	}

	start() {
		this.assetsLoaded.then(() => this.init());
	}

	init() {
		this.canvas = document.getElementById('glCanvas');
		this.gl = this.canvas.getContext('webgl2');

		if (!this.gl) {
			alert('Your browser does not support WebGL2');
			return;
		}

		this.initWebGLSettings();

		this.initScene();

		this.initEvents();

		this.resizeHandler();

		requestAnimationFrame(() => this.gameLoop());
	}

	initWebGLSettings() {
		// gl.clearColor(0.8, 0.9, 1.0, 1.0); // light blue
		this.gl.clearColor(0.0, 0.0, 0.0, 1.0); // black
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.depthFunc(this.gl.LEQUAL);
	}

	initScene() {
		this.textureAndLightProgramInfo = new TextureAndLightProgramInfo(this.gl, this.assetMap.get(this.textureAndLightVert), this.assetMap.get(this.textureAndLightFrag));

		const blockMeshes = [new Block(10, -2.55, 10), new Block(-10, -2.55, 10), new Block(10, -2.55, -10), new Block(-10, -2.55, -10)];
		for (let i = 0; i < 1000; i++) {
			let x = Math.floor(Math.random()*1000) - 500;
			let y = -2.55;
			let z = Math.floor(Math.random()*1000) - 500;
			blockMeshes.push(new Block(x, y, z));
		}
		this.blockRenderer = new BlockRenderer(this.textureAndLightProgramInfo, blockMeshes, ['block-texture']);

		this.lightBlock = new Block(0, 0, 0);
		const lightMeshes = [this.lightBlock];
		this.lightBlockRenderer = new BlockRenderer(this.textureAndLightProgramInfo, lightMeshes, ['light-texture']);

		this.lightProgramInfo = new LightProgramInfo(this.gl, this.assetMap.get(this.lightVert), this.assetMap.get(this.lightFrag));
		const lightEntities = [new Bunny(0, 10, 0), new Sphere(20, -10, 0, 0), new Sphere(20, 0, 0, 0), new Sphere(20, 10, 0, 0)];
		this.lightRenderer = new LightRenderer(this.lightProgramInfo, lightEntities);

		this.skyBoxProgramInfo = new SkyBoxProgramInfo(this.gl, this.assetMap.get(this.skyBoxVert), this.assetMap.get(this.skyBoxFrag));
		this.skyBoxRenderer = new SkyBoxRenderer(this.skyBoxProgramInfo);

		this.terrainProgramInfo = new TerrainProgramInfo(this.gl, this.assetMap.get(this.terrainVert), this.assetMap.get(this.terrainFrag));
		this.terrainRenderer = new TerrainRenderer(this.terrainProgramInfo);

		mat4.identity(this.viewMatrix);
		mat4.perspective(this.projMatrix, glMatrix.toRadian(45), this.canvas.clientWidth / this.canvas.clientHeight, 1.0, 5000.0);

		this.setViewMatrix();
		this.setProjMatrix();
	}

	initEvents() {
		//
		// resize handler
		//
		document.body.onresize = () => this.resizeHandler();

		//
		// key handler
		//
		document.body.onkeydown = (event) => {
			this.keysPressed[event.key] = performance.now();
		};

		document.body.onkeyup = (event) => {
			this.keysPressed[event.key] = undefined;
		};

		//
		// mouse handler
		//
		document.body.onmousemove = (event) => {
			this.mouseX = 2 * this.rotateSpeed * event.clientY / this.canvas.clientHeight - this.rotateSpeed;
			this.mouseY = 2 * this.rotateSpeed * event.clientX / this.canvas.clientWidth - this.rotateSpeed;
			this.mouseX = 10 * Math.abs(this.mouseX) * this.mouseX;
			if (Math.abs(this.mouseY) < 0.0001) this.mouseY = 0;
		};

		//
		// settings events
		//
		document.getElementById('mouseLook').addEventListener('change', function(e) {
			this.mouseLook = e.target.checked;
			if (!this.mouseLook) {
				this.camara.rotx = 0;
				this.camara.change = true;
			}
		});
		document.getElementById('timeBased').addEventListener('change', function(e) {
			this.timeBased = e.target.checked;
		});
	}

	resizeHandler() {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.gl.viewport(0, 0, window.innerWidth, window.innerHeight);
		mat4.perspective(this.projMatrix, glMatrix.toRadian(45), window.innerWidth / window.innerHeight, 1.0, 5000.0);
		this.setProjMatrix();
	}

	setProjMatrix() {
		this.textureAndLightProgramInfo.use();
		this.textureAndLightProgramInfo.setProjMatrix(this.projMatrix);
		this.lightProgramInfo.use();
		this.lightProgramInfo.setProjMatrix(this.projMatrix);
		this.skyBoxProgramInfo.use();
		this.skyBoxProgramInfo.setProjMatrix(this.projMatrix);
		this.terrainProgramInfo.use();
		this.terrainProgramInfo.setProjMatrix(this.projMatrix);
	}

	setViewMatrix() {
		this.textureAndLightProgramInfo.use();
		this.textureAndLightProgramInfo.setViewMatrix(this.viewMatrix);
		this.lightProgramInfo.use();
		this.lightProgramInfo.setViewMatrix(this.viewMatrix);
		this.skyBoxProgramInfo.use();
		this.skyBoxProgramInfo.setViewMatrix(this.viewMatrix);
		this.terrainProgramInfo.use();
		this.terrainProgramInfo.setViewMatrix(this.viewMatrix);
	}

	processMovement() {
		let now = performance.now();
		if (this.keysPressed['w']) {
			let speed =  (now - this.keysPressed['w']) / this.translateFactor;
			this.keysPressed['w'] = now;
			this.camara.moveForward(this.timeBased ? speed : this.translateSpeed);
		}
		if (this.keysPressed['s']) {
			let speed = (now - this.keysPressed['s']) / this.translateFactor;
			this.keysPressed['s'] = now;
			this.camara.moveBackward(this.timeBased ? speed : this.translateSpeed);
		}
		if (this.keysPressed['a']) {
			let speed = (now - this.keysPressed['a']) / this.translateFactor;
			this.keysPressed['a'] = now;
			this.camara.moveLeft(this.timeBased ? speed : this.translateSpeed);
		}
		if (this.keysPressed['d']) {
			let speed = (now - this.keysPressed['d']) / this.translateFactor;
			this.keysPressed['d'] = now;
			this.camara.moveRight(this.timeBased ? speed : this.translateSpeed);
		}
		if (this.keysPressed['ArrowLeft']) {
			let speed = (now - this.keysPressed['ArrowLeft']) / this.rotateFactor;
			this.keysPressed['ArrowLeft'] = now;
			this.camara.rotateLeft(this.timeBased ? speed : this.rotateSpeed);
		}
		if (this.keysPressed['ArrowRight']) {
			let speed = (now - this.keysPressed['ArrowRight']) / this.rotateFactor;
			this.keysPressed['ArrowRight'] = now;
			this.camara.rotateRight(this.timeBased ? speed : this.rotateSpeed);
		}
		if (this.keysPressed['ArrowUp']) {
			let speed = (now - this.keysPressed['ArrowUp']) / this.rotateFactor;
			this.keysPressed['ArrowUp'] = now;
			this.camara.rotateForward(this.timeBased ? speed : this.rotateSpeed);
		}
		if (this.keysPressed['ArrowDown']) {
			let speed = (now - this.keysPressed['ArrowDown']) / this.rotateFactor;
			this.keysPressed['ArrowDown'] = now;
			this.camara.rotateBackward(this.timeBased ? speed : this.rotateSpeed);
		}
		if (this.mouseLook) {
			this.camara.rotx = this.mouseX * this.rotateFactor;
			this.camara.roty += this.mouseY;
			this.camara.change = true;
		}
		if (this.camara.change) {
			if (this.camara.y > -1.0) {
				this.camara.y = -1.0;
			}
			mat4.identity(this.viewMatrix);
			mat4.rotateX(this.viewMatrix, this.viewMatrix, this.camara.rotx);
			mat4.rotateY(this.viewMatrix, this.viewMatrix, this.camara.roty);
			mat4.translate(this.viewMatrix, this.viewMatrix, this.camara.getLocation());
			this.setViewMatrix();
			this.camara.change = false;
		}
	}

	updateState() {
		let sunRotx = (performance.now()/1333) % this.TAU;
		let sunRoty = (performance.now()/917) % this.TAU;
		let sunRotz = (performance.now()/577) % this.TAU;
		let sunPoint = [Math.sin(sunRotx)*15.0, Math.sin(sunRoty)*15.0, Math.sin(sunRotz)*15.0];

		this.textureAndLightProgramInfo.use();
		this.textureAndLightProgramInfo.setLightPoint(sunPoint);

		this.lightProgramInfo.use();
		this.lightProgramInfo.setLightPoint(sunPoint);

		this.lightBlock.updateVertexData(...sunPoint);
	}

	render() {
		this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT);

		this.textureAndLightProgramInfo.use();
		this.blockRenderer.bindTextures();
		this.blockRenderer.render();
		this.lightBlockRenderer.checkUpdates();
		this.lightBlockRenderer.bindTextures();
		this.lightBlockRenderer.render();

		this.lightProgramInfo.use();
		this.lightRenderer.render();

		this.skyBoxProgramInfo.use();
		this.skyBoxRenderer.render();

		this.terrainProgramInfo.use();
		this.terrainRenderer.render();
	}

	gameLoop() {
		requestAnimationFrame(() => this.gameLoop());
		this.processMovement();
		this.updateState();
		this.render();
	}
}

const app = new App();
