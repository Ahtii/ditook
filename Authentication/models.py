
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.conf import settings
from ditook.settings import USERNAME_LENGTH, MEDIA_ROOT
from django.http import HttpRequest
import pytz
import os
import shutil

def directory_path(instance, filename):
	return 'user_{0}/{1}'.format(instance.user.id, filename)

class Profile(models.Model):
	user = models.OneToOneField(User, related_name='profile', on_delete=models.CASCADE)		
	bio = models.TextField(max_length=500, blank=True)
	provider = models.CharField(max_length=256, default='ditook')
	firstTimeLogin = models.BooleanField(default=True)
	timezone = models.CharField(max_length=50, default='Asia/Kolkata')
	online = models.BooleanField(default=False)	
	avatar = models.ImageField(
		null=True, 
		blank=True, 
		max_length=255,
		upload_to=directory_path,#settings.MEDIA_ROOT,
		editable=True,
		help_text="Profile Picture"
	)	

	@property
	def avatar_url(self):
		if self.avatar and hasattr(self.avatar, 'url'):
			return self.avatar.url				

	def save(self, *args, **kwargs):		
		try:
			this = Profile.objects.get(id=self.id) # delet previous file.
			if this.avatar:
				os.remove(this.avatar.path)
		except:
			pass
		super(Profile, self).save(*args, **kwargs)			

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
	if created:
		Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
	instance.profile.save()	

@receiver(post_delete, sender=Profile)
def del_user_pic(sender, instance, **kwargs):	
	if instance.avatar:
		file = instance.avatar.path
		if os.path.isfile(file):
			delmtr = '/'
			if os.name == 'nt':
				delmtr = "\\"	
			file_prnt = file.rsplit(delmtr, 1)[0]
			if file_prnt[-6:] != 'usr_im':
				shutil.rmtree(file_prnt)

class Fan(models.Model):
	fan = models.ForeignKey(User, on_delete=models.CASCADE)	
	fans = models.CharField(max_length=USERNAME_LENGTH, default='')	

class ProfileViews(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE)			
	viewed_by = models.CharField(max_length=USERNAME_LENGTH, default='')

		