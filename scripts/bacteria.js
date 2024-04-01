const random = function(a, b) {
    return Math.floor(Math.random() * (b-a)) + a
}

class Bacteria {
    // класс бактерии
    constructor(game, x, y, parentGenome) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 18;
        this.height = 18;
        this.speed = 1;
        //this.maxAge = 2500;
        //this.maxEnergy = 2000;
        this.age = 0;
        this.energy = ENERGY_START;
        //this.energyUsage = 1;
        this.reprInterval = 70;
        this.reprTime = -200;
        //this.reprCost = 500;
        this.speedX = 0;
        this.speedY = 0;
        const image = new Image();
        image.src = `../images/bacteria_3.png`;
        image.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = this.width;
            canvas.height = this.height;
            const context = canvas.getContext("2d");

            context.drawImage(image, 0, 0, this.width, this.height);
            context.globalCompositeOperation = "color"; // source-in
            context.fillStyle = `hsl(${this.color}, 50%, 50%)`;
            context.fillRect(0, 0, this.width, this.height);
            context.globalCompositeOperation = "destination-in";
            context.drawImage(image, 0, 0, this.width, this.height);

            this.imageSpecies = new Image();
            this.imageSpecies.src = canvas.toDataURL();
            this.image = this.imageSpecies;

            context.clearRect(0, 0, canvas.width, canvas.height);

            context.globalCompositeOperation = "source-over";
            context.drawImage(image, 0, 0, this.width, this.height);
            context.globalCompositeOperation = "color";
            context.fillStyle = `rgb(${this.skillBite*(1-this.skillFood)*255},0,${this.skillFood*(1-this.skillBite)*255})`;
            context.fillRect(0, 0, this.width, this.height);
            context.globalCompositeOperation = "destination-in";
            context.drawImage(image, 0, 0, this.width, this.height);

            this.imageSkills = new Image();
            this.imageSkills.src = canvas.toDataURL();

            canvas.remove();
        };
        //this.vision = 200;
        this.skillFood = 0;
        this.skillBite = 0;
        this.energyUsageThisTick = this.energyUsage;

        let genome;
        
        this.net = new Network([ // структура нейросети бактерий
            //new Layer(17, 4, "sigmoid", false),
            //new Layer(4, 2, "tanh", false)
            new Layer(17, 2, "tanh", false)
        ]);

        this.color = undefined; 
        if (typeof parentGenome === "undefined") {
            this.color = random(0, 359);
            this.size = random(11, 30);
            this.speed = 4/this.size;
            this.skillFood = randomFloat(0, 1);
            this.skillBite = randomFloat(0, 1);
        } else {
            genome = JSON.parse(parentGenome);
            this.color = genome.color;
            this.size = genome.size + randomFloat(-0.1, 0.1);
            this.skillFood = genome.skills.food + randomFloat(-0.05, 0.05);
            this.skillBite = genome.skills.bite + randomFloat(-0.05, 0.05);
            let newWeights = genome.weights;
            newWeights[random(0, newWeights.length)] = randomFloat(-1, 1);
            this.net.loadWeights(newWeights);
            if (randomFloat(0, 0.99) < MUT_CHANCE) {
                this.net.mutate(MUT_SIZE);
                const color_change = random(-40, 40);
                this.color += color_change;
                this.size += random(9, -9);
                this.speed = 4/this.size;
                this.skillFood += randomFloat(-0.5, 0.5);
                this.skillBite += randomFloat(-0.5, 0.5);
            }
            if (this.color < 0)     this.color = 0;
            if (this.color > 360)   this.color = 360;
            if (this.skillBite < 0) this.skillBite = 0;
            if (this.skillBite > 1) this.skillBite = 1;
            if (this.skillFood < 0) this.skillFood = 0;
            if (this.skillFood > 1) this.skillFood = 1;
            if (this.size < 1)      this.size = 1;
            if (this.size > 40)     this.size = 40;
            this.wait = 0;
        }
        this.width = this.height = this.size;
        
        if (this.x > this.game.width-this.width*this.game.scale) this.x = this.game.width-this.width*this.game.scale;
        if (this.x < 0) this.x = 0;
        if (this.y > this.game.height-this.height*this.game.scale) this.y = this.game.height-this.height*this.game.scale;
        if (this.y < 0) this.y = 0;
    }

    update() {
        if (typeof this.wait === "number") {
            this.wait ++;
        }
        //console.log(this.wait);
        if (typeof this.wait === "undefined" || this.wait > DELAY_START) {
        this.foodX = 0;
        this.foodY = 0;
        this.foodI = 0;
        this.nearestFoodX = null;
        this.nearestFoodY = null;
        this.nearestFoodDistance = Infinity;
        this.game.food.forEach(element => {
            const fX = element.x-this.x;
            const fY = element.y-this.y;
            const fD = Math.sqrt(fX**2+fY**2);
            if (fD < VISION*this.game.scale) {
                this.foodX += fX;
                this.foodY += fY;
                this.foodI += 1;
                if (fD < this.nearestFoodDistance) {
                    this.nearestFoodDistance = fD;
                    this.nearestFoodX = fX;
                    this.nearestFoodY = fY;
                }
            }
        });

        this.otherBacteriaMX = 0; // M - свои бактерии
        this.otherBacteriaMY = 0;
        this.otherBacteriaMI = 0;
        this.otherBacteriaLX = 0; // L - менее хищные бактерии
        this.otherBacteriaLY = 0;
        this.otherBacteriaLI = 0;
        this.otherBacteriaHX = 0; // H - более хищные бактерии
        this.otherBacteriaHY = 0;
        this.otherBacteriaHI = 0;

        this.nearestBacteriaMX = null;
        this.nearestBacteriaMY = null;
        this.nearestBacteriaMDistance = Infinity;
        this.nearestBacteriaLX = null;
        this.nearestBacteriaLY = null;
        this.nearestBacteriaLDistance = Infinity;
        this.nearestBacteriaHX = null;
        this.nearestBacteriaHY = null;
        this.nearestBacteriaHDistance = Infinity;
        for(let element of this.game.bacteria) {
            if (element === this) continue;
            const fX = element.x-this.x;
            const fY = element.y-this.y;
            const fD = Math.sqrt(fX**2+fY**2);
            if (fD < VISION*this.game.scale) {
                if (element.skillBite < this.skillBite+0.1 && element.skillBite > this.skillBite-0.1) {
                    this.otherBacteriaMX += fX;
                    this.otherBacteriaMY += fY;
                    this.otherBacteriaMI += 1;
                    if (fD < this.nearestBacteriaMDistance) {
                        this.nearestBacteriaMDistance = fD;
                        this.nearestBacteriaMX = fX;
                        this.nearestBacteriaMY = fY;
                    }
                }
                if (element.skillBite < this.skillBite-0.1) {
                    this.otherBacteriaLX += fX;
                    this.otherBacteriaLY += fY;
                    this.otherBacteriaLI += 1;
                    if (fD < this.nearestBacteriaLDistance) {
                        this.nearestBacteriaLDistance = fD;
                        this.nearestBacteriaLX = fX;
                        this.nearestBacteriaLY = fY;
                    }
                }
                if (element.skillBite > this.skillBite+0.1) {
                    this.otherBacteriaHX += fX;
                    this.otherBacteriaHY += fY;
                    this.otherBacteriaHI += 1;
                    if (fD < this.nearestBacteriaHDistance) {
                        this.nearestBacteriaHDistance = fD;
                        this.nearestBacteriaHX = fX;
                        this.nearestBacteriaHY = fY;
                    }
                }
            }
        }

        let newSpeedX, newSpeedY;
        [newSpeedX, newSpeedY] = this.net.run([this.foodX/this.foodI, this.foodY/this.foodI, this.nearestFoodX, this.nearestFoodY,
                                                this.otherBacteriaMX/this.otherBacteriaMI, this.otherBacteriaMY/this.otherBacteriaMI, this.nearestBacteriaMX, this.nearestBacteriaMY,
                                                this.otherBacteriaLX/this.otherBacteriaLI, this.otherBacteriaLY/this.otherBacteriaLI, this.nearestBacteriaLX, this.nearestBacteriaLY,
                                                this.otherBacteriaHX/this.otherBacteriaHI, this.otherBacteriaHY/this.otherBacteriaHI, this.nearestBacteriaHX, this.nearestBacteriaHY,
                                                this.energyUsageThisTick]); // запуск нейросети
        /*[newSpeedX, newSpeedY] = this.net.run([this.foodX/this.foodI, this.foodY/this.foodI,
                                                this.otherBacteriaMX/this.otherBacteriaMI, this.otherBacteriaMY/this.otherBacteriaMI,
                                                this.otherBacteriaLX/this.otherBacteriaLI, this.otherBacteriaLY/this.otherBacteriaLI,
                                                this.otherBacteriaHX/this.otherBacteriaHI, this.otherBacteriaHY/this.otherBacteriaHI,
                                                this.energyUsageThisTick]); // запуск нейросети*/
        this.speedX += newSpeedX*this.speed*this.game.scale;
        this.speedY += newSpeedY*this.speed*this.game.scale;
        this.speedX *= 0.85;
        this.speedY *= 0.85;
        this.x += this.speedX*SPEED;
        this.y += this.speedY*SPEED;
        if (this.x > this.game.width-this.width*this.game.scale) this.x = this.game.width-this.width*this.game.scale;
        if (this.x < 0) this.x = 0;
        if (this.y > this.game.height-this.height*this.game.scale) this.y = this.game.height-this.height*this.game.scale;
        if (this.y < 0) this.y = 0;

        const f = (x) => {if (x < 0) {return 0}; return x}
    
        this.energyUsageThisTick = ENERGY_USAGE + f(this.game.antibiotics.textureValues[Math.floor(this.y/this.game.antibiotics.pixelSize)][Math.floor(this.x/this.game.antibiotics.pixelSize)])*HARM_ANTIBIOTICS*USE_ANTIBIOTICS;
        this.energy -= this.energyUsageThisTick;
        this.age ++;
        this.reprTime ++;
        }
    }

    draw(context) {
        // рисование бактерии
        /*context.beginPath();
        context.moveTo(this.x+this.width*this.game.scale/2, this.y+this.height*this.game.scale/2);
        context.strokeStyle = 'red';
        context.lineWidth = 3;
        context.lineTo((this.otherBacteriaHX/this.otherBacteriaHI)+this.x+this.width*this.game.scale/2, (this.nearestBacteriaHY/this.otherBacteriaHI)+this.y+this.height*this.game.scale/2);
        context.closePath();
        context.stroke();*/

        if (this.game.displayMode === "type" && this.imageSpecies) {
            /*context.beginPath();
            context.fillStyle = `HSL(${this.color},100%, 50%)`
            context.arc(this.x+this.height*this.game.scale/2, this.y+this.width*this.game.scale/2, this.height*0.5*this.game.scale, 0, 2 * Math.PI, false);
            context.fill();*/

            context.save();
            context.translate(this.x+this.width*this.game.scale/2, this.y+this.height*this.game.scale/2);
            context.rotate(Math.atan2(this.speedY, this.speedX)+0.8);
            context.translate(-(this.x+this.width*this.game.scale/2), -(this.y+this.height*this.game.scale/2));
            context.drawImage(this.imageSpecies, this.x, this.y, this.width*this.game.scale, this.height*this.game.scale);
            context.restore();
        }

        if (this.game.displayMode === "skills" && this.imageSkills) {
            /*context.beginPath();
            context.fillStyle = `RGB(${this.skillBite*(1-this.skillFood)*255},0,${this.skillFood*(1-this.skillBite)*255})`
            context.arc(this.x+this.height*this.game.scale/2, this.y+this.width*this.game.scale/2, this.height*0.5*this.game.scale, 0, 2 * Math.PI, false);
            context.fill();*/

            context.save();
            context.translate(this.x+this.width*this.game.scale/2, this.y+this.height*this.game.scale/2);
            context.rotate(Math.atan2(this.speedY, this.speedX)+0.8);
            context.translate(-(this.x+this.width*this.game.scale/2), -(this.y+this.height*this.game.scale/2));
            context.drawImage(this.imageSkills, this.x, this.y, this.width*this.game.scale, this.height*this.game.scale);
            context.restore();
        }
    }

    getGenome() {
        const network_structure = {layers: []};
        for (let layer of this.net.layers) {
            network_structure.layers.push({inputs: layer.inputSize, outputs: layer.numberNeurons, bias: layer.bias, activation: layer.activation});
        }
        return JSON.stringify({weights: this.net.getWeights(), color: this.color, size: this.size, skills: {food: this.skillFood, bite: this.skillBite}, network_structure: network_structure});
    }
}