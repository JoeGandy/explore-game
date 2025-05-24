const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");

require('custom-env').env(true, "../maps");

const { getTileBitmask } = require('./getTile.js');
const { getTilemapMapping } = require('./getTilemapMapping.js');
const { performance } = require('perf_hooks');
const map = require("./raw-data.json");
const globals = require("../global-constants.js");
const { waterTileMap } = require("./tileDefinitions/water.js");
const landTileDefinition = require("./tileDefinitions/land.json");
const beachTileDefinition = require("./tileDefinitions/beach.json");

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

context.fillStyle = "#764abc";
context.fillRect(0, 0, canvasWidth, canvasHeight);

let spriteMaps = {
    "A2": {
        path: "./spriteMaps/A2 - Terrain and Misc.png",
        loadedImage: null,
        columns: 102,
    },
    "A1": {
        path: "./spriteMaps/A1 - Liquids And Misc.png",
        loadedImage: null,
        columns: 72,
    },
}

function getRandomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function getTileXY(tile) {
    let id = null, image = null;

    switch (tile.type) {
        case globals.TILES.WATER:
            id = getTilemapMapping(getTileBitmask(map, tile), waterTileMap);
            image = "A1";
            break;
        case globals.TILES.LAND:
            id = getRandomFromArray(landTileDefinition.baseTiles);
            image = "A2";
            break;
        case globals.TILES.BEACH:
            id = getRandomFromArray(beachTileDefinition.baseTiles);
            image = "A2";
            break;
        default:
            id = 7483;
            image = "A2";
            break;
    }

    return {
        image,
        x: (id % spriteMaps[image].columns) * globals.TILE_SIZE,
        y: Math.floor(id / spriteMaps[image].columns) * globals.TILE_SIZE,
    }
}

for (key of Object.keys(spriteMaps)) {
    spriteMaps[key].loadedImage = loadImage(spriteMaps[key].path);
}

function resolveObject(obj) {
    return Promise.all(
        Object.entries(obj).map(async ([k, v]) => [k, await v])
    ).then(Object.fromEntries);
}

resolveObject(spriteMaps).then(async (resolvedSpriteMaps) => {
    let imageIndex = 1;

    const tileWidth = globals.TILE_SIZE;
    const tileHeight = globals.TILE_SIZE;

    const tilesPerRow = Math.ceil(canvasWidth / tileWidth);
    const tilesPerColumn = Math.ceil(canvasHeight / tileHeight);

    for (let hPiece = 0; hPiece < hPieces; hPiece++) {
        for (let vPiece = 0; vPiece < vPieces; vPiece++) {
            const startTime = performance.now();

            // Calculate visible tile range for this piece
            const startX = hPiece * tilesPerRow;
            const startY = vPiece * tilesPerColumn;
            const endX = Math.min(startX + tilesPerRow, map[0].length);
            const endY = Math.min(startY + tilesPerColumn, map.length);

            for (let y = startY; y < endY; y++) {
                for (let x = startX; x < endX; x++) {
                    const tile = map[y][x];
                    const tileXY = getTileXY(tile);

                    const image = await resolvedSpriteMaps[tileXY.image].loadedImage;

                    const targetLocX = (x * tileWidth) - (hPiece * canvasWidth);
                    const targetLocY = (y * tileHeight) - (vPiece * canvasHeight);

                    context.drawImage(
                        image,
                        tileXY.x,
                        tileXY.y,
                        tileWidth,
                        tileHeight,
                        targetLocX,
                        targetLocY,
                        tileWidth,
                        tileHeight
                    );
                }
            }

            const buffer = canvas.toBuffer("image/png");
            const filePath = `./output/background-${hPiece}-${vPiece}.png`;
            console.log("Writing to", filePath);
            fs.writeFileSync(filePath, buffer);
            console.log(`\t|\tFile ${imageIndex++} of ${hPieces * vPieces} created`);
            console.log(`\tTook ${Math.round(performance.now() - startTime)} ms`);
        }
    }

    // Only write JSON config once
    const config = {
        horizontalPieces: hPieces,
        verticalPieces: vPieces
    };
    fs.writeFileSync('./output/background-config.json', JSON.stringify(config), 'utf8');
});