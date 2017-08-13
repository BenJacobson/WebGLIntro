function GLSLAttribute(name, size, stride, offset) {
	this.name = name;
	this.size = size;
	this.stride = stride;
	this.offset = offset;
	this.location = undefined;
}

function ProgramInfo(glContext, vertexShaderSource, fragmentShaderSource, attributes, textureIds) {
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

	this.attributes = attributes;
	this.attributes.forEach(attribute => {
		attribute.location = this.gl.getAttribLocation(this.program, attribute.name);
	});

	this.textures = textureIds.map(textureId => {
		let texture = this.gl.createTexture();
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
		this.gl.texImage2D(
			this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA,
			this.gl.UNSIGNED_BYTE,
			document.getElementById(textureId)
		);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
		this.gl.bindTexture(this.gl.TEXTURE_2D, null);
		return texture;
	});
}

ProgramInfo.prototype.use = function() {
	this.gl.useProgram(this.program);
}

ProgramInfo.prototype.enableAttributes = function() {
	this.attributes.forEach(attribute => {
		this.gl.vertexAttribPointer(
			attribute.location,
			attribute.size,
			this.gl.FLOAT,
			this.gl.FALSE,
			attribute.stride*Float32Array.BYTES_PER_ELEMENT,
			attribute.offset*Float32Array.BYTES_PER_ELEMENT
		);
		this.gl.enableVertexAttribArray(attribute.location);
	});
}

ProgramInfo.prototype.disableAttributes = function() {
	this.attributes.forEach(attribute => {
		this.gl.disableVertexAttribArray(attribute.location);
	});
}

ProgramInfo.prototype.bindTextures = function(indecies) {
	indecies.forEach((index, i) => {
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[index]);
		this.gl.activeTexture(this.gl.TEXTURE0 + i);
	});
}