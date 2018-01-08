const moment = require("moment");

module.exports = {
	moment (date, format = "YYYY-MM-DD HH:mm:ss") {
		return moment(date).format(format);
	},
	deleteNull (arr) {
		return arr.filter(item => !!item);
	}
};