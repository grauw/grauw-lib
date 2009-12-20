log('E execute: ' + getCurrentScriptName());
gl.module(
	'module_e',
	[ 'F.js' ],
	function(oModule) {
		if (oModule.getURI().indexOf('sub/E.js') == -1)
			log('E module ERROR - Wrong URI: ' + oModule.getURI());
		else if (!window.module_f)
			log('A module ERROR - module_f object not found');
		else
			log('E module OK');
	}
);
