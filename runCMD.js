/* eslint-disable no-console */
const { exec } = require("child_process");

const log = require("./base/log");
const mysql = require("./base/mysql.class");
const orm = new mysql();

const config = require("./config/index");
const serverConfig = require("./config/server.config")["server-1"];

const type = config.type === "all"? "-N" : "-i";
const interval = setInterval(insertData, config.frequency);

const runCMD = (cmd, cb) => {
	const child = exec(cmd);
	let result = "";
	child.stdout.on("data", buffer => result += buffer.toString());
	child.stdout.on("end", () => {
		cb(result);
	});
	child.stderr.on("data", err => {
		log("error", `执行ipmi命令失败， ${err}`);
	});
};

const insertData = () => {
	clearInterval(interval);
	let comm = `ipmiutil sensor ${type} ${serverConfig.ip} -U ${serverConfig.user} -P ${serverConfig.password}`;

	runCMD(comm, (data) => {
		console.log(data);
	});
};

export default insertData;