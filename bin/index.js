#!/usr/bin/env node
const path = require('path');



const yargs = require('yargs')
  .command(['serve [file]', 'run', 'start'], 'Starts PuzzleJs application', {}, (argv) => {
      require('ts-node').register({
          pretty: true,
      });
      require(path.join(process.cwd(), argv.file || 'index.ts'));
  })
  .command(['run [file]'], 'Builds PuzzleJs application', {}, (argv) => {
      require('ts-node').register({
          transpileOnly: true
      });
      require(path.join(process.cwd(), argv.file || 'index.ts'));
  })
  // .command(['init <type>', 'generate'], 'Creates an PuzzleJs starter application', {}, (argv) => {
  //
  // })
  .demandCommand()
  .help()
  .argv;
