// @include 'include/stdlib.js'


main();

function main(){

	try {
		var docRef = activeDocument;
	} catch(e) {
		alert("Document should be opened");
		return;
	}

	var file;
	var docFilePath = docRef.path;

	if ( Folder.fs == "Windows" ) {
		file = File.openDialog( "Open CSV Data", "Text files: *.txt, CSV Files:*.csv" );
	}
	else if ( Folder.fs == "Macintosh" ) {
		file = File.openDialog( "Open CSV Data", fileFilter );
		file = new File( file.fsName );
	}

	data = Stdlib.readTSVFile(file);

	headers = this.data.shift();

	docRef.dataSets.removeAll();

	for ( var i = 0; i < data.length; i++ ) {

		var row = data[i];
		var ds = docRef.dataSets.add();
		ds.name = row[0];

		for ( var j = 0; j < headers.length; j++ ) {

			var header = headers[j];
			var value = row[j];
			if (value == undefined) value = "";
			var valueBoolean = parseInt(value) ? true : false;

			var variable = undefined;

			try {
				variable = docRef.variables.getByName(header);
			} catch(e){}

			if (variable) {
				for ( var p = 0; p < variable.pageItems.length; p++ ){
					artItem = variable.pageItems[p];
					switch ( artItem.typename ) {
						case "PlacedItem":
							var file = new File(docFilePath + "/" + value);
							artItem.file = file;
							break;
						case "RasterItem":
							if ( ! artItem.embedded ) {
								var file = new File(docFilePath + "/" + value);
								artItem.file = file;
							}
							break;
						case "TextFrame":
							artItem.contents = value;
							break;
					}
				}

				// Debug
				// alert("Row:" + i + ", " + header+" Visible:"+header.indexOf('_Visible')+" Invisible:" + header.indexOf('_Invisible') + " Value: " + value + " BValue: " + valueBoolean );

				// Explicitly indicated visibility variable
				if (header.indexOf('_Visible') > 0) {
					for ( var p = 0; p < variable.pageItems.length; p++ ){
						variable.pageItems[p].hidden = valueBoolean ? false : true;
					}
				}

				// Explicitly indicated Invisibility variable
				if (header.indexOf('_Invisible') > 0) {
					for ( var p = 0; p < variable.pageItems.length; p++ ){
						variable.pageItems[p].hidden = valueBoolean ? true : false;
					}
				}

			}

			// Name a variable ColumnName_Visible to hide it if ColumnName content exists
			try {
				var visVar =  docRef.variables.getByName(header + '_Visible');
				for ( var p = 0; p < visVar.pageItems.length; p++ ){
					visVar.pageItems[p].hidden = valueBoolean ? false : true;
				}
			} catch(e) {}

			// Name a variable ColumnName_Invisible to hide it if ColumnName content exists
			try {
				var visVar =  docRef.variables.getByName(header + '_Invisible');
				for ( var p = 0; p < visVar.pageItems.length; p++ ){
					visVar.pageItems[p].hidden = valueBoolean ? true : false;
				}
			} catch(e){}

		}

		ds.update();
		redraw();
	}


	function fileFilter( f )
	{
		var Extension = ".csv";
		var lCaseName = f.name;
		lCaseName.toLowerCase();
		if ( lCaseName.indexOf( Extension ) == (f.name.length - Extension.length) ) return true;
		else if ( f.type == "TEXT" ) return true;
		else if ( f instanceof Folder ) return true;
		else return false;
	}


};

