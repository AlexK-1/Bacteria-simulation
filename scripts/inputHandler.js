class InputHandler {
    constructor(game) {
        this.game = game;
        window.addEventListener('keydown', (e) => {
            if (e.key === ' ') {
                if (this.game.pause) {
                    this.game.pause = false;
                } else {
                    this.game.pause = true;
                }
            }
            if (e.key === "v") {
                if (this.game.displayMode === "bacteria") {
                    this.game.displayMode = "type";
                } else {
                    this.game.displayMode = "bacteria";
                }
            }
        });
        window.addEventListener('keyup', (e) => {
            
        });
    }
}