import { PowerUp } from "./PowerUp.js";
import { Ball } from "./Ball.js";

export class AddBallsPowerUp extends PowerUp {
    constructor(initialPosition) {
        super(initialPosition, './main/assets/add-balls-power-up-texture.png');
    }

    powerUpAction() {
        Ball.addTwoBalls();
    }

    updateColor() {
        const object = this.getTHREEObject();
        object.material.color.setRGB(
            Math.abs(Math.tanh(object.position.z / 5)),
            Math.abs(Math.cos(object.position.z / 5)),
            Math.abs(Math.sin(object.position.z / 5))
        );
    }
} 