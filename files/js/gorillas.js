//State of the game
let state = {};

//The main canvas element and its drawing context
const canvas = document.getElementById("game");
const angle1DOM = document.querySelector("#info-left .angle");
const velocity1DOM = document.querySelector("#info-left .velocity");
const angle2DOM = document.querySelector("#info-right .angle");
const velocity2DOM = document.querySelector("#info-right .velocity");
const bombGrabAreaDOM = document.getElementById("bomb-grab-area");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");
theLastbuilding = -2


newGame();

function newGame()
{
	//Reset game state
	state = 
	{
		phase: "aiming",  //aiming | in flight | celebrating
		currentPlayer: 1,
		bomb:
		{
			x: undefined,
			y: undefined,
			rotation: 0,
			velocity: {x: 0, y: 0},	
		},

		//buildings
		backgroundBuildings: [],
		buildings: [],
		blastHoles: [],

		scale: 256,
	};

	//generate background building
	for(let i = 0; i < 11; i++)
	{
		generateBackgroundBuilding(i);
	}

	//generate foreground building
	for(let j=0; j < 8; j++)
	{
		generateBuilding(j);
	}

	window.addEventListener("resize", () =>{
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	

		calculateScale();
		initializeBombPosition();
		draw();
	});
	calculateScale();
	initializeBombPosition();
	draw();
}

function draw()
{
	ctx.save();

	//Flip coordinates system upside down
	ctx.translate(0, window.innerHeight);
	ctx.scale(1, -1);
	ctx.scale(state.scale, state.scale);

	//Draw scence
	drawBackground();
	drawBackgroundBuildings();
	drawBuildings();
	drawGorilla(1);
	drawGorilla(2);
	drawBomb();

	//Restore transformation
	ctx.restore();
}

function drawBackground()
{
	const gradient = ctx.createLinearGradient(0,0,0, window.innerHeight / state.scale);
	gradient.addColorStop(1, "#F8BA85");
	gradient.addColorStop(0, "#FFC28E");

	//Draw sky
	ctx.fillStyle = gradient;
	ctx.fillRect(0,0, window.innerWidth / state.scale, window.innerHeight / state.scale);

	//Draw moon
	ctx.fillStyle = "rgba(255,255,255, 0.6)";
	ctx.beginPath();
	ctx.arc(300,350, 60, 0, 2 * Math.PI);
	ctx.fill();
}

function drawGorilla(player)
{
	ctx.save();
	const building =
		player === 1
			? state.buildings.at(1) // second building
			: state.buildings.at(theLastbuilding) // second to last building
	
	ctx.translate(building.x + building.width / 2, building.height);

	drawGorillaBody();
	drawGorillaLeftArm(player);
	drawGorillaRightArm(player);
	drawGorillaFace(player);

	ctx.restore();
}

function drawGorillaBody()
{
	ctx.fillStyle = "black";

	ctx.beginPath();
	ctx.moveTo(0,15);
	ctx.lineTo(-7,0);
	ctx.lineTo(-20,0);
	ctx.lineTo(-17,18);
	ctx.lineTo(-20,44);

	ctx.lineTo(-11,77);
	ctx.lineTo(0,84);
	ctx.lineTo(11,77);

	ctx.lineTo(20,44);
	ctx.lineTo(17,18);
	ctx.lineTo(20,0);
	ctx.lineTo(7,0);
	ctx.fill();
}

function drawGorillaLeftArm(player)
{
	ctx.strokeStyle = "black";
	ctx.lineWidth = 18;

	ctx.beginPath();
	ctx.moveTo(-14,50);

	if(state.phase === "aiming" && state.currentPlayer === 1 && player === 1)
	{
		ctx.quadraticCurveTo(-44, 63, -28, 107);
	}
	else if (state.phase === "celebrating" && state.currentPlayer === player)
	{
		ctx.quadraticCurveTo(-44, 63, -28, 107);
	}
	else
	{
		ctx.quadraticCurveTo(-44, 45, -28, 12);
	}
	ctx.stroke();
}

function drawGorillaRightArm(player)
{
	ctx.strokeStyle = "black";
	ctx.lineWidth = 18;

	ctx.beginPath();
	ctx.moveTo(+14,50);

	if(state.phase === "aiming" && state.currentPlayer === 2 && player === 2)
	{
		ctx.quadraticCurveTo(+44, 63, +28, 107);
	}
	else if (state.phase === "celebrating" && state.currentPlayer === player)
	{
		ctx.quadraticCurveTo(+44, 63, +28, 107);
	}
	else
	{
		ctx.quadraticCurveTo(+44, 45,+ 28, 12);
	}
	ctx.stroke();
}

function drawGorillaFace(player)
{
	ctx.fillStyle = "lightgray";
	ctx.beginPath();
	ctx.arc(0, 63, 9, 0 , 2 * Math.PI);
	ctx.moveTo(-3.5, 70);
	ctx.arc(-3.5, 70, 4, 0, 2 * Math.PI);
	ctx.moveTo(+3.5, 70);
	ctx.arc(3.5, 70, 4, 0, 2 * Math.PI);
	ctx.fill();

	//Eyes
	ctx.fillStyle = "blue";
	ctx.beginPath();
	ctx.arc(-3.5, 70, 1.4, 0, 2 * Math.PI);
	ctx.moveTo(+3.5, 70);
	ctx.arc(+3.5, 70, 1.4, 0, 2 * Math.PI);
	ctx.fill();

	ctx.strokeStyle = "black";
	ctx.lineWidth = 1.4;

	//Nose
	ctx.beginPath();
	ctx.moveTo(-3.5, 66.5);
	ctx.lineTo(-1.5, 65);
	ctx.moveTo(3.5, 66.5);
	ctx.lineTo(1.5, 65);
	ctx.stroke();

	//Mouth
	ctx.beginPath();
	if(state.phase === "celebrating" && state.currentPlayer === player)
	{
		ctx.moveTo(-5, 60);
		ctx.quadraticCurveTo(0, 56, 5, 60);
	}
	else
	{
		ctx.moveTo(-5, 56);
		ctx.quadraticCurveTo(0, 60, 5, 56);
	}
	ctx.stroke();
}

function drawBackgroundBuildings()
{
	state.backgroundBuildings.forEach((building) =>
	{
		ctx.fillStyle = "#947285";
		ctx.fillRect(building.x, 0, building.width, building.height);
	});
}

function drawBuildings()
{
	state.buildings.forEach((building) =>
	{
		//Draw buildings
		ctx.fillStyle = "#4A3C68";
		ctx.fillRect(building.x, 0, building.width, building.height);

		//Draw windows
		const windowWidth = 10;
		const windowHeight = 12;
		const gap = 15;

		const numberOfFloors = Math.ceil(
				(building.height - gap) / (windowHeight + gap)
			);

		const numberOfRoomsPerFloor = Math.floor(
				(building.width - gap) / (windowWidth + gap)
			);

	 	for(let floor = 0; floor < numberOfFloors; floor++)
	 	{
	 		for(let room = 0; room < numberOfRoomsPerFloor; room++)
	 		{
	 			if(building.lightsOn[floor * numberOfRoomsPerFloor + room])
	 			{
	 				ctx.save();
	 				ctx.translate(building.x + gap, building.height - gap);
	 				ctx.scale(1,-1);

	 				const x = room * (windowWidth + gap);
	 				const y = floor * (windowHeight + gap);

	 				ctx.fillStyle = "#EBB6A2";
	 				ctx.fillRect(x,y, windowWidth, windowHeight);
	 				ctx.restore();
	 			}
	 		}
		}
	 });
}

function drawBomb()
{
	ctx.save();
	ctx.translate(state.bomb.x, state.bomb.y);

	//Draw circle
	ctx.fillStyle = "#442301";
	ctx.beginPath();
	
	ctx.arc(0,0,9,0 , 2 * Math.PI);
	
	ctx.fill();

	ctx.restore();

}

function throwBomb()
{

}

function animate(timestamp)
{

}

function generateBackgroundBuilding(index)
{
	const previousBuilding = state.backgroundBuildings[index - 1];

	const x = previousBuilding 
		? previousBuilding.x + previousBuilding.width + 4
		: -30;
	const minWidth = 60;
	const maxWidth = 110;
	const width = minWidth + Math.random() * (maxWidth - minWidth);

	const minHeight = 80;
	const maxHeight = 350;
	const height = minHeight + Math.random() * (maxHeight - minHeight);

	state.backgroundBuildings.push({x, width, height});
}

function generateBuilding(index)
{
	const previousBuilding = state.buildings[index - 1];

	const x = previousBuilding 
		? previousBuilding.x + previousBuilding.width + 4
		: 0;
	const minWidth = 80;
	const maxWidth = 130;
	const width = minWidth + Math.random() * (maxWidth - minWidth);
	
	const platformWithGorilla = index === 1 || index === 22;


	const minHeight = 80;
	const maxHeight = 350;
	const minHeightGorilla = 30;
	const maxHeightGorilla = 150;

	const height = platformWithGorilla
		? minHeightGorilla + Math.random() * (maxHeightGorilla - minHeightGorilla)
		: minHeight + Math.random() * (maxHeight - minHeight);

	//Genereate an array of booleans to show if the light is on or off
	const lightsOn = [];
	for (let l = 0; l < 50; l++)
	{
		const light = Math.random() <= 0.33 ? true : false;
		lightsOn.push(light);
	}
	state.buildings.push({x, width, height, lightsOn});

}

function initializeBombPosition()
{
	const building = 
		state.currentPlayer === 1
		? state.buildings.at(1) 
		: state.buildings.at(theLastbuilding);

	const gorillaX = building.x + building.width/2;
	const gorillaY = building.height;

	const gorillaHandOffsetX = state.currentPlayer === 1 ? -28 : 28;
	const gorillaHandOffsetY = 107;

	state.bomb.x = gorillaX + gorillaHandOffsetX;
	state.bomb.y = gorillaY + gorillaHandOffsetY;
	state.bomb.velocity.x = 0;
	state.bomb.velocity.y = 0;

	//Initialize grab area position
	const grabAreaRadius = 15;
	const left = state.bomb.x * state.scale - grabAreaRadius ;
	const bottom = (state.bomb.y * state.scale - grabAreaRadius) -20;
	bombGrabAreaDOM.style.left = `${left}px`;
	bombGrabAreaDOM.style.bottom = `${bottom}px`;
}

function calculateScale()
{
	const lastBuilding = state.buildings.at(-1);
	const totalWidthOfTheCity = lastBuilding.x + lastBuilding.width;

	state.scale = window.innerWidth / totalWidthOfTheCity;
}