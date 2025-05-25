const { BitmaskConst } = require("./bitMaskConst");

function getTilemapMapping(bitmask, tileMap) {
    // Bitmask definitions with descriptive names
    const BitmaskGrouped = {
        CENTER: [255],
        TOP: [248, 252, 249],
        BOTTOM: [143, 159, 207, 175],
        LEFT: [63, 62, 126],
        RIGHT: [127, 227, 243, 231],

        TOP_LEFT: [239],
        TOP_RIGHT: [250, 191],
        BOTTOM_LEFT: [251],
        BOTTOM_RIGHT: [254],

        IN_TOP_LEFT: [56, 120, 60, 122],
        IN_TOP_RIGHT: [240, 224, 225, 233, 232, 242],
        IN_BOTTOM_LEFT: [15, 30, 14, 46, 142, 158],
        IN_BOTTOM_RIGHT: [195, 131, 135, 167, 139, 203, 163],

        TJUNCTION_UP: [],
        TJUNCTION_DOWN: [],
        TJUNCTION_LEFT: [],
        TJUNCTION_RIGHT: [],

        CROSS: [],

        HIDE: [192, 2, 38, 48, 12, 7, 39, 3, 128, 137, 129, 96],
    };


    let BitMask = {};

    for (let [bitMaskConstKey, values] of Object.entries(BitmaskGrouped)) {
        Object.assign(BitMask, ...values.map(k => ({ [k]: bitMaskConstKey })));
    }

    const fullMap = new Array(256).fill(0).map((_, bit) =>
        BitMask.hasOwnProperty(bit)
            ? (tileMap[BitMask[bit]].length > 1 ? tileMap[BitMask[bit]][Math.floor(Math.random() * tileMap[BitMask[bit]].length)] : tileMap[BitMask[bit]][0])
            : 68
    );

    return fullMap[bitmask];
}

module.exports = { getTilemapMapping };