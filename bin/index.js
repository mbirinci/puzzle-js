#!/usr/bin/env node
require('ts-node/register');
const path = require('path');
const {fork} = require('child_process');
const webpack = require('webpack');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');


const yargs = require('yargs')
  .command(['serve [file]', 'run', 'start'], 'Starts PuzzleJs application', {}, (argv) => {
    require(path.join(process.cwd(), argv.file || 'index.ts'));
  })
  .command(['build [file]'], 'Builds PuzzleJs application', {}, (argv) => {
    const entryFile = path.join(process.cwd(), argv.file || 'index.ts');
    const outDir = path.join(process.cwd(), './dist');
    const compiler = webpack(require('./webpack.config')(entryFile, outDir));
    compiler.apply(new ProgressPlugin(function (percentage, msg, current, active, modulepath) {
      if (process.stdout.isTTY && percentage < 1) {
        process.stdout.cursorTo(0);
        modulepath = modulepath ? ' …' + modulepath.substr(modulepath.length - 30) : '';
        current = current ? ' ' + current : '';
        active = active ? ' ' + active : '';
        process.stdout.write((percentage * 100).toFixed(0) + '% ' + msg + current + active + modulepath + ' ');
        process.stdout.clearLine(1)
      } else if (percentage === 1) {
        process.stdout.write('\n');
        console.log('webpack: done.')
      }
    }));

    compiler.run(function (err, stats) {
      if (err) throw err;
      process.stdout.write(stats.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false
      }) + '\n\n')
    });
    // fork('./node_modules/.bin/tsc', {
    //   cwd: path.dirname(entryFile)
    // });
  })
  // .command(['init <type>', 'generate'], 'Creates an PuzzleJs starter application', {}, (argv) => {
  //
  // })
  .demandCommand()
  .help()
  .argv;
