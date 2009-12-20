log('A execute: ' + getCurrentScriptName());
gl.module(
	'module_a',
	[ 'sub/D.js', 'sub/E.js' ],
	function(oModule) {
		if (oModule.getURI().indexOf('A.js') == -1)
			log('A module ERROR - Wrong URI: ' + oModule.getURI());
		else if (!window.module_d)
			log('A module ERROR - module_d object not found');
		else if (!window.module_e)
			log('A module ERROR - module_e object not found');
		else
			log('A module OK');
		console.trace();
	}
);
