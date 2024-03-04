class Food {
    constructor(game, x, y, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 5;
        if (typeof type === "undefined" || type === "green") {
            this.color = "#62B604";
            this.energy = 50;
        } else if (type === "yellow") {
            this.color = "#F1B011";
            this.energy = 70;
        }
    }

    update() {}

    draw(context) {
        //рисование еды
        context.beginPath();
        context.fillStyle = this.color;
        context.arc(this.x+this.width/2, this.y+this.height/2, this.width, 0, 2*Math.PI, false);
        context.fill();
    }
}