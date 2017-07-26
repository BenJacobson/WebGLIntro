var vertexShaderCode = [
'precision mediump float;',
'',
'attribute vec3 coordinates;',
'attribute vec3 color;',
'attribute mat4 mWorld;',
'',
'varying vec3 fragColor;',
'',
'uniform mat4 mView;',
'uniform mat4 mProj;',
'',
'void main(void) {',
'	fragColor = color;',
'	mat4 test = mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);',
'	gl_Position = mProj * mView * mWorld * vec4(coordinates, 1.0);',
'}'
].join('\n');

var fragmentShaderCode = [
'precision mediump float;',
'',
'varying vec3 fragColor;',
'',
'void main(void) {',
'	gl_FragColor = vec4(fragColor, 1.0);',
'}'
].join('\n');

function Block(x, y, z) {
	let worldMatrix = new Float32Array(16);
	mat4.identity(worldMatrix);
	this.customVertexData = new Array(this.vertexData.length/6 * 22);
	let index = 0;
	for (let i = 0; i < this.vertexData.length;) {
		this.customVertexData[index++] = this.vertexData[i++] + x; // x
		this.customVertexData[index++] = this.vertexData[i++] + y; // y
		this.customVertexData[index++] = this.vertexData[i++] + z; // z
		this.customVertexData[index++] = this.vertexData[i++]; // r
		this.customVertexData[index++] = this.vertexData[i++]; // g
		this.customVertexData[index++] = this.vertexData[i++]; // b
		for (let k = 0; k < 16; k++) {
			this.customVertexData[index++] = worldMatrix[k];
		}
	}
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

function init() {
	let canvas = document.getElementById('glCanvas');
	let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

	if (!gl) {
		alert('Your browser does not support WebGL');
		return;
	}

	// make all the meshes
	let meshes = [new Block(-3, -3, 0)];

	let vertexData = Array.prototype.concat.apply([], meshes.map(p => p.customVertexData));
	let indexData = Array.prototype.concat.apply([], meshes.map(p => p.indexData));

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
		22*Float32Array.BYTES_PER_ELEMENT,
		0*Float32Array.BYTES_PER_ELEMENT
	);

	let attributeColor = gl.getAttribLocation(shaderProgram, 'color');
	gl.vertexAttribPointer(
		attributeColor,
		3,
		gl.FLOAT,
		gl.FALSE,
		22*Float32Array.BYTES_PER_ELEMENT,
		3*Float32Array.BYTES_PER_ELEMENT
	);

	let attributeMWorld = gl.getAttribLocation(shaderProgram, 'mWorld');
	gl.vertexAttribPointer(
		attributeMWorld,
		4,
		gl.FLOAT,
		gl.FALSE,
		22*Float32Array.BYTES_PER_ELEMENT,
		6*Float32Array.BYTES_PER_ELEMENT
	);
	gl.vertexAttribPointer(
		attributeMWorld+1,
		4,
		gl.FLOAT,
		gl.FALSE,
		22*Float32Array.BYTES_PER_ELEMENT,
		10*Float32Array.BYTES_PER_ELEMENT
	);
	gl.vertexAttribPointer(
		attributeMWorld+2,
		4,
		gl.FLOAT,
		gl.FALSE,
		22*Float32Array.BYTES_PER_ELEMENT,
		14*Float32Array.BYTES_PER_ELEMENT
	);
	gl.vertexAttribPointer(
		attributeMWorld+3,
		4,
		gl.FLOAT,
		gl.FALSE,
		22*Float32Array.BYTES_PER_ELEMENT,
		18*Float32Array.BYTES_PER_ELEMENT
	);

	gl.enableVertexAttribArray(attributeCoord);
	gl.enableVertexAttribArray(attributeColor);
	gl.enableVertexAttribArray(attributeMWorld);
	gl.enableVertexAttribArray(attributeMWorld+1);
	gl.enableVertexAttribArray(attributeMWorld+2);
	gl.enableVertexAttribArray(attributeMWorld+3);

	gl.clearColor(0.3, 0.7, 0.5, 1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	let matViewUniformLocation = gl.getUniformLocation(shaderProgram, 'mView');
	let matProjUniformLocation = gl.getUniformLocation(shaderProgram, 'mProj');

	let viewMatrix = new Float32Array(16);
	let projMatrix = new Float32Array(16);
	mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);
	mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);

	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

	//
	// resize handler
	//
	function resize() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		gl.viewport(0, 0, window.innerWidth, window.innerHeight);
		mat4.perspective(projMatrix, glMatrix.toRadian(45), window.innerWidth / window.innerHeight, 0.1, 1000.0);
		gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
	}
	document.body.onresize = resize;
	resize();

	//
	// Main render loop
	//
	let identityMatrix = new Float32Array(16);
	mat4.identity(identityMatrix);
	let angle = 0;
	let loop = function() {
		angle = performance.now() / 1000 / 6 * 2 * Math.PI;

		gl.clearColor(0.75, 0.85, 0.8, 1.0);
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
		gl.drawElements(gl.TRIANGLES, indexData.length, gl.UNSIGNED_SHORT, 0);

		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);
}

// https://webglfundamentals.org/webgl/lessons/webgl-anti-patterns.html
