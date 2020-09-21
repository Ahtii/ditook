
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from django import forms
from .models import Profile
from django.core.validators import RegexValidator
import re

class forgot_password_form(forms.ModelForm):
	email = forms.EmailField(required=False)
	class Meta:
		model = User
		fields = ['email']

class proUpdateForm(forms.ModelForm):	
	class Meta:
		model = Profile
		fields = ['bio', 'avatar']							

class setPasswordForm(forms.Form):	
	email = forms.EmailField()
	password = forms.CharField(widget=forms.PasswordInput, validators=[RegexValidator('^(?=.*[a-zA-Z]).{8,}$')])		

class signupForm(forms.ModelForm):	
	password = forms.CharField(widget=forms.PasswordInput, validators=[RegexValidator('^(?=.*[a-zA-Z]).{8,}$')])
	username = forms.CharField(validators=[RegexValidator('^[a-zA-Z][\w]{2,14}$')])

	class Meta:
		model = User
		fields = ['username', 'email', 'password']	

class loginForm(forms.Form):	
	username = forms.CharField( required=True )		
	password = forms.CharField( required=True )

class updateForm(forms.Form):	
	password = forms.CharField(widget=forms.PasswordInput, required=False)
	username = forms.CharField(validators=[RegexValidator('^[a-zA-Z][\w]{2,14}$')], required=False)
	email = forms.EmailField(required=False)	

	def clean(self):
		cleaned_data = super(updateForm, self).clean()
		password = cleaned_data.get('password')
		if password != '*********':
			if re.match('^(?=.*[a-zA-Z]).{8,}$', password) == None:
				return False;	

		