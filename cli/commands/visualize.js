/**
 * @file commands/visualize.js
 * @description stego visualize command — display LSB visualization report.
 */
'use strict';

const fs    = require('fs');
const chalk = require('chalk');
const ora   = require('ora');
const engine = require('../../backend/steganography/engine');

module.exports = function visualizeCommand(program) {
  program
    .command('visualize')
    .description('Show a pixel-level LSB visualization report comparing original and encoded images.')
    .requiredOption('-c, --carrier <path>',  'Path to the original carrier image')
    .requiredOption('-e, --encoded <path>',  'Path to the encoded (steganographic) image')
    .option('-n, --samples <count>',         'Number of pixel samples to show (default: 12)', '12')
    .action(async (opts) => {
      const spinner = ora('Analysing images...').start();
      try {
        if (!fs.existsSync(opts.carrier)) {
          spinner.fail(chalk.red(`Carrier file not found: ${opts.carrier}`));
          process.exit(1);
        }
        if (!fs.existsSync(opts.encoded)) {
          spinner.fail(chalk.red(`Encoded file not found: ${opts.encoded}`));
          process.exit(1);
        }

        const carrierBuf = fs.readFileSync(opts.carrier);
        const encodedBuf = fs.readFileSync(opts.encoded);
        const sampleCount = Math.min(Math.max(parseInt(opts.samples, 10) || 12, 1), 64);

        const report = await engine.visualize(carrierBuf, encodedBuf, { sampleCount });
        spinner.stop();

        // ── Header ─────────────────────────────────────────
        console.log(chalk.cyan('\n╔══════════════════════════════════════════════════╗'));
        console.log(chalk.cyan('║         StegoKit — LSB Visualization Report      ║'));
        console.log(chalk.cyan('╚══════════════════════════════════════════════════╝\n'));

        console.log(chalk.bold('Image Info'));
        console.log(`  Dimensions  : ${report.imageInfo.width} × ${report.imageInfo.height} px`);
        console.log(`  Total pixels: ${report.imageInfo.totalPixels.toLocaleString()}`);

        console.log(chalk.bold('\nCapacity'));
        console.log(`  Max embeddable : ${report.capacity.maxBytes.toLocaleString()} bytes`);
        console.log(`  Payload stored : ${report.capacity.usedBytes.toLocaleString()} bytes`);
        console.log(`  Usage          : ${report.capacity.percentUsed}%`);

        console.log(chalk.bold('\nHeader (32-bit payload length):'));
        console.log('  ' + chalk.yellow(report.headerBits.slice(0, 16)) + chalk.dim(report.headerBits.slice(16)));

        console.log(chalk.bold(`\nPixel Samples (${report.samples.length} of ${report.imageInfo.totalPixels.toLocaleString()})`));
        console.log(chalk.dim('  [PIXEL] (x,y)  CH  ORIGINAL → ENCODED  LSB Changed?'));
        console.log(chalk.dim('  ' + '─'.repeat(58)));

        for (const s of report.samples) {
          for (const ch of ['r', 'g', 'b']) {
            const ob = s.original.binary[ch];
            const eb = s.encoded.binary[ch];
            const changed = s.changedBits.includes(ch);
            const lsbOrig = chalk.bold(ob.slice(0, 7)) + (changed ? chalk.red.bold(ob[7]) : chalk.green.bold(ob[7]));
            const lsbEnc  = chalk.bold(eb.slice(0, 7)) + (changed ? chalk.red.bold(eb[7]) : chalk.green.bold(eb[7]));
            const indicator = changed ? chalk.red('✗ CHANGED') : chalk.green('✓ same');
            console.log(`  [${String(s.pixelIndex).padStart(6)}] (${String(s.x).padStart(4)},${String(s.y).padStart(4)})  ${ch.toUpperCase()}   ${lsbOrig} → ${lsbEnc}  ${indicator}`);
          }
        }

        console.log(chalk.cyan('\n────────────────────────────────────────────────────'));
        console.log(chalk.bold('Algorithm: ') + chalk.dim(report.algorithm));
        console.log(chalk.bold('Header:    ') + chalk.dim(report.headerFormat));
        console.log('');
      } catch (err) {
        spinner.fail(chalk.red(`Error: ${err.message}`));
        process.exit(1);
      }
    });
};
