const { BitmaskConst } = require("./bitMaskConst");

function getTilemapMapping(bitmask, tileMap) {
    // Bitmask definitions with descriptive names
    const BitmaskGrouped = {
        CENTER: [255],

        // Edges
        TOP: [143, 159],
        BOTTOM: [248],
        LEFT: [127],
        RIGHT: [254, 63],

        // Corners
        TOP_LEFT: [252],
        TOP_RIGHT: [250, 191],
        BOTTOM_LEFT: [126],
        BOTTOM_RIGHT: [187],

        // Inside corners
        IN_TOP_LEFT: [240],
        IN_TOP_RIGHT: [120],
        IN_BOTTOM_LEFT: [15],
        IN_BOTTOM_RIGHT: [195],

        // T-junctions
        TJUNCTION_UP: [253],
        TJUNCTION_DOWN: [247],
        TJUNCTION_LEFT: [223],
        TJUNCTION_RIGHT: [254],

        // Crossroads
        CROSS: [255]
    };


    let BitMask = {};

    for (let [bitMaskConstKey, values] of Object.entries(BitmaskGrouped)) {
        Object.assign(BitMask, ...values.map(k => ({ [k]: bitMaskConstKey })));
    }

    const fullMap = new Array(256).fill(0).map((_, bit) =>
        BitMask.hasOwnProperty(bit)
            ? (tileMap[BitMask[bit]].length > 1 ? tileMap[BitMask[bit]][Math.floor(Math.random() * tileMap[BitMask[bit]].length)] : tileMap[BitMask[bit]][0])
            : 3692
    );

    return fullMap[bitmask];
}

module.exports = { getTilemapMapping };