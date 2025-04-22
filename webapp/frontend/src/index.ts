import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui/2D';
import { registerBuiltInLoaders } from "@babylonjs/loaders/dynamic";

registerBuiltInLoaders();

var groundHeight = 1000;
var groundWidth = groundHeight * 0.8;
var groundDepth = groundHeight * 0.1;

var paddleWidth = 100;
var paddleHeight = 25;
var paddleDepth = 25;

var sphereDiameter = 32;
var spherePositionY = 48;

var skyboxSize = 5000;

var velocityX = 0;
var velocityZ = 0;

var tmpX = 0;
var tmpZ = 0;

var gameMode = null;
var gameStatus = null;

var leftScore = 0;
var rightScore = 0;
var Name;
var right;
var left;

var sphere,leftPlayer,rightPlayer;
var leftScoreText,rightScoreText;
var tournamentCounter;
var cameraCoord = new BABYLON.Vector3(-1500, 700, 0);
export var engine;
export var scene;

if (document.getElementById("pong")) {
    var canvas = document.getElementById("pong") as HTMLCanvasElement;
    engine = new BABYLON.Engine(canvas);

    canvas.height= 600;
    canvas.width= 800;

    function resizeCanvas(canvas: HTMLCanvasElement) {
        // console.log(window.innerWidth);
        canvas.width = (window.innerWidth / 6) * 3;
        canvas.height = (window.innerHeight / 6) * 5;
        if (window.innerWidth < 650) {
            canvas.width = window.innerWidth - 10;
            cameraCoord = new BABYLON.Vector3(-2500, 700, 0);
        }
    }
    resizeCanvas(canvas);

    window.addEventListener('resize', () => {
        resizeCanvas(canvas);
        engine.resize();
    });

    function createScene() {

        var scenekek = new BABYLON.Scene(engine);
        //Camera
        // cameraCoord = new BABYLON.Vector3(-1500, 700, 0 );
        const camera = new BABYLON.FreeCamera("camera", cameraCoord, scenekek);
        camera.setTarget(BABYLON.Vector3.Zero());
        //camera.attachControl(canvas, true);
        //Light
        var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 10, 0), scenekek);
        light.intensity = 1;
        //Skybox
        var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:5000}, scenekek);
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scenekek);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("https://www.babylonjs.com/assets/skybox/TropicalSunnyDay", scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.disableLighting = true;
        skybox.material = skyboxMaterial;
        //Terrain
        //createGround(groundHeight, groundWidth, groundDepth, 10000, , )
        const ground = BABYLON.MeshBuilder.CreateBox("ground", {width: groundWidth, height: groundHeight}, scenekek);
        ground.rotation.x = Math.PI / 2;
        const groundMat = new BABYLON.StandardMaterial("groundMat");
        groundMat.diffuseTexture = new BABYLON.Texture("./dist/assets/wood.jpg");
        if (groundMat.diffuseTexture instanceof BABYLON.Texture) {
            groundMat.diffuseTexture.uScale = 15;
            groundMat.diffuseTexture.vScale = 10;
        }
        ground.material = groundMat;
        const groundBox = BABYLON.MeshBuilder.CreateBox("groundBox", {width: groundWidth, height: groundHeight, depth :groundDepth}, scene);
        const groundBoxMat = new BABYLON.StandardMaterial("groundBoxMat");
        groundBoxMat.diffuseTexture = new BABYLON.Texture("./dist/assets/wood.jpg");
        if (groundBoxMat.diffuseTexture instanceof BABYLON.Texture) {
            groundBoxMat.diffuseTexture.uScale = 15;
            groundBoxMat.diffuseTexture.vScale = 1;
        }
        groundBox.material = groundBoxMat;
        groundBox.position.y = -groundDepth / 2;
        groundBox.rotation.x = Math.PI / 2;
        const floor = BABYLON.Mesh.CreateGround("floor", 5000, 5000, 1, scenekek, false);
        const floorMat = new BABYLON.StandardMaterial("floorMat", scenekek);
        floorMat.diffuseTexture = new BABYLON.Texture("./dist/assets/water.png", scenekek);
        floorMat.alpha = 0.5;
        if (floorMat.diffuseTexture instanceof BABYLON.Texture) {
            floorMat.diffuseTexture.uScale = 150;
            floorMat.diffuseTexture.vScale = 100;
        }
        floor.material = floorMat;
        //Left Player
        const paddle = BABYLON.MeshBuilder.CreateBox("leftPaddle", {width: paddleHeight, height: paddleWidth, depth: paddleDepth}, scenekek);
        paddle.rotation.z = Math.PI / 2;
        leftPlayer = paddle;
        leftPlayer.position.set(0,paddleHeight/2, groundHeight/2 - paddleDepth/2);
        //Right Player
        const paddle2 = BABYLON.MeshBuilder.CreateBox("RightPaddle", {width: paddleHeight, height: paddleWidth, depth: paddleDepth}, scenekek);
        paddle2.rotation.z = Math.PI / 2;
        rightPlayer = paddle2;
        rightPlayer.position.set(0,paddleHeight/2,- groundHeight/2 + paddleDepth/2);
        //Sphere
        sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: sphereDiameter}, scenekek);
        sphere.position.set(0,spherePositionY,0);
        //GUI
        // advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);
        //Menu
        menuGUI();

        return (scenekek);
    };

    scene = createScene();
    var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    function endGame(opponent_name, scoreLeft, scoreRight) {
        var payload = {
            opponent: opponent_name,
            user_score: scoreLeft,
            opponent_score: scoreRight,
        };
    fetch("/endgame", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(payload)
        })
    }

    function endTournament(winner, players) {
        var payload = {
            winner: winner,
            runnerUp: players
        };
        try {
            fetch("/avax", {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: 'POST',
                    body: JSON.stringify(payload)
                })
        } catch (error) {
            console.error("Error KEK: ", error);
            return null;
        }
    }
    
    async function getCurrentUser() {
        try {
        const response = await fetch("/current-user");
        const data = await response.json();
    
        if (data.username) {
            return data.username;
        } else {
            console.log("No user is currently logged in.");
            return null;
        }
        } catch (error) {
        console.error("Error fetching current user:", error);
        return null;
        }
    }
    
    
    /* function createGround(heightValue, widthValue, depthValue ,floorSize, pathTextureGround, pathTextureFloor){
        const ground = BABYLON.MeshBuilder.CreateBox("ground", {width: widthValue, height: heightValue}, scene);
        ground.rotation.x = Math.PI / 2;
        const groundMat = new BABYLON.StandardMaterial("groundMat");
        groundMat.diffuseTexture = new BABYLON.Texture(pathTextureGround);
        if (groundMat.diffuseTexture instanceof BABYLON.Texture) {
            groundMat.diffuseTexture.uScale = 15;
            groundMat.diffuseTexture.vScale = 10;
        }
        ground.material = groundMat;
        const groundBox = BABYLON.MeshBuilder.CreateBox("groundBox", {width: widthValue, height: heightValue, depth :depthValue}, scene);
        const groundBoxMat = new BABYLON.StandardMaterial("groundBoxMat");
        groundBoxMat.diffuseTexture = new BABYLON.Texture(pathTextureGround);
        if (groundBoxMat.diffuseTexture instanceof BABYLON.Texture) {
            groundBoxMat.diffuseTexture.uScale = 15;
            groundBoxMat.diffuseTexture.vScale = 1;
        }
        groundBox.material = groundBoxMat;
        groundBox.position.y = -groundDepth / 2;
        groundBox.rotation.x = Math.PI / 2;
        const floor = BABYLON.Mesh.CreateGround("floor", floorSize, floorSize, 1, scene, false);
        const floorMat = new BABYLON.StandardMaterial("floorMat", scene);
        floorMat.diffuseTexture = new BABYLON.Texture(pathTextureFloor, scene);
        floorMat.alpha = 0.5;
        if (floorMat.diffuseTexture instanceof BABYLON.Texture) {
            floorMat.diffuseTexture.uScale = 150;
            floorMat.diffuseTexture.vScale = 100;
        }
        floor.material = floorMat;
    } */

    function createPlayer(widthValue, heightValue, depthValue){
        const paddle = BABYLON.MeshBuilder.CreateBox("leftPaddle", {width: heightValue, height: widthValue, depth: depthValue}, scene);
        paddle.rotation.z = Math.PI / 2;
        return (paddle);
    }

    function createButton(name, text, left, top) {
        const button = GUI.Button.CreateSimpleButton(name, text);
        button.width = "180px";
        button.height = "60px";
        button.thickness = 0;
        button.color = "#2b7fff";
        button.background = "#101828";
        button.cornerRadius = 10;
        button.left = left;
        button.top = top;

        button.onPointerEnterObservable.add(() => {
            button.color = "#ffffff";
            button.background = "#2b7fff"
        });
        button.onPointerOutObservable.add(() => {
            button.color = "#2b7fff";
            button.background = "#101828"
        });
        return (button);
    }

    function createTitle(text,top,left)
    {
        const title = new GUI.TextBlock();
        title.text = text;
        title.color = "#ffffff";
        title.fontSize = 28;
        title.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        title.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        title.left = left;
        title.top = top;
        return(title);
    }

    function createGuiBackground(width,height){
        var background = new GUI.Rectangle();
        background.width = width;
        background.height = height;
        background.cornerRadius = 20;
        background.thickness = 0;
        background.background = "#101828B7";
        return (background);
    }

    function menuGUI(){
        var menuContainer = new GUI.Grid();
        var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        advancedTexture.addControl(menuContainer);

        const menuBackground = createGuiBackground("500px","300px")
        menuContainer.addControl(menuBackground);


        const menuTitle = createTitle("Choisissez un mode de jeu","-100px","0px")
        menuContainer.addControl(menuTitle);

        const pvpButton = createButton("pvp","1v1","-100px","-20px")
        pvpButton.onPointerUpObservable.add(() => {
            gameMode = "PVP";
            gameStatus = "WAIT";
            menuContainer.isVisible = false;
            scoreDisplay();
            usernameDisplay();
        });
        menuContainer.addControl(pvpButton);


        const botButton = createButton("bot","Contre un bot","100px","-20px")
        botButton.onPointerUpObservable.add(() => {
            gameMode = "IA";
            gameStatus = "WAIT";
            menuContainer.isVisible = false;
            scoreDisplay();
            usernameDisplay();
        });
        menuContainer.addControl(botButton);

        const tournamentButton = createButton("tournament","Tournois","0px","50px")
        tournamentButton.onPointerUpObservable.add(() => {
            gameMode = "TOURNAMENT";
            menuContainer.isVisible = false;
            tournamentGUI();
        });
        menuContainer.addControl(tournamentButton);
    }

    var scoreContainer;
    function scoreDisplay(){
        scoreContainer = new GUI.Grid();
        advancedTexture.addControl(scoreContainer);
        leftScoreText = new GUI.TextBlock();
        leftScoreText.text = "0";
        leftScoreText.fontSize = 32;
        leftScoreText.color = "white";
        leftScoreText.top = "-170";
        leftScoreText.left = "-200px";
        scoreContainer.addControl(leftScoreText);

        rightScoreText = new GUI.TextBlock();
        rightScoreText.text = "0";
        rightScoreText.fontSize = 32;
        rightScoreText.color = "white";
        rightScoreText.top = "-170px";
        rightScoreText.left = "200px";
        scoreContainer.addControl(rightScoreText);
    }

    var usernameContainer,tournamentContainer;
    function pauseGUI() {
        var pauseContainer = new GUI.Grid();
        advancedTexture.addControl(pauseContainer);

        const pauseBackground = createGuiBackground("500px","200px")
        pauseContainer.addControl(pauseBackground);
        const pauseTitle = createTitle("Pause","-50px","0px");

        pauseContainer.addControl(pauseTitle);

        const resumeButton = createButton("resume","Reprendre","-100px","30px")
        resumeButton.onPointerUpObservable.add(() => {
            if(tmpX)
                gameStatus = "PLAY";
            else
                gameStatus = "WAIT";
            velocityZ = tmpZ;
            velocityX = tmpX;
            pauseContainer.isVisible = false;
        });
        pauseContainer.addControl(resumeButton);
        const leaveButton = createButton("leave","Quitter","100px","30px");
        leaveButton.onPointerUpObservable.add(() => {
            leftScore = 0;
            rightScore = 0;
            updateScores();
            sphere.position.set(0, spherePositionY, 0);
            scoreContainer.isVisible = false;
            usernameContainer.isVisible = false;
            pauseContainer.isVisible = false;
            gameStatus = "END";
            users["user2"] ="";
            users["user3"] ="";
            users["user4"] ="";
            tournamentCounter = 0;
            menuGUI();
        });
        pauseContainer.addControl(leaveButton);
    }

    function winScreen(player){
        var winContainer = new GUI.Grid();
        advancedTexture.addControl(winContainer); 

        const winBackground = createGuiBackground("500px","200px")
        winContainer.addControl(winBackground);

        const winTitle = createTitle(player + " a gagné","-50px","0px")
        winContainer.addControl(winTitle);
            
        const restartButton = createButton("restart","Rejouer","-100px","30px")
        restartButton.onPointerUpObservable.add(() => {
            gameStatus = "WAIT";
            leftScore = 0;
            rightScore = 0;
            updateScores();
            usernameDisplay();
            scoreDisplay();
            sphere.position.set(0, spherePositionY, 0);
            winContainer.isVisible = false
        });
        winContainer.addControl(restartButton);
        const menuButton = createButton("menu","Menu","100px","30px")
        menuButton.onPointerUpObservable.add(() => {
            leftScore = 0;
            rightScore = 0;
            updateScores();
            sphere.position.set(0, spherePositionY, 0);
            scoreContainer.isVisible = false;
            winContainer.isVisible = false;
            menuGUI();
            gameStatus = "END";
        });
        winContainer.addControl(menuButton);
    }

    async function updateScores() {
        leftScoreText.text = leftScore.toString();
        rightScoreText.text = rightScore.toString();
        gameStatus = "WAIT";
        Name = await getCurrentUser();
        if(Name.length > 12){
            Name = Name.substring(0, 12) + ".";
        }
        if(gameMode == "IA")
            right = "la calvitie"
        if(gameMode == "PVP")
            right = "invité"
        if(leftScore == 3)
        {
            if(gameMode == "TOURNAMENT")
            {
                usernameContainer.isVisible = false;
                scoreContainer.isVisible = false;
                gameStatus = "END";
                if(tournamentCounter == 1)
                {
                    winners["firstMatch"] = users["user1"];
                    losers["firstMatch"] = users["user2"];
                    if(winners["firstMatch"] == Name)
                        endGame(losers["firstMatch"],leftScore,rightScore)
                    else if(losers["firstMatch"] == Name)
                        endGame(winners["firstMatch"],leftScore,rightScore)
                    winTournamentScreen(users["user1"],users["user3"],users["user4"]);
                }
                else if(tournamentCounter == 2)
                {
                    winners["secondMatch"] = users["user3"];
                    losers["secondMatch"] = users["user4"];
                    if(winners["secondMatch"] == Name)
                        endGame(losers["secondMatch"],leftScore,rightScore)
                    else if(losers["secondMatch"] == Name)
                        endGame(winners["secondMatch"],leftScore,rightScore)
                    winTournamentScreen(users["user3"],losers["firstMatch"],losers["secondMatch"]);
                }
                else if(tournamentCounter == 3)
                {
                    winners["thirdMatch"] = losers["firstMatch"];
                    losers["thirdMatch"] = losers["secondMatch"];
                    if(winners["thirdMatch"] == Name)
                        endGame(losers["thirdMatch"],leftScore,rightScore)
                    else if(losers["thirdMatch"] == Name)
                        endGame(winners["thirdMatch"],leftScore,rightScore)
                    winTournamentScreen(losers["firstMatch"],winners["firstMatch"],winners["secondMatch"]);
                }
                else if(tournamentCounter == 4)
                {
                    winners["fourthMatch"] = winners["firstMatch"];
                    losers["fourthMatch"] = winners["secondMatch"];
                    if(winners["fourthMatch"] == Name)
                        endGame(losers["fourthMatch"],leftScore,rightScore)
                    else if(losers["fourthMatch"] == Name)
                        endGame(winners["fourthMatch"],leftScore,rightScore);
                    endTournament(winners["fourthMatch"],winners["firstMatch"]+","+winners["secondMatch"]+","+winners["thirdMatch"]);
                    tournamentResult();
                }
                return;
            }
            usernameContainer.isVisible = false;
            scoreContainer.isVisible = false;
            gameStatus = "END";
            winScreen(left);
            endGame(right,leftScore,rightScore);
            return;
        }
        else if(rightScore == 3)
        {
            if(gameMode == "TOURNAMENT")
            {
                usernameContainer.isVisible = false;
                scoreContainer.isVisible = false;
                gameStatus = "END";
                if(tournamentCounter == 1)
                {
                    winners["firstMatch"] = users["user2"];
                    losers["firstMatch"] = users["user1"];
                    if(winners["firstMatch"] == Name)
                        endGame(losers["firstMatch"],leftScore,rightScore)
                    else if(losers["firstMatch"] == Name)
                        endGame(winners["firstMatch"],leftScore,rightScore)
                    winTournamentScreen(users["user2"],users["user3"],users["user4"]);
                }
                else if(tournamentCounter == 2)
                {
                    winners["secondMatch"] = users["user4"];
                    losers["secondMatch"] = users["user3"];
                    if(winners["secondMatch"] == Name)
                        endGame(losers["secondMatch"],leftScore,rightScore)
                    else if(losers["secondMatch"] == Name)
                        endGame(winners["secondMatch"],leftScore,rightScore)
                    winTournamentScreen(users["user4"],losers["firstMatch"],losers["secondMatch"]);
                }
                else if(tournamentCounter == 3)
                {
                    winners["thirdMatch"] = losers["secondMatch"];
                    losers["thirdMatch"] = losers["firstMatch"];
                    if(winners["thirdMatch"] == Name)
                        endGame(losers["thirdMatch"],leftScore,rightScore)
                    else if(losers["thirdMatch"] == Name)
                        endGame(winners["thirdMatch"],leftScore,rightScore)
                    winTournamentScreen(losers["secondMatch"],winners["firstMatch"],winners["secondMatch"]);
                }
                else if(tournamentCounter == 4)
                {
                    winners["fourthMatch"] = winners["secondMatch"];
                    losers["fourthMatch"] = winners["firstMatch"];
                    if(winners["fourthMatch"] == Name)
                        endGame(losers["fourthMatch"],leftScore,rightScore)
                    else if(losers["fourthMatch"] == Name)
                        endGame(winners["fourthMatch"],leftScore,rightScore)
                    endTournament(winners["fourthMatch"],winners["firstMatch"]+","+winners["secondMatch"]+","+winners["thirdMatch"]);
                    tournamentResult();
                }
                return;
            }
            usernameContainer.isVisible = false;
            scoreContainer.isVisible = false;
            gameStatus = "END";
            winScreen(right);
            endGame(right,leftScore,rightScore);
            return;
        }
        return;
    }

    var users = {
        user1: "",
        user2: "",
        user3: "",
        user4: ""
    };

    var winners = {
        firstMatch: "",
        secondMatch: "",
        thirdMatch: "",
        fourthMatch: ""
    }

    var losers = {
        firstMatch: "",
        secondMatch: "",
        thirdMatch: "",
        fourthMatch: ""
    }

    function createInput(top, left, userVarKey){
        var input = new GUI.InputText("heightInput");
        input.width = "300px";
        input.height = "35px";
        input.top = top;
        input.left = left;
        input.thickness = 1;
        input.color = "white";
        input.background = "#2b7fffb7";
        input.onTextChangedObservable.add(e => {
            if(input && input.text.length > 12) {
                input.text = input.text.substring(0, 12);
            }
            users[userVarKey] = e.text;
        });

        input.text = users[userVarKey];
        return input;
    }

    async function usernameDisplay(){
        Name = await getCurrentUser();
        if(Name.length > 12){
            Name = Name.substring(0, 12) + ".";
        }
        if(gameMode == "IA")
        {
            left = Name;
            right = "la calvitie"
        }
        if(gameMode == "PVP")
        {
            left =  Name;
            right = "invité"
        }
        if(tournamentCounter == 1)
        {
            left = users["user1"];
            right = users["user2"];
        }
        if(tournamentCounter == 2)
        {
            left = users["user3"];
            right = users["user4"];
        }
        if(tournamentCounter == 3)
        {
            left = losers["firstMatch"];
            right = losers["secondMatch"];
        }
        if(tournamentCounter == 4)
        {
            left = winners["firstMatch"];
            right = winners["secondMatch"];
        }
        usernameContainer = new GUI.Grid();
        advancedTexture.addControl(usernameContainer);
        var leftUsername = new GUI.TextBlock();
        leftUsername.text = left;
        leftUsername.fontSize = 32;
        leftUsername.color = "#2b7fff";
        leftUsername.top = "-210px";
        leftUsername.left = "-200px";
        usernameContainer.addControl(leftUsername);

        var rightUsername = new GUI.TextBlock();
        rightUsername.text = right;
        rightUsername.fontSize = 32;
        rightUsername.color = "#2b7fff";
        rightUsername.top = "-210px";
        rightUsername.left = "200px";
        usernameContainer.addControl(rightUsername);
    }

    var winTContainer,winContainer;
    async function tournamentGUI(){
        tournamentContainer = new GUI.Grid();
        advancedTexture.addControl(tournamentContainer);

        const tournamentBackground = createGuiBackground("500px", "300px");
        tournamentContainer.addControl(tournamentBackground);

        Name = await getCurrentUser();
        if(Name.length > 12){
            Name = Name.substring(0, 12) + ".";
        }
        users["user1"] = Name;
        
        var firstUsername = createTitle(users["user1"],"-100px", "75px");
        var secondUsername = createInput("-50px", "75px", "user2");
        var thirdUsername = createInput("0px", "75px", "user3");
        var fourthUsername = createInput("50px", "75px", "user4");

        var firstTitle = createTitle("Joueur 1 :", "-100px", "-150px");
        var secondTitle = createTitle("Joueur 2 :", "-50px", "-150px");
        var thirdTitle = createTitle("Joueur 3 :", "0px", "-150px");
        var fourthTitle = createTitle("Joueur 4 :", "50px", "-150px");


        var startButton = createButton("tournamentStart", "Joueur 1 vs Joueur 2", "0px", "110px");
        startButton.onPointerUpObservable.add(() => {
            if(users["user4"] != "" && users["user3"] != "" && users["user4"] != "")
            {
                tournamentContainer.isVisible = false;
                gameStatus = "WAIT";
                tournamentCounter = 1;
                scoreDisplay();
                usernameDisplay();
            }
            
        });

        tournamentContainer.addControl(firstTitle);
        tournamentContainer.addControl(secondTitle);
        tournamentContainer.addControl(thirdTitle);
        tournamentContainer.addControl(fourthTitle);

        tournamentContainer.addControl(firstUsername);
        tournamentContainer.addControl(secondUsername);
        tournamentContainer.addControl(thirdUsername);
        tournamentContainer.addControl(fourthUsername);

        tournamentContainer.addControl(startButton);
    }

    function winTournamentScreen(player,j1,j2){
        winTContainer = new GUI.Grid();
        advancedTexture.addControl(winTContainer);

        const winBackground = createGuiBackground("500px","200px")
        winTContainer.addControl(winBackground);

        const winTitle = createTitle(player + " a gagné !","-40px","0px")
        winTContainer.addControl(winTitle);

        const nextMatch = createTitle("Prochain match " + j1 +" vs " +j2,"-75px","0px")
        nextMatch.fontSize = 20;
        nextMatch.color = "#2b7fff";

        winTContainer.addControl(nextMatch);
        const nextButton = createButton("next","Prochain match","0px","30px")
        nextButton.onPointerUpObservable.add(() => {
            gameStatus = "WAIT";
            tournamentCounter++;
            leftScore = 0;
            rightScore = 0;
            updateScores();
            sphere.position.set(0, spherePositionY, 0);
            winTContainer.isVisible = false
            usernameDisplay();
            scoreDisplay();
        });
        winTContainer.addControl(nextButton);
    }

    var ResultContainer;

    function tournamentResult(){
        users["user2"] ="";
        users["user3"] ="";
        users["user4"] ="";
        ResultContainer = new GUI.Grid();
        advancedTexture.addControl(ResultContainer);

        const winBackground = createGuiBackground("500px","300px")
        ResultContainer.addControl(winBackground);


        var firstTitle = createTitle("Premier : " + winners["fourthMatch"], "-100px", "px");
        var secondTitle = createTitle("Deuxieme : " + losers["fourthMatch"], "-50px", "0px");
        var thirdTitle = createTitle("Trosieme : " + winners["thirdMatch"], "0px", "0px");
        var fourthTitle = createTitle("Quatrieme : " + losers["thirdMatch"], "50px", "0px");

        var menuButton = createButton("MENU", "Menu", "0px", "110px");
        menuButton.onPointerUpObservable.add(() => {
            leftScore = 0;
            rightScore = 0;
            updateScores();
            sphere.position.set(0, spherePositionY, 0);
            scoreContainer.isVisible = false;
            ResultContainer.isVisible = false;
            tournamentCounter = 0;
            menuGUI();
            gameStatus = "END";
            
        });

        ResultContainer.addControl(firstTitle);
        ResultContainer.addControl(secondTitle);
        ResultContainer.addControl(thirdTitle);
        ResultContainer.addControl(fourthTitle);

        ResultContainer.addControl(menuButton);
    }


    var keysPressed = {};

    document.addEventListener("keydown", handleKey, false);
    document.addEventListener("keyup", releaseKey, false);

    function handleKey(event) {
        var keyCode = event.which;
        keysPressed[keyCode] = true;
    }

    function releaseKey(event) {
        var keyCode = event.which;
        keysPressed[keyCode] = false;
    }

    function startGame(){
        var randomDirection = Math.floor(Math.random() * 6);
        switch (randomDirection) {
            case 0:
                velocityX = -4;
                velocityZ = -12;
                break;
            case 1:
                velocityX = 4;
                velocityZ = -12;
                break;
            case 2:
                velocityX = -4;
                velocityZ = 12;
                break;
            case 3:
                velocityX = 4;
                velocityZ = 12;
                break;
            case 4:
                velocityX = 0;
                velocityZ = 10;
                break;
            case 5:
                velocityX = 0;
                velocityZ = -10;
                break;
        }
        gameStatus = "PLAY";
        calculIA();
    }

    var tmp = Date.now();
    var ball = sphere.position.x;

    function calculIA(){
        var predictedX = sphere.position.x;
        var predictedZ = sphere.position.z;
        var velX = velocityX;
        var velZ = velocityZ;
        while (true) {
            predictedX += velX;
            predictedZ += velZ;
            if (predictedX > 350) { 
                velX = -Math.abs(velX);  
            } else if (predictedX < -350) { 
                velX = Math.abs(velX); 
            }
            if (predictedZ + 55 > groundHeight/2) {
                ball = predictedX + 50;
                break;
            }
            if (predictedZ - 55 < -groundHeight/2) {
                ball = predictedX - 50;
                break;
            }
        }
    }
    
    function ia(){
        if (tmp + 16 <= Date.now())  {
            tmp = Date.now();
            if (Math.round(Math.trunc(ball) / 10) * 10 > rightPlayer.position.x && rightPlayer.position.x < groundWidth/2 - paddleWidth/2) {
                rightPlayer.position.x += 10;
            }
            else if (Math.round(Math.trunc(ball) / 10) * 10 < rightPlayer.position.x && rightPlayer.position.x > -groundWidth/2 + paddleWidth/2) {
                rightPlayer.position.x -= 10; 
            }
        }
    }

    function handleMovement() {
        if (gameStatus == "WAIT" && keysPressed[32]) {
            startGame();
        }
        if (keysPressed[27] && (gameStatus == "PLAY" || gameStatus == "WAIT"))
        {
            pauseGUI();
            gameStatus = "PAUSE";
            tmpZ = velocityZ;
            tmpX = velocityX;
            velocityZ = 0;
            velocityX = 0;
        }
        //LeftPlayer
        if(gameStatus == "PLAY")
        {
            if (keysPressed[65] && leftPlayer.position.x < groundWidth/2 - paddleWidth/2) {
                leftPlayer.position.x += 10;
            }
            if (keysPressed[68] && leftPlayer.position.x > -groundWidth/2 + paddleWidth/2) {
                leftPlayer.position.x -= 10;
            }
        }
        //RightPlayer
        if(gameMode == "IA" && gameStatus == "PLAY"){
            ia();
        }
        else if(gameMode == "PVP" || gameMode == "TOURNAMENT")
        {
            if (keysPressed[37] && rightPlayer.position.x < groundWidth/2 - paddleWidth/2) {
                rightPlayer.position.x += 10;
            }
            if (keysPressed[39] && rightPlayer.position.x > -groundWidth/2 + paddleWidth/2) {
                rightPlayer.position.x -= 10;
            }
        }
    }

    function detectCollision() {
        sphere.position.x += velocityX;
        sphere.position.z += velocityZ;
        if (sphere.position.z <= rightPlayer.position.z + paddleDepth*2  && (sphere.position.x > (rightPlayer.position.x - paddleWidth) && sphere.position.x  < (rightPlayer.position.x + paddleWidth))) {
            const relativePosition = (sphere.position.x - rightPlayer.position.x) / 50 ;
            velocityX = relativePosition * 10;
            velocityZ = -velocityZ;
        }
        else if (sphere.position.z >= leftPlayer.position.z - paddleDepth*2 && (sphere.position.x > (leftPlayer.position.x - paddleWidth) && sphere.position.x  < (leftPlayer.position.x + paddleWidth))) {
            const relativePosition = (sphere.position.x - leftPlayer.position.x) / 50 ;
            velocityX = relativePosition * 10;
            velocityZ = -velocityZ;
            calculIA();
        }
        if (sphere.position.x > 350) {
            velocityX = -Math.abs(velocityX);
        }
        else if (sphere.position.x < -350) {
            velocityX = Math.abs(velocityX);
        }
    }

    function scoreCounter(){
        if (sphere.position.z + 55 > groundHeight/2) {
            sphere.position.set(0, spherePositionY, 0);
            rightScore++;
            updateScores();
            velocityX = 0;
            velocityZ = 0;
        }
        else if (sphere.position.z - 55 < -groundHeight/2) {
            sphere.position.set(0, spherePositionY, 0);
            leftScore++;
            updateScores();
            velocityX = 0;
            velocityZ = 0;
        }
    }

    function resetPosition(){
        if (velocityX == 0 && velocityZ == 0 && sphere.position.z == 0 && sphere.position.x < leftPlayer.position.x && leftPlayer.position.x >= -230) {
            leftPlayer.position.x -= 10;
        }
        else if ( velocityX == 0 && velocityZ == 0 && sphere.position.z == 0 && sphere.position.x > leftPlayer.position.x && leftPlayer.position.x <= 230) {
            leftPlayer.position.x += 10;
        }

        if (velocityX == 0 && velocityZ == 0 &&  sphere.position.z == 0  && sphere.position.x < rightPlayer.position.x && rightPlayer.position.x >= -230) {
            rightPlayer.position.x -= 10;
        }
        else if (velocityX == 0 && velocityZ == 0 && sphere.position.z == 0 && sphere.position.x > rightPlayer.position.x && rightPlayer.position.x <= 230) {
            rightPlayer.position.x += 10;
        }
    }

    function loadModelWithRetry(fileName, retries, onSuccess) {
        let attempts = 0;

        function tryLoad() {
            BABYLON.ImportMeshAsync("./dist/assets/" + fileName, scene)
                .then(function(result) {
                    onSuccess(result);
                })
                .catch(function(error) {
                    attempts++;
                    if (attempts < retries) {
                        setTimeout(tryLoad, 1000);
                    }
                });
        }
        tryLoad();
    }

    var leftHead,rightHead,cow;
    // var leftHead,rightHead,cow;
    // loadModelWithRetry("head.glb", 2, function(result) {
    //     leftHead = result.meshes[0];
    //     leftHead.scaling = new BABYLON.Vector3(300, 300, 300);
    // });

    // loadModelWithRetry("head.glb", 2, function(result) {
    //     rightHead = result.meshes[0];
    //     rightHead.scaling = new BABYLON.Vector3(300, 300, 300);
    //     rightHead.rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.LOCAL);

    // });

    loadModelWithRetry("cow.glb", 2, function(result) {
        cow = result.meshes[0];
        cow.position.z = 0;
        cow.position.y = 50;
        cow.scaling = new BABYLON.Vector3(3, 3, 3);
        cow.rotation.z += 0.5;
    });

    function mouveTexture(){
        if(leftHead){
            leftHead.position.x = leftPlayer.position.x;
            leftHead.position.z = leftPlayer.position.z;
        }
        if(rightHead){
            rightHead.position.x = rightPlayer.position.x;
            rightHead.position.z = rightPlayer.position.z;
        }
        if(cow){
            cow.position.x = sphere.position.x;
            cow.position.z = sphere.position.z;
            cow.rotate(BABYLON.Axis.Y, 0.05 , BABYLON.Space.LOCAL);
        }
    } 


    engine.runRenderLoop(function () {
        handleMovement();
        detectCollision();
        scoreCounter();
        resetPosition();
        mouveTexture();
        scene.render();
    });

    // window.scene = scene;
}