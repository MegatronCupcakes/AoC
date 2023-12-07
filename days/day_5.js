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
const lookupSequence = ['seed', 'soil', 'fertilizer', 'water', 'light', 'temperature', 'humidity'];
const seeds = _.chunk((data.shift()).split(":")[1].trim().split(' ').map(value => Number(value)), 2).map(pair => {return {seedRangeStart: pair[0], seedRangeEnd: pair[0] + pair[1] - 1, seedRange: pair[1]}});
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

const lookup = (number, sequence) => {
    if(sequence.length == 0){
        // since we're only interested in the lowest location value, we don't need to store all locations.
        if(!lowestLocation || number < lowestLocation) lowestLocation = number;
    } else {
        const sequenceKey = sequence.shift();
        const _maps = maps.sourceMaps[sequenceKey].filter(_map => _map.sourceRangeStart <= number && number <= _map.sourceRangeEnd);        
        if(_maps.length > 0){                    
            number = _maps[0].destinationRangeStart + (number - _maps[0].sourceRangeStart);
        }
        lookup(number, sequence);                
    }
}
let lowestLocation = null;
for(let i = 0; i < seeds.length; i++){    
    for(let _i = seeds[i].seedRangeStart; _i <= seeds[i].seedRangeEnd; _i++){        
        lookup(_i, [...lookupSequence]);
    }
}
console.log(`lowest destination: ${lowestLocation}`);