function makeRequest(url) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };
    xhr.send();
  });
}

let vertexShaderCode, fragmentShaderCode;
let shaderPromises = ['vertexShader.glsl', 'fragmentShader.glsl'].map(shader => makeRequest('shader/'+shader));
let shadersLoaded = Promise.all(shaderPromises).then(shaderSources => {
	[vertexShaderCode, fragmentShaderCode] = shaderSources;
});

shadersLoaded.catch(err => {
	console.log('failed to load shaders', err);
});

// function Plane(x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4) {
// 	this.customVertexData = [
// 		x1, y1, z1,    0.5, 0.25, 0.05,
// 		x2, y2, z2,    0.5, 0.25, 0.05,
// 		x3, y3, z3,    0.5, 0.25, 0.05,
// 		x4, y4, z4,    0.5, 0.25, 0.05
// 	];
// 	this.vertexLength = 4;
// }

// Plane.prototype.indexData = [
// 	0, 1, 2,
// 	0, 2, 3
// ];

function init() {
	let canvas = document.getElementById('glCanvas');
	let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

	if (!gl) {
		alert('Your browser does not support WebGL');
		return;
	}

	// make all the meshes
	// let boundaries = 10000;
	// meshes.push(new Plane(
	// 	-boundaries, -2.55, -boundaries,
	// 	-boundaries, -2.55, boundaries,
	// 	 boundaries, -2.55, boundaries,
	// 	 boundaries, -2.55, -boundaries,
	// ));

	let blockMeshes = [new Block(10, -2.55, 10), new Block(-10, -2.55, 10), new Block(10, -2.55, -10), new Block(-10, -2.55, -10)];
	for (let i = 0; i < 1000; i++) {
		let x = Math.floor(Math.random()*1000) - 500;
		let y = -2.55;
		let z = Math.floor(Math.random()*1000) - 500;
		blockMeshes.push(new Block(x, y, z));
	}
	let blockMeshSet = new MeshSet(gl, blockMeshes);

	let lightMeshes = [new Block(0, 0, 0)];
	let lightMeshSet = new MeshSet(gl, lightMeshes);

	let programInfo = new ProgramInfo(gl, vertexShaderCode, fragmentShaderCode,
		[
			new GLSLAttribute('vertCoord', 3, 8, 0),
			new GLSLAttribute('normal', 3, 8, 3),
			new GLSLAttribute('texturePoint', 2, 8, 6),
		],
		[
			'block-texture'
		]
	);

	blockMeshSet.bind();
	programInfo.enableAttributes();
	blockMeshSet.unbind();

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	let matViewUniformLocation = gl.getUniformLocation(programInfo.program, 'mView');
	let matProjUniformLocation = gl.getUniformLocation(programInfo.program, 'mProj');
	let lightPointUniformLocation = gl.getUniformLocation(programInfo.program, 'lightPoint');

	let viewMatrix = new Float32Array(16);
	let projMatrix = new Float32Array(16);
	mat4.identity(viewMatrix);
	mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 1.0, 5000.0);

	programInfo.use();
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

	//
	// resize handler
	//
	function resize() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		gl.viewport(0, 0, window.innerWidth, window.innerHeight);
		mat4.perspective(projMatrix, glMatrix.toRadian(45), window.innerWidth / window.innerHeight, 1.0, 5000.0);
		gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
	}
	document.body.onresize = resize;
	resize();

	//
	// state varialbes
	//
	let keysPressed = {};
	let x=0, y=0, z=0, roty=0, rotx=0;
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
			// if (y > -1.0) {
			// 	y = -1.0;
			// }
			mat4.identity(viewMatrix);
			mat4.rotateX(viewMatrix, viewMatrix, rotx);
			mat4.rotateY(viewMatrix, viewMatrix, roty);
			mat4.translate(viewMatrix, viewMatrix, [x, y, z]);
			gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
			change = false;
		}
	}

	//
	// drawing
	//
	function draw() {
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
		programInfo.use();
		programInfo.textures.forEach((texture, i) => {
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.activeTexture(gl.TEXTURE0 + i);
		});
		let sunRot = (performance.now()/1000) % TAU;
		let sunPoint = [Math.sin(sunRot)*15.0, Math.cos(sunRot)*15.0, 0];
		gl.uniform3f(lightPointUniformLocation, ...sunPoint);
		programInfo.use();
		blockMeshSet.bind();
		blockMeshSet.draw();
		blockMeshSet.unbind();
	}

	//
	// Main render loop
	//
	function loop() {
		move();
		draw();
		requestAnimationFrame(loop);
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

// https://webglfundamentals.org/webgl/lessons/webgl-anti-patterns.html
// http://gdcvault.com/play/1020791/
