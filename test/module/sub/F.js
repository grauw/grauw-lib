log('F execute: ' + getCurrentScriptName());
gl.module(
	'f',
	[],
	function(oModule) {
		if (oModule.getURI().indexOf('sub/F.js') != -1)
			log('F module OK');
		else {
			log('F module ERROR');
			log(oModule.getURI());
		}
	}
);
