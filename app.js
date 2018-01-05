const mysql = require("./base/mysql.class");
const { exec } = require("child_process");

const config = require("./config/index");
const serverConfig = require("./config/server.config")["server-1"];

const type = config.type === "all"? "-N" : "-i";
const orm = new mysql();

//const interval = setInterval(getData, config.frequency);

function getData () {
	clearInterval(interval);
	let comm = `ipmiutil sensor ${type} ${serverConfig.ip} -U ${serverConfig.user} -P ${serverConfig.password}`;

	const interval = setInterval(runCMD(comm, (data) => {
		console.log(data);
	}), serverConfig.frequency);
}

function runCMD (cmd, cb) {
	const child = exec(cmd);
	let result = "";
	child.stdout.on("data", buffer => result += buffer.toString());
	child.stdout.on("end", () => cb(result));
	child.stderr.on("data", err => console.error(err));
}

