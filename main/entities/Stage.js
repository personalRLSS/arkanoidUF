import * as THREE from 'three';

import { Brick } from './Brick.js';

export class Stage {
    static totalNumberOfStages = 3;
    
    constructor(stage, scene) {
        this.scene = scene;
        this.stage = stage;
        this.colors = ["lightgray", "red", "dodgerblue", "orange", "hotpink", "chartreuse"];
        this.secondColors = ["#808080"];
        this.createConfig(stage);
    }

    createConfig(stage) {
        switch (stage) {
            case 1:
                this.columns = 11;
                this.rows = 6;
                break;
            case 2:
                this.columns = 8;
                this.rows = 14;
                break;
            case 3:
                this.columns = 6;
                this.rows = 12;
                break;
            default:
                break;
        }
    }
    
    constructStage1() {
        var brickIndex = 0;
        var linha = -38;
        var bricks = [];
        var textureLoader = new THREE.TextureLoader();
        var brickTexture = textureLoader.load('./main/assets/textureBrick2.png');
        for(var i = 0; i < this.rows; i++) {
            var coluna = -20;
            var arrayLinha = [];
            for(var j = 0; j < this.columns; j++) {
                let material = new THREE.MeshLambertMaterial({color: this.colors[i]});
                let initialLife = 1;
                let secondColor = null;
                if(i === 0) {
                    initialLife = 2;
                    secondColor = this.secondColors[0];
                }
                var brick = new Brick(material, coluna, linha, brickIndex++, this.colors[i], this.scene, secondColor, initialLife, 0);
                if(brick.initialLife === 2) {
                    brick.block.material.map = brickTexture;
                }
                arrayLinha.push(brick);
                coluna = coluna + 4; 
            }
            bricks.push(arrayLinha);
            linha = linha + 2.3;
        }

        return bricks;
    }

    constructStage2() {
        var brickIndex = 0;
        var linha = -45;
        var bricks = [];
        var padrao = [
            [0, 3, 5, 4, 3, 5, 2, 0],
            [2, 5, 3, 1, 5, 3, 0, 2],
            [5, 4, 1, 3, 2, 0, 3, 5],
            [3, 1, 4, 5, 0, 2, 5, 3],
            [1, 3, 5, 2, 3, 5, 4, 1],
            [4, 5, 3, 0, 5, 3, 1, 4],
            [5, 2, 0, 3, 4, 1, 3, 5],
            [3, 0, 2, 5, 1, 4, 5, 3]
        ];
        var textureLoader = new THREE.TextureLoader();
        var brickTexture = textureLoader.load('./main/assets/textureBrick2.png');
    
        for (var i = 0; i < this.rows; i++) {
            var coluna = -16;
            var arrayLinha = [];
            for (var j = 0; j < this.columns; j++) {
                var colorIndex = padrao[i % 8][j % 8];
                let material = new THREE.MeshLambertMaterial({ color: this.colors[colorIndex] });
    
                if (j == 4) {
                    coluna = coluna + 4;
                }
                var initialLife = 1;
                var secondColor = null;
                if(colorIndex === 0) {
                    initialLife = 2;
                    secondColor = this.secondColors[0];
                }
                var brick = new Brick(material, coluna, linha, brickIndex++, this.colors[colorIndex], this.scene, secondColor, initialLife, 0);
                if(brick.initialLife === 2) {
                    brick.block.material.map = brickTexture;
                }
                arrayLinha.push(brick);
                coluna = coluna + 4;
            }
            bricks.push(arrayLinha);
            linha = linha + 2.3;
        }
        return bricks;
    }

    constructStage3() {
        var textureLoader = new THREE.TextureLoader();
        var brickwall = textureLoader.load('./main/assets/texture-gold.png');

        var brickIndex = 0;
        var linha = -38;
        var bricks = [];
        var colorIndex = [2, 1, 5, 5, 1, 2]
        for(var i = 0; i < 11; i++) {
            var coluna = -18.5;
            var arrayLinha = [];
            for(var j = 0; j < 6; j++) {
                let initialLife = 1;
                let secondColor = null;        
                let indestructible = 0;    
                var colorAux = this.colors[colorIndex[j]];
                if((i == 9 || i === 3) && j !== 0 && j !== 5) {
                    colorAux = "gold";
                    indestructible = 1;                    
                }else if(i === 9 && ( j === 0 || j === 5)) {
                    colorAux = "salmon";
                }
                let material = new THREE.MeshLambertMaterial({color: colorAux});
                var brick = new Brick(material, coluna, linha, brickIndex++, colorAux, this.scene, secondColor, initialLife, indestructible);
                if((i == 9 || i === 3) && j !== 0 && j !== 5) {
                    brick.block.material.map = brickwall;
                }
                arrayLinha.push(brick);             
                coluna = coluna + 7.5; 
            }
            bricks.push(arrayLinha);
            linha = linha + 2.3;
        }

        // Blocos do meio
        var linhaAux = [];
        var posX = [-7.2, 0.2, 7.8];
        var material = new THREE.MeshLambertMaterial({color: "salmon"});
        for(let i = 0; i < 3; i++) {
            var brick = new Brick(material, posX[i], -31.1, brickIndex++, "salmon", this.scene, null, 1, 0);
            linhaAux.push(brick);
            this.scene.add(brick.block);
        }
        linhaAux.push(null, null, null);
        bricks.push(linhaAux);
        return bricks;
    }

    constructStage() {
        switch (this.stage) {
            case 1:
                return this.constructStage1();
                break;
            case 2:
                return this.constructStage2();
                break;
            case 3:
                return this.constructStage3();
                break;
            default:
                return [];
                break;
        }
    }
}