const child_process = require('child_process');


const webserver = require('./webserver.js');
const { init_socket_server } = require('./socket_server.js');
const config = require('./config.js');

const _this = module.exports =  {
	init: async () => { 
		try{
			_this.SOCKET_SERVER = init_socket_server(_this.webconfig);
			_this.WEB_SERVER = await webserver.init();
		} catch(e){
			console.error(e);
		}
	},

	stop: async () => {
		if (_this.SOCKET_SERVER)
			await _this.SOCKET_SERVER.close();
		if (_this.WEB_SERVER)
			await _this.WEB_SERVER.close();
	},

	open_webpage: async () => {
		const GRADES_HTTP_PORT = config.get_value( 'GRADES_HTTP_PORT' );
		child_process.execSync(`start http://localhost:${GRADES_HTTP_PORT}`);
	}
};

