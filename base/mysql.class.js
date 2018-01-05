const mysql = require("mysql");
const sqlConfig = require("../config/mysql.config");

const config = require("../config/index");

const env = process.NODE_env || config.env || "dev";

module.exports = class {
	constructor () {
		this._init();
	}

	_init () {
		this._create();
	}

	_create () {
		this._pool = mysql.createPool(sqlConfig[env]);
	}

	_execQuery (post, sql,  cb) {
		this._pool.getConnection((err, connect) => {
			if ( err ) {
				// todo：写log
				cb(err);
			} else {
				connect.query(sql, post, (err, rows)=>{
					this._release(connect)
					if(err){
						//todo log
						cb(err)
					} else {
						cb(null, rows)
					}

				});
			}
		})


	}

	_release(connect){
		try{
			connect.release((err) => {
				if(err){
					console.log("DB-关闭数据库连接异常！");
				}
			});
		} catch(err) {

			throw err;
		}
	}

	run (post, sql) {

		const db = sqlConfig[env].database;
		const table = config.table;


		if(sql === null){
			sql = `INSERT INTO ${db}.${table} SET ？`
		}
		return new Promise((resolve, reject) => {
			this._execQuery(post, sql, (err, data) => {
				if ( err ) {
					reject(err);
				} else {
					resolve(data);
				}
			});
		});
	}
};