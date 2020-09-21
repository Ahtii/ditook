
from django.conf.urls import include, url
from django.contrib import admin
from .import views
from django.contrib.auth import views as auth_views
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    
    url(r'^accounts/', include('allauth.urls')),       
    url(r'^profile/(?P<person>[a-zA-Z]+)', views.profile, name='profile'),
    url(r'^profile/', views.profile, name='profile'),
    url(r'^add_fan/', views.add_fan, name='add_fan'),
    url(r'^settings/', views.settings, name='settings'),
    url(r'^admin/', admin.site.urls),    
    url(r'^search/', views.search, name='search'),
    url(r'^articles/', include('articles.urls')),
    url(r'^contact/', include('contact.urls')),
    url(r'^privacypolicy/',views.privacypolicy, name="PrivacyPolicy"),
    url(r'^termsandconditions/',views.termsandconditions, name="TermsAndConditions"),
    url(r'^about/',views.about, name="About"),
    url(r'^temp/',views.temp, name="temp"),
    url(r'^ditook_note/$',views.ditook_note, name="ditook_note"),  
    url(r'^authenticate/', include(('Authentication.urls', 'authenticate'), namespace="authenticate")),
    url(r'^$', views.index, name='index'),    
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
