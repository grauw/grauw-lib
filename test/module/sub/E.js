log('E execute: ' + getCurrentScriptName());
gl.module(
	'e',
	[ 'F.js' ],
	function(oModule) {
		if (oModule.getURI().indexOf('sub/E.js') != -1)
			log('E module OK');
		else {
			log('E module ERROR');
			log(oModule.getURI());
			log(document.getElementsByTagName('head')[0].innerHTML);
		}
	}
);
