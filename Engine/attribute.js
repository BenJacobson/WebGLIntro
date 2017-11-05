class Attribute {
    constructor(name, size, bufferType, drawType, stride, offset) {
        this.name = name;
        this.size = size;
        this.bufferType = bufferType;
        this.drawType = drawType;
        this.stride = stride || size;
        this.offset = offset || 0;
    }
}