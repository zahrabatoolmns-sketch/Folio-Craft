// config/logger.js

const c = {
  reset:  '\x1b[0m',
  bright: '\x1b[1m',
  dim:    '\x1b[2m',

  black:  '\x1b[30m',
  red:    '\x1b[31m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  blue:   '\x1b[34m',
  magenta:'\x1b[35m',
  cyan:   '\x1b[36m',
  white:  '\x1b[37m',

  bgRed:    '\x1b[41m',
  bgGreen:  '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue:   '\x1b[44m',
  bgCyan:   '\x1b[46m',
};

function timestamp() {
  return new Date().toLocaleTimeString('en-US', { hour12: false });
}

const logger = {

  info(msg) {
    console.log(`${c.cyan}${c.bright}[INFO]${c.reset}  ${c.dim}${timestamp()}${c.reset}  ${c.white}${msg}${c.reset}`);
  },

  success(msg) {
    console.log(`${c.green}${c.bright}[OK]${c.reset}    ${c.dim}${timestamp()}${c.reset}  ${c.green}${msg}${c.reset}`);
  },

  error(msg, err = '') {
    console.error(`${c.red}${c.bright}[ERR]${c.reset}   ${c.dim}${timestamp()}${c.reset}  ${c.red}${msg}${c.reset}`, err ? `\n       ${c.dim}${err}${c.reset}` : '');
  },

  warn(msg) {
    console.warn(`${c.yellow}${c.bright}[WARN]${c.reset}  ${c.dim}${timestamp()}${c.reset}  ${c.yellow}${msg}${c.reset}`);
  },

  db(msg) {
    console.log(`${c.magenta}${c.bright}[DB]${c.reset}    ${c.dim}${timestamp()}${c.reset}  ${c.magenta}${msg}${c.reset}`);
  },

  auth(msg) {
    console.log(`${c.blue}${c.bright}[AUTH]${c.reset}  ${c.dim}${timestamp()}${c.reset}  ${c.blue}${msg}${c.reset}`);
  },

  request(method, path, status) {
    const statusColor = status >= 500 ? c.red : status >= 400 ? c.yellow : c.green;
    console.log(`${c.cyan}[REQ]${c.reset}   ${c.dim}${timestamp()}${c.reset}  ${c.bright}${method.padEnd(6)}${c.reset}${statusColor}${status}${c.reset}  ${c.dim}${path}${c.reset}`);
  },

  banner() {
    console.log(`
${c.cyan}${c.bright}  ╔═══════════════════════════════════════╗
  ║         FolioCraft Backend            ║
  ║         Final Year Project            ║
  ╚═══════════════════════════════════════╝${c.reset}
`);
  },

};

module.exports = logger;