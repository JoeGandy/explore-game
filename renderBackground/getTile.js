
function getTileBitmask(map, tile) {
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [ 0, 1], [ 1, 1], [ 1, 0],
        [ 1, -1], [ 0, -1]
    ];

    let bitmask = 0;
    if (!tile || !map[tile.coordinate.x] || map[tile.coordinate.x][tile.coordinate.y] === undefined) {
        return bitmask;
    }

    const tileType = map[tile.coordinate.x][tile.coordinate.y].type;

    directions.forEach(([dx, dy], index) => {
        const nx = tile.coordinate.x + dx;
        const ny = tile.coordinate.y + dy;

        if (
            map[nx] !== undefined &&
            map[nx][ny] !== undefined &&
            map[nx][ny].type === tileType
        ) {
            bitmask |= (1 << index);
        }
    });

    return bitmask;
}

module.exports = { getTileBitmask };