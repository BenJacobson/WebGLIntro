class ProgramInfo {

	constructor(glContext, vertexShaderSource, fragmentShaderSource) {
		// save context
		this.gl = glContext;

		// setup vertex shader
		let vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
		this.gl.shaderSource(vertexShader, vertexShaderSource);
		this.gl.compileShader(vertexShader);
		if (!this.gl.getShaderParameter(vertexShader, this.gl.COMPILE_STATUS)) {
			console.error('Failed to compile vertex shader', this.gl.getShaderInfoLog(vertexShader));
		}

		// seutp fragment shader
		let fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
		this.gl.shaderSource(fragmentShader, fragmentShaderSource);
		this.gl.compileShader(fragmentShader);
		if (!this.gl.getShaderParameter(fragmentShader, this.gl.COMPILE_STATUS)) {
			console.error('Failed to compile fragment shader', this.gl.getShaderInfoLog(fragmentShader));
		}

		// setup program
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

	use() {
		this.gl.useProgram(this.program);
	}

	getUniformLocation(name) {
		return this.gl.getUniformLocation(this.program, name);
	}

	getAttribLocation(name) {
		return this.gl.getAttribLocation(this.program, name);
	}

}