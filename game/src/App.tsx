import { useCallback, useRef, useState } from "react";
import { Stage, Sprite } from "@pixi/react";
import { PixiViewport } from "./Viewport";
import { Viewport } from "pixi-viewport";
import routes from './assets/raw-data-known-routes.json';
import map from './assets/raw-data.json';
import Background from "./components/background";
import RenderText from "./components/render-text";
import Debug from "./assets/-1.png";
import { width, height } from "./consants/dimensions";

const stageWidth = 800;
const stageHeight = 800;

const stageOptions = {
  antialias: false,
  autoDensity: true,
  backgroundAlpha: 0
};

const areas = {
  'world': [width / 2, height / 2, 0.1],
  'pinxton': [14358.891290513706, 13645.855506198452, 0.4],
  'derby': [11373.153135617216, 18992.967234900392, 0.4]
};

const renderMap = (mapLight: any[][], highLightedtiles, highLightedCoords) => {
  let result = [];

  highLightedtiles && highLightedtiles.map((highlightedTile) => {
    result.push(
      <Sprite
        image={Debug}
        y={highlightedTile.coordinate.x * 32}
        x={highlightedTile.coordinate.y * 32}
        key={`${highlightedTile.coordinate.x}.${highlightedTile.coordinate.y}.tile`} />
    );
  });

  highLightedCoords && highLightedCoords.map((highLightedCoord, i) => {
    result.push(
      <Sprite
        image={Debug}
        y={highLightedCoord[0] * 32}
        x={highLightedCoord[1] * 32}
        key={`${highLightedCoord[0]}.${highLightedCoord[1]}.coord.${i}`} />
    );
  });

  // for (let y = 0; y < mapLight.length; y++) {
  //   for (let x = 0; x < mapLight[0].length; x++) {
  //     const cell = mapLight[y][x];
  //     if ([0, 1, 2, 3, 4].includes(cell.type)) {
  //       continue;
  //     }

  //     const image = Debug;

  //     const texture = Texture.from(image);
  //     texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;

  //     result.push(
  //       <Sprite
  //         texture={texture}
  //         x={x * 32}
  //         y={y * 32}
  //         key={`${x}.${y}`} />
  //     );

  //   }
  // }
  return result;
}


function getTile(tile, direction) {
  let modifier = { x: 0, y: 0 };

  switch (direction) {
    case 'above':
      modifier.x = 1;
      break;
    case 'aboveLeft':
      modifier.x = 1;
      modifier.y = -1;
      break;
    case 'aboveRight':
      modifier.x = 1;
      modifier.y = 1;
      break;
    case 'below':
      modifier.x = -1;
      break;
    case 'belowLeft':
      modifier.x = -1;
      modifier.y = -1;
      break;
    case 'belowRight':
      modifier.x = -1;
      modifier.y = 1;
      break;
    case 'left':
      modifier.y = -1;
      break;
    case 'right':
      modifier.y = 1;
      break;
  }

  if (typeof map[tile.coordinate.x + modifier.x] === 'undefined' || typeof map[tile.coordinate.x + modifier.x][tile.coordinate.y + modifier.y] === 'undefined') {
    return null;
  }

  return map[tile.coordinate.x + modifier.x][tile.coordinate.y + modifier.y].type;
}


function getTilesAround(tile, setHighLightedtiles) {
  const aboveTile = getTile(tile, 'above');
  const aboveLeftTile = getTile(tile, 'aboveLeft');
  const aboveRightTile = getTile(tile, 'aboveRight');
  const belowTile = getTile(tile, 'below');
  const belowLeftTile = getTile(tile, 'belowLeft');
  const belowRightTile = getTile(tile, 'belowRight');
  const leftTile = getTile(tile, 'left');
  const rightTile = getTile(tile, 'right');

  const matrix = [
    [aboveLeftTile === tile.type, aboveTile === tile.type, aboveRightTile === tile.type],
    [leftTile === tile.type, true, rightTile === tile.type],
    [belowLeftTile === tile.type, belowTile === tile.type, belowRightTile === tile.type],
  ];

  // setHighLightedtiles([aboveTile.coordinate]);
  return matrix;

}

const App = () => {
  const viewportRef = useRef<Viewport>(null);
  const [highLightedCoords, setHighLightedCoords] = useState<number[][] | null>([]);
  const [highLightedtiles, setHighLightedtiles] = useState<any[] | null>([]);

  const focus = useCallback((p: keyof typeof areas) => {
    const viewport = viewportRef.current!;
    const [x, y] = areas[p];


    viewport.setZoom(0.2);
    viewport.snap(x, y, { removeOnComplete: true });
  }, []);

  const onViewPortClicked = (event) => {
    const x = Math.floor(event.world.x / 32);
    const y = Math.floor(event.world.y / 32);
    const tile = map[y][x];

    console.log(tile);

    const closestRoutes = tile?.extraInfo?.closest.map(
      (closest) => {
        return routes.find((route) => {
          return route.id === closest.route
        }).route;
      }).flat();

    setHighLightedCoords(closestRoutes);
    setHighLightedtiles([tile]);
  }

  return (
    <>
      <div className="buttons-group">
        <button onClick={() => focus('world')}>Center</button>
        <button onClick={() => focus('pinxton')}>Pinxton</button>
        <button onClick={() => focus('derby')}>Derby</button>
      </div>


      <Stage width={stageWidth} height={stageHeight} options={stageOptions}>
        <PixiViewport
          ref={viewportRef}
          screenWidth={stageWidth}
          screenHeight={stageHeight}
          viewportPlugins={["drag", "wheel"]}
          worldWidth={width}
          worldHeight={height}
          onViewPortClicked={onViewPortClicked}
        >
          <Background
            worldWidth={width}
            worldHeight={height}
          />
          <RenderText />
          {renderMap(map, highLightedtiles, highLightedCoords)}
        </PixiViewport>
      </Stage>
    </>
  );
};

export default App;
