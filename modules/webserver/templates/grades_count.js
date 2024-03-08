
const config = require('../config');

module.exports =  () => {
	const GRADES_SOCKET_PORT = config.get_value( 'GRADES_SOCKET_PORT');

	return GRADES_SOCKET_PORT && GRADES_SOCKET_PORT > 0 ?
		`<!DOCTYPE html>
		<html lang="ru">
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Grades Count</title>
			<link rel="stylesheet" href="styles.css">
			<script src="jquery-3.7.1.min.js"></script>
			<script src="scripts_init.js" script_type="grades"></script>
		</head>
		<body>
			<div class="SOCKET_PORT" id="SOCKET_PORT" style="display: none;">${ GRADES_SOCKET_PORT }</div>
			<div class="content">
				
			</div>
		</body>
	</html>` : 'Error: Socket port is not defined in config';
};