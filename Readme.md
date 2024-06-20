.osm.pbf files:

https://download.geofabrik.de/europe/united-kingdom.html



counties .json:

```
    /*
    This is an example Overpass query.
    Try it out by pressing the Run button above!
    You can find more examples with the Load tool.
    */
    [out:json][timeout:25];
    // fetch area “Andorra” to search in
    {{geocodeArea:Derbyshire}}->.searchArea;
    // gather results
    (
    node[place~"city|town|village|hamlet|suburb"](area.searchArea);
    );
    // print results
    out body;
    >;
    out skel qt;
```


counties-rivers .json:

    /*
    This is an example Overpass query.
    Try it out by pressing the Run button above!
    You can find more examples with the Load tool.
    */
    [out:json][timeout:50];
    // fetch area “Andorra” to search in
    {{geocodeArea:Derbyshire}}->.searchArea;
    // gather results
    (
  		relation["type"="waterway"]["waterway"="river"](area.searchArea);
    );
    // print results
    out body;
    >;
    out skel qt;
    
https://overpass-turbo.eu/

export as GeoJSON

