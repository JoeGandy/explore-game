const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const map = require("./raw-data.json");
const globals = require("../global-constants");
const getEdgeTile = require("./getEdgeTile");
const waterTileDefintion = require("./tileDefinitions/water.json");
const roadTileDefintion = require("./tileDefinitions/road.json");

// Dimensions for the image
const width = map[0].length * globals.TILE_SIZE;
const height = map.length * globals.TILE_SIZE;

const hPieces = globals.BACKGROUND_PIECES_HORITZONTAL;
const vPieces = globals.BACKGROUND_PIECES_VERTICAL;

const canvasWidth = (width / hPieces);
const canvasHeight = (height / vPieces);
// Instantiate the canvas object
const canvas = createCanvas(canvasWidth, canvasHeight);
const context = canvas.getContext("2d");

// const spriteMapColumns = 40;
const spriteMapColumns = 32;

context.fillStyle = "#764abc";
context.fillRect(0, 0, canvasWidth, canvasHeight);

const landIds = [0, 1, 2, 3, 4, 5, 6];
const remoteLandIds = [291, 292, 293];
function getTileXY(tile) {
    let id = null;

    switch (tile.type) {
        case 0: //WATER
            // https://www.boristhebrave.com/2021/11/14/classification-of-tilesets/
            id = getEdgeTile(map, tile, waterTileDefintion);
            break;
        case 1: //LAND
            id = landIds[Math.floor(Math.random() * landIds.length)];
            break;
        case 2: //REMOTELAND
            id = remoteLandIds[Math.floor(Math.random() * remoteLandIds.length)];
            break;
        case 3: //ROAD
            id = getEdgeTile(map, tile, roadTileDefintion);
            break;
        case 4: //PLACE
            switch (tile.extraInfo.properties.place) {
                case 'hamlet':
                    id = 201;
                    break;
                case 'village':
                    id = 199;
                    break;
                case 'town':
                    id = 195;
                    break;
                case 'city':
                    id = 198;
                    break;
                case 'suburb':
                    id = 193;
                    break;
            }
            break;
        default:
            id = 704;
    }

    return {
        x: Math.floor(id % spriteMapColumns) * globals.TILE_SIZE,
        y: Math.floor(id / spriteMapColumns) * globals.TILE_SIZE,
    } //https://stackoverflow.com/questions/47951361/finding-x-y-based-off-of-index
}

loadImage("../spritemap-new-new.png").then((tileMap) => {
    let image = 1;
    for (let hPiece = 0; hPiece < hPieces; hPiece++) {
        for (let vPiece = 0; vPiece < vPieces; vPiece++) {
            for (let y = 0; y < map.length; y++) {
                for (let x = 0; x < map[0].length; x++) {
                    const tile = map[y][x];
                    const tileXY = getTileXY(tile);

                    const targetLocX = (x * globals.TILE_SIZE) - (hPiece * canvasWidth);
                    const targetLocY = (y * globals.TILE_SIZE) - (vPiece * canvasHeight);

                    //draw the image    
                    context.drawImage(
                        tileMap, // image
                        tileXY.x, // source x
                        tileXY.y, // source y
                        globals.TILE_SIZE, // source width
                        globals.TILE_SIZE, // source height
                        targetLocX, // target x
                        targetLocY, // target y
                        globals.TILE_SIZE, // target width
                        globals.TILE_SIZE, // target height
                    );
                }
            }
            const buffer = canvas.toBuffer("image/png");
            fs.writeFileSync(`./output/background-${hPiece}-${vPiece}.png`, buffer);
            console.log("\t|\tFile " + (image++) + " of " + (hPieces * vPieces) + " created");


        }
    }



});
