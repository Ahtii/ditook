
from django.conf.urls import url
from . import views

urlpatterns = [
	
	url(r'^$',views.contact, name="contact"),	
	url(r'^send_concern/',views.concern, name="concern"),	
]