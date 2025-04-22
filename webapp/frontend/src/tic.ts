import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui/2D';
import { registerBuiltInLoaders } from "@babylonjs/loaders/dynamic";

registerBuiltInLoaders();

var canvas = document.getElementById("tic-tac-toe")  as HTMLCanvasElement;
var engine = new BABYLON.Engine(canvas, true);

canvas.height= 600;
canvas.width= 800;
var Name;

function resizeCanvas (canvas: HTMLCanvasElement) {
	canvas.width = (window.innerWidth / 6) * 5;
	// canvas.width = window.innerWidth - myDrawerWidth;
	canvas.height = (window.innerHeight / 6) * 5;
	// canvas.height = window.innerHeight - (myHeaderHeight + myFooterHeight);
}
resizeCanvas(canvas);

window.addEventListener('resize', () => {
	resizeCanvas(canvas);
	engine.resize();
});

function endMorp(opponent_name,winner_name,draw_int) {
	var payload = {
		opponent: opponent_name,
		winner: winner_name,
		draw: draw_int
	};
	fetch("/endmorp", {
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		method: 'POST',
		body: JSON.stringify(payload)
	});
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

async function setName(){
	Name = await getCurrentUser();
}

var WinContainer;


var button;
var gameState = ["", "", "", "", "", "", "", "", ""];
function createScene() {
	setName();
	var scene = new BABYLON.Scene(engine);
	scene.clearColor = new BABYLON.Color4(0.2, 0.2, 0.25);
	var camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 4, 9, BABYLON.Vector3.Zero(), scene);
	camera.lowerRadiusLimit = 4;
	camera.upperRadiusLimit = 30;
	const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(-1, 2, -2), scene);
	const light = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(0, 5, 0), scene);
	light.intensity = 0.3;
	camera.setTarget(new BABYLON.Vector3(1, -1, -1));

	var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:20}, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("https://www.babylonjs.com/assets/skybox/TropicalSunnyDay", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
	const proto = BABYLON.MeshBuilder.CreateBox("proto", {
		size: 1
	}, scene);
	proto.material = new BABYLON.StandardMaterial("material");
	// proto.material.diffuseColor = new BABYLON.Color4(0.3, 0.23, 0.89);
	var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
	skyboxMaterial.backFaceCulling = false;
	skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("./dist/assets/wood/wood", scene);
	skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
	skyboxMaterial.disableLighting = true;
	proto.material = skyboxMaterial;
	proto.isVisible = false;
	const floor = BABYLON.Mesh.CreateGround("floor", 20, 20, 1, scene, false);
    const floorMat = new BABYLON.StandardMaterial("floorMat", scene);
    floorMat.diffuseTexture = new BABYLON.Texture("./dist/assets/water.png", scene);
    floorMat.alpha = 0.5;
	if (floorMat.diffuseTexture instanceof BABYLON.Texture) {
		floorMat.diffuseTexture.uScale = 15;
		floorMat.diffuseTexture.vScale = 10;
	}
    floor.material = floorMat;
	const boxPositions = [
		[0, 0, 0],
		[1.1, 0, 0],
		[2.2, 0, 0],
		[0, 0, -1.1],
		[1.1, 0, -1.1],
		[2.2, 0, -1.1],
		[0, 0, -2.2],
		[1.1, 0, -2.2],
		[2.2, 0, -2.2]
	];
	let bPos = function(fieldmesh, order) {
		fieldmesh.position = new BABYLON.Vector3(boxPositions[order][0], boxPositions[order][1], boxPositions[order][2]);
	}
	const box0 = proto.createInstance("box0");
	bPos(box0, 0);
	const box1 = proto.createInstance("box1");
	bPos(box1, 1);
	const box2 = proto.createInstance("box2");
	bPos(box2, 2);
	const box3 = proto.createInstance("box3");
	bPos(box3, 3);
	const box4 = proto.createInstance("box4");
	bPos(box4, 4);
	const box5 = proto.createInstance("box5");
	bPos(box5, 5);
	const box6 = proto.createInstance("box6");
	bPos(box6, 6);
	const box7 = proto.createInstance("box7");
	bPos(box7, 7);
	const box8 = proto.createInstance("box8");
	bPos(box8, 8);

	const torus = BABYLON.MeshBuilder.CreateTorus("torus", {
		thickness: 0.20,
		diameter: 0.75,
		tessellation: 32
	}); 
	torus.material = new BABYLON.StandardMaterial("torusmaterial");
	// torus.material.diffuseColor = new BABYLON.Color3(0.6, 0.1, 0.3);
	torus.isVisible = false;
	let cylinder = BABYLON.MeshBuilder.CreateCylinder('cylinder', {
		height: 1,
		diameter: 0.2
	}, scene);
	let newcylinder = cylinder.clone();
	newcylinder.rotation.x = -Math.PI / 2;;
	const mesh = BABYLON.Mesh.MergeMeshes([cylinder, newcylinder]); // "X"
	mesh.rotation.y = Math.PI / 4;
	mesh.rotation.z = -Math.PI / 2;
	mesh.position.y = 0.1;
	mesh.material = new BABYLON.StandardMaterial("meshmaterial");
	// mesh.material.diffuseColor = new BABYLON.Color3(0.2, 0.9, 0.3);
	mesh.isVisible = false;
	const frameRate = 10;
	const xSlide = new BABYLON.Animation("xSlide", "position.y", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
	const keyFrames = [];

	const xSlide2 = new BABYLON.Animation("xSlide2", "position.y", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
	const dropFrames = [];
	var dropWinBox = function(boxname) {
			setTimeout(() => {}, 3000);
			dropFrames.push({
				frame: 0,
				value: 0
			});
			dropFrames.push({
				frame: frameRate,
				value: .5
			});
			dropFrames.push({
				frame: 4 * frameRate,
				value: -500
			});
			xSlide2.setKeys(dropFrames);
			boxname.animations.push(xSlide2);
			const myAnim2 = scene.beginAnimation(boxname, 0, 2 * frameRate, true);
			setTimeout(() => {
				myAnim2.stop()
			}, 2000);
		} 
	var gui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI");
	button = GUI.Button.CreateSimpleButton("button", "Tour de : invité");
	button.top = "10";
	button.left = "0";
    button.verticalAlignment = 0;
	button.width = "300px";
	button.height = "60px";
	button.cornerRadius = 20;
	button.thickness = 0;
	button.children[0].color = "#2b7fff";
	button.children[0].fontSize = 22;
	button.background = "#101828";
	
	button.onPointerEnterObservable.add(() => {
        button.children[0].color = "#ffffff";
        button.background = "#2b7fff"
		button.children[0].text = "Rejouer "
    });
    button.onPointerOutObservable.add(() => {
		showTurn();
        button.children[0].color = "#2b7fff";
        button.background = "#101828"
    });
	gui.addControl(button);
	let currentPlayer = "X";
	let lastPlayer = "O";
	let gameActive = true;


	function handlePlayerChange() {
		currentPlayer = currentPlayer === "X" ? "O" : "X";
	}
	const winningConditions = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6]
	];
	let dynamicText;
	function showTurn() {
		var tmp;
		
		if(currentPlayer == "X")
			tmp = "invité"
		else if(currentPlayer == "O")
			tmp = Name;
		dynamicText = "Tour de : " + tmp;
		button.children[0].text = dynamicText;
	}



	function handleResultValidation() {
		let roundWon = false;
		for(let i = 0; i <= 7; i++) {
			const winCondition = winningConditions[i];
			let a = gameState[winCondition[0]];
			let b = gameState[winCondition[1]];
			let c = gameState[winCondition[2]];
			if(a === '' || b === '' || c === '') {
				continue;
			}
			if(a === b && b === c) {
				roundWon = true;
				for(let index = 0; index <= 2; index++) {
					let winboxName = "box" + winningConditions[i][index];
					dropWinBox(scene.getMeshByName(winboxName));
				}
				break
			}
			showTurn();

		}
		if(roundWon) {
			gameActive = false;
			var name;
			if(currentPlayer == "X"){
				name = "invité"
				endMorp("invité","invité", 0);
				var gui2 = GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI")
				var background = new GUI.Rectangle();
				background.width = "350px";
				background.height = "50px";
				background.cornerRadius = 20;
				background.thickness = 0;
				background.background = "#101828B8";
				WinContainer = new GUI.Grid();
				WinContainer.addControl(background);
				gui2.addControl(WinContainer);
				var Winner = new GUI.TextBlock();
				if(name == "")
					Winner.text = "Match Nul !";
				else
					Winner.text = name + " a gagner !";
				Winner.fontSize = 32;
				Winner.color = "white";
				Winner.top = "";
				Winner.left = "";
				WinContainer.addControl(Winner);
			}
			else{
				name = Name;
				var gui2 = GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI")
				var background = new GUI.Rectangle();
				background.width = "350px";
				background.height = "50px";
				background.cornerRadius = 20;
				background.thickness = 0;
				background.background = "#101828B8";
				WinContainer = new GUI.Grid();
				WinContainer.addControl(background);
				gui2.addControl(WinContainer);
				var Winner = new GUI.TextBlock();
				if(name == "")
					Winner.text = "Match Nul !";
				else
					Winner.text = name + " a gagner !";
				Winner.fontSize = 32;
				Winner.color = "white";
				Winner.top = "";
				Winner.left = "";
				WinContainer.addControl(Winner);
				endMorp("invité",Name,0);
			}
			button.children[0].text = "ok";
			return;
		}
		let roundDraw = !gameState.includes("");
		if(roundDraw) {
			name = "";
			endMorp("invité","invité",1);

			var gui2 = GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI")
			var background = new GUI.Rectangle();
			background.width = "350px";
			background.height = "50px";
			background.cornerRadius = 20;
			background.thickness = 0;
			background.background = "#101828B8";
			WinContainer = new GUI.Grid();
			WinContainer.addControl(background);
			gui2.addControl(WinContainer);
			var Winner = new GUI.TextBlock();
			if(name == "")
				Winner.text = "Match Nul !";
			else
				Winner.text = name + " a gagner !";
			Winner.fontSize = 32;
			Winner.color = "white";
			Winner.top = "";
			Winner.left = "";
			WinContainer.addControl(Winner);
			button.children[0].text = "Match Nul.";
			gameActive = false;
			return;
		}
	} 


	function oTurn() {
		if(gameActive) {
			if (currentPlayer == "O") {
				scene.onPointerDown = function(evt, pickResult) {
					if (gameActive && pickResult.hit) {
						if (pickResult.pickedMesh.name.includes("box")) {
							var boxIndex = parseInt(pickResult.pickedMesh.name.charAt(pickResult.pickedMesh.name.length - 1), 10);
							if (!gameState[boxIndex]) {
								gameState[boxIndex] = "O";
								var turnMesh = torus.createInstance("torusmain");
								turnMesh.position = new BABYLON.Vector3(boxPositions[boxIndex][0], boxPositions[boxIndex][1] + 0.5, boxPositions[boxIndex][2]);
								let numbers = gameState;
								let result = true;
								for(let i = 0; i < numbers.length; i++) {
									if(numbers[i] == "") {
										result = false;
										currentPlayer = "O";
										break;
									}
								}
								handleResultValidation();
								if (gameActive) {
									handlePlayerChange();
									Xturn()
								}
								showTurn(); 
							}
						}
					}
				};
			}
		}
	}

	function Xturn() {
		if (gameActive) {
			scene.onPointerDown = function(evt, pickResult) {
				if (gameActive && pickResult.hit) {
			
					if (pickResult.pickedMesh.name.includes("box")) {
						var boxIndex = parseInt(pickResult.pickedMesh.name.charAt(pickResult.pickedMesh.name.length - 1), 10);
						
						if (!gameState[boxIndex]) {
							gameState[boxIndex] = "X";
							var turnMesh = mesh.createInstance("meshmain");
							turnMesh.position = new BABYLON.Vector3(boxPositions[boxIndex][0], boxPositions[boxIndex][1] + 0.5, boxPositions[boxIndex][2]);
	
							handleResultValidation();
	
							if (gameActive) {
								handlePlayerChange(); 
								oTurn(); 
							}
							showTurn();
						}
					}
				}
			};
		}
	}
	

	scene.onPointerDown = function(evt, pickResult) {
		if(gameActive) {
			if(pickResult.hit) {
				if(currentPlayer == "X") {
					if(pickResult.pickedMesh.name.includes("box")) {
						var boxIndex = parseInt(pickResult.pickedMesh.name.charAt(pickResult.pickedMesh.name.length - 1), 10);
						if(!gameState[boxIndex]) {
							gameState[boxIndex] = currentPlayer;
							var turnMesh = mesh.createInstance("meshmain");
							turnMesh.position = new BABYLON.Vector3(boxPositions[boxIndex][0], boxPositions[boxIndex][1] + 0.5, boxPositions[boxIndex][2]);
							let numbers = gameState;
							let result = true;
							for(let i = 0; i < numbers.length; i++) {
								if(numbers[i] == "") {
									result = false;
									break;
								}
							}
							if(gameActive) {
								if(!result) {
									handlePlayerChange();
									oTurn();
								}
							}
						}
					}
				}
				showTurn();
				handleResultValidation();

				function handleRestartGame() {
					gameActive = true;
					currentPlayer = "X";
					gameState = ["", "", "", "", "", "", "", "", ""];
					button.children[0].text = "Tour de : invité";
					bPos(box0, 0);
					bPos(box1, 1);
					bPos(box2, 2);
					bPos(box3, 3);
					bPos(box4, 4);
					bPos(box5, 5);
					bPos(box6, 6);
					bPos(box7, 7);
					bPos(box8, 8);
					for(let i = 0; i < scene.meshes.length; i++) {
						if(scene.getMeshByName("torusmain")) {
							scene.getMeshByName("torusmain").dispose();
						}
						if(scene.getMeshByName("meshmain")) {
							scene.getMeshByName("meshmain").dispose();
						}
					}
				}
				button.onPointerClickObservable.add(function() {
					handleRestartGame();
					if(WinContainer)
						WinContainer.isVisible = false;

				});
			}
		}
	};
	return scene;
};

var scene = createScene();
var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

engine.runRenderLoop(function () {

    scene.render();
});