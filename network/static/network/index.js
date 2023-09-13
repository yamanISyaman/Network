document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#menuFormBtn').addEventListener('click', addMargin);
    document.querySelector('#postBtn').addEventListener('click', addPost);
});


function addMargin() {

    let postform = document.querySelector('#postFormDiv');
    
    if (postform.style.marginBottom == '' || postform.style.marginBottom == '0vh') {
        postform.style.marginBottom = '15vh';
    } else {
        postform.style.marginBottom = '0vh';
        document.querySelector('#postAlert').style.display = 'none';
    }
}


function addPost() {
    const text = document.querySelector('#postText').value;
    if (text.length < 5 || text.length > 400) {
        let alert = document.querySelector('#postAlert');
        alert.innerHTML = 'posts must be between [5 - 400] characters';
        alert.style.display = 'block';
    } else {
        fetch('/addPost', {
            method: 'POST',
            body: JSON.stringify({
                postText: text,
            })
        })
        .then(response => response.json())
        .then(result => {
            console.log(result);
        })
        document.querySelector('#menuFormBtn').click();
    }
}