
'use strict';

const fs    = require('fs');
const path  = require('path');
const chalk = require('chalk');
const ora   = require('ora');
const engine = require('../../backend/steganography/engine');

module.exports = function decodeImageCommand(program) {
  program
    .command('decode-image')
    .description('Extract a hidden image from an encoded carrier image.')
    .requiredOption('-i, --input <path>',    'Path to the encoded carrier image')
    .requiredOption('-o, --output <path>',   'Output path for the recovered secret image (.png)')
    .option('-p, --password <password>',     'Decryption password (if payload was encrypted)')
    .action(async (opts) => {
      const spinner = ora('Decoding image...').start();
      try {
        if (!fs.existsSync(opts.input)) {
          spinner.fail(chalk.red(`Input file not found: ${opts.input}`));
          process.exit(1);
        }

        const inputBuf     = fs.readFileSync(opts.input);
        const recoveredBuf = await engine.decodeImage(inputBuf, { password: opts.password || null });

        const outDir  = path.dirname(path.resolve(opts.output));
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
        const outPath = opts.output.endsWith('.png') ? opts.output : opts.output + '.png';

        fs.writeFileSync(outPath, recoveredBuf);
        spinner.succeed(chalk.green(`✓ Hidden image extracted to: ${path.resolve(outPath)}`));
        console.log(chalk.dim(`  Source:    ${opts.input}`));
        console.log(chalk.dim(`  Decrypted: ${opts.password ? 'Yes (AES-256)' : 'No'}`));
      } catch (err) {
        spinner.fail(chalk.red(`Error: ${err.message}`));
        process.exit(1);
      }
    });
};
