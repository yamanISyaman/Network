import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator

from .models import User, Post


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
    page = data["page"]
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

    nposts = [post.serialize() for post in posts]
    rposts = sorted(nposts, key=lambda _: _['id'], reverse=True)
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

    p = Paginator(rposts, 2)
    try:
        p = p.page(page)
    except EmptyPage:
        return HttpResponse('Error 404')
        
    return JsonResponse({
        "next": p.has_next(),
        "pre": p.has_previous(),
        "posts": p.object_list,
        "liked": rliked_posts,
        "user_posts": ruser_posts,
    }, status=201)


@csrf_exempt
def showPage(request):
    data = json.loads(request.body)
    username = data.get('username')
    user = User.objects.get(username=username)
    response = {}
    if request.user.is_authenticated and user != request.user:
        response["signed"] = True
        if user in request.user.following.all():
            response["following"] = True
        else:
            response["following"] = False
    else:
        response["signed"] = False
    return JsonResponse(response, status=201)


@login_required
@csrf_exempt
def pressFollow(request):
    data = json.loads(request.body)
    username = data.get("username")
    user = User.objects.get(username=username)
    followings = request.user.following.all()
    result = {}
    if user in followings:
        request.user.following.remove(user)
        result["button"] = "follow"
    else:
        request.user.following.add(user)
        result["button"] = "unfollow"

    return JsonResponse(result, status=201)


@csrf_exempt
@login_required
def editPost(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    data = json.loads(request.body)
    post = Post.objects.get(id=data["id"])
    if post.user != request.user:
        return HttpResponse('Invalid Request')
    post.text = data["text"]
    post.save()
    return JsonResponse({"message": "Post Edited Successfully."}, status=201)