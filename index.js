'use strict'

const csv = require('csv');
const fs = require('fs');
const fetch = require('fetch');
const chalk = require('chalk');

const FILENAME = process.argv[2];
const RESULT_URL = 'http://www.powerball.com/powerball/winnums-text.txt';

const LOOKUP = {
  10: 2,
  11: 2,
  12: 7,
  3: 7,
  13: 100,
  4: 100,
  14: 50000,
  5: 1000000,
  15: 'JACKPOT',
};

fetch.fetchUrl(RESULT_URL, (err, meta, body) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  let results = body.toString().split(/\r?\n/)[1].split('  ');
  let resultDate = results[0];
  let powerball = parseInt(results[6], 10);
  let winningNums = results.slice(1, 6).map((num) => parseInt(num, 10));
  let total = 0;

  console.log(chalk.bold(`Results for ${resultDate}:`));
  console.log(chalk.bold(`\t1\t2\t3\t4\t5\tPB`));
  console.log(chalk.bold.yellow('W\t' + winningNums.join('\t') + '\t' + powerball))

  fs.readFile(FILENAME, 'utf8', (err, fileData) => {
    csv.parse(fileData, (err, data) => {
      let output = data.reduce((prev, ticket, i) => {
        let ticketMatches = 0;
        let output = prev + chalk.bold(i + 1) + ticket.reduce((prev, num, i) => {
          num = parseInt(num, 10);
          let match = false;
          if (i === 5) { // powerball
            match = num === powerball
            if (match) {
              ticketMatches += 10;
            }
          } else {
            match = winningNums.indexOf(num) !== -1;
            if (match) {
              ticketMatches += 1;
            }
          }
          return prev + '\t' + (match ? chalk.green(num) : chalk.red(num));
        }, '');
        let winnings = LOOKUP[ticketMatches] || 0;
        total += winnings;
        output += '\t' + (winnings > 0 ? chalk.green('$' + winnings) : '$' + winnings);
        return output + '\n';
      }, '');
      output += chalk.bold.green('\t\t\t\t\t\t\t$' + total);
      console.log(output);
    });
  });
});
