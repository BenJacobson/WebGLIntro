class App {
	constructor() {
		this.camara = new ThirdPersonCamara(0.5, 0);
		this.origin = [0, 0, 0];
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
		this.playerVert = 'Player/Shader/player.vert';
		this.playerFrag = 'Player/Shader/player.frag';
		const assetNames = [
			this.textureAndLightVert, this.textureAndLightFrag,
			this.lightVert, this.lightFrag,
			this.skyBoxVert, this.skyBoxFrag,
			this.terrainVert, this.terrainFrag,
			this.playerVert, this.playerFrag,
		];
		// Load shaders
		const assetPromises = assetNames.map(assetName => Request.makeRequest(assetName));
		this.assetsLoaded = Promise.all(assetPromises).then(assetSources => {
			this.assetMap = new Map(
				assetNames.map((asset, index) => {
					return [asset, assetSources[index]];
				})
			);
		});
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
		this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.depthFunc(this.gl.LEQUAL);
	}

	initScene() {
		this.terrainProgramInfo = new TerrainProgramInfo(this.gl, this.assetMap.get(this.terrainVert), this.assetMap.get(this.terrainFrag));
		this.terrainRenderer = new TerrainRenderer(this.terrainProgramInfo);

		this.textureAndLightProgramInfo = new TextureAndLightProgramInfo(this.gl, this.assetMap.get(this.textureAndLightVert), this.assetMap.get(this.textureAndLightFrag));

		const size = 2.0;
		const y = size;
		const radius = Terrain.prototype.radius;
		const radiusSquared = radius * radius;
		this.blockMeshes = [
			new Block(10, y, 10, size),
			new Block(-10, y, 10, size),
			new Block(10, y, -10, size),
			new Block(-10, y, -10, size)
		];
		for (let i = 0; i < 1000; i++) {
			const x = Math.random() * radius * (Math.random() > 0.5 ? 1 : -1);
			const z = Math.random() * radius * (Math.random() > 0.5 ? 1 : -1);
			if (Math.abs(x) * Math.abs(z) < radiusSquared) {
				this.blockMeshes.push(new Block(x, y, z, size));
			}
		}
		this.blockRenderer = new BlockRenderer(this.textureAndLightProgramInfo, this.blockMeshes, ['block-texture']);

		this.lightBlock = new Block(0, 0, 0);
		const lightMeshes = [this.lightBlock];
		this.lightBlockRenderer = new BlockRenderer(this.textureAndLightProgramInfo, lightMeshes, ['light-texture']);

		this.lightProgramInfo = new LightProgramInfo(this.gl, this.assetMap.get(this.lightVert), this.assetMap.get(this.lightFrag));
		const lightEntities = [new Bunny(0, 10, 0), new Sphere(20, -10, 0, 0), new Sphere(20, 0, 0, 0), new Sphere(20, 10, 0, 0)];
		this.lightRenderer = new LightRenderer(this.lightProgramInfo, lightEntities);

		this.skyBoxProgramInfo = new SkyBoxProgramInfo(this.gl, this.assetMap.get(this.skyBoxVert), this.assetMap.get(this.skyBoxFrag));
		this.skyBoxRenderer = new SkyBoxRenderer(this.skyBoxProgramInfo);

		this.playerProgramInfo = new PlayerProgramInfo(this.gl, this.assetMap.get(this.playerVert), this.assetMap.get(this.playerFrag));
		this.player = new Player(0, 1.0, 0);
		this.playerRenderer = new PlayerRenderer(this.playerProgramInfo, this.player);

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
		this.playerProgramInfo.use();
		this.playerProgramInfo.setProjMatrix(this.projMatrix);
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
		this.playerProgramInfo.use();
		this.playerProgramInfo.setViewMatrix(this.viewMatrix);
	}

	collision() {
		for (const point of this.player.boundingBox()) {
			for (const block of this.blockMeshes) {
				if (block.contains.apply(block, point)) {
					return true;
				}
			}
		}
		return false;
	}

	processMovement() {
		const now = performance.now();

		let change = false;

		const getTranslateSpeed = key => {
			const speed = (now - this.keysPressed[key]) / this.translateFactor;
			this.keysPressed[key] = now;
			change = true;
			return this.timeBased ? speed : this.translateSpeed;
		};

		const getRotateSpeed = key => {
			const speed = (now - this.keysPressed[key]) / this.rotateFactor;
			this.keysPressed[key] = now;
			change = true;
			return this.timeBased ? speed : this.rotateSpeed;
		};

		if (this.keysPressed['w']) {
			const speed = getTranslateSpeed('w');
			this.player.moveForward(speed, this.camara.roty);
		}
		if (this.keysPressed['s']) {
			const speed = getTranslateSpeed('s');
			this.player.moveBackward(speed, this.camara.roty);
		}
		if (this.keysPressed['a']) {
			const speed = getTranslateSpeed('a');
			this.player.moveLeft(speed, this.camara.roty);
		}
		if (this.keysPressed['d']) {
			const speed = getTranslateSpeed('d');
			this.player.moveRight(speed, this.camara.roty);
		}

		if (this.keysPressed['ArrowLeft']) {
			this.camara.rotateLeft(getRotateSpeed('ArrowLeft'));
		}
		if (this.keysPressed['ArrowRight']) {
			this.camara.rotateRight(getRotateSpeed('ArrowRight'));
		}
		if (this.keysPressed['ArrowUp']) {
			this.camara.rotateForward(getRotateSpeed('ArrowUp'));
		}
		if (this.keysPressed['ArrowDown']) {
			this.camara.rotateBackward(getRotateSpeed('ArrowDown'));
		}

		if (this.mouseLook) {
			this.camara.rotx = this.mouseX * this.rotateFactor;
			this.camara.roty += this.mouseY;
			this.camara.change = true;
		}
		if (change || this.camara.change) {
			if (this.player.y > -1.0) {
				this.camara.y = -1.0;
			}
			this.camara.setFocus(this.player.getLocation());
			mat4.identity(this.viewMatrix);
			mat4.rotateX(this.viewMatrix, this.viewMatrix, this.camara.rotx);
			mat4.rotateY(this.viewMatrix, this.viewMatrix, this.camara.roty);
			mat4.translate(this.viewMatrix, this.viewMatrix, this.camara.getLocation());
			this.setViewMatrix();
			this.camara.change = false;

			this.playerProgramInfo.use();
			if (this.collision()) {
				this.playerProgramInfo.setColor([1.0, 0.0, 0.0]);
			} else {
				this.playerProgramInfo.setColor([0.0, 0.0, 1.0]);
			}
		}
	}

	updateState() {
		const sunRotx = (performance.now()/1333) % this.TAU;
		const sunRoty = (performance.now()/917) % this.TAU;
		const sunRotz = (performance.now()/577) % this.TAU;
		const sunPoint = [Math.sin(sunRotx)*15.0, Math.sin(sunRoty)*15.0, Math.sin(sunRotz)*15.0];

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

		this.playerProgramInfo.use();
		this.playerRenderer.checkUpdates();
		this.playerRenderer.render();
	}

	gameLoop() {
		requestAnimationFrame(() => this.gameLoop());
		this.processMovement();
		this.updateState();
		this.render();
	}
}

const app = new App();
