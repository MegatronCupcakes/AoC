import path from 'node:path';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import _ from 'underscore';

const TEST = process.env.TEST_MODE == 'true';

let data;
if(TEST){
    data = [
        '467..114..',
        '...*......',
        '..35..633.',
        '......#...',
        '617*......',
        '.....+.58.',
        '..592.....',
        '......755.',
        '...$.*....',
        '.664.598..'
    ];
    const exclusions = [114, 58];
    const sum = 4361;
} else {
    data = (await readFile(path.join('data', 'day_3.txt'), 'utf8'))
    .split('\n')
    .map(line => line.toLowerCase())
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

const isNumeric = (value) => {
    try {
        Number(value);
        return !isNaN(value);
    } catch(error){
        console.log(`error`)
        return false;
    }
};
const isSymbol = (value) => {
    return value != "." && !isNumeric(value);
};
const findAdjacentSymbols = (position, symbols) => {
    return _.filter(symbols, symbol => {
        const _adjacent = (symbol.row == position.row && symbol.column - 1 == position.column) // left
        || (symbol.row - 1 == position.row && symbol.column - 1 == position.column) // diagnol up left
        || (symbol.row - 1 == position.row && symbol.column == position.column) // above
        || (symbol.row - 1 == position.row && symbol.column + 1 == position.column) // diagnol up right
        || (symbol.row == position.row && symbol.column + 1 == position.column) // right
        || (symbol.row + 1 == position.row && symbol.column + 1 == position.column) // diagnol down right
        || (symbol.row + 1 == position.row && symbol.column == position.column) // below
        || (symbol.row + 1 == position.row && symbol.column - 1 == position.column); // diagnol down left        
        return _adjacent;
    });
}


let symbols = [];
let numbers = await Promise.all(data.map((row, rowIndex) => new Promise((resolve, reject) => {
    try {
        let rowNumbers = [];
        row.split("").forEach((lineCharacter, columnIndex) => {
            if(isNumeric(lineCharacter)){
                rowNumbers.push({value: lineCharacter, row: rowIndex, column: columnIndex});
            }
            if(isSymbol(lineCharacter)){
                symbols.push({_id: randomUUID(), value: lineCharacter, row: rowIndex, column: columnIndex, gear: lineCharacter == '*', adjacentNumbers: []});
            }
        });
                
        const groupNumbers = (currentNumber, numberArray, groupedNumbers, fn) => {
            if(numberArray.length == 0){
                groupedNumbers.push(currentNumber);
                fn(groupedNumbers)
            } else {
                let nextNumber = rowNumbers.shift();                
                if(currentNumber.positions[currentNumber.positions.length - 1].column + 1 == nextNumber.column){
                    // adjacent numbers, append.
                    currentNumber.value = Number(`${currentNumber.value}${nextNumber.value}`);
                    currentNumber.positions.push({
                        row: nextNumber.row,
                        column: nextNumber.column
                    });                    
                    groupNumbers(currentNumber, numberArray, groupedNumbers, fn)
                } else {
                    groupedNumbers.push(currentNumber);
                    groupNumbers(createNumberGroup(nextNumber), numberArray, groupedNumbers, fn);
                }                
            }            
        }
        const createNumberGroup = (number) => {
            return {
                _id: randomUUID(),
                value: number.value,
                positions: [
                    {
                        row: number.row,
                        column: number.column
                    }
                ]
            }
        };
        const firstNumber = rowNumbers.shift();
        if(firstNumber){
            groupNumbers(createNumberGroup(firstNumber), rowNumbers, [], resolve);
        } else {
            resolve([]);
        }
    } catch(error){
        reject(error);
    }
})));
let gearSymbols = _.where(symbols, {gear: true});
let gearNumberXref = [];
numbers = numbers.flat();
numbers.map((number) => {
    const adjacentSymbols = number.positions.map(position => findAdjacentSymbols(position, symbols))
        .flat()
        .map(symbol => symbol._id);
    const adjacentGearSymbols = number.positions.map(position => findAdjacentSymbols(position, gearSymbols))
        .flat()
        .map(symbol => symbol._id);
    number.adjacentSymbols = adjacentSymbols;
    number.isAdjacent = adjacentSymbols.length > 0;
    number.isAdjacentToGear = adjacentGearSymbols.length > 0;
    number.adjacentGearSymbols = adjacentGearSymbols;
    adjacentGearSymbols.forEach(gearSymbolId => {
        if(!_.findWhere(gearNumberXref, {numberId: number._id})){
            gearNumberXref.push({gearId: gearSymbolId, numberId: number._id, value: number.value});
        }
    });
    return number;
});
const groupedByGear = _.groupBy(gearNumberXref, 'gearId');
const gearRatios = _.compact(_.keys(groupedByGear).map(key => {
    if(groupedByGear[key].length == 2) return Number(groupedByGear[key][0].value) * Number(groupedByGear[key][1].value);
}));
const adjacentValues = numbers.filter(number => number.isAdjacent).map(number => number.value);
const numberSum = adjacentValues.reduce((sum, value) => sum + Number(value), 0);
const gearRatioSum = gearRatios.reduce((sum, value) => sum + value, 0);
console.log(`numberSum: ${numberSum}; gearRatioSum: ${gearRatioSum}`);