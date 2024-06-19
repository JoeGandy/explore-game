const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const map = require("./raw-data.json");
const globals = require("../global-constants");

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


context.fillStyle = "#764abc";
context.fillRect(0, 0, canvasWidth, canvasHeight);

function getTile(tile, direction) {
    let modifier = { x: 0, y: 0 };

    switch (direction) {
        case 'above':
            modifier.x = 1;
            break;
        case 'aboveLeft':
            modifier.x = 1;
            modifier.y = -1;
            break;
        case 'aboveRight':
            modifier.x = 1;
            modifier.y = 1;
            break;
        case 'below':
            modifier.x = -1;
            break;
        case 'belowLeft':
            modifier.x = -1;
            modifier.y = -1;
            break;
        case 'belowRight':
            modifier.x = -1;
            modifier.y = 1;
            break;
        case 'left':
            modifier.y = -1;
            break;
        case 'right':
            modifier.y = 1;
            break;
    }

    if (typeof map[tile.coordinate.x + modifier.x] === 'undefined' || typeof map[tile.coordinate.x + modifier.x][tile.coordinate.y + modifier.y] === 'undefined') {
        return null;
    }

    return map[tile.coordinate.x + modifier.x][tile.coordinate.y + modifier.y].type;
}

function arrayMatch(a1, a2) {
    return JSON.stringify(a1) === JSON.stringify(a2);
}

function rotateClockwise(a) {
    var n = a.length;
    for (var i = 0; i < n / 2; i++) {
        for (var j = i; j < n - i - 1; j++) {
            var tmp = a[i][j];
            a[i][j] = a[n - j - 1][i];
            a[n - j - 1][i] = a[n - i - 1][n - j - 1];
            a[n - i - 1][n - j - 1] = a[j][n - i - 1];
            a[j][n - i - 1] = tmp;
        }
    }
    return a;
}

function getTilesAround(tile){
    const aboveTile = getTile(tile, 'above');
    const aboveLeftTile = getTile(tile, 'aboveLeft');
    const aboveRightTile = getTile(tile, 'aboveRight');
    const belowTile = getTile(tile, 'below');
    const belowLeftTile = getTile(tile, 'belowLeft');
    const belowRightTile = getTile(tile, 'belowRight');
    const leftTile = getTile(tile, 'left');
    const rightTile = getTile(tile, 'right');

    const matrix = [
        [aboveLeftTile === tile.type, aboveTile === tile.type, aboveRightTile === tile.type],
        [leftTile === tile.type, true, rightTile === tile.type],
        [belowLeftTile === tile.type, belowTile === tile.type, belowRightTile === tile.type],
    ];

    return matrix;

}

function getEdgeTile(tile, edgeDefinition) {
    const matrix = getTilesAround(tile);

    if (
        arrayMatch(matrix,
            [
                [true, true, true],
                [true, true, true],
                [true, true, true],
            ])
    ) {
        return { id: edgeDefinition.middle };
    }
    let arrays;

    //up/down/left/right edges 
    arrays = [
        [
            [true, true, true],
            [true, true, true],
            [true, false, false]
        ],
        [
            [true, true, true],
            [true, true, true],
            [false, false, false],
        ],
        [
            [true, true, true],
            [true, true, true],
            [false, false, true],
        ]
    ];
    for (let r = 0; r < 4; r++) {
        if (r > 0) {
            arrays = arrays.map((array) => rotateClockwise(array));
        }

        if (
            arrays.find((array) => arrayMatch(matrix, array))
        ) {
            return { id: edgeDefinition.edge[r] };
        }
    }


    //inner corners
    arrays = [
        [
            [true, true, true],
            [false, true, true],
            [false, false, true]
        ],
        [
            [false, true, true],
            [false, true, true],
            [false, false, false]
        ],
        [
            [true, true, true],
            [false, true, true],
            [false, false, false]
        ],
        [
            [false, true, true],
            [false, true, true],
            [false, false, true]
        ],
    ];
    for (let r = 0; r < 4; r++) {
        if (r > 0) {
            arrays = arrays.map((array) => rotateClockwise(array));
        }

        if (
            arrays.find((array) => arrayMatch(matrix, array))
        ) {
            return { id: edgeDefinition.innerCorner[r] };
        }
    }
    arrays = [
        [
            [true, true, true],
            [true, true, true],
            [false, true, true]
        ],
    ];
    for (let r = 0; r < 4; r++) {
        if (r > 0) {
            arrays = arrays.map((array) => rotateClockwise(array));
        }

        if (
            arrays.find((array) => arrayMatch(matrix, array))
        ) {
            return { id: edgeDefinition.ouoterCorner[r] };
        }
    }

    //outer corners

    return { id: 84 };
}

const landIds = [17, 17, 17, 17, 17, 17, 17, 17, 17, 131, 131, 131, 148, 148, 148, 147, 132, 149];
const remoteLandIds = [147, 147, 132, 149, 147, 147, 132, 149, 131, 148, 17];
function getTileXY(tile) {
    let id = null;

    switch (tile.type) {
        case 0: //WATER
            id = getEdgeTile(tile, {
                edge: {
                    0: 81,
                    1: 19,
                    2: 1,
                    3: 32
                },
                innerCorner: {
                    0: 53,
                    1: 37,
                    2: 52,
                    3: 82,
                },
                ouoterCorner: {
                    0: 119,
                    1: 5,
                    2: 0,
                    3: 80,
                },
                middle: 84,
            }).id;
            break;
        case 1: //LAND
            id = landIds[Math.floor(Math.random() * landIds.length)];
            break;
        case 2: //REMOTELAND
            id = remoteLandIds[Math.floor(Math.random() * remoteLandIds.length)];
            break;
        case 3: //ROAD
            id = 25;
            break;
        case 4: //PLACE
            switch (tile.extraInfo.properties.place) {
                case 'hamlet':
                    id = 176;
                    break;
                case 'village':
                    id = 128;
                    break;
                case 'town':
                    id = 128;
                    break;
                case 'town':
                    id = 128;
                    break;
                case 'city':
                    id = 178;
                    break;
                case 'suburb':
                    id = 177;
                    break;
            }
            break;
        default:
            id = 128;
    }

    return {
        x: Math.floor(id % 16) * globals.TILE_SIZE,
        y: Math.floor(id / 16) * globals.TILE_SIZE,
    } //https://stackoverflow.com/questions/47951361/finding-x-y-based-off-of-index
}

loadImage("../spritemap.png").then((tileMap) => {
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
            console.log("\t|\tFile " + ((hPiece + 1) + (vPiece + 1)) + " of " + (hPieces * vPieces) + " created");


        }
    }



});
