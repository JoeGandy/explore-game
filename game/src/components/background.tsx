
import { Sprite } from "@pixi/react";
import { BACKGROUND_PIECES_HORITZONTAL, BACKGROUND_PIECES_VERTICAL, TILE_SIZE } from "../../../global-constants.ts"

type BackgroundProps = {
    worldWidth: number;
    worldHeight: number;
}

const Background = ({ worldWidth, worldHeight }: BackgroundProps) => {
    const renderImages = () => {
        let result = [];
        for (let x = 0; x < BACKGROUND_PIECES_HORITZONTAL; x++) {
            for (let y = 0; y < BACKGROUND_PIECES_VERTICAL; y++) {
                result.push(
                    <Sprite
                        image={`/assets/background/background-${x}-${y}.png`}
                        x={x * (worldWidth / BACKGROUND_PIECES_HORITZONTAL)}
                        y={y * (worldHeight / BACKGROUND_PIECES_VERTICAL)}
                        key={`background-${x}.${y}`}
                    />
                );
            }
        }
        return result;
    }

    return renderImages();
}

export default Background;
