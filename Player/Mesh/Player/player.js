class Player {
    constructor(x=0, y=0, z=0) {
        this.vertexLength = 24;
        this.vertexComponents = 3;
        this.updateVertexData(x, y, z);
        this.vertexDataUpdated = false;
    }

    updateVertexData(x, y, z) {
        this.vertexData = Player.prototype.vertexData.map((v, i) => {
            let offset = i % this.vertexComponents;
            return v +
                (offset == 0 ? x : 0) +
                (offset == 1 ? y : 0) +
                (offset == 2 ? z : 0);
        });
        this.vertexDataUpdated = true;
    }

    moveForward(d) {
        this.updateVertexData(0, 0, d);
    }

    moveBackward(d) {
        this.moveForward(-d);
    }

    moveLeft(d) {
        this.updateVertexData(d, 0, 0);
    }

    moveRight(d) {
        this.moveLeft(-d);
    }
}

Player.prototype.normalData = [
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,

    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,

    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,

    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,

    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,

    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
];

Player.prototype.textureCoords = [
    0.0, 0.0,
    0.0, 1.0,
    1.0, 1.0,
    1.0, 0.0,

    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,

    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,

    1.0, 1.0,
    1.0, 0.0,
    0.0, 0.0,
    0.0, 1.0,

    0.0, 0.0,
    0.0, 1.0,
    1.0, 1.0,
    1.0, 0.0,

    1.0, 1.0,
    1.0, 0.0,
    0.0, 0.0,
    0.0, 1.0,
];

Player.prototype.vertexData = [
    // Top
    -1.0, 1.0, -1.0,
    -1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, -1.0,

    // Left
    -1.0, 1.0, 1.0,
    -1.0, -1.0, 1.0,
    -1.0, -1.0, -1.0,
    -1.0, 1.0, -1.0,

    // Right
    1.0, 1.0, 1.0,
    1.0, -1.0, 1.0,
    1.0, -1.0, -1.0,
    1.0, 1.0, -1.0,

    // Front
    1.0, 1.0, 1.0,
    1.0, -1.0, 1.0,
    -1.0, -1.0, 1.0,
    -1.0, 1.0, 1.0,

    // Back
    1.0, 1.0, -1.0,
    1.0, -1.0, -1.0,
    -1.0, -1.0, -1.0,
    -1.0, 1.0, -1.0,

    // Bottom
    -1.0, -1.0, -1.0,
    -1.0, -1.0, 1.0,
    1.0, -1.0, 1.0,
    1.0, -1.0, -1.0,
];

Player.prototype.indexData =
[
    // Top
    0, 1, 2,
    0, 2, 3,

    // Left
    5, 4, 6,
    6, 4, 7,

    // Right
    8, 9, 10,
    8, 10, 11,

    // Front
    13, 12, 14,
    15, 14, 12,

    // Back
    16, 17, 18,
    16, 18, 19,

    // Bottom
    21, 20, 22,
    22, 20, 23
];
