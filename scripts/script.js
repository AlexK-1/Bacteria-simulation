// canvas setup
const canvas = this.document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 2002;
canvas.height = 1000;

class Game {
    // главный класс игры
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.input = new InputHandler(this);
        this.pause = 0;
        this.bacteria = [];
        this.food = [];
        for (let i = 0; i < 50; i++) {
            this.bacteria.push(new Bacteria(this, random(0, this.width), random(0, this.height))); // создание нескольких бактерий
        }
        for (let i = 0; i < 1000; i++) {
            this.food.push(new Food(this, random(0, this.width), random(0, this.height))); // создание еды при запуске
        }
        this.bacteriaColors = {};
        this.foodInterval = 10;
        this.foodSpawn = 5;
        this.foodTime = 0;
        this.maxFood = 3000;
        this.displayMode = "bacteria";
    }

    update() {
        // обновление данных
        this.bacteriaColors = {};
        if (!this.pause) {
        
        this.bacteria.forEach((element, index) => { // цикл обновления бактерий
            element.update();
            if (element.energy > element.maxEnergy) element.energy = element.maxEnergy;
            this.food.forEach((food, id_food) => { // цикл для столкновений бактерий с едой
                if (this.checkCollision(food, element)) {
                    element.energy += food.energy;
                    this.food.splice(id_food, 1);
                }
            });
            if (element.reprTime > element.reprInterval && element.energy > element.reprCost+100) { // размножение бактерий
                element.reprTime = 0;
                this.bacteria.push(new Bacteria(this, element.x+random(-30, 30), element.y+random(-30, 30), element.getGenome()));
                element.energy -+ element.reprCost;
            }
            if ((element.age > element.maxAge) ||  (element.energy < 0)) {
                this.bacteria.splice(index, 1); // удаление мёртвых бактерий
                this.food.push(new Food(this, element.x, element.y, "yellow"));
            }
        });

        // создание новой еды
        this.foodTime ++;
        if (this.foodTime >= this.foodInterval && this.food.length <= this.maxFood) {
            this.foodTime = 0;
            for (let i = 0; i<this.foodSpawn; i++) {
                this.food.push(new Food(this, random(0, this.width), random(0, this.height)));
            }
        }
        }
    }

    draw(context, fps) {
        // рисование игры
        this.bacteria.forEach(element => element.draw(context));
        this.food.forEach(element => element.draw(context));

        context.fillStyle = "black";
        context.font = "30px Arial";
        context.fillText(`FPS: ${Math.round(fps)}`, 6, 30);
        context.fillText(`Bacteria: ${this.bacteria.length}`, 6, 65);
        context.fillText(`Food: ${this.food.length}`, 6, 100);
    }

    checkCollision(rect1, rect2) {
        // проверка столкновений двух прямоугольников
        return (
            rect1.x < rect2.x + rect2.width &&
            rect2.x < rect1.x + rect1.width &&
            rect1.y < rect2.y + rect2.height &&
            rect2.y < rect1.y + rect1.height)
    }
}

const game = new Game(canvas.width, canvas.height);


let lastCalledTime;
let fps;
const animate = function() {
    // главный цикл игры
    if(!lastCalledTime) {
        lastCalledTime = performance.now();
        fps = 0;
    }
    
    delta = (performance.now() - lastCalledTime)/1000;
    lastCalledTime = performance.now();
    fps = 1/delta;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.draw(ctx, fps);
    game.update();
    requestAnimationFrame(animate);
}

animate();
