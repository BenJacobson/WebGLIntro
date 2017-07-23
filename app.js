var vertexShaderCode = [
'precision mediump float;',
'',
'attribute vec3 coordinates;',
'attribute vec3 color;',
'',
'varying vec3 fragColor;',
'',
'void main(void) {',
'	fragColor = color;',
'	gl_Position = vec4(coordinates, 1.0);',
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

function init() {
	let canvas = document.getElementById('glCanvas');
	let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

	if (!gl) {
		alert('Your browser does not support WebGL');
		return;
	}

	function resize() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		gl.viewport(0, 0, window.innerWidth, window.innerHeight);
	}

	document.body.onresize = resize;
	resize();

	let vertexData = [
		-0.5, -0.5, 0.0,    0.5, 0.1, 0.1,
		0.5, -0.5, 0.0,     0.2, 0.9, 0.7,
		0.0, 0.5, 0.0,      0.4, 0.7, 0.7
	];

	let indexData = [
		0, 1, 2
	];

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

	gl.clearColor(0.3, 0.7, 0.5, 1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

	gl.drawElements(gl.TRIANGLES, indexData.length, gl.UNSIGNED_SHORT, 0);


}