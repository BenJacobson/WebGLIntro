class SkyBox {

    constructor(precision, size) {
        // normal data
        this.normalComponents = 3;
        this.normalData = [0, -1, 0];
        for (let i = 1; i < precision; i++) {
            let rads = Math.PI * i / precision;
            let y = -Math.cos(rads);
            let arm = Math.abs(Math.sin(rads));
            for (let j = 0; j < precision; j++) {
                let rads = 2 * Math.PI * j / precision;
                let x = Math.cos(rads) * arm;
                let z = Math.sin(rads) * arm;
                this.normalData = this.normalData.concat([x, y, z]);
            }
        }
        this.normalData = this.normalData.concat([0, 1, 0]);
        // vertex data
        this.vertexComponents = 3;
        this.vertexData = this.normalData.map((v, i) => {
            let offset = i % this.vertexComponents;
            return v * size;
        });
        // index data
        this.indexComponents = 3;
        this.indexData = [];
        for (let i = 1; i < precision+1; i++) {
            let next = (i % precision == 0 ? i - precision : i) + 1;
            this.indexData = this.indexData.concat([0, i, next]);
        }
        for (let i = 0; i < precision-2; i++) {
            for (let j = 0; j < precision; j++) {
                let offset = 1 + j +(i*precision);
                let wrap = offset % precision == 0;
                this.indexData = this.indexData.concat([
                    offset, wrap ? offset + 1 - precision : offset + 1, offset+precision,
                    offset+precision, wrap ? offset + 1 : offset + 1 + precision, wrap ? offset + 1 - precision : offset + 1
                ]);
            }
        }
        let start = 1 + (precision * (precision - 2));
        for (let i = start; i < precision + start; i++) {
            let next = (i % precision == 0 ? i - precision : i) + 1;
            this.indexData = this.indexData.concat([i, next, precision + start]);
        }
        // vertex length
        this.vertexLength = precision * (precision-1) + 2;
    }
}
