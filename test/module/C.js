log('C execute');
gl.module(
	'c',
	[],
	function(oModule) {
		if (oModule.getURI().indexOf('C.js') != -1)
			log('C module OK');
		else
			log('C module ERROR');
	}
);
