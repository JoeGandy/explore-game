
import map from '../assets/raw-data.json';
import { TextStyle } from 'pixi.js'
import { Text } from "@pixi/react";

const RenderText = () => {
    const getSize = (tile) => {
        switch (tile.extraInfo?.properties?.place) {
            case 'city':
                return 90;
            case 'town':
                return 50;
            case 'village':
            case 'suburb':
                return 30;
            default:
                return 20;
        }
    }

    return map.flat().map((tile: any) => {
        if (tile?.type === 4) {
            return <Text
                text={tile.extraInfo?.properties?.name}
                anchor={0.5}
                y={tile.coordinate.x * 32}
                x={tile.coordinate.y * 32}
                key={`${tile.coordinate.x}.${tile.coordinate.y}-text`}
                style={
                    new TextStyle({
                        align: 'center',
                        fontFamily: '"VT323", monospace',
                        fontSize: getSize(tile),
                        fontWeight: '400',
                        fill: '0xffffff',
                        letterSpacing: 5,
                        wordWrap: true,
                        wordWrapWidth: 440,
                    })
                }
            />
        }
        return null;
    }).filter(cell => !!cell);
}

export default RenderText;