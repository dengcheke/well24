//"prepare": "rimraf .husky && node ./script/prepare.js",
const husky = require('husky');
const path = require('path');
const huskyRoot = path.join(__dirname, '../.husky');

husky.install(huskyRoot);
husky.add(path.join(huskyRoot, './prepare-commit-msg'), "exec < /dev/tty && git cz --hook || true");
//husky.add(path.join(huskyRoot, './commit-msg'), `npx --no-install commitlint --edit "$1"`)
