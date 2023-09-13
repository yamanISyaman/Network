from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField("self", related_name="follower")
    def __str__(self):
        return f"{self.user}"


class Post(models.Model):
    text = models.CharField(max_length=400)
    date = models.DateTimeField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="post")
    like = models.ManyToManyField(User, related_name="liked")
    
    def __str__(self):
        return f"{self.user} posted: {self.text[0:10]}..."


class Comment(models.Model):
    text = models.CharField(max_length=200)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comment")
    comment = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comment")

    def __str__(self):
        return f"{self.user} commented: {self.text[0:10]}..."