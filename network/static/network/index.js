document.addEventListener('DOMContentLoaded', function() {
    showPosts('all', 1);
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
        showPosts('all', 1);
    }
}


function showPosts(filter, page) {
    if (filter == 'all') {
        document.querySelector('#middleHeading').innerHTML = '<h1>All Posts</h1>';
        
    } else if (filter == 'following') {
        document.querySelector('#middleHeading').innerHTML = '<h1>Your Followings Posts</h1>';
        
    } else {}
    fetch('/showPosts', {
        method: 'POST',
        body: JSON.stringify({
            filter: filter,
            page: page,
        })
    })
    .then(response => response.json())
    .then(result => {
        viewPost(result.posts, result.liked, result.user_posts, result.next, result.pre, page, filter, result.signed);
    })
    document.querySelector('#showPosts').innerHTML = '';
}


function viewPost(posts, liked, user_posts, next, pre, page, filter, signed) {
    if (posts.length == 0) {
        document.querySelector('#showPosts').innerHTML += "<h3>No Posts!</h3>";
    } else {
        posts.forEach((post) => {
            let html = `<div class="card" style="width: 50vw;">
                <div class="card-body">
                    <h5 class="card-title" onclick="showPage('${post.user}')">${post.user}</h5>
                    <div id="editArea${post.id}">
                        <p class="card-text" id="ptext${post.id}">${post.text}</p>
                    </div>
                    <p class="card-text">${post.date}</p>`;
            if (user_posts.includes(post.id)) {
                html += `
                <a class="card-link" onclick="editPost(${post.id})" id="editBtn${post.id}">Edit</a>
                <br>`;
            } else {}
            if (signed) {
                if (liked.includes(post.id)) {
                    html += `<i id="like${post.id}" onclick="pressLike(${post.id})" width="16" height="16" class="bi bi-heart-fill" style="color: red" viewBox="0 0 16 16"></i>
                        <p id="likesNum${post.id}" class="likes">${post.likes}</p>`;
                } else {
                    html += `<i id="like${post.id}" onclick="pressLike(${post.id})" width="16" height="16" class="bi bi-heart" viewBox="0 0 16 16"></i>
                        <p id="likesNum${post.id}" class="likes">${post.likes}</p>`;
                }
            } else {
                html += `<i id="like${post.id}" width="16" height="16" class="bi bi-heart" viewBox="0 0 16 16"></i>
                        <p id="likesNum${post.id}" class="likes">${post.likes}</p>`;
            }
            html += '</div></div>'
            document.querySelector('#showPosts').innerHTML += html;
        })
        let pg = `
            <nav>
              <ul class="pagination">`;
        if (pre) {
            pg += `<li class="page-item"><a class="page-link" onclick="showPosts('${filter}', ${page - 1})">Previous</a></li>`;
        } else {}
        if (next) {
            pg += `<li class="page-item"><a class="page-link" onclick="showPosts('${filter}', ${page + 1})">Next</a></li>`;
        } else {}
        pg += `</ul>
            </nav>`;
        document.querySelector('#showPosts').innerHTML += pg;
    }
}


function showPage(username) {
    document.querySelector('#middleHeading').innerHTML = `
    <h1>${username}</h1>`;
    fetch('/showPage', {
        method: 'POST',
        body: JSON.stringify({
            username: username,
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.signed) {
            if (result.following) {
                document.querySelector('#middleHeading').innerHTML += `<button onclick="pressFollow('${username}')" class="btn btn-primary" id="followBtn">unfollow</button>
    `;
            }
            else {
                document.querySelector('#middleHeading').innerHTML += `<button onclick="pressFollow('${username}')" class="btn btn-primary" id="followBtn">follow</button>
    `;
            }
        } else {}
    })
    showPosts(username, 1);
}


function pressFollow(username) {
    fetch('/pressFollow', {
        method: 'POST',
        body: JSON.stringify({
            username: username,
        })
    })
    .then(response => response.json())
    .then(result => {
        document.querySelector('#followBtn').innerHTML = result.button;
    })
}


function editPost(id) {
    old_text = document.querySelector(`#ptext${id}`).innerHTML;
    document.querySelector(`#editArea${id}`).innerHTML = `
    <div class="alert alert-danger" role="alert" id="editAlert${id}" style="display: none;">
    </div>
    <textarea class="form-control" id="editText${id}" name="npost" minlength="5" maxlength="400" rows="3">${old_text}</textarea>
    <button id="editBtn" class="btn btn-primary" onclick="pressEdit(${id})">Edit</button>
    `;
    document.querySelector(`#editBtn${id}`).style.display = 'none';
}


function pressEdit(id) {
    const ntext = document.querySelector(`#editText${id}`).value;
    if (ntext.length < 5 || ntext.length > 400) {
        let alert = document.querySelector(`#editAlert${id}`);
        alert.innerHTML = 'posts must be between [5 - 400] characters';
        alert.style.display = 'block';
    } else {
        fetch('/editPost', {
            method: 'POST',
            body: JSON.stringify({
                text: ntext,
                id: id,
            })
        })
        document.querySelector(`#editArea${id}`).innerHTML = `
            <div class="alert alert-danger" role="alert" id="editAlert${id}" style="display: none;">
            </div>
            <p class="card-text" id="ptext${id}">${ntext}</p>
            `;
        document.querySelector(`#editBtn${id}`).style.display = 'block';
    }
}


function pressLike(id) {
    fetch('/pressLike', {
        method: 'POST',
        body: JSON.stringify({
            id: id,
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.increase) {
            document.querySelector(`#like${id}`).className = 'bi bi-heart-fill';
            document.querySelector(`#like${id}`).style.color = 'red';
            
        } else {
            document.querySelector(`#like${id}`).className = 'bi bi-heart';
            document.querySelector(`#like${id}`).style.color = 'black';
        }
        document.querySelector(`#likesNum${id}`).innerHTML = result.likes;
    })
}