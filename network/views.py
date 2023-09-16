import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required

from .models import User, Post, Comment


def index(request):
        return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })
        elif username in ["all", "following"]:
            return render(request, "network/register.html", {
                "message": "Reserved username, try another."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


@csrf_exempt
@login_required
def addPost(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    data = json.loads(request.body)
    new_post = Post(
        user=request.user,
        text=data["postText"],
    )
    new_post.save()
    return JsonResponse({"message": "Post Added Successfully."}, status=201)


@csrf_exempt
def showPosts(request):
    data = json.loads(request.body)
    filter = data["filter"]
    posts = None

    if filter == "all":
        posts = Post.objects.all()
    elif filter == "following":
        followings = request.user.following.all()
        posts = []
        for f in followings:
            posts += [*(f.post.all())]
    else:
        try:
            user = User.objects.get(username=filter)
        except IntegrityError:
            return HttpResponse('Error 404')
        posts = user.post.all()

    rposts = [post.serialize() for post in posts]
    if request.user.is_authenticated:
        liked_posts = request.user.liked.all()
        user_posts = Post.objects.filter(user=request.user)
        if len(liked_posts) == 0:
            rliked_posts = []
        else:
            rliked_posts = [post.id for post in liked_posts]
        if len(user_posts) == 0:
            ruser_posts = []
        else:
            ruser_posts = [post.id for post in user_posts]
            
    else:
        rliked_posts = []
        ruser_posts = []
    return JsonResponse({
        "posts": sorted(rposts, key=lambda _: _['date']),
        "liked": rliked_posts,
        "user_posts": ruser_posts,
    }, status=201)