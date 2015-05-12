var Student = {
	'students' : [ {
	    'name'  : 'Rachel Margulies  &ensp;',
	    'netID' : 'rachelbm',
	},
	{
	    'name'  : 'Sonia Skoularikis &ensp;',
	    'netID' : 'sskoular',
	},
	{
	    'name'  : 'Thomas Greenspan',
	    'netID' : 'tgreensp',
	}],
};

Student.updateHTML = function( ) {
	for (var i = 0; i < 3; i++) {
		var studentInfo = this.students[i].name + ' &lt;' + this.students[i].netID + '&gt;';
		if (i < 2) studentInfo += '<br>'
		document.getElementById('student').innerHTML += studentInfo;
	}
}
