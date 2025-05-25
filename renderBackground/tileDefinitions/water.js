const { BitmaskConst } = require("../bitMaskConst");

const waterTileMap = {
    [BitmaskConst.CENTER]: [59, 60, 83, 84],

    // Edges
    [BitmaskConst.TOP]: [3],
    [BitmaskConst.BOTTOM]: [123],
    [BitmaskConst.LEFT]: [26],
    [BitmaskConst.RIGHT]: [31],

    // Outer Corners
    [BitmaskConst.TOP_LEFT]: [27],
    [BitmaskConst.TOP_RIGHT]: [28],
    [BitmaskConst.BOTTOM_LEFT]: [51],
    [BitmaskConst.BOTTOM_RIGHT]: [52],

    // Inner Corners
    [BitmaskConst.IN_TOP_LEFT]: [2],
    [BitmaskConst.IN_TOP_RIGHT]: [7],
    [BitmaskConst.IN_BOTTOM_LEFT]: [122],
    [BitmaskConst.IN_BOTTOM_RIGHT]: [127],

    // T-junctions (fallback or rarely used)
    [BitmaskConst.TJUNCTION_UP]: [68],
    [BitmaskConst.TJUNCTION_DOWN]: [68],
    [BitmaskConst.TJUNCTION_LEFT]: [68],
    [BitmaskConst.TJUNCTION_RIGHT]: [68],

    // Cross (intersection)
    [BitmaskConst.CROSS]: [68],
    
    [BitmaskConst.HIDE]: [69]
};

const waterSpriteMap = {
    path: "./spriteMaps/water-beach.jpg",
    loadedImage: null,
    columns: 24,
};

module.exports = { waterTileMap, waterSpriteMap };
