const { exec } = require("child_process");

const log = require("./base/log");
const mysql = require("./base/mysql.class");
const orm = new mysql();

const config = require("./config/index");
const serverConfig = require("./config/server.config")["server-1"];

const type = config.type === "all"? "-N" : "-i";


const runCMD = (cmd, cb) => {
	const child = exec(cmd);
	let result = "";
	child.stdout.on("data", buffer => result += buffer.toString());
	child.stdout.on("end", () => {
		cb(result);
	});
	child.stderr.on("data", err => {
		log("error", `执行cmd命令失败， ${err}`);
	});
};

const insertData = (post) => {
	let query = orm.run(post);
	query
		.then(result => log("info", `写入数据库成功, ${result}`))
		.catch(err => log("error", `写入数据库失败, ${err}`));
};

const convertData = (data) => {
	//todo: 数据格式转换
	let result = data;
	return result;
};

const ipmi = () => {
	let comm = `ipmiutil sensor ${type} ${serverConfig.ip} -U ${serverConfig.user} -P ${serverConfig.password}`;

	runCMD(comm, (data) => {
		let post = convertData(data);
		insertData(post);
	});
};



module.exports = ipmi;