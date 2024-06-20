const getTilemapMapping = require("./getTilemapMapping");
const globals = require("../global-constants");

function getTile(map, tile, direction) {
    let modifier = { x: 0, y: 0 };

    switch (direction) {
        case 'above':
            modifier.x = -1;
            break;
        case 'aboveLeft':
            modifier.x = -1;
            modifier.y = -1;
            break;
        case 'aboveRight':
            modifier.x = -1;
            modifier.y = 1;
            break;
        case 'below':
            modifier.x = 1;
            break;
        case 'belowLeft':
            modifier.x = 1;
            modifier.y = -1;
            break;
        case 'belowRight':
            modifier.x = 1;
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

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

const debugTile = 704;
// 16 | 32 | 64
// --+---+---
// 8  | x  | 128
// --+---+---
// 4  | 2  | 1
function getEdgeTile(map, tile, tileDefinition) {
    let mainTile = tileDefinition.mainTile;

    if (Array.isArray(tileDefinition.mainTile)) {
        mainTile = tileDefinition.mainTile[Math.floor(Math.random() * tileDefinition.mainTile.length)];
    }
    const order = ['belowRight', 'below', 'belowLeft', 'left', 'aboveLeft', 'above', 'aboveRight', 'right'];
    const bit = [1, 2, 4, 8, 16, 32, 64, 128];

    let runningTotal = 0;

    order.forEach(function (target, i) {
        const targetTile = getTile(map, tile, target);
        if (targetTile != tile.type) {
            runningTotal += bit[i];
        }
    });

    const tileMap = getTilemapMapping({ ...tileDefinition, mainTile });

    if (typeof (tileMap[runningTotal]) === "undefined") {
        console.log('[', getKeyByValue(globals.TILES, tile.type), ']', runningTotal, 'does not have a tile @ x:', tile.coordinate.x, ', y:', tile.coordinate.y);
    }

    return tileMap[runningTotal] || debugTile;
}

module.exports = getEdgeTile;