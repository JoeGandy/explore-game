import { useCallback, useRef, useState } from "react";
import { Stage, Sprite } from "@pixi/react";
import { PixiViewport } from "./Viewport";
import { Viewport } from "pixi-viewport";
import routes from './assets/raw-data-known-routes.json';
import map from './assets/raw-data.json';
import Background from "./components/background";
import RenderText from "./components/render-text";
import Debug from "./assets/debug24px.png";
import { width, height, TILE_SIZE } from "./consants/dimensions";

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
  'derby': [11373.153135617216, 18992.967234900392, 0.4],
  'bamford': [7344.451031076167, 5556.966944493974, 0.95]
};
const renderMap = (mapLight: any[][], highLightedtiles, highLightedCoords) => {
  let result = [];

  highLightedtiles && highLightedtiles.map((highlightedTile) => {
    result.push(
      <Sprite
        image={Debug}
        y={highlightedTile.coordinate.x * TILE_SIZE}
        x={highlightedTile.coordinate.y * TILE_SIZE}
        key={`${highlightedTile.coordinate.x}.${highlightedTile.coordinate.y}.tile`} />
    );
  });

  highLightedCoords && highLightedCoords.map((highLightedCoord, i) => {
    result.push(
      <Sprite
        image={Debug}
        y={highLightedCoord[0] * TILE_SIZE}
        x={highLightedCoord[1] * TILE_SIZE}
        key={`${highLightedCoord[0]}.${highLightedCoord[1]}.coord.${i}`} />
    );
  });

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

const App = () => {
  const viewportRef = useRef<Viewport>(null);
  const [highLightedCoords, setHighLightedCoords] = useState<number[][] | null>([]);
  const [highLightedtiles, setHighLightedtiles] = useState<any[] | null>([]);
  const [targetCoordinate, setTargetCoordinate] = useState<{ x: number, y: number }>({ x: 50, y: 50 });

  const focus = useCallback((p: keyof typeof areas) => {
    const viewport = viewportRef.current!;
    const [x, y, zoom] = areas[p];


    viewport.setZoom(zoom);
    viewport.snap(x, y, { removeOnComplete: true });
  }, []);

  const jumpToCoordinate = useCallback((coordinate: { x: number, y: number }) => {
    const viewport = viewportRef.current!;

    const { x, y } = coordinate;
    console.log(coordinate);
    viewport.setZoom(0.5);
    viewport.snap(y * TILE_SIZE, x * TILE_SIZE, { removeOnComplete: true });
  }, []);

  const onViewPortClicked = (event) => {
    const x = Math.floor(event.world.x / TILE_SIZE);
    const y = Math.floor(event.world.y / TILE_SIZE);
    const tile = map[y][x];

    console.log(tile);
    function getTile(tile, direction) {
      let modifier = { x: 0, y: 0 };

      switch (direction) {
        case 'above':
          modifier.x = -1;
          break;
        case 'aboveLeft':
          modifier.x = -1;
          modifier.y = -1;
          break;
        case 'aboveRight':
          modifier.x = -1;
          modifier.y = 1;
          break;
        case 'below':
          modifier.x = 1;
          break;
        case 'belowLeft':
          modifier.x = 1;
          modifier.y = -1;
          break;
        case 'belowRight':
          modifier.x = 1;
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




    function getTilesAround(tile) {
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
      return matrix;

    }

    function getEdgeTile(tile) {
      const order = ['belowRight', 'below', 'belowLeft', 'left', 'aboveLeft', 'above', 'aboveRight', 'right'];
      const bit = [1, 2, 4, 8, 16, 32, 64, 128];
      let runningTotal = 0;
      order.forEach(function (target, i) {
        const targetTile = getTile(tile, target);
        if (targetTile !== tile.type) {
          runningTotal += bit[i];
        }
      });

      return runningTotal;
    }
    function getTileBitmask(map, tile) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [ 0, 1], [ 1, 1], [ 1, 0],
            [ 1, -1], [ 0, -1]
        ];
    
        let bitmask = 0;
        if (!tile || !map[tile.coordinate.x] || map[tile.coordinate.x][tile.coordinate.y] === undefined) {
            return bitmask;
        }
    
        const tileType = map[tile.coordinate.x][tile.coordinate.y].type;
    
        directions.forEach(([dx, dy], index) => {
            const nx = tile.coordinate.x + dx;
            const ny = tile.coordinate.y + dy;
    
            if (
                map[nx] !== undefined &&
                map[nx][ny] !== undefined &&
                map[nx][ny].type === tileType
            ) {
                bitmask |= (1 << index);
            }
        });
    
        return bitmask;
    }
    
    console.log('bitmask', getTileBitmask(map, tile));
    console.log(getTilesAround(tile));

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
        <button onClick={() => focus('bamford')}>Bamford</button>
        <input
          type="number"
          defaultValue={50}
          onChange={(e) => {
            setTargetCoordinate({ ...targetCoordinate, x: Number(e.target.value) })
            jumpToCoordinate({ ...targetCoordinate, x: Number(e.target.value) });
          }} />
        <input
          type="number"
          defaultValue={50}
          onChange={(e) => {
            setTargetCoordinate({ ...targetCoordinate, y: Number(e.target.value) })
            jumpToCoordinate({ ...targetCoordinate, y: Number(e.target.value) });
          }} />
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
