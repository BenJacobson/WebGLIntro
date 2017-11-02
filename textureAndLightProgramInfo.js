class TextureAndLightProgramInfo extends ProgramInfo {

	constructor(glContext, vertexShaderSource, fragmentShaderSource) {
		super(glContext, vertexShaderSource, fragmentShaderSource);
		this.setLocations();
	}

	setLocations() {
		// uniforms
		this.mViewLocation = this.getUniformLocation('mView');
		this.mProjLocation = this.getUniformLocation('mProj');
		this.lightPointLocation = this.getUniformLocation('lightPoint');
		this.textureSamplerLocation = this.getUniformLocation('textureSampler');

		// attributes
		this.vertCoordLocation = this.getAttribLocation('vertCoord');
		this.normalLocation = this.getAttribLocation('normal');
		this.texturePointLocation = this.getAttribLocation('texturePoint');
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
