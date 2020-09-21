
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from datetime import datetime
from django.utils import timezone
import json
from ditook.settings import USERNAME_LENGTH, MEDIA_ROOT

class Notifications(models.Model):
	user = models.ForeignKey(User, related_name='notifications', on_delete=models.CASCADE)
	avatar_url = models.CharField(max_length=255, default='/static/media/Images/userNavDp.png')
	message = models.CharField(default="", max_length=255)
	target = models.PositiveIntegerField(null=True, blank=True) 
	comment_id = models.PositiveIntegerField(null=True, blank=True) 
	viewed = models.BooleanField(default=False)

class Quotations(models.Model):	
	quote = models.TextField(default="", max_length=255)
	author = models.CharField(default="", max_length=100)

class Article(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE)
	body = models.TextField()
	date = models.DateTimeField(default=timezone.now)
	likes = models.PositiveIntegerField(default=0)
	title = models.TextField(max_length=254)
	shares = models.PositiveIntegerField(default=0)
	category = models.TextField(default="Others", max_length=254)
	last_edit = models.DateTimeField(null=True) 		

class Comment(models.Model):	
	article = models.ForeignKey(Article, on_delete=models.CASCADE)
	user = models.ForeignKey(User, on_delete=models.CASCADE)	
	text = models.TextField(max_length=1500)
	date = models.DateTimeField(default=timezone.now)
	last_edit = models.DateTimeField(null=True)
	likes = models.PositiveIntegerField(default=0)
	parent = models.PositiveIntegerField(blank=True, null=True)	

class Categories(models.Model):
	category = models.CharField(max_length=150)	
	total = models.PositiveIntegerField(default=0)

class Media(models.Model):
	article = models.ForeignKey(Article, on_delete=models.CASCADE)
	image = models.ImageField(upload_to='static/media/Images/upload/article_img')		

	@property
	def img_url(self):
		if self.image and hasattr(self.image, 'url'):
			return self.image.url

class LikedArticle(models.Model):
	user = models.CharField(max_length=USERNAME_LENGTH, blank=True)	
	article = models.ForeignKey(Article, on_delete=models.CASCADE)
			
class LikedComment(models.Model):	
	user = models.CharField(max_length=USERNAME_LENGTH, blank=True)
	comment = models.ForeignKey(Comment, default='', on_delete=models.CASCADE)						