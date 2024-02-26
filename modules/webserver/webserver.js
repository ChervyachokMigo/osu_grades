const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const path = require('path');


const index_js = require('./templates/index.js');
const config = require('./config.js');

const public_path = path.join(__dirname, 'public');

module.exports = {
	init: async () => { 
		// eslint-disable-next-line no-unused-vars
		return new Promise(( res, rej ) => {
			const GRADES_HTTP_PORT = config.get_value( 'GRADES_HTTP_PORT' );
			const app = express();
			
			app.on( 'error', (e) => {
				if ( e.code === 'EADDRINUSE' ) {
					console.error( 'Address in use, retrying...' );
				}
			});

			app.use( cors() );
			app.use( bodyParser.json() );
			app.use( bodyParser.urlencoded({ extended: false }));
			app.use( express.static( public_path ));
			
			app.get( '/', async (req, res) => res.send( 
				index_js()
			));
			
			
			res( app.listen( GRADES_HTTP_PORT ));
		});
	},



};