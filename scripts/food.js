class Food {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 5;
        this.color = "#62B604";
        this.energy = 50;
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