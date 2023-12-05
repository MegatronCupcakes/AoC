import path from 'node:path';
import {readFile} from 'node:fs/promises';

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
            resolve(game);
        } catch(error){
            reject(error);
        }
    });    
}))).filter(game => {
    return game.sets.every(set => set.red <= 12 && set.green <= 13 && set.blue <=14);
})
const gameIdSum = games.reduce((sum, game) => sum + game._id, 0);
console.log(`gameIdSum: ${gameIdSum}`);