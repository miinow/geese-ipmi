const { exec } = require("child_process");

const log = require("./base/log");
const mysql = require("./base/mysql.class");
const orm = new mysql();

const utils = require("./utils");

const config = require("./config/index");
const servers = require("./config/server.config");

const type = config.type === "all"? "-N" : "-i";
const sensType = config.sensType;

const runCMD = (cmd) => {
	const child = exec(cmd);
	let result = "";

	return new Promise((resolve, reject) => {
		child.stdout.on("data", buffer => result += buffer.toString());
		child.stdout.on("end", () => {
			resolve(result);
		});
		child.stderr.on("data", err => {
			reject(err);
		});
	});
};

const insertData = (post) => {
	let query = orm.run(post);
	query
		.then(result => log("info", `写入数据库成功, ${result}`))
		.catch(err => log("error", `写入数据库失败, ${err}`));
};

const convertData = (data) => {
	let result = {},
		dataArr = data.split("\n");

	dataArr.forEach((val) => {
		sensType.forEach((sens) => {
			if ( val.indexOf(sens) > 0 ) {
				sens = sens.replace(/\s/g, "");
				let item = val.split("=")[1];
				let itemArr = utils.deleteNull(item.replace(/\r/, "").split(" "));

				if ( sens !== "PowerOnHours" ) {
					result[`${sens}_status`] = itemArr[1];

					if ( itemArr[2] ) {
						result[`${sens}_value`] = itemArr[2];
					}
				} else {
					result[`${sens}_value`] = itemArr[0];
				}

			}
		});

		if ( val.indexOf("Connecting to") > -1 ) {

			let itemArr = utils.deleteNull(val.split(" "));
			result.ip = itemArr[3];
		}

	});

	result.time = utils.moment(Date.now());

	return result;
};

const ipmi = () => {

	for ( let server in servers ) {

		if ( servers.hasOwnProperty(server) ) {

			let serverConfig = servers[server];
			let comm = `ipmiutil sensor ${type} ${serverConfig.ip} -U ${serverConfig.user} -P ${serverConfig.password}`;

			runCMD(comm)
				.then(data => {
					let post = convertData(data);
					insertData(post);
				})
				.catch(err => log("error", `执行cmd命令失败， ${err}`));

		}
	}

};

module.exports = ipmi;