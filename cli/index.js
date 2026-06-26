#!/usr/bin/env node
/**
 * @file index.js
 * @description StegoKit CLI entry point — Commander.js program.
 */
'use strict';

const { Command } = require('commander');
const chalk       = require('chalk');
const { version } = require('./package.json');

// Command modules
const encodeImageCmd = require('./commands/encodeImage');
const decodeImageCmd = require('./commands/decodeImage');
const encodeTextCmd  = require('./commands/encodeText');
const decodeTextCmd  = require('./commands/decodeText');
const visualizeCmd   = require('./commands/visualize');

const program = new Command();

program
  .name('stego')
  .description(
    chalk.cyan('StegoKit') +
    ' — Hide and extract data inside images using LSB steganography.'
  )
  .version(version, '-v, --version');

// Register commands
encodeImageCmd(program);
decodeImageCmd(program);
encodeTextCmd(program);
decodeTextCmd(program);
visualizeCmd(program);

// Show help if no args
if (process.argv.length <= 2) {
  program.help();
}

program.parse(process.argv);
