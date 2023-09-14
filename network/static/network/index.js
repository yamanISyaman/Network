document.addEventListener('DOMContentLoaded', function() {
    showPosts('all');
});


function addMargin() {

    let postform = document.querySelector('#postFormDiv');
    
    if (postform.style.marginBottom == '' || postform.style.marginBottom == '0vh') {
        postform.style.marginBottom = '15vh';
    } else {
        postform.style.marginBottom = '0vh';
        document.querySelector('#postAlert').style.display = 'none';
        document.querySelector('#postText').value = '';
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
        document.querySelector('#menuFormBtn').click();
        showPosts('all');
    }
}


function showPosts(filter) {
    if (filter == 'all') {
        document.querySelector('#heading').innerHTML = 'All Posts';
        
    } else if (filter == 'following') {
        document.querySelector('#heading').innerHTML = 'Followings Posts';
        
    } else {}
    fetch('/showPosts', {
        method: 'POST',
        body: JSON.stringify({
            filter: filter,
        })
    })
    .then(response => response.json())
    .then(result => {
        viewPost(result.posts, result.liked, result.user_posts);
    })
    document.querySelector('#showPosts').innerHTML = '';
}


function viewPost(posts, liked, user_posts) {
    posts.forEach((post) => {
        html = `<div class="card" style="width: 50vw;">
            <div class="card-body">
                <h5 class="card-title" onclick="showPage(${post.user})">${post.user}</h5>
                <p class="card-text">${post.text}</p>`;
        if (user_posts.includes(post.id)) {
            html += `
                <a class="card-link" onclick="editPost(${post.id})">Edit</a>
            <br>`;
        } else {}
        html += `<a id="like${post.id}" onclick="pressLike(${post.id}, ${post.user})" class="card-link">Likes</a> ${post.likes}
                <a class="card-link" onclick="pressComment(${post.id}, ${post.user})">Comment</a>
                ${post.comments}
            </div>
        </div>`;
        document.querySelector('#showPosts').innerHTML += html;
    })
}


function editPost(id) {
    console.log('To Do');
}


function showPage(username) {
    console.log('To Do');
}


function pressComment(id, username) {
    console.log('To Do');
}


function pressLike(id, username) {
    console.log('To Do');
}