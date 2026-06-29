
'use strict';

const fs    = require('fs');
const path  = require('path');
const chalk = require('chalk');
const ora   = require('ora');

const engine = require('../../backend/steganography/engine');

module.exports = function encodeImageCommand(program) {
  program
    .command('encode-image')
    .description('Hide a secret image inside a carrier image using LSB steganography.')
    .requiredOption('-c, --carrier <path>',  'Path to the carrier (cover) image')
    .requiredOption('-s, --secret <path>',   'Path to the secret image to hide')
    .requiredOption('-o, --output <path>',   'Output file path for the encoded image (.png)')
    .option('-p, --password <password>',     'Optional AES-256 encryption password')
    .action(async (opts) => {
      const spinner = ora('Encoding image...').start();
      try {

        if (!fs.existsSync(opts.carrier)) {
          spinner.fail(chalk.red(`Carrier file not found: ${opts.carrier}`));
          process.exit(1);
        }
        if (!fs.existsSync(opts.secret)) {
          spinner.fail(chalk.red(`Secret file not found: ${opts.secret}`));
          process.exit(1);
        }

        const carrierBuf = fs.readFileSync(opts.carrier);
        const secretBuf  = fs.readFileSync(opts.secret);

        const cap = await engine.calculateCapacity(carrierBuf, secretBuf.length);
        spinner.text = `Carrier capacity: ${cap.maxBytes.toLocaleString()} bytes | Payload: ${secretBuf.length.toLocaleString()} bytes`;

        const encodedBuf = await engine.encodeImage(carrierBuf, secretBuf, {
          password:   opts.password || null,
          onProgress: (pct) => { spinner.text = `Encoding... ${pct}%`; },
        });

        const outDir = path.dirname(path.resolve(opts.output));
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

        const outPath = opts.output.endsWith('.png') ? opts.output : opts.output + '.png';
        fs.writeFileSync(outPath, encodedBuf);

        spinner.succeed(chalk.green(`✓ Encoded image saved to: ${path.resolve(outPath)}`));
        console.log(chalk.dim(`  Carrier: ${opts.carrier}`));
        console.log(chalk.dim(`  Secret:  ${opts.secret}`));
        console.log(chalk.dim(`  Encrypted: ${opts.password ? 'Yes (AES-256)' : 'No'}`));
        console.log(chalk.dim(`  Capacity used: ${cap.percentUsed}%`));
      } catch (err) {
        spinner.fail(chalk.red(`Error: ${err.message}`));
        process.exit(1);
      }
    });
};
