
from django import forms
from django.core.validators import RegexValidator

class contactForm(forms.Form):

	name = forms.CharField(max_length=25)
	email = forms.EmailField(validators=[RegexValidator('^[\w.%+-]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$')])
	subject = forms.CharField(max_length=100)
	message = forms.CharField(max_length=10000)