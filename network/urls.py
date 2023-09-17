
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("addPost", views.addPost, name="addPost"),
    path("showPosts", views.showPosts, name="showPosts"),
    path("showPage", views.showPage, name="showPage"),
    path("pressFollow", views.pressFollow, name="pressFollow"),
    path("editPost", views.editPost, name="editPost"),
]
