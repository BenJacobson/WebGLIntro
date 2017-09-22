class TextureAndLightProgramInfo extends ProgramInfo {

	constructor(glContext, vertexShaderSource, fragmentShaderSource) {
		super(glContext, vertexShaderSource, fragmentShaderSource);
		this.setLocations();
	}

	setLocations() {
		// uniforms
		this.mViewLocation = this.gl.getUniformLocation(this.program, 'mView');
		this.mProjLocation = this.gl.getUniformLocation(this.program, 'mProj');
		this.lightPointLocation = this.gl.getUniformLocation(this.program, 'lightPoint');
		this.textureSamplerLocation = this.gl.getUniformLocation(this.program, 'textureSampler');

		// attributes
		this.vertCoordLocation = this.gl.getAttribLocation(this.program, 'vertCoord');
		this.normalLocation = this.gl.getAttribLocation(this.program, 'normal');
		this.texturePointLocation = this.gl.getAttribLocation(this.program, 'texturePoint');
	}

	setViewMatrix(viewMatrix) {
		this.gl.uniformMatrix4fv(this.mViewLocation, this.gl.FALSE, viewMatrix);
	}

	setProjMatrix(projMatrix) {
		this.gl.uniformMatrix4fv(this.mProjLocation, this.gl.FALSE, projMatrix);
	}

	setLightPoint(lightPoint) {
		this.gl.uniform3f(this.lightPointLocation, ...lightPoint);
	}
}
