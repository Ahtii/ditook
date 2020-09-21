
import json
import urllib
import hashlib
import uuid
from Authentication import config
import pyotp
from datetime import datetime
from ditook.views import is_connected, index
from django import http
from .models import Profile
from articles.models import Article
from django.views import View
from django.conf import settings
from django.dispatch import receiver
from django.core.files import File
from .forms import *
from django.core.mail import EmailMultiAlternatives
from django.contrib.auth.models import User
from django.urls import reverse 
from django.shortcuts import redirect, render
from django.contrib.auth import get_user_model
from django.utils.html import strip_tags
from django.template.loader import render_to_string
from allauth.exceptions import ImmediateHttpResponse
from django.utils.encoding import force_bytes, force_text
from django.contrib.auth.signals import user_logged_in, user_logged_out
from allauth.socialaccount.signals import pre_social_login
from django.contrib.sites.shortcuts import get_current_site
from django.contrib.sites.models import Site
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.tokens import default_token_generator
from django.http import JsonResponse, HttpResponse, HttpResponseRedirect
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils import timezone	
from .tasks import del_useless_user
import logging

log = logging.getLogger(__name__)

def send_mail(template, data):	
	html_content = render_to_string(template, data);				
	message = strip_tags(html_content)					    	
	mail = EmailMultiAlternatives(data['subject'], message, settings.EMAIL_HOST_USER, [data['email']])	
	mail.attach_alternative(html_content, "text/html")	
	try:
		mail.send()
	except:
		return False
	return True		

class Register(View):		
	form_class = signupForm	
	def get(self, request):				
		data = {}
		inputName = request.GET.get('inputName')
		inputVal = request.GET.get('inputVal')					
		if inputName and inputVal:
			if (inputName == 'Username'):
				data = { 'is_taken': User.objects.filter(username__iexact=inputVal).exists() }
			else:								
				data = { 'is_taken': User.objects.filter(email__iexact=inputVal).exists() }
		else:		
			username = request.session.get('username')						
			data['responseInput1'] = ''
			data['responseInput2'] = ''
			data['response'] = ''
			if username:
				data['responseInput1'] = username.lower()
				data['responseInput2'] = request.session.get('email')
				request.session['username'] = ''
				request.session['email'] = ''		
		return JsonResponse(data)

	def post(self, request):
		data = {'responseMsg': 'Something went wrong', 'responseType': 'fa fa-exclamation-circle'}		
		form = self.form_class(request.POST)	
		connected = is_connected('www.google.com')
		if form.is_valid() and connected:
			user = form.save(commit=False)
			user.is_active = False		  
			to_email = form.cleaned_data['email'].lower()				 		   			
			username = form.cleaned_data['username'].lower()			
			password = form.cleaned_data['password']
			user.set_password(password)			
			user.save()
			picture_url = config.picture_url	 
			if picture_url:				
				result = urllib.urlretrieve(picture_url)[0]
				name = str(uuid.uuid1()) + '.' + result.rsplit('.', 1)[1]
				user.profile.avatar.save(name, File(open(result, 'rb')))						   
			user.profile.provider = config.provider			
			user.profile.save()	
			#setup and send confirmation email.			
			token = default_token_generator.make_token(user)
			uid = urlsafe_base64_encode(force_bytes(user.pk))			
			subject = 'Account Confirmation.'
			data = { 'user': user.username, 'domain': 'ditook.com', 'subject': subject,
					  'token': token, 'uid': uid, 'email' :to_email }			
			if send_mail("activationTemplate.html", data):
				data['responseMsg'] = 'Confirmation link delivered. Please confirm your email to complete the registration.'
				data['responseType'] = 'fa fa-check'
				request.session['isDeactivated'] = False			
				del_useless_user(user.id)
			else:	
				data['responseMsg'] = "Problem with your connection. Please try again."
				data['responseType'] = 'fa fa-exclamation-circle'
				user.delete()
		else:			
			if not connected:
				data['responseMsg'] = 'Please check your Internet connection and try again.'
		return JsonResponse(data) 

@receiver(user_logged_in)
def got_online(sender, user, request, **kwargs):	
	user.profile.online = True
	user.profile.save()

class Login(View):
	
	def get(self, request):	
		data = {'response': ''}
		data['email'] = request.session.get('email')				
		return JsonResponse(data)

	def post(self, request):
		data = {'redirectTo': '', 'isValidUser': False}		
		email = request.POST.get('email')
		password = request.POST.get('password')	

		if email == '' or password == '':
		   data['responseMsg'] = 'Please fill all the fields.'
		   return JsonResponse(data)

		user = authenticate(username = email, password = password)	

		if user is not None:
			data ['isValidUser'] = True	 			
			if request.session.get('isDeactivated'):
				user.is_active = True
				user.save()
				request.session['isDeactivated'] = False
				
			if user.is_active:			   
			   data['isActive'] = True	
			   login(request, user)
			   data ['redirectTo'] = '/articles'
			   if request.user.is_authenticated():
			   	  data ['username'] = request.user.username
			else:
			   data['isActive'] = False
			   data['responseMsg'] = "Please confirm your email to login."
		else:
			data['responseMsg'] = 'Invalid email or password.'	   	   			

		return JsonResponse(data)	

def Logout(request):
	logout(request)	
	template = '/'
	return redirect(template)	 	

@receiver(user_logged_out)
def got_offline(sender, user, request, **kwargs):	
	user.profile.online = False
	user.profile.save()

def set_new_password(request):
	data = {'response':''}
	form = setPasswordForm(request.POST)
	if form.is_valid():
		email = form.cleaned_data['email'].lower()
		try:						
			user = User.objects.get(email=email)
			password = form.cleaned_data['password']
			user.set_password(password)
			user.save()
			subject = 'Password change.'
			data = { 'user': user.username, 'domain': 'ditook.com', 'subject': subject,
					  'email' :email, 'date': timezone.now() }
			send_mail("changed_password.html", data)
			data['response'] = 'password set'
		except:
			data['failed'] = True
	return JsonResponse(data)		

class OtpManager(View):		
	totp = None 	
	def send_otp(self, form_data, request):
		data = {'response':'', 'responseType':''}		
		form = forgot_password_form(form_data)
		if form.is_valid():
			user = form.save(commit=False)		
			email = form.cleaned_data['email'].lower()	
			OtpManager.totp = pyotp.TOTP(pyotp.random_base32(), interval=300)	
			otp = OtpManager.totp.now()			
			val = {'user': user.username, 'domain': 'ditook.com', 'subject': 'Password reset.', 
				       'email' :email }
			if send_mail("password_reset.html", val):				   				  
				data['response'] = 'Verification code delivered.'
				data['responseType'] = 'fa fa-exclamation-circle'								
		return data

	def verify_otp(self, code):
		data = {'response':''}				
		if OtpManager.totp.verify(code):
			data['response'] = 'success'
		else:
			data['errMsg'] = 'Invalid code. Please try agin.'			
		return data	

	def post(self, request):	
		email = request.POST.get('email')
		data = {}
		if email:
			data = self.send_otp(request.POST, request)						
		else:
			code = request.POST.get('code')
			data = self.verify_otp(code)
		return JsonResponse(data, safe=False)	

def ActivateAccount(request, uidb64, token):
	response = '' 	
	responseType = 'fa fa-exclamation-circle'
	if uidb64 is not None and token is not None:
	   uid = urlsafe_base64_decode(uidb64)
	   try:
	   	    user = User.objects.get(pk=uid)   	   	   
	   	    if default_token_generator.check_token(user, token) and user.is_active == False:
	   	   	   user.is_active = True
	   	   	   user.save()
	   	   	   response = "Email confirmed successfully!"
	   	   	   responseType = 'fa fa-check'		   	  	   				  
	   except:
	   	    response = "Invalid link. Try confirming again from the link send to your email."			
	else:
		response = "Failed to confirm. Try confirming again from the link send to your email."
	return index(request, {'type': responseType, 'response': response})

def isSupportedImgFormat(value):
	imgType = value.rpartition('.')[-1]	
	if imgType == 'jpeg' or imgType == 'jpg' or imgType == 'png' or imgType == 'tif' or imgType == 'tiff':
		return True;
	return False;	

def updatePro(request):
	data = {'response':'','responseType':'fa fa-exclamation-circle','img':''}	
	if request.method == 'POST' and request.is_ajax():
		form = proUpdateForm(request.POST)			
		if form.is_valid():
			pro = form.save(commit=False)			
			data['response'] = 'Profile successfully updated!'	
			data['responseType'] = 'fa fa-check'
			bio = form.cleaned_data['bio']	
			profile = request.user.profile				
			try:
				img = request.FILES['image']				
				if isSupportedImgFormat(img.name):
					profile.avatar = img					
				else:
					data['response'] = 'Supported file formats are: jpeg / jpg, png and tif / tiff.'
					data['responseType'] = 'fa fa-exclamation-circle'
					return JsonResponse(data)																
			except:
				if profile.bio == bio:
					data['response'] = 'Nothing seems to be edited!'
					data['responseType'] = 'fa fa-exclamation-circle'
					return JsonResponse(data)
			profile.bio = bio			
			profile.save()	
			data['img']	= profile.avatar.url					
		else:
			data['response'] = 'Oops... Something went wrong!'
	else:
		data['response'] = 'Request failed to proceed!'
	return JsonResponse(data)

def updateUser(request):
	data = {'redirectTo':'','response':'Profile Updated.','responseType':'fa fa-check'}
	if request.method == 'POST' and request.is_ajax():
		form = updateForm(request.POST)		
		if form.is_valid():			
			username = request.POST.get('username')
			email = request.POST.get('email')
			password = request.POST.get('password')	
			user = request.user		
			if user.username != username:
			   	if User.objects.filter(username__iexact=username).exists():
			   		data['response'] = 'Username Already Exist.'
			   		data['responseType'] = 'fa fa-exclamation-circle'
			   	else:				   					   	
			   		user.username = username
			   		user.save()
			   		data['username'] = user.username
			if user.email != email:
			   	if User.objects.filter(email__iexact=email).exists():
			   		data['response'] = 'Email Already Exist.'
			   		data['responseType'] = 'fa fa-exclamation-circle'			   		
			   	else:
			   		user.email = email
			   		user.save()
			   		data['email'] = user.email
			if user.password != password and password != '*********':
			   	user.set_password(password)
			   	user.save()	
			   	data['redirectTo'] = "/"
			profile = user.profile  			
			if profile.timezone != request.POST.get('timezone'):
				profile.timezone =  request.POST.get('timezone') 
				profile.save() 				
	return JsonResponse(data)	

def deactivateUser(request):
	data = {'responseType': 'fa fa-exclamation-circle','response':'Unautheticated User!'}
	user = request.user
	if user.is_authenticated():
		user.is_active = False;
		user.save()
		request.session['isDeactivated'] = True	
		data['response'] = 'Your account will be active when you login next time.'		
		data['redirectTo'] = "/"
	return JsonResponse(data)   

def fb_auth(request):
	data = {'response': ''}
	request.session['username'] = ''
	request.session['email'] = ''
	username = request.GET.get('username')
	email = request.GET.get('email')
	picture_url = request.GET.get('picture_url')
	try:
		user = User.objects.get(email=email)
		if user.profile.provider == 'facebook':
			data['response'] = 'sign in'			
		else:	
			data['response'] = 'User with this email already exists please register with different email.'					
	except:
		request.session['username']	= username
		request.session['email'] = email		
		config.provider = 'facebook'		
		if picture_url:
			config.picture_url = picture_url	
	return JsonResponse(data)	

@receiver(pre_social_login)
def get_user_data(sender, request, sociallogin, **kwargs):	
	provider = sociallogin.account.provider		
	picture_url = ''
	responseType = 'fa fa-exclamation-circle'		
	request.session['username'] = ''
	request.session['email'] = ''
	articles = Article.objects.all()
	data = sociallogin.account.extra_data
	if provider == 'google':			
		email_address = data['email']
		username = data['given_name']
		picture_url = data['picture']		
	elif provider == 'linkedin':
		email_address = data['email-address']
		username = data['first-name']
		if data['picture-urls']:
			picture_url = data['picture-urls']['picture-url']
	elif provider == 'twitter':	
		email_address = data['email']	
		username = data['screen_name']
		if not data['default_profile_image']:
			smallPicture_url = data['profile_image_url']
			picture_url = smallPicture_url.rsplit("_", 1)[0] + "." + smallPicture_url.rsplit(".", 1)[1]	

	if email_address:			
		email_address = email_address.lower()		
		try:	 
			user = User.objects.get(email=email_address)					
		except:
			user = None			
		request.session['email'] = email_address
		if user:
			if user.profile.provider == provider:
				raise ImmediateHttpResponse(render(request, 'index.html', {'articles': articles, 'loginUser':True}))
			response = "Email address already exists. Please provide a different email address."
			raise ImmediateHttpResponse(render(request, 'index.html', {'articles': articles, 'type': responseType, 'response': response}))						
		if picture_url:					  
			config.picture_url = picture_url
			config.provider = provider
			config.username = username	
		request.session['username'] = username			
		raise ImmediateHttpResponse(render(request, 'index.html', {'articles': articles, 'registerUser':True}))		
	else:
		response = "Your social account doesn't have an email address. Please register as new user or try login with different social account."
		raise ImmediateHttpResponse(render(request, 'index.html', {'articles': articles, 'type': responseType, 'response': response}))			


