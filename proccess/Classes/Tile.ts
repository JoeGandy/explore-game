import { TILES } from "../../global-constants";


type coordinate = {
    y: number;
    x: number;
}

export class Tile {
    type: TILES;
    coordinate: coordinate;
    background: boolean;
    extraInfo?: any;

    constructor(type: TILES, y: number, x: number, extraInfo?: any) {
        this.type = type;
        this.background = this.allowDrawOver(type);
        this.coordinate = { y, x } as coordinate
        if (extraInfo) {
            this.extraInfo = extraInfo;
        }
    }

    allowDrawOver(type: TILES = this.type) {
        switch (type) {
            case TILES.ROAD:
            case TILES.PLACE:
            case TILES.CITY_ROAD:
            case TILES.BEACH:
                return false;
            case TILES.LAND:
            case TILES.REMOTELAND:
            case TILES.DEBUG:
            case TILES.WATER:
            default:
                return true;
        }
    }

}