
'use strict';

const fs    = require('fs');
const path  = require('path');
const chalk = require('chalk');
const ora   = require('ora');
const engine = require('../../backend/steganography/engine');

module.exports = function encodeTextCommand(program) {
  program
    .command('encode-text')
    .description('Hide a secret text message inside a carrier image.')
    .requiredOption('-c, --carrier <path>', 'Path to the carrier image')
    .requiredOption('-o, --output <path>',  'Output file path (.png)')
    .option('-t, --text <message>',         'Text to embed (inline)')
    .option('-f, --file <path>',            'Path to a text file to embed')
    .option('-p, --password <password>',    'Optional AES-256 encryption password')
    .action(async (opts) => {
      const spinner = ora('Encoding text...').start();
      try {

        let text = opts.text;
        if (!text && opts.file) {
          if (!fs.existsSync(opts.file)) {
            spinner.fail(chalk.red(`Text file not found: ${opts.file}`));
            process.exit(1);
          }
          text = fs.readFileSync(opts.file, 'utf8');
        }
        if (!text || text.trim().length === 0) {
          spinner.fail(chalk.red('Provide text via --text "message" or --file <path>'));
          process.exit(1);
        }

        if (!fs.existsSync(opts.carrier)) {
          spinner.fail(chalk.red(`Carrier file not found: ${opts.carrier}`));
          process.exit(1);
        }

        const carrierBuf = fs.readFileSync(opts.carrier);
        const payloadBytes = Buffer.byteLength(text, 'utf8');
        const cap = await engine.calculateCapacity(carrierBuf, payloadBytes);

        spinner.text = `Embedding ${payloadBytes} bytes into carrier (${cap.maxBytes.toLocaleString()} byte capacity)...`;

        const encodedBuf = await engine.encodeText(carrierBuf, text, {
          password:   opts.password || null,
          onProgress: (pct) => { spinner.text = `Encoding... ${pct}%`; },
        });

        const outDir  = path.dirname(path.resolve(opts.output));
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
        const outPath = opts.output.endsWith('.png') ? opts.output : opts.output + '.png';

        fs.writeFileSync(outPath, encodedBuf);
        spinner.succeed(chalk.green(`✓ Text embedded → ${path.resolve(outPath)}`));
        console.log(chalk.dim(`  Characters: ${text.length} | Bytes: ${payloadBytes}`));
        console.log(chalk.dim(`  Capacity used: ${cap.percentUsed}%`));
        console.log(chalk.dim(`  Encrypted: ${opts.password ? 'Yes (AES-256)' : 'No'}`));
      } catch (err) {
        spinner.fail(chalk.red(`Error: ${err.message}`));
        process.exit(1);
      }
    });
};
