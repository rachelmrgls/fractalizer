var Student = {
    'name'  : 'The Winners',
    'netID' : 'pinner',

Student.updateHTML = function( ) {
    var studentInfo = this.name + ' &lt;' + this.netID + '&gt;';
    document.getElementById('student').innerHTML = studentInfo;
}
