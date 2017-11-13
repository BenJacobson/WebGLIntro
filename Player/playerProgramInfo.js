class PlayerProgramInfo extends ProgramInfo {

    constructor(glContext, vertexShaderSource, fragmentShaderSource) {
        super(glContext, vertexShaderSource, fragmentShaderSource);
        this.setLocations();
    }

    setLocations() {
        // uniforms
        this.mViewLocation = this.getUniformLocation('mView');
        this.mProjLocation = this.getUniformLocation('mProj');

        // attributes
        this.vertexDataLocation = this.getAttribLocation('vertexData');
    }

    setViewMatrix(viewMatrix) {
        this.gl.uniformMatrix4fv(this.mViewLocation, this.gl.FALSE, viewMatrix);
    }

    setProjMatrix(projMatrix) {
        this.gl.uniformMatrix4fv(this.mProjLocation, this.gl.FALSE, projMatrix);
    }
}
