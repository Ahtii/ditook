
from django import forms
from django.contrib.auth.models import User
from .models import Article

class ArticleForm(forms.ModelForm):
	title = forms.CharField(max_length=254)
	body = forms.CharField()
	category = forms.CharField(max_length=254)

	class Meta:
		model = Article
		fields = ['title', 'body', 'category']

class ArticleMedia(forms.Form):
	files = forms.FileField(widget=forms.ClearableFileInput(attrs={'multiple':True}))