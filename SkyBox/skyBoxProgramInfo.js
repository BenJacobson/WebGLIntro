class SkyBoxProgramInfo extends ProgramInfo {

    constructor(glContext, vertexShaderSource, fragmentShaderSource) {
        super(glContext, vertexShaderSource, fragmentShaderSource);
        this.setLocations();
    }

    setLocations() {
        // uniforms
        this.mViewLocation = this.getUniformLocation('mView');
        this.mProjLocation = this.getUniformLocation('mProj');

        // attributes
        this.vertexLocation = this.getAttribLocation('vertexData');
        this.colorLocation = this.getAttribLocation('colorData');
    }

    setViewMatrix(viewMatrix) {
        const viewMatrixNoTranslation = viewMatrix.map((cell, i) => {
            return i < 12 ? cell : i % 4 == 3 ? 1 : 0;
        });
        this.gl.uniformMatrix4fv(this.mViewLocation, this.gl.FALSE, viewMatrixNoTranslation);
    }

    setProjMatrix(projMatrix) {
        this.gl.uniformMatrix4fv(this.mProjLocation, this.gl.FALSE, projMatrix);
    }
}
