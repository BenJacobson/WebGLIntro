var vertexShaderCode = [
'precision highp float;',
'',
'attribute vec3 coordinates;',
'attribute vec3 color;',
'',
'varying vec3 fragColor;',
'',
'uniform mat4 mView;',
'uniform mat4 mProj;',
'',
'void main(void) {',
'	fragColor = color;',
'	gl_Position = mProj * mView * vec4(coordinates, 1.0);',
'}'
].join('\n');

var fragmentShaderCode = [
'precision highp float;',
'',
'varying vec3 fragColor;',
'',
'void main(void) {',
'	gl_FragColor = vec4(fragColor, 1.0);',
'}'
].join('\n');

function Block(x, y, z) {
	this.customVertexData = this.vertexData.map((v, i) => {
		return v +
			(i % 6 == 0 ? x : 0) +
			(i % 6 == 1 ? y : 0) +
			(i % 6 == 2 ? z : 0);
	});
	this.vertexLength = 24;
}

Block.prototype.vertexData = 
[ // X, Y, Z           R, G, B
	// Top
	-1.0, 1.0, -1.0,   0.5, 0.5, 0.5,
	-1.0, 1.0, 1.0,    0.5, 0.5, 0.5,
	1.0, 1.0, 1.0,     0.5, 0.5, 0.5,
	1.0, 1.0, -1.0,    0.5, 0.5, 0.5,

	// Left
	-1.0, 1.0, 1.0,    0.75, 0.25, 0.5,
	-1.0, -1.0, 1.0,   0.75, 0.25, 0.5,
	-1.0, -1.0, -1.0,  0.75, 0.25, 0.5,
	-1.0, 1.0, -1.0,   0.75, 0.25, 0.5,

	// Right
	1.0, 1.0, 1.0,     0.25, 0.25, 0.75,
	1.0, -1.0, 1.0,    0.25, 0.25, 0.75,
	1.0, -1.0, -1.0,   0.25, 0.25, 0.75,
	1.0, 1.0, -1.0,    0.25, 0.25, 0.75,

	// Front
	1.0, 1.0, 1.0,     1.0, 0.0, 0.15,
	1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
	-1.0, -1.0, 1.0,   1.0, 0.0, 0.15,
	-1.0, 1.0, 1.0,    1.0, 0.0, 0.15,

	// Back
	1.0, 1.0, -1.0,    0.0, 1.0, 0.15,
	1.0, -1.0, -1.0,   0.0, 1.0, 0.15,
	-1.0, -1.0, -1.0,  0.0, 1.0, 0.15,
	-1.0, 1.0, -1.0,   0.0, 1.0, 0.15,

	// Bottom
	-1.0, -1.0, -1.0,  0.5, 0.5, 1.0,
	-1.0, -1.0, 1.0,   0.5, 0.5, 1.0,
	1.0, -1.0, 1.0,    0.5, 0.5, 1.0,
	1.0, -1.0, -1.0,   0.5, 0.5, 1.0,
];

Block.prototype.indexData =
[
	// Top
	0, 1, 2,
	0, 2, 3,

	// Left
	5, 4, 6,
	6, 4, 7,

	// Right
	8, 9, 10,
	8, 10, 11,

	// Front
	13, 12, 14,
	15, 14, 12,

	// Back
	16, 17, 18,
	16, 18, 19,

	// Bottom
	21, 20, 22,
	22, 20, 23
];

function Plane(x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4) {
	this.customVertexData = [
		x1, y1, z1,    0.5, 0.25, 0.05,
		x2, y2, z2,    0.5, 0.25, 0.05,
		x3, y3, z3,    0.5, 0.25, 0.05,
		x4, y4, z4,    0.5, 0.25, 0.05
	];
	this.vertexLength = 6;
}

Plane.prototype.indexData = [
	0, 1, 2,
	0, 2, 3
];

function init() {
	let canvas = document.getElementById('glCanvas');
	let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

	if (!gl) {
		alert('Your browser does not support WebGL');
		return;
	}

	// make all the meshes
	let meshes = []; // [new Block(-3, -3, 0), new Block(3, 3, 0), new Block(-3, 3, 0), new Block(3, -3, 0), new Block(0, 0, 0)];
	for (let i = 0; i < 1000; i++) {
		let x = Math.floor(Math.random()*1000) - 500;
		let y = -1.5;
		let z = Math.floor(Math.random()*1000) - 500;
		meshes.push(new Block(x, y, z));
	}
	let boundaries = 10000;
	meshes.push(new Plane(
		-boundaries, -2.55, -boundaries,
		-boundaries, -2.55, boundaries,
		 boundaries, -2.55, boundaries,
		 boundaries, -2.55, -boundaries,
	));

	let vertexData = Array.prototype.concat.apply([], meshes.map(p => p.customVertexData));
	let offset = 0;
	let indexData = Array.prototype.concat.apply([], meshes.map((p, m) => {
		let ret = p.indexData.map(i => i + offset);
		offset += p.vertexLength;
		return ret;
	}));


	let vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	let indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	let vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, vertexShaderCode);
	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		console.error('Failed to compile vertex shader');
		return;
	}

	let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, fragmentShaderCode);
	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.error('Failed to compile fragment shader');
		return;
	}

	let shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);

	gl.linkProgram(shaderProgram);
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		console.error('Failed to link program');
		return;
	}

	gl.validateProgram(shaderProgram);
	if (!gl.getProgramParameter(shaderProgram, gl.VALIDATE_STATUS)) {
		console.error('Failed to validate program');
		return;
	}

	gl.useProgram(shaderProgram);
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

	let attributeCoord = gl.getAttribLocation(shaderProgram, 'coordinates');
	gl.vertexAttribPointer(
		attributeCoord,
		3,
		gl.FLOAT,
		gl.FALSE,
		6*Float32Array.BYTES_PER_ELEMENT,
		0*Float32Array.BYTES_PER_ELEMENT
	);

	let attributeColor = gl.getAttribLocation(shaderProgram, 'color');
	gl.vertexAttribPointer(
		attributeColor,
		3,
		gl.FLOAT,
		gl.FALSE,
		6*Float32Array.BYTES_PER_ELEMENT,
		3*Float32Array.BYTES_PER_ELEMENT
	);

	gl.enableVertexAttribArray(attributeCoord);
	gl.enableVertexAttribArray(attributeColor);

	gl.clearColor(0.7, 0.9, 1.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	let matViewUniformLocation = gl.getUniformLocation(shaderProgram, 'mView');
	let matProjUniformLocation = gl.getUniformLocation(shaderProgram, 'mProj');

	let viewMatrix = new Float32Array(16);
	let projMatrix = new Float32Array(16);
	mat4.identity(viewMatrix);
	mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 1.0, 5000.0);

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
			if (y > -1.0) {
				y = -1.0;
			}
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
		gl.drawElements(gl.TRIANGLES, indexData.length, gl.UNSIGNED_SHORT, 0);
	}

	//
	// Main render loop
	//
	function loop() {
		move();
		draw();
		requestAnimationFrame(loop);
	};
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
