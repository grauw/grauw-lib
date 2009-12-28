execute('E');
gl.module(
	'module_e',
	[ 'D.js', 'F.js' ],
	function(oModule) {
		if (oModule.getURI().indexOf('sub/E.js') == -1)
			log('E module ERROR - Wrong URI: ' + oModule.getURI());
		else if (!window.module_d)
			log('E module ERROR - module_d object not found');
		else if (!window.module_f)
			log('E module ERROR - module_f object not found');
		else
			log('E module OK');
	}
);
