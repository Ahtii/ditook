
from allauth.account.adapter import DefaultAccountAdapter
from django.contrib.auth.models import User

class CustomAdapter(DefaultAccountAdapter):	
	def is_open_for_signup(self, request):
		return False