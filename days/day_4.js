import path from 'node:path';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import _ from 'underscore';

const TEST = process.env.TEST_MODE == 'true';
const Part1 = Number(process.argv[3]) == 1;

let data;
if(TEST){
    data = [
        'Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53',
        'Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19',
        'Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1',
        'Card 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83',
        'Card 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36',
        'Card 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11'
    ]
    .map(line => line.toLowerCase())
    .map(line => line.trim());
} else {
    data = (await readFile(path.join('data', 'day_4.txt'), 'utf8'))
    .split('\n')
    .map(line => line.toLowerCase())
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

let cards = await Promise.all(data.map(line => {
    return new Promise((resolve, reject) => {
        try {
            const card = {
                _id: randomUUID(),
                cardNumber: line.split('|')[0].split(':')[0].replace('card','').trim(),
                winningNumbers: _.compact(line.split('|')[0].split(':')[1].split(' ').map(value => Number(value.trim()))),
                myNumbers: _.compact(line.split('|')[1].split(' ').map(value => Number(value.trim()))),
                matchCount: 0,
                points: 0
            }
            card.cardNumber = Number(card.cardNumber);
            // count matches
            card.matchCount = card.winningNumbers.reduce((matchCount, winningNumber) => {
                if(card.myNumbers.indexOf(winningNumber) > -1) matchCount++;
                return matchCount;
            }, 0);
            card.matchRange = _.range(card.cardNumber + 1, card.cardNumber + card.matchCount + 1)
            resolve(card);
        } catch(error){     
            console.log(line);
            reject(error);
        }
    })
}));

if(Part1){
    cards.forEach(card => {        
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
} else {

    // Cache results; reverse the array and start with the lowest cards as they refer to the fewest
    // dependents, then store those results so they don't need calculation every time.  Don't even need to hold
    // the array of objects, just a count of cards generated for a number.
    
    cards = cards.reverse();
    const cardMap = {};
    cards.forEach(card => cardMap[card.cardNumber] = {
        cardNumber: card.cardNumber,
        matchRange: card.matchRange,
        totalCards: null
    });
    const copyCardByNumber = (cardNumber) => {
        // potentially matching cards at the bottom of the list could have
        // a match range that is outside the range of the list;  The instructions
        // say this is not possible but catching it is simple enough....
        try {
            return {
                ...cardMap[cardNumber]
            };
        } catch(error){
            return null;
        }
    };
    let processedCards = 0;
    for(let i = 0; i < cards.length; i++){
        await new Promise((resolve, reject) => {
            try {                
                let cardCount = 0;
                const findCopies = (_cards) => {                
                    if(_cards.length == 0){
                        cardMap[cards[i].cardNumber].totalCards = cardCount;
                        processedCards += cardCount;
                        resolve();
                    } else {
                        let _card = _cards.shift();
                        if(cardMap[_card.cardNumber].totalCards){
                            cardCount += cardMap[_card.cardNumber].totalCards;
                        } else {
                            // remove falsy values caused by a potentially out of rance match range before joining the lists.
                            _cards = _.union(_cards, _.compact(_card.matchRange.map(_cardNumber => copyCardByNumber(_cardNumber))));
                            cardCount++;
                        }                        
                        findCopies(_cards);
                    }
                }            
                findCopies([cards[i]]);
            } catch(error){
                reject(error);
            }        
        });
    }        
    console.log(`card total: ${processedCards}`);
    process.exit();
}