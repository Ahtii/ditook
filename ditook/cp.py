from articles.models import Quotations, Article
from articles.context_processors import show_categories
import random

categories = show_categories(None)['categories']
index = random.randrange(0, categories.count())
category = categories[index]

def genRandQuote():	
	# same_category = Quotations.objects.filter(category=category)	
	# if not same_category:
	# 	same_category = Quotations.objects.all()
	quotes = Quotations.objects.all()
	count = quotes.count()
	index = random.randrange(0, count)	
	quote = quotes[index]
	return quote		

def show_quotation(request):
	context = {'quote': genRandQuote()}
	return context