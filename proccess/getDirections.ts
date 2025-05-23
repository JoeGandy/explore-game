var Cache = require('cache-storage');
var FileStorage = require('cache-storage/Storage/FileSyncStorage');

const openrouteservice = require("openrouteservice-js");
var DirectionsCache = new Cache(new FileStorage('./cache'), 'DirectionsCache');

const Directions = new openrouteservice.Directions({ api_key: "5b3ce3597851110001cf6248aff83dabb7174507986671360deb89cd" });

export const getDirections = async (place, location) => {
    return new Promise(async (resolve, reject) => {
        const key = `${place.properties.name.replace(/[^a-zA-Z ]/g, "")}_${location.properties.name.replace(/[^a-zA-Z ]/g, "")}`;

        const cachedResult = await DirectionsCache.load(key);

        if (cachedResult) {
            return resolve(cachedResult);
        }

        const result = await Directions.calculate({
            host: 'http://localhost:8080/ors',
            coordinates: [place.geometry.coordinates, location.geometry.coordinates],
            profile: 'cycling-regular',
            radiuses: [5000],
            instructions: false,
            format: 'json',
            timeout: 5000,
        });

        DirectionsCache.save(key, result);

        resolve(result);

    });
}