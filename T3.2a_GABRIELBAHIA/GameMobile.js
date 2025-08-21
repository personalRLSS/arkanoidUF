import { Game } from './Game.js';
import { Ball } from './entities/Ball.js';
import { Buttons } from "../libs/other/buttons.js";

export class GameMobile extends Game {
    constructor() {
        super(false);
        this.buttons = new Buttons(
            (event) => this.onButtonDown(event),
            (event) => this.onButtonUp(event)
        );
        this.launchButtonPressed = false;
        
        Game.instance = this;
    }
    
    render() {
        this.executeStep();
        this.ballSpeedSecondaryBox.changeMessage(`Ball speed: ${Ball.speed}`);
        this.executeIfKeyPressed();
    
        requestAnimationFrame(() => this.render());
        this.renderer.render(this.scene, this.getCamera().getTHREECamera());
    }
        
    onButtonDown(event) {
        switch (event.target.id) {
            case "launch":
                this.launchButtonPressed = true;
                break;
            case "fullscreen":
                this.buttons.setFullScreen();
                break;
        }
    }

    onButtonUp(event) {
        this.launchButtonPressed = false;
    }

    executeIfKeyPressed() {
        if (this.launchButtonPressed && !this.getBall().isLauched) {
            this.getBall().launch(() => this.startTimerToUpdateBallSpeed());
        }
    }
}