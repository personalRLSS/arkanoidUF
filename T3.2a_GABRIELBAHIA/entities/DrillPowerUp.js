import { PowerUp } from "./PowerUp.js";
import { Ball } from "./Ball.js";
import { Brick } from "./Brick.js";
import { Game } from "../Game.js";

export class DrillPowerUp extends PowerUp {
    static timeDurationInSeconds = 7;
    static timePassedFromStartInMilliseconds = 0;
    static timeIntervalId = null;

    constructor(initialPosition) {
        super(initialPosition, './assets/drill-power-up-texture.png');
    }

    powerUpAction() {
        Ball.startDrillMode();
        DrillPowerUp.startTimer();
    }

    static startTimer() {
        const timeDelayToCheckSpeedUpdateInMilliseconds = 50;
        DrillPowerUp.timeIntervalId = setInterval(
            () => DrillPowerUp.checkUnpausedTimePassed(timeDelayToCheckSpeedUpdateInMilliseconds),
            timeDelayToCheckSpeedUpdateInMilliseconds
        );
    }

    static checkUnpausedTimePassed(timePassedInMilliseconds) {
        if (Game.getInstance().pausedGame) {
            return;
        }

        DrillPowerUp.timePassedFromStartInMilliseconds += timePassedInMilliseconds;

        if (DrillPowerUp.timePassedFromStartInMilliseconds >= DrillPowerUp.timeDurationInSeconds * 1000) {
            Ball.stopDrillMode();
            DrillPowerUp.stopDrillMode();
        }
    }

    static stopDrillMode() {
        DrillPowerUp.stopTimer();
        DrillPowerUp.timePassedFromStartInMilliseconds = 0;
        Brick.bricksDestroyedAtCurrentStage = 0;
    }

    static stopTimer() {
        if (DrillPowerUp.timeIntervalId !== null) {
            clearInterval(DrillPowerUp.timeIntervalId);
            DrillPowerUp.timeIntervalId = null;
        }
    }

    updateColor() {
        const object = this.getTHREEObject();
        object.material.color.setRGB(
            Math.abs(Math.sin(object.position.z / 5)),
            Math.abs(Math.cos(object.position.z / 5)),
            Math.abs(Math.tanh(object.position.z / 5))
        );
    }
}