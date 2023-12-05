import path from 'node:path';
import {readFile} from 'node:fs/promises';

const TEST = false;

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
const isAdjacentToSymbol = (position, symbols) => {
    return symbols.some(symbol => {
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
                symbols.push({value: lineCharacter, row: rowIndex, column: columnIndex});
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
                    groupNumbers({
                        value: nextNumber.value,
                        positions: [
                            {
                                row: nextNumber.row,
                                column: nextNumber.column
                            }
                        ]
                    }, numberArray, groupedNumbers, fn);
                }                
            }
            
        }
        const firstNumber = rowNumbers.shift();
        if(firstNumber){
            groupNumbers({
                value: firstNumber.value,
                positions: [
                    {
                        row: firstNumber.row,
                        column: firstNumber.column
                    }
                ]
            }, rowNumbers, [], resolve);
        } else {
            resolve([]);
        }
    } catch(error){
        reject(error);
    }
})));
numbers = numbers.flat();
numbers.forEach((number, numberIndex) => {
    numbers[numberIndex].isAdjacent = number.positions.some(position => isAdjacentToSymbol(position, symbols));
});
const adjacentValues = numbers.filter(number => number.isAdjacent).map(number => number.value);
const numberSum = adjacentValues.reduce((sum, value) => sum + Number(value), 0);
console.log(`numberSum: ${numberSum}`);