class SkyBox {
    constructor() {
        this.vertexLength = 8;
        this.size = 500;
        this.vertexData = SkyBox.prototype.vertexData.map(vertexComponent => {
            return vertexComponent * this.size;
        });
    }
}

SkyBox.prototype.colorData = [
    1.0, 0.0, 0.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
];

SkyBox.prototype.vertexData = [
    -1.0, -1.0, -1.0,
    -1.0, -1.0, 1.0,
    -1.0, 1.0, -1.0,
    -1.0, 1.0, 1.0,
    1.0, -1.0, -1.0,
    1.0, -1.0, 1.0,
    1.0, 1.0, -1.0,
    1.0, 1.0, 1.0,
];

SkyBox.prototype.indexData =
[
    // Top
    2, 3, 7,
    2, 7, 6,

    // Left
    1, 3, 0,
    0, 3, 2,

    // Right
    7, 5, 4,
    7, 4, 6,

    // Front
    5, 7, 1,
    3, 1, 7,

    // Back
    6, 4, 0,
    6, 0, 2,

    // Bottom
    1, 0, 4,
    5, 1, 4,
];
