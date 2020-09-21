
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
import socket
from django.template.loader import render_to_string
from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.models import User
from Authentication.models import Fan, ProfileViews
from articles.models import Article, Comment
import pytz
from articles import config
from django.core import serializers
from ditook import cp

def ditook_note(request):			
	return render(request,'ditook_note.html',{'title': request.GET.get('title'), 'body': request.GET.get('body')})

def get_page_number(request, obj_list, per_page):
	paginator = Paginator(obj_list, per_page) # Show some number of articles per page
	page = request.GET.get('page')
	articles = None
	try:
		articles = paginator.page(page)
	except PageNotAnInteger:
		# If page is not an integer, deliver first page.
		articles = paginator.page(1)
	except EmptyPage:
		# If page is out of range (e.g. 9999), deliver last page of results.
		articles = paginator.page(paginator.num_pages)
	return articles    
	
def get_actual_page(whole_page):
	start = whole_page.find("<div class=\"main_page\">")
	end = whole_page.find("</div class=\"main_page_end\">", start)
	return whole_page[start:end]

def merge_data(x, y):
	z = x.copy()
	z.update(y)
	return z	

def index(request, after_authenticated=None):	
	category = request.GET.get('category')	
	article_list = None
	if category:
		cp.category = category.lower().strip()	
		article_list = Article.objects.filter(category=cp.category).order_by('id')	
	else:
		article_list = Article.objects.all().order_by('-date')	
	articles = get_page_number(request, article_list, 5)	
	data = {'articles': articles}
	if after_authenticated:
		data = merge_data(data, after_authenticated)		
	return render(request,'index.html',data)

def temp(request):
	return render(request,'temp.html')

def privacypolicy(request):
	return render(request,'privacypolicy.html')

def termsandconditions(request):
	return render(request,'termsandconditions.html')	

def about(request):
	return render(request, 'about.html')			

def common_data(user):		
	profile_views = ProfileViews.objects.filter(user=user).count()
	number_of_posts = Article.objects.filter(user=user).count()
	posts = Article.objects.filter(user=user).order_by('-date')
	fans = Fan.objects.filter(fans=user.username).count()
	fan = Fan.objects.filter(fan=user).count()	
	data = {'fans': fans, 'fan': fan, 'profile_views': profile_views, 'number_of_posts': number_of_posts, 'posts': posts}
	return data

def profile(request, person=''):	
	if person:	
		is_fan = False
		try:		
			person = User.objects.get(username=person)
		except:
			fixes = []
			fixes.append('Login yourself to Ditook.')
			return render(request, '404.html', {'fixes': fixes,'problems': None})		
		if request.user.is_authenticated():	
			if request.user.username == person.username:
				return render(request, 'profile.html', common_data(request.user))
			else:	
				if not ProfileViews.objects.filter(user=person, viewed_by=request.user).exists():
					ProfileViews.objects.create(user=person, viewed_by=request.user)				
			config.person = person
			try: 
				Fan.objects.get(fan=request.user, fans=person)
				is_fan = True 						
			except:
				pass		
		context = common_data(person)
		context['person'] = person
		context['is_fan'] = is_fan
		return render(request, 'profile.html', context)
	elif request.user.is_authenticated():		
		return render(request, 'profile.html', common_data(request.user))	
	fixes = []
	fixes.append('Login yourself to Ditook.')
	return render(request, '404.html', {'fixes': fixes,'problems': None})	

def settings(request):
	if request.user.is_authenticated():
		timezone = []
		for tz in pytz.all_timezones:			
			timezone.append(tz)
		return render(request, 'settings.html', {'timezone': timezone})
	else:
		fixes = []
		fixes.append('Login yourself to Ditook.')
		return render(request, '404.html', {'fixes': fixes,'problems': None})	

def search(request):	
	search_by = request.GET.get('by')	
	old_target = request.GET.get('target')	
	target = old_target.lower()	
	if search_by == 'article':
		article_list = Article.objects.filter(title__contains=target).order_by('id')									
		articles = get_page_number(request, article_list, 5)
		return render (request, 'search.html', {'articles': articles, 'target': old_target})	
	user_list = User.objects.filter(username__contains=target).order_by('id')
	users = get_page_number(request, user_list, 10)
	return render (request, 'search.html', {'users': users, 'target': old_target})	

def add_fan(request):
	data = {'response': 0, 'fan': 0}
	if request.user.is_authenticated():
		try: 
			Fan.objects.get(fan=request.user, fans=config.person).delete()			
		except:
			Fan.objects.create(fan=request.user, fans=config.person)
			data['fan'] = 1
		data['response'] = 1	
	return JsonResponse(data)		

def is_connected(hostname):
	try:
		host = socket.gethostbyname(hostname)
		response = socket.create_connection((host, 80), 2)
		return True
	except:
		pass
	return False		