execute('C');
gl.module(
	'module_c',
	[],
	function(oModule) {
		if (oModule.getURI().indexOf('C.js') == -1)
			log('C module ERROR - Wrong URI: ' + oModule.getURI());
		else
			log('C module OK');
	}
);
