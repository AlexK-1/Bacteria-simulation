const random = function(a, b) {
    return Math.floor(Math.random() * (b-a)) + a
}

class Bacteria {
    // класс бактерии
    constructor(game, x, y, net, color) {
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
        this.energy = 500;
        this.energyUsage = 1;
        this.reprInterval = 70;
        this.reprTime = -200;
        this.reprCost = 300;
        this.speedX = 0;
        this.speedY = 0;
        this.image = new Image();
        //this.image.src = `/images/bacteria_${random(0, 12)}.png`;
        this.image.src = `/images/bacteria_3.png`;
        this.vision = 200;

        this.color = undefined;
        if (typeof color === "undefined") {
            this.color = random(0, 359);
        } else {
            this.color = color;
        }

        this.net = undefined;
        if (typeof net === "undefined") {
            this.net = new Network([ // структура нейросети бактерий
                new Layer(4, 5), // кол-во входов, кол-во выходов, ф. активации
                new Layer(5, 4, "sigmoid"),
                new Layer(4, 2, "tanh"),
            ]);
        } else {
            this.net = new Network(structuredClone(net).layers.map(element => new Layer(element.inputSize-1, element.numberNeurons, element.activation, element.bias, element.weights)));
            
            if (randomFloat(0, 0.99) < 0.07) {
                this.net.mutate(0.05);
                const color_change = random(-40, 40);
                this.color += color_change;
            }
            this.net.mutate(0.05);
            this.wait = 0;
        }
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
        this.game.food.forEach(element => {
            const fX = element.x-this.x;
            const fY = element.y-this.y;
            if (Math.sqrt(fX**2+fY**2) < this.vision) {
                this.foodX += fX;
                this.foodY += fY;
                this.foodI += 1;
            }
        });

        this.otherBacteriaX = 0;
        this.otherBacteriaY = 0;
        this.otherBacteriaI = 0;
        for(let element of this.game.bacteria) {
            if (element === this) continue;
            const fX = element.x-this.x;
            const fY = element.y-this.y;
            if (Math.sqrt(fX**2+fY**2) < this.vision) {
                this.otherBacteriaX += fX;
                this.otherBacteriaY += fY;
                this.otherBacteriaI += 1;
            }
        }

        [this.speedX, this.speedY] = this.net.run([this.foodX/this.foodI, this.foodY/this.foodI, this.otherBacteriaX/this.otherBacteriaI, this.otherBacteriaY/this.otherBacteriaI]); // запуск нейросети
        this.x += this.speedX*this.speed;
        this.y += this.speedY*this.speed;
        if (this.x > this.game.width-this.width) this.x = this.width+1;
        if (this.x < 0) this.x = this.game.width-this.width-1;
        if (this.y > this.game.height-this.height) this.y = this.height+1;
        if (this.y < 0) this.y = this.game.height-this.height-1;

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
        context.lineTo((this.otherBacteriaX/this.otherBacteriaI*1)+this.x+this.width/2, (this.otherBacteriaY/this.otherBacteriaI*1)+this.y+this.height/2);
        context.closePath();
        context.stroke();*/

        /*context.beginPath();
        context.strokeStyle = 'red';
        context.lineWidth = 5;
        context.arc(this.x, this.y, this.vision, 0, 2 * Math.PI, false);
        context.stroke();*/

        if (this.game.displayMode === "type") {
            context.beginPath();
            context.fillStyle = `HSL(${this.color},100%, 50%)`
            context.arc(this.x+this.height/2, this.y+this.width/2, this.height*0.5, 0, 2 * Math.PI, false);
            context.fill();
        }

        if (this.game.displayMode === "bacteria") {
            context.save();
            context.translate(this.x+this.width/2, this.y+this.height/2);
            context.rotate(Math.atan2(this.speedY, this.speedX)+0.8);
            context.translate(-(this.x+this.width/2), -(this.y+this.height/2));
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
            context.restore();
        }
    }
}