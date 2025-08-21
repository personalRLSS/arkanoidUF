import * as THREE from 'three';
import { SecondaryBox } from "../libs/util/util.js";

import { Camera } from './entities/Camera.js';
import { Ball } from './entities/Ball.js';
import { Background } from './entities/Background.js';
import { BrickArea } from './entities/BrickArea.js';
import { Wall } from './entities/Wall.js';
import { EventHandler } from './EventHandler.js';
import { ScreenHandler } from './ScreenHandler.js';
import { HitterCSG } from './entities/HitterCSG.js';
import { HitterWithDrag } from './entities/HitterWithDrag.js';
import { Stage } from './entities/Stage.js';
import { PowerUp } from './entities/PowerUp.js';
import { AddBallsPowerUp } from './entities/AddBallsPowerUp.js';
import { DrillPowerUp } from './entities/DrillPowerUp.js';
import { Brick } from './entities/Brick.js';


export class Game {
    static instance = null;

    constructor(isWeb) {
        this.camera = new Camera();
        this.createRenderer();

        this.scene = new THREE.Scene();

        this.createAmbientLight();
        this.createDirectionalLight();

        this.hitterCSG = null;        
        if (isWeb) {
            this.hitterCSG = new HitterCSG(this.scene);
        } else {
            this.hitterCSG = new HitterWithDrag(this.scene, this.camera, this.renderer);
        }

        this.currentStage = 1;
        this.stage = new Stage(this.currentStage, this.scene);

        this.background = new Background(this.scene);
        this.brickArea = new BrickArea(this.scene, this.stage);

        const hitterInitialPosition = this.hitterCSG.getPosition();
        const ballInitialPosition = new THREE.Vector3().copy(hitterInitialPosition);
        ballInitialPosition.z -= 2;

        this.balls = [new Ball(ballInitialPosition)];
        this.walls = [
            Wall.createLeftWall(),
            Wall.createRightWall(),
            Wall.createTopWall(),
            Wall.createBottomWall()
        ];
        this.powerUps = [];

        this.bricksAnimateDestruction = [];

        this.gameScreen = false;
        this.pausedGame = false;
        this.startGame = false;

        this.timeIntervalIdToUpdateBallSpeed = null;

        this.initialLives = 5;
        this.lives = this.initialLives;

        this.eventHandler = new EventHandler(this, this.camera, this.renderer);
        this.screenHandler = new ScreenHandler();

        this.addObjectsToScene();

        this.eventHandler.listenResizeEvent(this.renderer);
        this.eventHandler.listenKeydownEvent();
        this.eventHandler.listenMousemoveEvent();

        this.screenHandler.listenScreenEvents();
        this.createBallSpeedInfo();
    }

    static getInstance() {
        if (Game.instance === null) {
            Game.instance = new Game();
        }

        return Game.instance;
    }

    getCamera() {
        return this.camera;
    }

    getHitter() {
        return this.hitterCSG;
    }

    getBackground() {
        return this.background;
    }

    getBrickArea() {
        return this.brickArea;
    }

    getBall() {
        return this.balls[0];
    }

    getWalls() {
        return this.walls;
    }

    getBottomWall() {
        return this.walls[this.walls.length - 1];
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer();
        document.getElementById("webgl-output").appendChild(this.renderer.domElement);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(new THREE.Color("rgb(0, 0, 0)"));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    createAmbientLight() {
        const ambientLight = new THREE.AmbientLight('white', 0.45);
        this.scene.add(ambientLight);
    }

    createDirectionalLight() {
        const directionalLightPosition = new THREE.Vector3(22, 50, -40);
        this.directionalLight = new THREE.DirectionalLight('white', 0.6);
        this.directionalLight.position.copy(directionalLightPosition);
        this.directionalLight.castShadow = true;
        
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.shadow.camera.near = 0.1;
        this.directionalLight.shadow.camera.far = 110;
        this.directionalLight.shadow.camera.left = -45;
        this.directionalLight.shadow.camera.right = 45;
        this.directionalLight.shadow.camera.bottom = -40;
        this.directionalLight.shadow.camera.top = 40;
        this.directionalLight.shadow.bias = -0.0005;
        this.directionalLight.shadow.radius = 1.0;
        
        this.scene.add(this.directionalLight);
    }

    createBallSpeedInfo() {
        this.ballSpeedSecondaryBox = new SecondaryBox();
        this.ballSpeedSecondaryBox.changeStyle('rgba(100,100,255,0.3)', 'white', '20px');
        this.ballSpeedSecondaryBox.changeMessage('Ball speed: 0');
    }

    render() {}

    getLives() {
        return this.lives;
    }

    loseOneLife() {
        this.lives--;

        this.screenHandler.updateLivesIndicator();
        if (this.lives <= 0) {
            this.toggleGameOver();
        }
    }

    executeStep() {
        if (!this.pausedGame && this.startGame) {
            if (this.getBall().isLauched) {
                // move
                this.balls.forEach(ball => {
                    ball.move();
                });

                // move power ups
                this.powerUps.forEach(powerUp => {
                    powerUp.move();
                });

                this.bricksAnimateDestruction.forEach(brick => {
                    brick.animateDestructionStep();
                });

                // check end game
                if (this.getBrickArea().noBricks && !this.pausedGame) {
                    this.toggleEndGame();
                }
            }
        }
    }

    addObjectsToScene() {
        this.scene.add(this.getBackground().getTHREEObject());

        this.getBrickArea().buildBrickArea(this.scene);

        this.scene.add(this.getBall().getTHREEObject());

        this.getWalls().forEach(wall => {
            this.scene.add(wall.getTHREEObject());
        });

        this.scene.add(this.hitterCSG.hitterMesh);
        this.scene.add(this.hitterCSG.sphere);
    }

    addPowerUp(position) {
        if (this.balls.length > 1 || this.powerUps.length > 0 || Ball.isDrillMode) {
            return;
        }

        const powerUp = PowerUp.lastPowerUpSpawned instanceof AddBallsPowerUp
            ? new DrillPowerUp(position)
            : new AddBallsPowerUp(position);

        PowerUp.lastPowerUpSpawned = powerUp;

        this.powerUps.push(powerUp);
        this.scene.add(powerUp.getTHREEObject());
    }

    deletePowerUp(powerUp) {
        this.powerUps = this.powerUps.filter(currentPowerUp => currentPowerUp !== powerUp);
        this.scene.remove(powerUp.getTHREEObject());
    }

    deleteAllPowerUps() {
        this.powerUps.forEach(powerUp => {
            this.scene.remove(powerUp.getTHREEObject());
        });
        this.powerUps = [];
    }

    deleteBall(ball) {
        this.balls = this.balls.filter(currentBall => currentBall !== ball);
        this.scene.remove(ball.getTHREEObject());
    }

    deleteDuplicatedBalls() {
        if (this.balls.length === 1) {
            return;
        }

        for (let i = 1; i < this.balls.length; i++) {
            this.scene.remove(this.balls[i].getTHREEObject());
        }

        this.balls = [this.balls[0]];
    }

    deleteBrickAnimation(brick) {
        this.bricksAnimateDestruction = this.bricksAnimateDestruction.filter(currentBrick => currentBrick !== brick);
    }

    startTimerToUpdateBallSpeed() {
        const timeDelayToCheckSpeedUpdateInMilliseconds = 50;
        const timeIntervalId = setInterval(
            () => Ball.updateSpeed(timeDelayToCheckSpeedUpdateInMilliseconds, this.pausedGame, timeIntervalId),
            timeDelayToCheckSpeedUpdateInMilliseconds
        );
    }

    toggleFullScreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    togglePauseGame() {
        this.pausedGame = !this.pausedGame; // Pausando Raycaster
        if (this.pausedGame === true) {
            this.screenHandler.showGamePausedScreen();
        } else {
            this.screenHandler.hideGamePausedScreen();
        }
        // Travar movimento da bola também
    }

    toggleStartGame() {
        if (this.pausedGame === false) {
            this.startGame = true;
            this.getBall().launch(() => this.startTimerToUpdateBallSpeed());
        }
    }

    toggleRestartStage() {
        this.getHitter().resetPosition();
        this.getBrickArea().resetBrickArea();
        this.deleteAllPowerUps();
        this.deleteDuplicatedBalls();
        this.getBall().resetPosition();
        this.bricksAnimateDestruction = [];

        this.pausedGame = false;
        this.startGame = false;
    }

    toggleRestartGame() {
        this.currentStage = 1;
        this.lives = this.initialLives;
        this.screenHandler.updateLivesIndicator();
        this.bricksAnimateDestruction = [];
        this.pausedGame = false;
        this.startGame = false;
        
        this.getHitter().resetPosition();
        this.getBall().resetPosition();
        this.deleteAllPowerUps();
        this.deleteDuplicatedBalls();
        this.getBrickArea().deleteBrickArea();
        this.stage = new Stage(this.currentStage, this.scene);
        this.brickArea = new BrickArea(this.scene, this.stage);
        this.getBrickArea().buildBrickArea(this.scene);
    }

    toggleEndGame() {
        if (this.currentStage >= Stage.totalNumberOfStages) {
            this.screenHandler.showEndGameScreen();
        } else {
            this.screenHandler.showStageCompleteScreen();
        }
        
        this.getHitter().resetPosition();
        this.getBall().resetPosition();
        this.pausedGame = true;
    }

    toggleGameOver() {
        if (this.lives > 0) {
            return;
        }

        this.screenHandler.showGameOverScreen();

        this.pausedGame = true;
        this.startGame = false;
        
        this.getHitter().resetPosition();
        this.getBall().resetPosition();
    }

    nextStage() {
        if (this.currentStage >= Stage.totalNumberOfStages) {
            this.currentStage = 0;
        }
        this.currentStage++;
        this.pausedGame = false;
        this.startGame = false;
        this.getBrickArea().deleteBrickArea();
        this.bricksAnimateDestruction = [];
        this.stage = new Stage(this.currentStage, this.scene);
        this.brickArea = new BrickArea(this.scene, this.stage);
        this.getBrickArea().buildBrickArea(this.scene);
        this.getHitter().resetPosition();
        this.deleteAllPowerUps();
        this.deleteDuplicatedBalls();
        this.getBall().resetPosition();
    }
}