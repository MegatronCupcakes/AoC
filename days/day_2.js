import path from 'node:path';
import {readFile} from 'node:fs/promises';

const Part1 = Number(process.argv[3]) == 1;
const inputLines = (await readFile(path.join('data', 'day_2.txt'), 'utf8'))
    .split('\n')
    .map(line => line.toLowerCase())
    .map(line => line.trim())
    .filter(line => line.length > 0);
let games = (await Promise.all(inputLines.map(line => {
    return new Promise((resolve, reject) => {
        try {
            let game = {
                _id: Number(line.split(":")[0].replace("game ", "")),
                sets: line.split(":")[1].trim().split(";").map(string => string.trim()).map(set => {
                    let _set = {
                        red: 0,
                        blue: 0,
                        green: 0
                    };
                    set.split(",").map(str => str.trim()).forEach(result => {
                        const resultComponents = result.split(" ");
                        _set[resultComponents[1].trim()] = Number(resultComponents[0].trim());
                    });
                    return _set;
                })
            };
            const _minNeededForColor = (game, color) => {
                return game.sets.map(set => set[color]).sort((a, b) => b - a).filter(number => number > 0)[0];
            }            
            game.power = _minNeededForColor(game, "red") * _minNeededForColor(game, "green") * _minNeededForColor(game, "blue");            
            resolve(game);
        } catch(error){
            reject(error);
        }
    });    
})));

if(Part1){
    games = games.filter(game => {
        return game.sets.every(set => set.red <= 12 && set.green <= 13 && set.blue <=14);
    });
    const gameIdSum = games.reduce((sum, game) => sum + game._id, 0);
    console.log(`gameIdSum: ${gameIdSum}`);
} else {
    const gamePowerSum = games.reduce((sum, game) => sum + game.power, 0);
    console.log(`gamePowerSum: ${gamePowerSum}`);
}

