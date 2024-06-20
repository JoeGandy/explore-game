
import { Sprite } from "@pixi/react";

import backgroundConfig from "../assets/background-config.json";

type BackgroundProps = {
    worldWidth: number;
    worldHeight: number;
}

const Background = ({ worldWidth, worldHeight }: BackgroundProps) => {
    const renderImages = () => {
        let result = [];
        for (let x = 0; x < Number(backgroundConfig.horizontalPieces); x++) {
            for (let y = 0; y < Number(backgroundConfig.verticalPieces); y++) {
                result.push(
                    <Sprite
                        image={`/assets/background/background-${x}-${y}.png`}
                        x={x * (worldWidth / Number(backgroundConfig.horizontalPieces))}
                        y={y * (worldHeight / Number(backgroundConfig.verticalPieces))}
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
