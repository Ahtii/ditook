
from django.conf.urls import url
from .import views
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [

	url(r'^OtpManager/$', views.OtpManager.as_view(), name='OtpManager'),	
	url(r'^register/', views.Register.as_view(), name='register'),
	url(r'^Login/', views.Login.as_view(), name='Login'),
	url(r'^Logout/$', views.Logout, name='Logout'),	
	url(r'^set_new_password/$', views.set_new_password, name='set_new_password'),	
	url(r'^fb_auth/$', views.fb_auth, name='fb_auth'),		
	url(r'^activateAccount/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$', views.ActivateAccount, name="activateAccount"),	
	url(r'^updateProfile/$', views.updatePro, name='updateProfile'),	
	url(r'^updateUser/$', views.updateUser, name='updateUser'),	
	url(r'^deactivateUser/$', views.deactivateUser, name='deactivateUser'),	
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)