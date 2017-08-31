let vertexShader = 'vertexShader.glsl';
let fragmentShader = 'fragmentShader.glsl';
let bunnyVShader = 'bunnyVShader.glsl';
let bunnyFShader = 'bunnyFShader.glsl';
let shaders = [vertexShader, fragmentShader, bunnyVShader, bunnyFShader];

let shaderPromises = shaders.map(shader => Request.makeRequest('shader/'+shader));
let shaderMap;

let shadersLoaded = Promise.all(shaderPromises).then(shaderSources => {
	shaderMap = new Map(
		shaders.map((shader, index) => {
			return [shader, shaderSources[index]];
		})
	);
});

shadersLoaded.catch(err => {
	console.error('failed to load shaders', err);
});

function init() {
	let canvas = document.getElementById('glCanvas');
	let gl = canvas.getContext('webgl2');

	if (!gl) {
		alert('Your browser does not support WebGL2');
		return;
	}

	let programInfo = new ProgramInfo(gl, shaderMap.get(vertexShader), shaderMap.get(fragmentShader));

	let blockMeshes = [new Block(10, -2.55, 10), new Block(-10, -2.55, 10), new Block(10, -2.55, -10), new Block(-10, -2.55, -10)];
	for (let i = 0; i < 1000; i++) {
		let x = Math.floor(Math.random()*1000) - 500;
		let y = -2.55;
		let z = Math.floor(Math.random()*1000) - 500;
		blockMeshes.push(new Block(x, y, z));
	}
	let blockMeshSet = new MeshSet(gl, blockMeshes, programInfo,
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
	let lightMeshSet = new MeshSet(gl, lightMeshes, programInfo,
		[
			new GLSLAttribute('vertCoord', 'vertexData', 'vertexComponents'),
			new GLSLAttribute('normal', 'normalData', 'normalComponents'),
			new GLSLAttribute('texturePoint', 'textureCoords', 'textureComponents'),
		],
		[
			'light-texture'
		]
	);


	let bunnyProgramInfo = new ProgramInfo(gl, shaderMap.get(bunnyVShader), shaderMap.get(bunnyFShader));
	let bunnyMeshes = [new Bunny(0, 10, 0)];
	let bunnyMeshSet = new MeshSet(gl, bunnyMeshes, bunnyProgramInfo,
		[
			new GLSLAttribute('vertCoord', 'vertexData', 'vertexComponents'),
			new GLSLAttribute('normal', 'normalData', 'normalComponents'),
		],
		[]
	);

	let sphereMeshes = [new Sphere(20, -10, 0, 0), new Sphere(20, 0, 0, 0), new Sphere(20, 10, 0, 0)];
	let sphereMeshSet = new MeshSet(gl, sphereMeshes, bunnyProgramInfo,
		[
			new GLSLAttribute('vertCoord', 'vertexData', 'vertexComponents'),
			new GLSLAttribute('normal', 'normalData', 'normalComponents'),
		],
		[]
	);

	// gl.clearColor(0.8, 0.9, 1.0, 1.0); // light blue
	gl.clearColor(0.0, 0.0, 0.0, 1.0); // black
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	let matViewUniformLocation = gl.getUniformLocation(programInfo.program, 'mView');
	let matProjUniformLocation = gl.getUniformLocation(programInfo.program, 'mProj');
	let lightPointUniformLocation = gl.getUniformLocation(programInfo.program, 'lightPoint');
	let matViewUniformLocationBunny = gl.getUniformLocation(bunnyProgramInfo.program, 'mView');
	let matProjUniformLocationBunny = gl.getUniformLocation(bunnyProgramInfo.program, 'mProj');
	let lightPointUniformLocationBunny = gl.getUniformLocation(bunnyProgramInfo.program, 'lightPoint');

	let viewMatrix = new Float32Array(16);
	let projMatrix = new Float32Array(16);
	mat4.identity(viewMatrix);
	mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 1.0, 5000.0);

	programInfo.use();
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
	bunnyProgramInfo.use();
	gl.uniformMatrix4fv(matViewUniformLocationBunny, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocationBunny, gl.FALSE, projMatrix);

	//
	// resize handler
	//
	function resize() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		gl.viewport(0, 0, window.innerWidth, window.innerHeight);
		mat4.perspective(projMatrix, glMatrix.toRadian(45), window.innerWidth / window.innerHeight, 1.0, 5000.0);
		programInfo.use();
		gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
		bunnyProgramInfo.use();
		gl.uniformMatrix4fv(matProjUniformLocationBunny, gl.FALSE, projMatrix);
	}
	document.body.onresize = resize;
	resize();

	//
	// state varialbes
	//
	let keysPressed = {};
	let x=0, y=0, z=-40, roty=0, rotx=0;
	let mouseX = 0;
	let mouseY = 0;
	let origin = [0, 0, 0];
	let change = true;
	let TAU = Math.PI * 2;
	let translateFactor = 15;
	let rotateFactor = 1000;
	let translateSpeed = 0.7;
	let rotateSpeed = 0.03;
	let mouseLook = false;
	let timeBased = false;

	//
	// key handler
	//
	document.body.onkeydown = (event) => {
		keysPressed[event.key] = performance.now();
	};

	document.body.onkeyup = (event) => {
		keysPressed[event.key] = undefined;
	};

	//
	// mouse handler
	//
	document.body.onmousemove = (event) => {
		mouseX = 2 * rotateSpeed * event.clientY / canvas.clientHeight - rotateSpeed;
		mouseY = 2 * rotateSpeed * event.clientX / canvas.clientWidth - rotateSpeed;
		mouseX = 10 * Math.abs(mouseX) * mouseX;
		if (Math.abs(mouseY) < 0.0001) mouseY = 0;
	};

	//
	// movement
	//
	function move() {
		let now = performance.now();
		if (keysPressed['w']) {
			let speed =  (now - keysPressed['w']) / translateFactor;
			keysPressed['w'] = now;
			let v = timeBased ?
						[0, 0, speed] :
						[0, 0, translateSpeed];
			vec3.rotateX(v, v, origin, -rotx);
			vec3.rotateY(v, v, origin, -roty);
			x += v[0];
			y += v[1];
			z += v[2];
			change = true;
		}
		if (keysPressed['s']) {
			let speed = (now - keysPressed['s']) / translateFactor;
			keysPressed['s'] = now;
			let v = timeBased ?
					[0, 0, -speed] :
					[0, 0, -translateSpeed];
			vec3.rotateX(v, v, origin, -rotx);
			vec3.rotateY(v, v, origin, -roty);
			x += v[0];
			y += v[1];
			z += v[2];
			change = true;
		}
		if (keysPressed['a']) {
			let speed = (now - keysPressed['a']) / translateFactor;
			keysPressed['a'] = now;
			let v = timeBased ?
					[speed, 0, 0] :
					[translateSpeed, 0, 0];
			vec3.rotateX(v, v, origin, -rotx);
			vec3.rotateY(v, v, origin, -roty);
			x += v[0];
			y += v[1];
			z += v[2];
			change = true;
		}
		if (keysPressed['d']) {
			let speed = (now - keysPressed['d']) / translateFactor;
			keysPressed['d'] = now;
			let v = timeBased ?
					[-speed, 0, 0] :
					[-translateSpeed, 0, 0];
			vec3.rotateX(v, v, origin, -rotx);
			vec3.rotateY(v, v, origin, -roty);
			x += v[0];
			y += v[1];
			z += v[2];
			change = true;
		}
		if (keysPressed['ArrowLeft']) {
			let speed = (now - keysPressed['ArrowLeft']) / rotateFactor;
			keysPressed['ArrowLeft'] = now;
			roty -= timeBased ?
					speed :
					rotateSpeed;
			if (roty < 0) {
				roty += TAU;
			}
			change = true;
		}
		if (keysPressed['ArrowRight']) {
			let speed = (now - keysPressed['ArrowRight']) / rotateFactor;
			keysPressed['ArrowRight'] = now;
			roty += timeBased ?
					speed :
					rotateSpeed;
			if (roty > TAU) {
				roty -= TAU;
			}
			change = true;
		}
		if (keysPressed['ArrowUp']) {
			let speed = (now - keysPressed['ArrowUp']) / rotateFactor;
			keysPressed['ArrowUp'] = now;
			rotx -= timeBased ?
					speed :
					rotateSpeed;
			if (rotx < 0) {
				rotx += TAU;
			}
			change = true;
		}
		if (keysPressed['ArrowDown']) {
			let speed = (now - keysPressed['ArrowDown']) / rotateFactor;
			keysPressed['ArrowDown'] = now;
			rotx += timeBased ?
					speed :
					rotateSpeed;
			if (rotx > TAU) {
				rotx -= TAU;
			}
			change = true;
		}
		if (mouseLook) {
			rotx = mouseX * rotateFactor;
			roty += mouseY;
			change = true;
		}
		if (change) {
			if (y > -1.0) {
				y = -1.0;
			}
			mat4.identity(viewMatrix);
			mat4.rotateX(viewMatrix, viewMatrix, rotx);
			mat4.rotateY(viewMatrix, viewMatrix, roty);
			mat4.translate(viewMatrix, viewMatrix, [x, y, z]);
			programInfo.use();
			gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
			bunnyProgramInfo.use();
			gl.uniformMatrix4fv(matViewUniformLocationBunny, gl.FALSE, viewMatrix);
			change = false;
		}
	}

	//
	// drawing
	//
	function draw() {
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
		let sunRotx = (performance.now()/1333) % TAU;
		let sunRoty = (performance.now()/917) % TAU;
		let sunRotz = (performance.now()/577) % TAU;
		let sunPoint = [Math.sin(sunRotx)*15.0, Math.sin(sunRoty)*15.0, Math.sin(sunRotz)*15.0];
		programInfo.use();
		// Blocks
		gl.bindVertexArray(blockMeshSet.vao);
		gl.uniform3f(lightPointUniformLocation, ...sunPoint);
		blockMeshSet.bindTextures();
		blockMeshSet.draw();
		// Light
		gl.bindVertexArray(lightMeshSet.vao);
		lightMeshSet.updateVertexData([new Block(...sunPoint)]);
		lightMeshSet.bindTextures();
		lightMeshSet.draw();
		// // bunny
		bunnyProgramInfo.use();
		gl.uniform3f(lightPointUniformLocationBunny, ...sunPoint);
		gl.bindVertexArray(bunnyMeshSet.vao);
		bunnyMeshSet.draw();
		// sphere
		gl.bindVertexArray(sphereMeshSet.vao);
		sphereMeshSet.draw();
	}

	//
	// Main render loop
	//
	function loop() {
		requestAnimationFrame(loop);
		move();
		draw();
	}
	requestAnimationFrame(loop);

	//
	// settings events
	//
	document.getElementById('mouseLook').addEventListener('change', function(e) {
		mouseLook = e.target.checked;
		if (!mouseLook) {
			rotx = 0;
			change = true;
		}
	});
	document.getElementById('timeBased').addEventListener('change', function(e) {
		timeBased = e.target.checked;
	});
}
