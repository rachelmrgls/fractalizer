var Student = {
    // please fill in your name and NetID
    // your NetID is the part of your email before @princeton.edu
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
    'name'  : 'The Winners',
    'netID' : 'pinner',
=======
>>>>>>> Stashed changes
    'name'  : 'The Winnerz',
    'netID' : 'winner',
>>>>>>> origin/master
};

Student.updateHTML = function( ) {
    var studentInfo = this.name + ' &lt;' + this.netID + '&gt;';
    document.getElementById('student').innerHTML = studentInfo;
}
