import { TILES } from "./Tiles";


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
                return false;
            case TILES.LAND:
            case TILES.REMOTELAND:
            case TILES.DEBUG:
            case TILES.WATER:
            default:
                return true;
        }
    }

    getColour() {
        switch (this.type) {
            case TILES.ROAD:
                return [20, 20, 20];
            case TILES.LAND:
                return [50, 90, 50];
            case TILES.REMOTELAND:
                return [30, 70, 30];
            case TILES.DEBUG:
                return [255, 255, 0];
            case TILES.WATER:
                return [50, 50, 180];
            case TILES.PLACE:
                switch(this.extraInfo.properties.place){
                    case 'hamlet': 
                        return [150, 0, 0];
                    case 'village': 
                        return [175, 0, 0];
                    case 'town':
                        return [200, 0, 0];
                    case 'city':
                        return [225, 0, 0];
                    case 'suburb':
                        return [225, 100, 100];
                }
            default:
                return [255, 255, 255];
        }
    }

}