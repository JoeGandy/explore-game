const { BitmaskConst } = require("../bitMaskConst");

const waterTileMap = {
    [BitmaskConst.CENTER]: [250, 251, 253, 323, 324],

    // Edges
    [BitmaskConst.TOP]: [538],
    [BitmaskConst.BOTTOM]: [35],
    [BitmaskConst.LEFT]: [327],
    [BitmaskConst.RIGHT]: [320],

    // Corners
    [BitmaskConst.TOP_LEFT]: [542],
    [BitmaskConst.TOP_RIGHT]: [76],
    [BitmaskConst.BOTTOM_LEFT]: [33],
    [BitmaskConst.BOTTOM_RIGHT]: [537],

    // Inner Corners
    [BitmaskConst.IN_TOP_LEFT]: [26],
    [BitmaskConst.IN_TOP_RIGHT]: [31],
    [BitmaskConst.IN_BOTTOM_LEFT]: [386],
    [BitmaskConst.IN_BOTTOM_RIGHT]: [391],

    // Misc unmapped
    [BitmaskConst.TJUNCTION_UP]: [300],
    [BitmaskConst.TJUNCTION_DOWN]: [300],
    [BitmaskConst.TJUNCTION_LEFT]: [300],
    [BitmaskConst.TJUNCTION_RIGHT]: [300],
    [BitmaskConst.CROSS]: [300]
};

module.exports = { waterTileMap };