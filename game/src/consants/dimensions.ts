import map from '../assets/raw-data-light.json';
export const TILE_SIZE = 24;

export const mapWidth = map[0].length;
export const mapHeight = map.length;

export const width = mapWidth * TILE_SIZE;
export const height = mapHeight * TILE_SIZE;
