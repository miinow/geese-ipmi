const log4js = require("log4js");
const logConfig = require("../config/log.config");

log4js.configure(logConfig);

let logger = log4js.getLogger("mio");

const log = (level, info) => {
	logger[level](info);
};

export default log;

