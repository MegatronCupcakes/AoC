import path from 'node:path';
import {readFile} from 'node:fs/promises';

const inputLines = (await readFile(path.join('data', 'input.txt'), 'utf8')).split('\n').filter(line => line.length > 0);
const calibrationSum = (await Promise.all(inputLines.map(line => {
    return new Promise((resolve, reject) => {
        try {
            const numerics = line.split('').map(character => Number(character)).filter(character => !isNaN(character));
            resolve((numerics[0] * 10) + numerics[numerics.length -1]);
        } catch(error){
            reject(error);
        }
    });
}))).reduce((sum, value) => sum + value);
console.log(`calibrationSum: ${JSON.stringify(calibrationSum)}`);