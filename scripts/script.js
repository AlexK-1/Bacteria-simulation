// canvas setup
const canvas = this.document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", e => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

class Game {
    // главный класс игры
    constructor(width, height) {
        this.scale = WORLD_SCALE;
        this.width = width;
        this.height = height;
        this.input = new InputHandler(this);
        this.pause = 0;
        this.bacteria = [];
        this.food = [];
        for (let i = 0; i < NUM_BACTERIA; i++) {
            this.bacteria.push(new Bacteria(this, random(0, this.width), random(0, this.height))); // создание нескольких бактерий
        }
        for (let i = 0; i < NUM_FOOD; i++) {
            this.food.push(new Food(this, random(0, this.width), random(0, this.height))); // создание еды при запуске
        }
        this.bacteriaColors = {};
        this.foodInterval = 1;
        this.foodSpawn = 11;
        this.foodTime = 0;
        this.maxFood = 8000;
        this.displayMode = "bacteria";
        this.bacteriaColors = {};

        this.bacteria.forEach(element => {
            // добавление цвета для видового счётчика
            if (Object.keys(this.bacteriaColors).includes(String(element.color))) {
                this.bacteriaColors[String(element.color)][0] += 1;
            } else {
                this.bacteriaColors[String(element.color)] = [1, element.skillBite*(1-element.skillFood)*255, element.skillFood*(1-element.skillBite)*255, element.size];
            }
        });
    }

    update() {
        // обновление данных
        let needUpdateCounters = false;
        this.bacteriaColors = {};
        if (!this.pause) {
        this.bacteria.forEach((element, index) => { // цикл обновления бактерий
            element.update();
            if (element.energy > element.maxEnergy) element.energy = element.maxEnergy;
            this.food.forEach((food, id_food) => { // цикл для столкновений бактерий с едой
                if (this.checkCollision(food, element)) {
                    let foodEnergy;
                    if (typeof food.type === "undefined" || food.type === "green") {
                        foodEnergy = ENERGY_GREEN_FOOD;
                    } else if (food.type === "yellow") {
                        foodEnergy = ENERGY_YELLOW_FOOD;
                    }
                    element.energy += foodEnergy*element.skillFood*(1-element.skillBite);
                    this.food.splice(id_food, 1);
                }
            });
            let bite = false;
            for (let otherBacteria of this.bacteria) {
                if (otherBacteria === element) continue;
                if (this.checkCollision(otherBacteria, element)) { // цикл для столкновений бактерий с другими бактериями
                    element.energy -= otherBacteria.skillBite*ENERGY_BITE*(1-otherBacteria.skillFood); // одна бактерия кусает другую бактерию
                    element.energyUsageThisTick = ENERGY_USAGE + otherBacteria.skillBite*ENERGY_BITE*(1-otherBacteria.skillFood);
                    bite = true;
                    otherBacteria.energy += otherBacteria.skillBite*ENERGY_BITE*0.9*(1-otherBacteria.skillFood);
                }
            }
            if (!bite) element.energyUsageThisTick = element.energyUsage;
            if (element.reprTime > element.reprInterval && element.energy > REPR_COST+100) { // размножение бактерий
                element.reprTime = 0;
                this.bacteria.push(new Bacteria(this, element.x+random(-30*this.scale, 30*this.scale), element.y+random(-30*this.scale, 30*this.scale), element.getGenome()));
                element.energy -= REPR_COST;
                needUpdateCounters = true;
            }
            if (element.energy > MAX_ENERGY) element.energy = MAX_ENERGY;
            if ((element.age > MAX_AGE) ||  (element.energy < 0)) {
                this.bacteria.splice(index, 1); // удаление мёртвых бактерий
                this.food.push(new Food(this, element.x, element.y, "yellow"));
                needUpdateCounters = true;
            }
            // добавление цвета для видового счётчика
            if (Object.keys(this.bacteriaColors).includes(String(element.color))) {
                this.bacteriaColors[String(element.color)][0] += 1;
            } else {
                this.bacteriaColors[String(element.color)] = [1, element.skillBite*(1-element.skillFood)*255, element.skillFood*(1-element.skillBite)*255, element.size];
            }
        });

        if (needUpdateCounters) updateCounters();

        // создание новой еды
        this.foodTime ++;
        if (this.foodTime >= FOOD_INTERVAL && this.food.length <= this.maxFood) {
            this.foodTime = 0;
            for (let i = 0; i<AMOUNT_FOOD; i++) {
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
        /*context.fillText(`FPS: ${Math.round(fps)}`, 6, 30);
        context.fillText(`Bacteria: ${this.bacteria.length}`, 6, 65);
        context.fillText(`Food: ${this.food.length}`, 6, 100);*/
    }

    checkCollision(rect1, rect2) {
        // проверка столкновений двух прямоугольников
        return (
            rect1.x < rect2.x + rect2.width*this.scale &&
            rect2.x < rect1.x + rect1.width*this.scale &&
            rect1.y < rect2.y + rect2.height*this.scale &&
            rect2.y < rect1.y + rect1.height*this.scale)
    }

    restart() {
        this.width = canvas.width;
        this.height = canvas.height;
        this.scale = WORLD_SCALE;
        this.bacteriaColors = {};
        this.bacteria = [];
        this.food = [];
        for (let i = 0; i < NUM_BACTERIA; i++) {
            this.bacteria.push(new Bacteria(this, random(0, this.width), random(0, this.height))); // создание нескольких бактерий
        }
        for (let i = 0; i < NUM_FOOD; i++) {
            this.food.push(new Food(this, random(0, this.width), random(0, this.height))); // создание еды при запуске
        }
        this.foodTime = 0;

        this.bacteria.forEach(element => {
            // добавление цвета для видового счётчика
            if (Object.keys(this.bacteriaColors).includes(String(element.color))) {
                this.bacteriaColors[String(element.color)][0] += 1;
            } else {
                this.bacteriaColors[String(element.color)] = [1, element.skillBite*(1-element.skillFood)*255, element.skillFood*(1-element.skillBite)*255];
            }
        });

        updateCounters();
    }

    getHerbivoresCount() {
        return this.bacteria.reduce((acc, value) => acc+value.skillFood, 0);
    }

    getPredatorsCount() {
        return this.bacteria.reduce((acc, value) => acc+value.skillBite, 0);
    }
}

const game = new Game(canvas.width, canvas.height);
updateCounters();

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
