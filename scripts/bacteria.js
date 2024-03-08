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
        //this.maxAge = 2400 + Math.floor(Math.random()*200);
        this.maxAge = 2500;
        this.maxEnergy = 2000;
        this.age = 0;
        this.energy = 400;
        this.energyUsage = 1;
        this.reprInterval = 70;
        this.reprTime = -200;
        this.reprCost = 500;
        this.speedX = 0;
        this.speedY = 0;
        this.image = new Image();
        //this.image.src = `/images/bacteria_${random(0, 12)}.png`;
        this.image.src = `/images/bacteria_3.png`;
        this.vision = 200;
        this.skillFood = 0;
        this.skillBite = 0;

        let genome;
        
        this.net = new Network([ // структура нейросети бактерий
            new Layer(6, 2, "tanh", false)
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
            this.size = genome.size;
            this.skillFood = genome.skills.food + randomFloat(-0.05, 0.05);
            this.skillBite = genome.skills.bite + randomFloat(-0.05, 0.05);
            let newWeights = genome.weights;
            newWeights[random(0, newWeights.length)] = randomFloat(-1, 1);
            this.net.loadWeights(newWeights);
            if (randomFloat(0, 0.99) < 0.07) {
                this.net.mutate(0.05);
                const color_change = random(-40, 40);
                this.color += color_change;
                this.size += random(7, -7);
                this.speed = 4/this.size;
                this.skillFood += randomFloat(-0.2, 0.2);
                this.skillBite += randomFloat(-0.2, 0.2);
            }
            this.wait = 0;
        }
        this.width = this.height = this.size;
    }

    update() {
        if (typeof this.wait === "number") {
            this.wait ++;
        }
        //console.log(this.wait);
        if (typeof this.wait === "undefined" || this.wait > 50) {
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
            if (fD < this.vision*this.game.scale) {
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

        this.otherBacteriaX = 0;
        this.otherBacteriaY = 0;
        this.otherBacteriaI = 0;
        for(let element of this.game.bacteria) {
            if (element === this) continue;
            const fX = element.x-this.x;
            const fY = element.y-this.y;
            if (Math.sqrt(fX**2+fY**2) < this.vision*this.game.scale) {
                this.otherBacteriaX += fX;
                this.otherBacteriaY += fY;
                this.otherBacteriaI += 1;
            }
        }

        let newSpeedX, newSpeedY;
        [newSpeedX, newSpeedY] = this.net.run([this.foodX/this.foodI, this.foodY/this.foodI, this.nearestFoodX, this.nearestFoodY, this.otherBacteriaX/this.otherBacteriaI, this.otherBacteriaY/this.otherBacteriaI]); // запуск нейросети
        //[newSpeedX, newSpeedY] = this.net.run([this.foodX/this.foodI, this.foodY/this.foodI, this.otherBacteriaX/this.otherBacteriaI, this.otherBacteriaY/this.otherBacteriaI]);
        this.speedX += newSpeedX*this.speed*this.game.scale;
        this.speedY += newSpeedY*this.speed*this.game.scale;
        this.speedX *= 0.85;
        this.speedY *= 0.85;
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > this.game.width-this.width*this.game.scale) this.x = this.game.width-this.width*this.game.scale;
        if (this.x < 0) this.x = 0;
        if (this.y > this.game.height-this.height*this.game.scale) this.y = this.game.height-this.height*this.game.scale;
        if (this.y < 0) this.y = 0;

        this.energy -= this.energyUsage;
        this.age ++;
        this.reprTime ++;
        }
    }

    draw(context) {
        // рисование бактерии
        /*context.beginPath();
        context.moveTo(this.x+this.width/2, this.y+this.height/2);
        context.strokeStyle = 'red';
        context.lineWidth = 3;
        context.lineTo((this.nearestFoodX)+this.x+this.width/2, (this.nearestFoodY)+this.y+this.height/2);
        context.closePath();
        context.stroke();*/

        /*context.beginPath();
        context.moveTo(this.x+this.width/2, this.y+this.height/2);
        context.strokeStyle = 'blue';
        context.lineWidth = 3;
        context.lineTo((this.foodX/this.foodI)+this.x+this.width/2, (this.foodY/this.foodI)+this.y+this.height/2);
        context.closePath();
        context.stroke();*/

        /*context.beginPath();
        context.strokeStyle = 'red';
        context.lineWidth = 5;
        context.arc(this.x, this.y, this.vision*this.game.scale, 0, 2 * Math.PI, false);
        context.stroke();*/

        if (this.game.displayMode === "type") {
            context.beginPath();
            context.fillStyle = `HSL(${this.color},100%, 50%)`
            context.arc(this.x+this.height*this.game.scale/2, this.y+this.width*this.game.scale/2, this.height*0.5*this.game.scale, 0, 2 * Math.PI, false);
            context.fill();
        }

        if (this.game.displayMode === "bacteria") {
            context.save();
            context.translate(this.x+this.width*this.game.scale/2, this.y+this.height*this.game.scale/2);
            context.rotate(Math.atan2(this.speedY, this.speedX)+0.8);
            context.translate(-(this.x+this.width*this.game.scale/2), -(this.y+this.height*this.game.scale/2));
            context.drawImage(this.image, this.x, this.y, this.width*this.game.scale, this.height*this.game.scale);
            context.restore();
        }

        if (this.game.displayMode === "skills") {
            context.beginPath();
            context.fillStyle = `RGB(${this.skillBite*255},0,${this.skillFood*255})`
            context.arc(this.x+this.height*this.game.scale/2, this.y+this.width*this.game.scale/2, this.height*0.5*this.game.scale, 0, 2 * Math.PI, false);
            context.fill();
        }
    }

    getGenome() {
        return JSON.stringify({weights: this.net.getWeights(), color: this.color, size: this.size, skills: {food: this.skillFood, bite: this.skillBite}});
    }
}