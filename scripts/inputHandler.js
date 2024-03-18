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
                if (this.game.displayMode === "type") {
                    this.game.displayMode = "skills";
                } else {
                    this.game.displayMode = "type";
                }
            }
        });
        window.addEventListener('keyup', (e) => {
            
        });
    }
}