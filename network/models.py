from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField("self", related_name="follower", symmetrical=False)
    def __str__(self):
        return f"{self.username}"


class Post(models.Model):
    text = models.CharField(max_length=400)
    date = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="post")
    like = models.ManyToManyField(User, related_name="liked")

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "text": self.text,
            "date": self.date.strftime("%b %d %Y, %I:%M %p"),
            "likes": len(self.like.all()),
            "comments": len(self.comment.all())
        }
    
    def __str__(self):
        return f"{self.user.username} posted: {self.text[0:10]}..."


class Comment(models.Model):
    text = models.CharField(max_length=200)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comment")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comment")
    date = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "post": self.post.id,
            "text": self.text,
            "date": self.date.strftime("%b %d %Y, %I:%M %p"),
        }

    def __str__(self):
        return f"{self.user} commented: {self.text[0:10]}..."