import { Tile } from "./Classes/Tile";
import { TILES } from "../global-constants";
import getTile from "../renderBackground/getTile";
import { getDirections } from "./getDirections"
require('custom-env').env(true, "../maps");

const geoJsonPath = `./geojson/${process.env.GEOJSON}`;
var globalMercator = require('global-mercator');
const geolib = require('geolib');
var county = require(geoJsonPath);
// var countyRivers = require('./counties/england/derbyshire-rivers.json');
var PNG = require('pngjs2').PNG;
var PF = require('pathfinding');
var polyline = require('google-polyline');
var smooth = require('chaikin-smooth');
var knownRoutes = [];
const { hasUncaughtExceptionCaptureCallback } = require('process');

enum MODE {
    fast = 0,
    beautiful = 1,
}

const SPEED: MODE = MODE.fast;

const LAT_INDEX = 1, LON_INDEX = 0;
const ZOOM = process.env.ZOOM;
const TIMES_TO_SMOOTH = 5;
const TILE_SIZE = 32;
const PADDING = 1 * TILE_SIZE;
const AREA_TO_FILL_AROUND_PATH = 4;
const AREA_TO_FILL_AROUND_PLACE = 4;


console.log("------------------------------------------");
console.log(`Now rendering map for ${process.env.COUNTY_NAME}`);
console.log(`\tgeoJson: ${geoJsonPath}`);
console.log(`\tzoom: ${ZOOM}`);
console.log("\t\tRemember to run ", "yarn start:ors", "before this");

let highestLat = null, lowestLat = null, highestLon = null, lowestLon = null;

let locations = county.features;

locations.forEach((place) => {
    const mapCoords = globalMercator.lngLatToTile(place.geometry.coordinates, ZOOM);

    if (mapCoords[LAT_INDEX] < lowestLat || lowestLat == null)
        lowestLat = mapCoords[LAT_INDEX];
    if (mapCoords[LAT_INDEX] > highestLat || highestLat == null)
        highestLat = mapCoords[LAT_INDEX];
    if (mapCoords[LON_INDEX] < lowestLon || lowestLon == null)
        lowestLon = mapCoords[LON_INDEX];
    if (mapCoords[LON_INDEX] > highestLon || highestLon == null)
        highestLon = mapCoords[LON_INDEX];
})

function roundUpToNearest(number, target = 32) {
    return Math.ceil(number / target) * target;
}
const gridSizeWidth = roundUpToNearest(Math.abs(lowestLon - highestLon) + (PADDING * 2) + 1);
const gridSizeHeight = roundUpToNearest(Math.abs(lowestLat - highestLat) + (PADDING * 2) + 1);

function validCoord(_y, _x) {
    return _x > 0 && _y > 0 && _y < gridSizeHeight && _x < gridSizeWidth;
}

let map: Tile[][] = new Array(gridSizeHeight);
for (var i = 0; i < gridSizeHeight; i++) {
    map[i] = new Array(gridSizeWidth);
}

for (var y = 0; y < gridSizeHeight; y++) {
    for (var x = 0; x < gridSizeWidth; x++) {
        map[y][x] = new Tile(TILES.DEBUG, y, x);
    }
}


const getMapCoord = (tileCoord) => {
    return [
        highestLat - tileCoord[LAT_INDEX],
        tileCoord[LON_INDEX] - lowestLon
    ];
};

let previoiusMsg = null;
const getPercentageString = (prog, total, label) => {
    const percent = Math.round((prog / total) * 100);
    const msg = "%" + percent + "\t|\t" + label;
    if (percent % 25 == 0 && previoiusMsg !== msg) {
        previoiusMsg = msg;
        console.log(msg);
    }
}

function upgradeRoads(map: Tile[][], _y, _x, width) {
    for (var x = (_x - width); x < (_x + width); x++) {
        for (var y = (_y - width); y < (_y + width); y++) {
            if (!validCoord(y, x)) continue;
            if (x == _x && y == _y) continue; //don't overwrite the square we're on
            if (map[y][x]?.type === TILES.ROAD) {
                map[y][x] = new Tile(TILES.CITY_ROAD, x, y);
            }
        }
    }
    return map;
}

function fillSquareAround(map: Tile[][], _y, _x, width, type = TILES.LAND) {
    for (var x = (_x - width); x < (_x + width); x++) {
        for (var y = (_y - width); y < (_y + width); y++) {
            if (!validCoord(y, x)) continue;
            if (x == _x && y == _y) continue; //don't overwrite the square we're on
            if (map[y][x]?.allowDrawOver()) {
                map[y][x] = new Tile(type, x, y);
            }
        }
    }
    return map;
}

locations.reverse().forEach((place, i) => {
    const placeCoords = getMapCoord(globalMercator.lngLatToTile(place.geometry.coordinates, ZOOM));
    const y = placeCoords[LON_INDEX] + PADDING;
    const x = placeCoords[LAT_INDEX] + PADDING;

    map[y][x] = new Tile(TILES.PLACE, x, y, place);
    fillSquareAround(map, y, x, AREA_TO_FILL_AROUND_PLACE);
});

function getDensity(place = undefined) {
    switch (place?.properties?.place) {
        case 'hamlet':
            return {
                radius: 0,
                tile: TILES.BUILT_UP_DENSITY_1
            };
        case 'village':
            return {
                radius: 0,
                tile: TILES.BUILT_UP_DENSITY_2
            };
        case 'town':
            return {
                radius: 2,
                tile: TILES.BUILT_UP_DENSITY_3
            };
        case 'suburb':
            return {
                radius: 6,
                tile: TILES.BUILT_UP_DENSITY_4
            };
        case 'city':
            return {
                radius: 10,
                tile: TILES.BUILT_UP_DENSITY_5
            };
        default:
            return {
                tile: TILES.BUILT_UP_DENSITY_2
            };
    }
}

function getClosestCount(place) {
    switch (place.properties.place) {
        case 'hamlet':
            return 3;
        case 'village':
            return 3;
        case 'town':
            return 4;
        case 'city':
            return 5;
        case 'suburb':
            return 3;
    }
}

locations.forEach((place, i) => {
    getPercentageString(i, locations.length, "Getting closests places");
    const CLOSEST_COUNT = getClosestCount(place);
    let closest = new Array(CLOSEST_COUNT).fill(null), closest_distance = new Array(CLOSEST_COUNT).fill(null);
    county.features.forEach((p, ii) => {
        if (i == ii) return;
        var distance = geolib.getDistance(
            {
                latitude: place.geometry.coordinates[LAT_INDEX],
                longitude: place.geometry.coordinates[LON_INDEX]
            },
            {
                latitude: p.geometry.coordinates[LAT_INDEX],
                longitude: p.geometry.coordinates[LON_INDEX]
            }
        );
        let found = false;
        for (var x = 0; x < closest.length; x++) {
            if (found) break;
            if (distance < closest_distance[x] || closest_distance[x] === null) {
                found = true;

                closest_distance[x] = distance;
                closest[x] = {
                    properties: p.properties,
                    geometry: p.geometry
                }
            }
        }
    });
    locations[i].closest = closest;
});

function uniq(a) {
    var seen = {};
    return a.filter(function (item) {
        return seen.hasOwnProperty(JSON.stringify(item)) ? false : (seen[JSON.stringify(item)] = true);
    });
}


let requests = [];

locations.forEach(async (place, i) => {
    requests = requests.concat(place.closest.map(async (location, index) => {
        getPercentageString(i, locations.length, "Building API requests");
        return getDirections(place, location)
            .then(function (json) {
                let smoothPolyLine = polyline.decode((json as any).routes[0].geometry);
                let count = 0;
                while (count < TIMES_TO_SMOOTH) {
                    smoothPolyLine = smooth(smoothPolyLine);
                    count++;
                }

                const decodedCoordsRough = uniq(
                    smoothPolyLine.map((latLng) =>
                        getMapCoord(globalMercator.lngLatToTile(latLng.reverse(), ZOOM))
                    ).reverse()
                );
                const routeId = [place.properties.name, location.properties.name].sort().join('');
                const decodedCoords = decodedCoordsRough.map(i => i.map(inner => Math.floor(inner)));

                const placeCoords = getMapCoord(globalMercator.lngLatToTile(place.geometry.coordinates, ZOOM));
                const y = placeCoords[LON_INDEX] + PADDING;
                const x = placeCoords[LAT_INDEX] + PADDING;

                map[y][x].extraInfo.closest[index].route = routeId;

                const route = decodedCoords.map((coord) => [coord[0] + PADDING, coord[1] + PADDING]);

                knownRoutes.push({
                    from: place,
                    to: location,
                    id: routeId,
                    route,
                });
            })
            .catch(function (err) {
                var str = "An error occurred: " + err;
                console.log(str);
            });
    }));
});

console.log("\t|\tIssuing requests");
Promise.all(requests).then(() => postProccess());

let progress = 0;
requests.forEach(
    p => p.then(() => progress++ && getPercentageString(progress, requests.length, "Issuing API Requests"))
);

function roadAroundPoint(_y, _x) {
    let result = false;
    for (var x = (_x - 1); x <= (_x + 1); x++) {
        for (var y = (_y - 1); y <= (_y + 1); y++) {
            if (map[y][x].type == TILES.ROAD) {
                result = true;
            }
        }
    }
    return result;
}

function checkRadiusAroundPoint(type, _y, _x, radius) {
    for (var x = (_x - radius); x <= (_x + radius); x++) {
        for (var y = (_y - radius); y <= (_y + radius); y++) {
            if (validCoord(y, x)) {
                if (map[y][x]?.type == type) {
                    return [y, x];
                }
            }
        }
    }
    return null;
}

function fill(x, y, type) {
    // get target value
    var target = map[x][y];
    // maintain list of cells to process
    // put the starting cell in the queue
    var queue = [{ x: x, y: y }], item;

    while (queue.length) {
        item = queue.shift();
        x = item.x;
        y = item.y;
        if (map[x][y].type === target.type) {
            map[x][y] = new Tile(type, y, x);
            // up
            if (x > 0) {
                queue.push({ x: x - 1, y: y })
            }
            // down
            if (x + 1 < map.length) {
                queue.push({ x: x + 1, y: y })
            }
            // left
            if (y > 0) {
                queue.push({ x: x, y: y - 1 });
            }
            // right
            if (y + 1 < map[x].length) {
                queue.push({ x: x, y: y + 1 });
            }
        }
    }
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


function removeNarrow() {
    console.log("\t|\tRemoving Pointless narrow points");
    let removingPointlessNarrow = 0;
    for (var y = 0; y < gridSizeHeight; y++) {
        for (var x = 0; x < gridSizeWidth; x++) {
            const tile = map[y][x];
            if (tile?.type == TILES.WATER) {
                const aboveTile = getTile(tile, 'above').type;
                const aboveLeftTile = getTile(tile, 'aboveLeft').type;
                const aboveRightTile = getTile(tile, 'aboveRight').type;
                const belowTile = getTile(tile, 'below').type;
                const belowLeftTile = getTile(tile, 'belowLeft').type;
                const belowRightTile = getTile(tile, 'belowRight').type;
                const leftTile = getTile(tile, 'left').type;
                const rightTile = getTile(tile, 'right').type;

                const matrix = [
                    [aboveLeftTile === tile.type, aboveTile === tile.type, aboveRightTile === tile.type],
                    [leftTile === tile.type, true, rightTile === tile.type],
                    [belowLeftTile === tile.type, belowTile === tile.type, belowRightTile === tile.type],
                ];

                let arrays;

                //up/down/left/right edges 
                arrays = [
                    [
                        [false, false, false],
                        [true, true, true],
                        [false, false, false]
                    ],
                    [
                        [false, false, false],
                        [false, true, true],
                        [false, true, true]
                    ],
                    [
                        [true, true, true],
                        [false, true, false],
                        [false, true, false]
                    ],
                    [
                        [true, true, true],
                        [false, true, false],
                        [false, false, false]
                    ],
                    [
                        [false, true, true],
                        [false, true, false],
                        [false, true, false]
                    ],
                    [
                        [false, false, false],
                        [false, true, false],
                        [false, false, false]
                    ],
                    [
                        [false, false, false],
                        [true, true, false],
                        [false, false, false]
                    ],
                    [
                        [false, false, false],
                        [false, true, false],
                        [false, true, false]
                    ],
                    [
                        [false, false, false],
                        [false, true, false],
                        [false, true, true]
                    ],
                    [
                        [false, false, false],
                        [false, true, false],
                        [true, true, false]
                    ],
                ];
                for (let r = 0; r < 4; r++) {
                    if (r > 0) {
                        arrays = arrays.map((array) => rotateClockwise(array));
                    }

                    if (
                        arrays.find((array) => arrayMatch(matrix, array))
                    ) {
                        removingPointlessNarrow++;
                        map[y][x] = new Tile(TILES.LAND, y, x);
                    }
                }

            }
        }
    }
    console.log("\t|\tRemoved " + removingPointlessNarrow + " narrow points in the map");
    return removingPointlessNarrow;
}

function postProccess() {
    console.log("\t|\tRemovoing duplicate routes");
    knownRoutes = Object.values(
        knownRoutes.reduce((acc, obj) => ({ ...acc, [obj.id]: obj }), {})
    );


    console.log("\t|\tDrawing routes");
    knownRoutes.forEach(routeObj => {
        routeObj.route.forEach((coord) => {
            const x = coord[1];
            const y = coord[0];


            if (map[y][x]?.allowDrawOver()) {
                map[y][x] = new Tile(TILES.ROAD, x, y);
                map = fillSquareAround(map, y, x, AREA_TO_FILL_AROUND_PATH);
            }
        })
    })



    console.log("\t|\tFix missing road diagonals");
    knownRoutes.forEach(routeObj => {
        routeObj.route.forEach((coord) => {
            const x = coord[1];
            const y = coord[0];

            if (!validCoord(y, x)) return;
            if (map[x][y]?.type === TILES.PLACE) return;

            const totalConnections = ['above', 'below', 'left', 'right'].map((direction) => {
                const adjacentTile = getTile(map, map[x][y], direction);
                if (!adjacentTile) return 0;
                return adjacentTile.type === TILES.ROAD || adjacentTile.type === TILES.CITY_ROAD || adjacentTile.type === TILES.PLACE ? 1 : 0;
            }).reduce((a, b) => a + b, 0);

            //If only has one connection
            if (totalConnections === 1) {
                console.log("Only one connection", x, y);
                //Loop around adjacent tiles
                ['above', 'below', 'left', 'right'].some((direction) => {
                    const _adjacentTile = getTile(map, map[x][y], direction);
                    //Find one that would make two adjacent roads if it was a road
                    const roadConnectionCount = ['above', 'below', 'left', 'right'].map((direction) => {
                        const __adjacentTileType = getTile(map, map[_adjacentTile.coordinate.x][_adjacentTile.coordinate.y], direction).type;
                        return __adjacentTileType === TILES.ROAD || __adjacentTileType === TILES.CITY_ROAD || __adjacentTileType === TILES.PLACE ? 1 : 0;
                    }).reduce((a, b) => a + b, 0);

                    if (roadConnectionCount == 2 && _adjacentTile.type !== TILES.ROAD) {
                        map[_adjacentTile.coordinate.x][_adjacentTile.coordinate.y] = new Tile(TILES.ROAD, _adjacentTile.coordinate.y, _adjacentTile.coordinate.x);
                        console.log('\t|\t', _adjacentTile.coordinate.x, _adjacentTile.coordinate.y, 'road diagonal added');
                        return "returning to only add one connection";
                    }
                })
            }
        });
    });

    // console.log("\t|\tCleaning excess roads");
    // for (var y = 0; y < gridSizeHeight; y++) {
    //     for (var x = 0; x < gridSizeWidth; x++) {
    //         const tile = map[y][x];
    //         if (
    //             tile !== undefined &&
    //             tile.type == TILES.ROAD
    //         ) {
    //             const rightTileType = getTile(map, tile, 'right').type,
    //                 belowTileType = getTile(map, tile, 'below').type,
    //                 belowRightTileType = getTile(map, tile, 'belowRight').type;

    //             if (rightTileType === TILES.ROAD && belowTileType === TILES.ROAD && belowRightTileType === TILES.ROAD) {
    //                 //Means all 4 tiles are roads
    //                 // Loop through each one and delete the least connected
    //                 let currentMost = { value: 0, x: -1, y: -1 };

    //                 for(var _x = tile.coordinate.x; _x <= (tile.coordinate.x+1); _x++){
    //                     for(var _y = tile.coordinate.y; _y <= (tile.coordinate.y+1); _y++){
    //                         const totalConnections = ['above', 'below', 'left', 'right'].map((direction) => {
    //                             return getTile(map, map[_x][_y], direction).type === TILES.ROAD ? 1 : 0;
    //                         }).reduce((a, b) => a + b, 0)

    //                         if(totalConnections > currentMost.value){
    //                             currentMost = {
    //                                 value: totalConnections,
    //                                 x: _x,
    //                                 y: _y
    //                             }
    //                         }

    //                     }

    //                 }
    //                 map[currentMost.x][currentMost.y] = new Tile(TILES.DEBUG, currentMost.y, currentMost.x);
    //                 console.log('\t|\t', currentMost.x, currentMost.y, 'road deleted', 'on pass', i, 'connections', currentMost.value);
    //             }

    //         }
    //     }
    // }

    console.log("\t|\tIdentifiying places without road connections");
    for (var y = 0; y < gridSizeHeight; y++) {
        for (var x = 0; x < gridSizeWidth; x++) {
            if (
                map[y][x] !== undefined &&
                map[y][x].type == TILES.PLACE &&
                roadAroundPoint(y, x) == false
            ) {
                console.log("\t|\tFound missing road at: " + map[y][x].extraInfo.properties.name);
                let foundRoadCoord = null, radius = 1;
                while (foundRoadCoord == null) {
                    foundRoadCoord = checkRadiusAroundPoint(TILES.ROAD, y, x, radius++);
                }

                //Path to that road
                var grid = new PF.Grid(gridSizeHeight, gridSizeWidth);
                var finder = new PF.AStarFinder({
                    allowDiagonal: true
                });
                var path = finder.findPath(y, x, foundRoadCoord[0], foundRoadCoord[1], grid);
                for (var i = 0; i < path.length; i++) {
                    const coord = path[i];
                    const _y = coord[0];
                    const _x = coord[x];

                    if (validCoord(y, x) && map[_y][_x]?.allowDrawOver()) {
                        map[_y][_x] = new Tile(TILES.ROAD, _y, _x);
                    }
                    map = fillSquareAround(map, _y, _x, AREA_TO_FILL_AROUND_PATH);
                }
            }
        }
    }


    console.log("\t|\tIdentifiying places and applying density");
    for (var y = 0; y < gridSizeHeight; y++) {
        for (var x = 0; x < gridSizeWidth; x++) {
            if (
                map[y][x] !== undefined &&
                map[y][x].type == TILES.PLACE
            ) {
                const tile = map[y][x];
                const densityDefiniton = getDensity(tile.extraInfo);

                map = fillSquareAround(map, y, x, densityDefiniton.radius + 4);
                map = fillSquareAround(map, y, x, densityDefiniton.radius + 2, getDensity().tile);
                map = fillSquareAround(map, y, x, densityDefiniton.radius, densityDefiniton.tile);
                map = upgradeRoads(map, y, x, densityDefiniton.radius);
            }
        }
    }
    console.log("\t|\tPatching holes in the map");
    let holes = 0;
    for (var y = 0; y < gridSizeHeight; y++) {
        for (var x = 0; x < gridSizeWidth; x++) {
            if (map[y][x]?.type == TILES.DEBUG) {
                holes++;
                fill(y, x, TILES.REMOTELAND);
            }
        }
    }
    console.log("\t|\tFixed " + holes + " in the map");


    console.log("\t|\tAdding water");
    fill(0, 0, TILES.WATER);


    if (SPEED === MODE.beautiful) {
        let narrowPoints = 1;

        while (narrowPoints > 0) {
            narrowPoints = removeNarrow();
        }
    }


    // console.log("\t|\tMapping Rivers");
    // countyRivers.elements.forEach((river) => {
    //     if(river.type !== "node"){
    //         return;
    //     }

    //     const placeCoords = getMapCoord(globalMercator.lngLatToTile([river.lon, river.lat], ZOOM));
    //     const y = placeCoords[LON_INDEX] + PADDING;
    //     const x = placeCoords[LAT_INDEX] + PADDING;

    //     if(validCoord(y, x)){
    //         if(map[y][x].type === TILES.LAND || map[y][x].type === TILES.REMOTELAND){
    //             map[y][x] = new Tile(TILES.WATER, x, y);
    //             map = fillSquareAround(map, y, x, 2, TILES.WATER);
    //         }
    //     }
    // });


    renderFiles();
}

function renderFiles() {
    var json = JSON.stringify(knownRoutes);
    var fs = require('fs');
    fs.writeFile('raw-data-known-routes.json', json, 'utf8', () => { });


    var json = JSON.stringify(map);
    var fs = require('fs');
    fs.writeFile('raw-data.json', json, 'utf8', () => { });


    const lightweightMap = map.map((row) =>
        row.map((cell) => cell.type
        ));
    var json = JSON.stringify(lightweightMap);
    var fs = require('fs');
    fs.writeFile('raw-data-light.json', json, 'utf8', () => { });
}