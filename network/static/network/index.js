document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#postform').addEventListener('click', addMargin);
});


function addMargin() {

    let postform = document.querySelector('#postform');
    if (postform.style.marginBottom == '' || postform.style.marginBottom == '0vh') {
        postform.style.marginBottom = '15vh';
    } else {postform.style.marginBottom = '0vh';}
}