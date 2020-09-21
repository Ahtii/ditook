
from django.shortcuts import render
from .forms import contactForm
from ditook.views import is_connected
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.http import JsonResponse

def contact(request):
	return render(request,'contact.html')

def concern(request):
	data = {'responseMsg': '', 'responseType': "fa fa-exclamation-circle"}
	form = contactForm(request.POST)
	connected = is_connected('www.google.com')
	if form.is_valid() and connected:
		name = form.cleaned_data['name']
		message = form.cleaned_data['message']
		subject = form.cleaned_data['subject']
		from_email = form.cleaned_data['email']
		mail = EmailMultiAlternatives(subject, message, from_email, [settings.EMAIL_HOST_USER])
		mail.send()
		data['responseMsg'] = 'Your message has been send. You will recieve a reply to your provided email.'
		data['responseType'] = "fa fa-check"
	else:
		if not connected:
			data['responseMsg'] = 'Please check your internet connection.'
		else:	
			data['responseMsg'] = 'Invalid form content.'	
	return JsonResponse(data)		
