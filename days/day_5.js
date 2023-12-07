import path from 'node:path';
import {readFile} from 'node:fs/promises';
import _ from 'underscore';

const TEST = process.env.TEST_MODE == 'true';

let data;
if(TEST){
    data = [
        'seeds: 79 14 55 13',
        '',
        'seed-to-soil map:',
        '50 98 2',
        '52 50 48',
        '',
        'soil-to-fertilizer map:',
        '0 15 37',
        '37 52 2',
        '39 0 15',
        '',
        'fertilizer-to-water map:',
        '49 53 8',
        '0 11 42',
        '42 0 7',
        '57 7 4',
        '',
        'water-to-light map:',
        '88 18 7',
        '18 25 70',
        '',
        'light-to-temperature map:',
        '45 77 23',
        '81 45 19',
        '68 64 13',
        '',
        'temperature-to-humidity map:',
        '0 69 1',
        '1 0 69',
        '',
        'humidity-to-location map:',
        '60 56 37',
        '56 93 4'
    ]
    .map(line => line.toLowerCase())
    .map(line => line.trim());
} else {
    data = (await readFile(path.join('data', 'day_5.txt'), 'utf8'))
    .split('\n')
    .map(line => line.toLowerCase())
    .map(line => line.trim());
}
const lookupSequence = ['seed', 'soil', 'fertilizer', 'water', 'light', 'temperature', 'humidity', 'location'];
const seeds = (data.shift()).split(":")[1].trim().split(' ').map(value => Number(value));
const maps = {
    sourceMaps: {},
    destinationMaps: {}
};
await new Promise((resolve, reject) => {
    try {
        let sourceKey, destinationKey;
        const mapData = () => {
            if(data.length == 0){
                resolve();
            } else {
                const line = data.shift();
                if(!_.isEmpty(line)){
                    if(isNaN(Number(line[0]))){
                        // key values
                        [sourceKey, destinationKey] = _.compact(line.replace(' map:','').trim().split('-to-')).map(key => key.trim());
                    } else {
                        // number values
                        const [destinationRangeStart, sourceRangeStart, rangeLength] = line.trim().split(' ').map(value => Number(value.trim()))
                        const mapValues = {
                            destinationRangeStart: destinationRangeStart,
                            destinationRangeEnd: destinationRangeStart + (rangeLength - 1),
                            sourceRangeStart: sourceRangeStart,
                            sourceRangeEnd: sourceRangeStart + (rangeLength - 1),
                            rangeLength: rangeLength
                        };
                        if(!maps.sourceMaps[sourceKey]) maps.sourceMaps[sourceKey] = [];
                        if(!maps.destinationMaps[destinationKey]) maps.destinationMaps[destinationKey] = [];
                        maps.sourceMaps[sourceKey].push({destination: destinationKey, ...mapValues});
                        maps.destinationMaps[destinationKey].push({source: sourceKey, ...mapValues});
                    }
                }
                mapData();
            }
        }
        mapData();
    } catch(error){
        reject(error);
    }
});

const seedMaps = await Promise.all(seeds.map(seed => new Promise((resolve, reject) => {
    try {
        const lookup = (number, sequence, seedMap) => {
            if(sequence.length == 0){
                resolve(seedMap);
            } else {
                const sequenceKey = sequence.shift();
                const map = _.find(maps.sourceMaps[sequenceKey], map => map.sourceRangeStart <= number && number <= map.sourceRangeEnd);
                if(map){                    
                    number = map.destinationRangeStart + (number - map.sourceRangeStart);
                }
                seedMap[sequenceKey] = number;
                lookup(number, sequence, seedMap);
            }

        }
        lookup(seed, [...lookupSequence], {seed: seed});
    } catch {
        reject(error);
    }
})))
const seedToSoil = {};
seeds.forEach(seed => {
    const map = _.find(maps.sourceMaps.seed, map => _.contains(map.sourceRange, seed));
    if(map){
        const index = map.sourceRange.indexOf(seed);
        seedToSoil[seed] = map.destinationRange[index];
    } else {
        seedToSoil[seed] = seed;
    }
});
const lowestDestination = seedMaps.map(seedMap => seedMap.location).sort((a, b) => a - b)[0];
console.log(`lowest destination: ${lowestDestination}`);