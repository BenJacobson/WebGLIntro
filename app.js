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
		this.textureAndLightVert = 'shader/textureAndLight.vert';
		this.textureAndLightFrag = 'shader/textureAndLight.frag';
		this.lightVert = 'shader/light.vert';
		this.lightFrag = 'shader/light.frag';
		let assetNames = [this.textureAndLightVert, this.textureAndLightFrag, this.lightVert, this.lightFrag];
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

	draw() {
		this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT);
		let sunRotx = (performance.now()/1333) % this.TAU;
		let sunRoty = (performance.now()/917) % this.TAU;
		let sunRotz = (performance.now()/577) % this.TAU;
		let sunPoint = [Math.sin(sunRotx)*15.0, Math.sin(sunRoty)*15.0, Math.sin(sunRotz)*15.0];
		this.textureAndLightProgramInfo.use();
		// Blocks
		this.gl.bindVertexArray(this.blockMeshSet.vao);
		this.textureAndLightProgramInfo.setLightPoint(sunPoint);
		this.blockMeshSet.bindTextures();
		this.blockMeshSet.draw();
		// Light
		this.gl.bindVertexArray(this.lightMeshSet.vao);
		this.lightMeshSet.updateVertexData([new Block(...sunPoint)]);
		this.lightMeshSet.bindTextures();
		this.lightMeshSet.draw();
		// // bunny
		this.lightProgramInfo.use();
		this.lightProgramInfo.setLightPoint(sunPoint);
		this.gl.bindVertexArray(this.bunnyMeshSet.vao);
		this.bunnyMeshSet.draw();
		// sphere
		this.gl.bindVertexArray(this.sphereMeshSet.vao);
		this.sphereMeshSet.draw();
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
			this.textureAndLightProgramInfo.use();
			this.textureAndLightProgramInfo.setViewMatrix(this.viewMatrix);
			this.lightProgramInfo.use();
			this.lightProgramInfo.setViewMatrix(this.viewMatrix);
			this.camara.change = false;
		}
	}

	resizeHandler() {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.gl.viewport(0, 0, window.innerWidth, window.innerHeight);
		mat4.perspective(this.projMatrix, glMatrix.toRadian(45), window.innerWidth / window.innerHeight, 1.0, 5000.0);
		this.textureAndLightProgramInfo.use();
		this.textureAndLightProgramInfo.setProjMatrix(this.projMatrix);
		this.lightProgramInfo.use();
		this.lightProgramInfo.setProjMatrix(this.projMatrix);
	}

	init() {
		this.canvas = document.getElementById('glCanvas');
		this.gl = this.canvas.getContext('webgl2');

		if (!this.gl) {
			alert('Your browser does not support WebGL2');
			return;
		}

		this.textureAndLightProgramInfo = new TextureAndLightProgramInfo(this.gl, this.assetMap.get(this.textureAndLightVert), this.assetMap.get(this.textureAndLightFrag));

		let blockMeshes = [new Block(10, -2.55, 10), new Block(-10, -2.55, 10), new Block(10, -2.55, -10), new Block(-10, -2.55, -10)];
		for (let i = 0; i < 1000; i++) {
			let x = Math.floor(Math.random()*1000) - 500;
			let y = -2.55;
			let z = Math.floor(Math.random()*1000) - 500;
			blockMeshes.push(new Block(x, y, z));
		}
		this.blockMeshSet = new MeshSet(this.gl, blockMeshes, this.textureAndLightProgramInfo,
			[
				new GLSLAttribute('vertCoord', 'vertexData', 'vertexComponents'),
				new GLSLAttribute('normal', 'normalData', 'normalComponents'),
				new GLSLAttribute('texturePoint', 'textureCoords', 'textureComponents'),
			],
			[
				'block-texture'
			]
		);

		let lightMeshes = [new Block(0, 0, 0, true)];
		this.lightMeshSet = new MeshSet(this.gl, lightMeshes, this.textureAndLightProgramInfo,
			[
				new GLSLAttribute('vertCoord', 'vertexData', 'vertexComponents'),
				new GLSLAttribute('normal', 'normalData', 'normalComponents'),
				new GLSLAttribute('texturePoint', 'textureCoords', 'textureComponents'),
			],
			[
				'light-texture'
			]
		);


		this.lightProgramInfo = new LightProgramInfo(this.gl, this.assetMap.get(this.lightVert), this.assetMap.get(this.lightFrag));
		let bunnyMeshes = [new Bunny(0, 10, 0)];
		this.bunnyMeshSet = new MeshSet(this.gl, bunnyMeshes, this.lightProgramInfo,
			[
				new GLSLAttribute('vertCoord', 'vertexData', 'vertexComponents'),
				new GLSLAttribute('normal', 'normalData', 'normalComponents'),
			],
			[]
		);

		let sphereMeshes = [new Sphere(20, -10, 0, 0), new Sphere(20, 0, 0, 0), new Sphere(20, 10, 0, 0)];
		this.sphereMeshSet = new MeshSet(this.gl, sphereMeshes, this.lightProgramInfo,
			[
				new GLSLAttribute('vertCoord', 'vertexData', 'vertexComponents'),
				new GLSLAttribute('normal', 'normalData', 'normalComponents'),
			],
			[]
		);

		// gl.clearColor(0.8, 0.9, 1.0, 1.0); // light blue
		this.gl.clearColor(0.0, 0.0, 0.0, 1.0); // black
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.depthFunc(this.gl.LEQUAL);

		mat4.identity(this.viewMatrix);
		mat4.perspective(this.projMatrix, glMatrix.toRadian(45), this.canvas.clientWidth / this.canvas.clientHeight, 1.0, 5000.0);

		this.textureAndLightProgramInfo.use();
		this.textureAndLightProgramInfo.setViewMatrix(this.viewMatrix);
		this.textureAndLightProgramInfo.setProjMatrix(this.projMatrix);
		this.lightProgramInfo.use();
		this.lightProgramInfo.setViewMatrix(this.viewMatrix);
		this.lightProgramInfo.setProjMatrix(this.projMatrix);

		document.body.onresize = this.resizeHandler.bind(this);
		this.resizeHandler();

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
		// Main render loop
		//
		function loop() {
			requestAnimationFrame(loop.bind(this));
			this.processMovement();
			this.draw();
		}
		requestAnimationFrame(loop.bind(this));

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
}

let app = new App();
