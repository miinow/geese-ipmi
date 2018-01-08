const ipmi = require("./runCMD");
const config = require("./config/index");

setInterval( ipmi, config.frequency);

