require('custom-env').env(true, "./maps");


console.log("------------------------------------------");
console.log(`Now processing county ${process.env.COUNTY_NAME}`);
console.log(`\tgeoJson: process/geojson/${process.env.GEOJSON}`);
console.log(`\tzoom: ${process.env.ZOOM}`);
console.log("\t\tRemember to run ", "yarn start:ors", "before this");