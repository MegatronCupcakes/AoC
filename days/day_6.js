import path from 'node:path';
import {readFile} from 'node:fs/promises';
import _ from 'underscore';

const TEST = process.env.TEST_MODE == 'true';

let data;
if(TEST){
    data = [
        'Time:      7  15   30',
        'Distance:  9  40  200'
    ]
    .map(line => line.toLowerCase())
    .map(line => line.trim());
} else {
    data = (await readFile(path.join('data', 'day_6.txt'), 'utf8'))
    .split('\n')
    .map(line => line.toLowerCase())
    .map(line => line.trim());
}
const [time, distance] = data.map(line => _.compact(line.split(':')[1].trim().split(' ')).map(value => Number(value.trim())));
const raceMap = {
    byTime: _.object(time, distance),
    byDistance: _.object(distance, time)
};

const counts = _.compact(_.keys(raceMap.byTime).map(time => {
    let count = 0;
    for(let pressTime = 1; pressTime < time; pressTime++){
        const distance = (time - pressTime) * pressTime;
        if(distance > raceMap.byTime[time]) count++;
    }
    return count;
}));
const answer = counts.reduce((sum, value) => sum * value, 1);
console.log(`counts: ${counts}`);
console.log(`answer: ${answer}`);
