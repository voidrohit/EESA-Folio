const edit = document.getElementById('aboutText')
const skills = document.getElementById('skills')
const post = document.getElementById('post')

var a = 1;

function show()  {

    if( a == 1) {
        edit.style.display = "block";
        a = 0;
    } else {
        edit.style.display = "none";
        a = 1;
    }
}
var b = 1
function showskill()  {

    if( b == 1) {
        skills.style.display = "block";
        b = 0;
    } else {
        skills.style.display = "none";
        b = 1;
    }
}
var c=1

function showPost() {
    if( c == 1) {
        post.style.display = "block";
        c = 0;
    } else {
        post.style.display = "none";
        c = 1;
    }
}

