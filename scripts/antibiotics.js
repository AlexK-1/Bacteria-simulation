class Antibiotics {
    constructor (game) {
        this.game = game; 
        this.x = 0;
        this.y = 0;
        this.width = game.width;
        this.height = game.height;
        this.textureValues = null;
        this.textureImage = null;
        this.textureImageBuffer = null;
        perlin.seed();
        this.pixelSize = 10;
        this.generateTextureValues();
        this.generateTextureBufferImage();
    }

    update () {}

    draw (context) {
        // рисование антибиотиков
        const NUM_PIXELS_X = Math.ceil(this.width/this.pixelSize);
        const NUM_PIXELS_Y = Math.ceil(this.height/this.pixelSize);
        if (this.textureImage === null) {
            this.textureImage = context.createImageData(NUM_PIXELS_X*this.pixelSize, NUM_PIXELS_Y*this.pixelSize); // создавать изображение антибиотиков, если оно ещё не создано
            this.textureImage.data.set(this.textureImageBuffer);
        }
        context.putImageData(this.textureImage, this.x, this.y);
    }

    generateTextureValues () {
        const NUM_PIXELS_X = Math.ceil(this.width/this.pixelSize);
        const NUM_PIXELS_Y = Math.ceil(this.height/this.pixelSize);
        this.textureValues = [];
        for (let y=0; y<NUM_PIXELS_Y; y++) {
            const a = [];
            for (let x=0; x<NUM_PIXELS_X; x++) {
                const v = perlin.get(x/(70*this.game.scale), y/(70*this.game.scale));
                a.push(v);
            }
            this.textureValues.push(a);
        }
    }

    generateTextureBufferImage () {
        const NUM_PIXELS_X = Math.ceil(this.width/this.pixelSize);
        const NUM_PIXELS_Y = Math.ceil(this.height/this.pixelSize);
        this.textureImageBuffer = new Uint8ClampedArray(NUM_PIXELS_X*this.pixelSize * NUM_PIXELS_Y*this.pixelSize * 4);

        const f = (x) => {if (x < 0) {return 0}; return x}

        for (let y=0; y<NUM_PIXELS_Y; y++) {
            for (let x=0; x<NUM_PIXELS_X; x++) {
                const v = f(this.textureValues[y][x]);
                for (let yp=0; yp<this.pixelSize; yp++) {
                    for (let xp=0; xp<this.pixelSize; xp++) {
                        const pos = (y*NUM_PIXELS_X*this.pixelSize*this.pixelSize + yp*NUM_PIXELS_X*this.pixelSize + x*this.pixelSize + xp) * 4;
                        this.textureImageBuffer[pos] = 105;
                        this.textureImageBuffer[pos + 1] = 224;
                        this.textureImageBuffer[pos + 2] = 247;
                        this.textureImageBuffer[pos + 3] = 255*v*1.5;
                    }
                }
            }
        }
    }
}