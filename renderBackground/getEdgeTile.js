const getTilemapMapping = require("./getTilemapMapping");
const globals = require("../global-constants");
const getTile = require("./getTile");

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

const debugTile = 704;
// 16 | 32 | 64
// --+---+---
// 8  | x  | 128
// --+---+---
// 4  | 2  | 1
function getEdgeTile(map, tile, tileDefinition, customMatcher) {
    let mainTile = tileDefinition.mainTile;

    if (Array.isArray(tileDefinition.mainTile)) {
        mainTile = tileDefinition.mainTile[Math.floor(Math.random() * tileDefinition.mainTile.length)];
    }
    const order = ['belowRight', 'below', 'belowLeft', 'left', 'aboveLeft', 'above', 'aboveRight', 'right'];
    const bit = [1, 2, 4, 8, 16, 32, 64, 128];

    let runningTotal = 0;

    order.forEach(function (target, i) {
        const targetTile = getTile(map, tile, target);
        if(customMatcher) {
            if(customMatcher(targetTile, tile)){
                runningTotal += bit[i];
            }
        }else{
            if (targetTile != tile.type) {
                runningTotal += bit[i];
            }
        }
    });

    const tileMap = getTilemapMapping({ ...tileDefinition, mainTile });

    if (typeof (tileMap[runningTotal]) === "undefined") {
        console.log('[', getKeyByValue(globals.TILES, tile.type), ']', runningTotal, 'does not have a tile @ x:', tile.coordinate.x, ', y:', tile.coordinate.y);
    }

    return tileMap[runningTotal] || debugTile;
}

module.exports = getEdgeTile;