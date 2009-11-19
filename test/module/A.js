log('A execute');
gl.module(
	'a',
	[ 'sub/D.js', 'sub/E.js' ],
	function(oModule) {
		if (oModule.getURI().indexOf('A.js') != -1)
			log('A module OK');
		else
			log('A module ERROR');
	}
);
