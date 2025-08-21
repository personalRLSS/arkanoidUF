import { Brick } from './Brick.js';

export class BrickArea {
    constructor(scene, stage) {
        let brickIndex = 0;
        this.noBricks = false;
        this.bricks = [];
        this.scene = scene;
        this.stage = stage;
    }

    buildBrickArea(scene) {
        this.bricks = this.stage.constructStage();
        for(let i = 0; i < this.stage.rows; i++) {
            for(let j = 0; j < this.stage.columns; j++) {
                if(this.bricks[i][j] !== null) {
                    scene.add(this.bricks[i][j].block);
                }
            } 
        }
        Brick.bricksDestroyedAtCurrentStage = 0;
    }
    
    resetBrickArea() {
        for(let i = 0; i < this.stage.rows; i++) {
            for(let j = 0; j < this.stage.columns; j++) {
                if(this.bricks[i][j] !== null) {
                    this.bricks[i][j].setVisible(true);
                    this.bricks[i][j].getTHREEObject().scale.set(1, 1, 1);
                }
            }
        }
        this.noBricks = false;
        Brick.bricksDestroyedAtCurrentStage = 0;
    }

    checkEndGame() {
        let endGame = true;
        for(let i = 0; i < this.stage.rows; i++) {
            for(let j = 0; j < this.stage.columns; j++) {
                if(this.bricks[i][j] !== null && this.bricks[i][j].indestructible === 0 && this.bricks[i][j].visible === true) {
                    endGame = false;
                    break;
                }
            }
            if(endGame === false) {
                break;
            }
        }
        if(endGame === true) {
            this.noBricks = true;
        }
    }

    deleteBrickArea() {
        for(let i = 0; i < this.stage.rows; i++) {
            for(let j = 0; j < this.stage.columns; j++) {
                if(this.bricks[i][j] !== null) {
                    this.scene.remove(this.bricks[i][j].block);
                }
            }
        }
    }
}