import { Game } from "./Game.js";
import { onWindowResize } from "../libs/util/util.js";
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';

export class EventHandler {
    constructor(game, camera, renderer) {
        this.game = game;
        this.orbit = new OrbitControls(camera.camera, renderer.domElement);
        this.orbit.enabled = false;

        this.camera = camera;
        this.camera.resetCamera();
    }

    listenMousedownEvent() {
        window.addEventListener('mousedown', (event) => {
            if (event.button === 0 && !Game.getInstance().pausedGame) {
                if (!Game.getInstance().startGame) {
                    Game.getInstance().toggleStartGame();
                } else if (!Game.getInstance().getBall().isLauched) {
                    Game.getInstance().getBall().launch(() => Game.getInstance().startTimerToUpdateBallSpeed());
                }
            }
        });
    }

    listenMousemoveEvent() {
        window.addEventListener('mousemove', (event) => {
            if (!Game.getInstance().pausedGame) {
                Game.getInstance().getBackground().onMouseMove(event, Game.getInstance().getCamera(), Game.getInstance().getHitter());

                const ball = Game.getInstance().getBall();
                if (!ball.isLauched) {
                    const hitterPosition = Game.getInstance().getHitter().getPosition();
                    const ballTHREEObject = ball.getTHREEObject();
                    ballTHREEObject.position.copy(hitterPosition);
                    ballTHREEObject.position.z -= 2;
                }
            }
        });
    }

    listenKeydownEvent() {
        window.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'Enter':
                    Game.getInstance().toggleFullScreen();
                    break;
                case 'r':
                    if (Game.getInstance().startGame && this.orbit.enabled === false) {
                        Game.getInstance().toggleRestartStage();
                    }
                    break;
                case ' ': // Space
                    if (Game.getInstance().gameScreen && this.orbit.enabled === false) {
                        Game.getInstance().togglePauseGame();
                    }
                    break;
                case 'g':
                    if (this.orbit.enabled === false) {
                        Game.getInstance().nextStage();
                    }
                    break;
                case 'o':
                    if(this.orbit.enabled === false) {
                        this.orbit.enabled = true;
                        this.game.pausedGame = true;                                              
                    }else {
                        this.orbit.enabled = false;
                        this.game.pausedGame = false;
                        this.camera.resetCamera();
                    }
                    break;
                default:
                    break;
            }
        });
    }

    listenResizeEvent(renderer) {
        window.addEventListener(
            'resize',
            () => onWindowResize(Game.getInstance().getCamera().getTHREECamera(), renderer),
            false
        );
    }
}
