const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");

require('custom-env').env(true, "../maps");

const map = require("./raw-data.json");
const globals = require("../global-constants");
const getEdgeTile = require("./getEdgeTile");
const waterTileDefintion = require("./tileDefinitions/water.json");
const roadTileDefintion = require("./tileDefinitions/road.json");
const cityRoadTileDefintion = require("./tileDefinitions/cityRoad.json");
const remoteTileDefintion = require("./tileDefinitions/remote.json");

// Dimensions for the image
const width = map[0].length * globals.TILE_SIZE;
const height = map.length * globals.TILE_SIZE;


console.log("------------------------------------------");
console.log(`Now rendering map for ${process.env.COUNTY_NAME}`);
console.log(`\tHorizontal Pieces: ${process.env.BACKGROUND_PIECES_HORITZONTAL}`);
console.log(`\tVertical Pieces: ${process.env.BACKGROUND_PIECES_VERTICAL}`);

const hPieces = process.env.BACKGROUND_PIECES_HORITZONTAL || globals.BACKGROUND_PIECES_HORITZONTAL;
const vPieces = process.env.BACKGROUND_PIECES_VERTICAL || globals.BACKGROUND_PIECES_VERTICAL;

const canvasWidth = (width / hPieces);
const canvasHeight = (height / vPieces);
// Instantiate the canvas object
const canvas = createCanvas(canvasWidth, canvasHeight);
const context = canvas.getContext("2d");

// const spriteMapColumns = 40;
const spriteMapColumns = 32;

context.fillStyle = "#764abc";
context.fillRect(0, 0, canvasWidth, canvasHeight);

const landIds = [0, 1, 2, 3, 4, 5, 6, 0, 1, 2, 3, 4, 5, 6, 0, 1, 2, 3, 4, 5, 6, 0, 1, 2, 3, 4, 5, 6, 325, 326, 327, 328];


function getFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}
// https://www.boristhebrave.com/2021/11/14/classification-of-tilesets/
function getTileXY(tile) {
    let id = null;

    switch (tile.type) {
        case globals.TILES.WATER:
            id = getEdgeTile(map, tile, waterTileDefintion);
            break;
        case globals.TILES.LAND:
            id = getFromArray(landIds);
            break;
        case globals.TILES.REMOTELAND:
            id = getEdgeTile(map, tile, remoteTileDefintion);
            break;
        case globals.TILES.ROAD:
            id = getEdgeTile(map, tile, roadTileDefintion,
                (_targetTile, _tile) => ![globals.TILES.ROAD, globals.TILES.CITY_ROAD].includes(_targetTile)
            );
            break;
        case globals.TILES.CITY_ROAD:
            id = getEdgeTile(map, tile, cityRoadTileDefintion,
                (_targetTile, _tile) => ![globals.TILES.CITY_ROAD, globals.TILES.ROAD].includes(_targetTile)
            );
            break;
        case globals.TILES.PLACE:
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
        case globals.TILES.BUILT_UP_DENSITY_1:
            id = getFromArray([213, 2, 1, 1, 209]);
            break;
        case globals.TILES.BUILT_UP_DENSITY_2:
            id = getFromArray([213, 2, 1, 1, 209]);
            break;
        case globals.TILES.BUILT_UP_DENSITY_3:
            id = getFromArray([213, 212, 211, 2, 1, 209]);
            break;
        case globals.TILES.BUILT_UP_DENSITY_4:
            id = getFromArray([213, 212, 211, 1, 209]);
            break;
        case globals.TILES.BUILT_UP_DENSITY_5:
            id = getFromArray([213, 203, 212, 211, 208, 207, 206, 209]);
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
            console.log("writing to", `./output/background-${hPiece}-${vPiece}.png`);
            fs.writeFileSync(`./output/background-${hPiece}-${vPiece}.png`, buffer);
            console.log("\t|\tFile " + (image++) + " of " + (hPieces * vPieces) + " created");


        }
    }


    var json = JSON.stringify({
        horizontalPieces: hPieces,
        verticalPieces: vPieces,
    });
    fs.writeFile('./output/background-config.json', json, 'utf8', () => { });

});
