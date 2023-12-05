import path from 'node:path';
import {readFile} from 'node:fs/promises';

const numberWords = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9
};

const inputLines = (await readFile(path.join('data', 'input.txt'), 'utf8'))
    .split('\n')
    .map(line => line.toLowerCase())
    .map(line => line.trim())
    .filter(line => line.length > 0);
const calibrationValues = (await Promise.all(inputLines.map(line => {
    return new Promise(async (resolve, reject) => {
        try {
            // numeric substrings can share characters: "eightwothree" is 8,2,3; "xtwone3four" is 2,1,4
            // replacing just the first character with a number will preserve the dependent substring;
            // since substrings can repeat, check recursively
            console.log(`line: ${line}`);
            line = await new Promise((_resolve, _reject) => {
                try {
                    const _parseLine = (_line, _characterIndex) => {
                        if(_characterIndex == _line.length){
                            _resolve(_line);
                        } else {                            
                            Object.keys(numberWords).forEach(_numberWord => {
                                let _substringIndex = _line.indexOf(_numberWord);
                                if(_substringIndex == _characterIndex){
                                    _line = _line.slice(0, _substringIndex) + numberWords[_numberWord] + _line.slice(_substringIndex + 1);
                                }
                            });
                            _parseLine(_line, ++_characterIndex);
                        }                
                    }
                    _parseLine(line, 0);
                } catch(error){
                    _reject(error);
                }
            });                        
            const numerics = line.split('').map(character => Number(character)).filter(character => !isNaN(character));
            const calibrationValue = (numerics[0] * 10) + numerics[numerics.length - 1];
            console.log(`calibrationValue: ${calibrationValue} numerics: ${JSON.stringify(numerics)} line: ${line}`);
            resolve(calibrationValue);
        } catch(error){
            console.error(error);
            reject(error);
        }
    });
})));
const calibrationSum = calibrationValues.reduce((sum, value) => sum + value);
console.log(`calibrationSum: ${JSON.stringify(calibrationSum)}`);