import path from 'node:path';
import {readFile} from 'node:fs/promises';
import _ from 'underscore';

const TEST = process.env.TEST_MODE == 'true';

let data;
if(TEST){
    data = [
        'Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53',
        'Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19',
        'Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1',
        'Card 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83',
        'Card 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36',
        'Card 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11'
    ];
} else {
    data = (await readFile(path.join('data', 'day_4.txt'), 'utf8'))
    .split('\n')
    .map(line => line.toLowerCase())
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

const cards = await Promise.all(data.map(line => {
    return new Promise((resolve, reject) => {
        try {
            const card = {
                _id: Number(line.split('|')[0].split(':')[0].replace('Card','').trim()),
                winningNumbers: _.compact(line.split('|')[0].split(':')[1].split(' ').map(value => value.trim())),
                myNumbers: _.compact(line.split('|')[1].split(' ').map(value => value.trim())),
                matchCount: 0,
                points: 0
            }
            resolve(card);
        } catch(error){
            reject(error);
        }
    })
}));
cards.forEach(card => {
    // count matches
    card.matchCount = card.winningNumbers.reduce((matchCount, winningNumber) => {
        if(card.myNumbers.indexOf(winningNumber) > -1) matchCount++;
        return matchCount;
    }, 0);
    // calculate points
    if(card.matchCount > 0){
        let _matchCount = card.matchCount - 1;
        card.points = 1;
        if(_matchCount > 0){
            _.times(_matchCount, () => card.points = 2 * card.points);
        }
    }
});
const pointsSum = cards.map(card => card.points).reduce((sum, points) => sum + points, 0);
console.log(`pointsSum: ${pointsSum}`);