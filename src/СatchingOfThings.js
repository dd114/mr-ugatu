import React, {useEffect, useState} from 'react';
import bridge from '@vkontakte/vk-bridge';
import {
    Cell, Avatar, Group, PanelHeader, PanelHeaderBack
} from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import {
    collection,
    doc,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    where,
    onSnapshot
} from "firebase/firestore";
import fireStore from "./DB";

import back from './images/background.jpg'
import marsel from './images/marsel.png'
import melon2 from './images/melon2.png'
import pineapple2 from './images/pineapple2.png'
import orange2 from './images/orange2.png'
import apple2 from './images/apple2.png'
import banana2 from './images/banana2.png'


const CatchingOfThings = (props) => {

    useEffect(() => {

        let canvas = document.getElementById("canvas");
        let context = canvas.getContext("2d");
        // let canvasBack = document.getElementById("backgroundCanvas");
        // let contextBack = canvasBack.getContext("2d");

        canvas.height = window.innerHeight - document.querySelector('#headerBack').clientHeight - 50
        canvas.width = window.innerWidth;


        let background = new Image();
        background.src = back


        let timer;
        //Keeps track of hi score

        let timer2


        let hiscore = localStorage.getItem('catchingOfThingsBestScore');

        let player;
        let fruits = [];
        let numberOfFruits = 10;

        //Player constructor
        function Player() {
            this.gameOver = true;
            this.score = 0;
            this.fruitsCollected = 0;
            this.fruitsMissed = 0;
            this.playerWidth = 100;
            this.playerHeight = 120;
            this.playerSpeed = 5;
            this.x = canvas.width / 2;
            this.y = canvas.height - this.playerHeight;
            this.playerImage = new Image();
            this.playerImage.src = marsel

            //Draws the player
            this.render = function () {
                context.drawImage(this.playerImage, this.x, this.y, this.playerWidth, this.playerHeight);
            }

            //Moves the player left
            this.moveLeft = function () {
                if (this.x > 0) {
                    this.x -= this.playerSpeed;
                }
            }

            //Moves the player right
            this.moveRight = function () {
                if (this.x < canvas.width - this.playerWidth) {
                    this.x += this.playerSpeed;
                }
            }
        }

        //Fruit constructor
        function Fruit() {
            this.fruitNumber = Math.floor(Math.random() * 5);
            this.fruitType = "";
            this.fruitScore = 0;
            this.fruitWidth = 50;
            this.fruitHeight = 50;
            this.fruitImage = new Image();
            this.fruitSpeed = Math.floor(Math.random() * 3 + 1) + 5;
            this.x = Math.random() * (canvas.width - this.fruitWidth);
            this.y = Math.random() * -canvas.height - this.fruitHeight;

            //Creates a different kind of fruit depending on the fruit number
            //which is generated randomly
            this.chooseFruit = function () {
                if (this.fruitNumber == 0) {
                    this.fruitType = "banana";
                    this.fruitScore = 1;
                    this.fruitImage.src = banana2
                } else if (this.fruitNumber == 1) {
                    this.fruitType = "apple";
                    this.fruitScore = 1
                    this.fruitImage.src = apple2
                } else if (this.fruitNumber == 2) {
                    this.fruitType = "orange";
                    this.fruitScore = 1;
                    this.fruitImage.src = orange2
                } else if (this.fruitNumber == 3) {
                    this.fruitType = "pineapple";
                    this.fruitScore = 1;
                    this.fruitImage.src = pineapple2
                } else if (this.fruitNumber == 4) {
                    this.fruitType = "melon";
                    this.fruitScore = 1;
                    this.fruitImage.src = melon2
                }

                // console.log("this.fruitScore", this.fruitScore)
            }


            this.fall = function () {
                if (this.y < canvas.height - this.fruitHeight) {
                    this.y += this.fruitSpeed;
                } else {

                    player.fruitsMissed += 1;
                    this.changeState();
                    this.chooseFruit();
                }
                this.checkIfCaught();
            }


            this.checkIfCaught = function () {
                if (this.y >= player.y) {
                    if ((this.x > player.x && this.x < (player.x + player.playerWidth)) ||
                        (this.x + this.fruitWidth > player.x && this.x + this.fruitWidth < (player.x + player.playerWidth))) {


                        player.score += this.fruitScore;
                        player.fruitsCollected += 1;

                        this.changeState();
                        this.chooseFruit();
                    }
                }
            }

            //Randomly updates the fruit speed, fruit number, which defines the type of fruit
            //And also changes its x and y position on the canvas.
            this.changeState = function () {
                this.fruitNumber = Math.floor(Math.random() * 5);
                this.fruitSpeed = Math.floor(Math.random() * 3 + 1) + 5;
                this.x = Math.random() * (canvas.width - this.fruitWidth);
                this.y = Math.random() * -canvas.height - this.fruitHeight;
            }

            //Draws the fruit.
            this.render = function () {
                context.drawImage(this.fruitImage, this.x, this.y);
            }
        }

        //Adds controls

        //Перехватываем события

        canvas.addEventListener("touchstart", function (e) {


            if (player.gameOver === true) {
                window.clearTimeout(timer);
                main(true);
            } else {
                let x = e.changedTouches[0].clientX


                if (x <= canvas.width / 2) {
                    timer2 = window.setInterval(() => player.moveLeft(), 10)
                } else if (x > canvas.width / 2) {
                    timer2 = window.setInterval(() => player.moveRight(), 10)
                }
            }


        });

        canvas.addEventListener("touchend", function (e) {

            window.clearTimeout(timer2)

        });

        // canvas.addEventListener("touchmove", function (e) {
        //     let x = e.changedTouches[0].clientX
        //
        //     if (x <= canvas.width / 2) {
        //         player.moveLeft();
        //     } else if (x > canvas.width / 2) {
        //         player.moveRight();
        //     }
        //
        // }); //Движение пальцем по экрану


        main(false);

        //Fills an array of fruits, creates a player and starts the game
        function main(isStartGame) {


            // contextBack.font = "bold 23px Velvetica";
            // contextBack.fillStyle = "black";
            player = new Player();
            fruits = []

            if (isStartGame === true) {
                player.gameOver = false

                for (let i = 0; i < numberOfFruits; i++) {
                    let fruit = new Fruit();
                    fruit.chooseFruit();
                    fruits.push(fruit);
                }
            }


            startGame(isStartGame);
        }

        function startGame(isStartGame) {
            context.drawImage(background, 0, 0, canvas.width, canvas.height)

            if (isStartGame)
                updateGame();

            setTimeout(() => window.requestAnimationFrame(drawGame), 10)

        }

        function updateGame() {

            // console.log("updateGame")
            if (player.fruitsMissed >= 5) {
                player.gameOver = true;
            }

            for (let j = 0; j < fruits.length; j++) {
                fruits[j].fall();
            }
            timer = window.setTimeout(updateGame, 30);
        }


        //Draws the player and fruits on the screen as well as info in the HUD.
        function drawGame() {
            // console.log("drawGame")


            if (player.gameOver === false) {
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(background, 0, 0, canvas.width, canvas.height)


                player.render();

                for (let j = 0; j < fruits.length; j++) {
                    fruits[j].render();
                }

                context.fillText("SCORE: " + player.score, canvas.width / 6, 50);
                context.fillText("HI SCORE: " + hiscore, canvas.width / 6 * 2, 50);
                context.fillText("FRUIT CAUGHT: " + player.fruitsCollected, canvas.width / 6 * 3, 50);
                context.fillText("FRUIT MISSED: " + player.fruitsMissed, canvas.width / 6 * 4, 50);

                window.requestAnimationFrame(drawGame);


            } else {
                //Different screen for game over.
                for (let i = 0; i < numberOfFruits; i++) {
                    // console.log(" fruits[fruits.length - 1]",  fruits[fruits.length - 1])
                    // if (fruits.length !== 0)
                    //     console.log("Speed was", fruits.pop().fruitSpeed);
                    fruits.pop();
                }


                // context.clearRect(0, 0, canvas.width, canvas.height)

                // console.log(hiscore, player.score)

                if (hiscore < player.score) {
                    hiscore = player.score
                    localStorage.setItem('catchingOfThingsBestScore', player.score)
                }

                context.drawImage(background, 0, 0, canvas.width, canvas.height)

                context.fillText("TOUCH TO START", (canvas.width / 2) - 80, canvas.height / 3);

                context.fillText("SCORE: " + player.score, canvas.width / 6, 50);
                context.fillText("HI SCORE: " + hiscore, canvas.width / 6 * 3, 50);
                // context.fillText("FRUIT CAUGHT: " + player.fruitsCollected, canvas.width / 6 * 3, 50);
                context.fillText("FRUIT MISSED: " + player.fruitsMissed, canvas.width / 6 * 5, 50);

                props.updateStorage(4, player.score)

            }

        }


    }, []);

    return (
        <React.Fragment>
            {/*<canvas id="backgroundCanvas" width="1024" height="650"></canvas>*/}

            <PanelHeaderBack id="headerBack" onClick={() => props.setCatchingOfThings('game')}/>

            <canvas id="canvas"></canvas>
        </React.Fragment>
    )
}

export default CatchingOfThings