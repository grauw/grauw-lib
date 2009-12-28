execute('F');
gl.module(
	'module_f',
	[],
	function(oModule) {
		if (oModule.getURI().indexOf('sub/F.js') == -1)
			log('F module ERROR - Wrong URI: ' + oModule.getURI());
		else
			log('F module OK');
	}
);
