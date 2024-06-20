function getTile(map, tile, direction, mofidyX = 0 , modifyY = 0) {
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

    modifier.x = mofidyX + modifier.x;
    modifier.y = modifyY + modifier.y;

    if (typeof map[tile.coordinate.x + modifier.x] === 'undefined' || typeof map[tile.coordinate.x + modifier.x][tile.coordinate.y + modifier.y] === 'undefined') {
        return null;
    }

    return map[tile.coordinate.x + modifier.x][tile.coordinate.y + modifier.y].type;
}

module.exports = getTile;