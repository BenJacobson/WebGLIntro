class LightRenderer extends Renderer {

    constructor(programInfo, entities) {
        super(programInfo, entities, []);

        this.attributes = [
            new Attribute('vertexData', 3, this.gl.ARRAY_BUFFER, this.gl.DYNAMIC_DRAW),
            new Attribute('normalData', 3, this.gl.ARRAY_BUFFER, this.gl.DYNAMIC_DRAW),
        ];
        this.initAttributes();
        this.initIndexData();
    }

    render() {
        this.gl.bindVertexArray(this.vao);
        this.gl.drawElements(this.gl.TRIANGLES, this.indexData.length, this.gl.UNSIGNED_SHORT, 0);
    }
}
