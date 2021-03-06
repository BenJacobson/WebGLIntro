class SkyBoxRenderer extends Renderer {

    constructor(programInfo) {
        super(programInfo, [new SkyBox(30, 1000)], []);

        this.attributes = [
            new Attribute('vertexData', 3, this.gl.ARRAY_BUFFER, this.gl.STATIC_DRAW),
        ];
        this.initAttributes();
        this.initIndexData();
    }

    render() {
        this.gl.bindVertexArray(this.vao);
        this.gl.drawElements(this.gl.TRIANGLES, this.indexData.length, this.gl.UNSIGNED_SHORT, 0);
    }
}
