console.log( [1,2,3,4,5,6].slice(3, 6));

		/*const proxy_list = JSON.parse( readFileSync( 'Free_Proxy_List.json', { encoding: 'utf8' }))
			.filter( x => 
				x.protocols.includes('http'))
			.map( ({ ip, port, protocols }) => 
				({ host: ip, port: Number(port), protocol: protocols.shift() }))
			.sort( (a, b) => 
				a.responseTime - b.responseTime );
		
		console.log( 'proxy_list', proxy_list.length );*/