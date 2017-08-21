function GLSLAttribute(name, size, stride, offset) {
	this.name = name;
	this.size = size;
	this.stride = stride;
	this.offset = offset;
	this.location = undefined;
}

function ProgramInfo(glContext, vertexShaderSource, fragmentShaderSource) {
	this.gl = glContext;
	let vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
	this.gl.shaderSource(vertexShader, vertexShaderSource);
	this.gl.compileShader(vertexShader);
	if (!this.gl.getShaderParameter(vertexShader, this.gl.COMPILE_STATUS)) {
		console.error('Failed to compile vertex shader', this.gl.getShaderInfoLog(vertexShader));
	}

	let fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
	this.gl.shaderSource(fragmentShader, fragmentShaderSource);
	this.gl.compileShader(fragmentShader);
	if (!this.gl.getShaderParameter(fragmentShader, this.gl.COMPILE_STATUS)) {
		console.error('Failed to compile fragment shader', this.gl.getShaderInfoLog(fragmentShader));
	}

	this.program = this.gl.createProgram();
	this.gl.attachShader(this.program, vertexShader);
	this.gl.attachShader(this.program, fragmentShader);

	this.gl.linkProgram(this.program);
	if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
		console.error('Failed to link program', this.gl.getProgramInfoLog(this.program));
	}

	this.gl.validateProgram(this.program);
	if (!this.gl.getProgramParameter(this.program, this.gl.VALIDATE_STATUS)) {
		console.error('Failed to validate program', this.gl.getProgramInfoLog(this.program));
	}
}

ProgramInfo.prototype.use = function() {
	this.gl.useProgram(this.program);
}