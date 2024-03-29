
const { select_mysql_model } = require('./defines.js');

function updateAll(Model, condition, values ){
	return Model.update(
		values, {
			where: condition
		});
}

module.exports = {
	MYSQL_GET_ONE: async (action, condition) => {
		const MysqlModel = select_mysql_model(action);

		try {
			return await MysqlModel.findOne({ 
				where: condition,
				raw: true
			});
		} catch (e){
			if (e.code === 'ECONNREFUSED' || e.name === 'SequelizeConnectionRefusedError'){
				throw new Error('Нет доступа к базе данных.');
			} else {
				console.error( 'action', action, 'params', condition );
				throw new Error(e);
			}
		}
	},

    
	MYSQL_GET_ALL: async (action, params, attributes = undefined) => {
		const MysqlModel = select_mysql_model(action);
		try{
			return await MysqlModel.findAll ({ 
				where: params? params : {},
				raw: true, 
				attributes 
			});//order: [['id', 'DESC']] 
		} catch (e){
			if (e.code === 'ECONNREFUSED' || e.name === 'SequelizeConnectionRefusedError'){
				throw new Error('Нет доступа к базе данных.');
			} else {
				console.error( 'action', action, 'params', params, 'attributes', attributes );
				throw new Error(e);
			}
		}    
	},

	MYSQL_UPDATE: async (action, condition, values) => {
		const MysqlModel = select_mysql_model(action);
		try{
			return await updateAll( MysqlModel, condition, values );
		} catch (e){
			if (e.code === 'ECONNREFUSED' || e.name === 'SequelizeConnectionRefusedError'){
				throw new Error('Нет доступа к базе данных.');
			} else {
				console.error( 'action', action, 'condition', condition, 'values', values );
				throw new Error(e);
			}
		}    
	},

	MYSQL_DELETE: async (action, condition) => {
		const MysqlModel = select_mysql_model(action);
		try{
			return await MysqlModel.destroy({
				where: condition, 
			});
		} catch (e){
			if (e.code === 'ECONNREFUSED' || e.name === 'SequelizeConnectionRefusedError'){
				throw new Error('Нет доступа к базе данных.');
			} else {
				console.error('can not delete', action, condition);
			}
		}   
	},

	MYSQL_SAVE: async ( action, keys, values ) => {
		const MysqlModel = select_mysql_model(action);
        
		if ( keys && Object.keys(keys).length > 0 ){
			values = {...values, ...keys};
		}

		try {
			if (typeof values.length !== 'undefined' && values.length > 0){
				return await MysqlModel.bulkCreate( values, { ignoreDuplicates: true });
			} else {
				return (await MysqlModel.upsert( values, { where: keys, raw: true }))
					.shift();
			}
		} catch (e){
			if (e.code === 'ECONNREFUSED' || e.name === 'SequelizeConnectionRefusedError'){
				throw new Error('Нет доступа к базе данных.');
			} else {
				console.error( 'action', action, 'keys', keys, 'values', values );
				throw new Error(e);
			}
		}       
	},

};