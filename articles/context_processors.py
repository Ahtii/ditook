from .models import Article

def show_popular_posts(request):
	popular_posts = Article.objects.all().order_by('-likes')[:5]	
	return {'popular_posts': popular_posts}	

def show_latest_posts(request):
	latest_posts = Article.objects.all().order_by('-date')[:5]
	return {'latest_posts': latest_posts}	

def show_categories(request):
	categories = Article.objects.values_list('category', flat=True).distinct()[:5]
	return {'categories': categories}	