
'use strict';

const fs    = require('fs');
const path  = require('path');
const chalk = require('chalk');
const ora   = require('ora');
const engine = require('../../backend/steganography/engine');

module.exports = function decodeTextCommand(program) {
  program
    .command('decode-text')
    .description('Extract a hidden text message from an encoded carrier image.')
    .requiredOption('-i, --input <path>',    'Path to the encoded image')
    .option('-o, --output <path>',           'Save extracted text to a file instead of stdout')
    .option('-p, --password <password>',     'Decryption password (if payload was encrypted)')
    .action(async (opts) => {
      const spinner = ora('Decoding text...').start();
      try {
        if (!fs.existsSync(opts.input)) {
          spinner.fail(chalk.red(`Input file not found: ${opts.input}`));
          process.exit(1);
        }

        const inputBuf = fs.readFileSync(opts.input);
        const text     = await engine.decodeText(inputBuf, { password: opts.password || null });

        spinner.stop();

        if (opts.output) {
          const outDir = path.dirname(path.resolve(opts.output));
          if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
          fs.writeFileSync(opts.output, text, 'utf8');
          console.log(chalk.green(`✓ Extracted text saved to: ${path.resolve(opts.output)}`));
        } else {
          console.log(chalk.cyan('\n── Extracted Text ──────────────────────────────'));
          console.log(text);
          console.log(chalk.cyan('────────────────────────────────────────────────\n'));
        }

        console.log(chalk.dim(`  Characters: ${text.length}`));
        console.log(chalk.dim(`  Decrypted:  ${opts.password ? 'Yes (AES-256)' : 'No'}`));
      } catch (err) {
        spinner.fail(chalk.red(`Error: ${err.message}`));
        process.exit(1);
      }
    });
};
