import map from '../assets/raw-data-light.json';

export const mapWidth = map[0].length;
export const mapHeight = map.length;

export const width = mapWidth * 32;
export const height = mapHeight * 32;
