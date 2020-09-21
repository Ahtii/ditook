
from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth import authenticate
from django.core import serializers
from .forms import *
from django.utils import timezone
from django.utils.timezone import activate
import pytz
import uuid
from .models import*
import random
from articles import config
import json
from django.conf import settings
from ditook.settings import BASE_DIR
from ditook.cp import category
from xml.dom.minidom import parseString

def genRandArticle():
	similar_articles = Article.objects.filter(category=category)	
	if not similar_articles:
		similar_articles = Article.objects.all()
	last = similar_articles.count() - 1
	index = random.randint(0, last)		
	article = Article.objects.all()[index]	
	return article.id

def get_article_data(request, article):
	NoOfComments = Comment.objects.filter(article=article).count()						
	comments = Comment.objects.filter(article=article).order_by('-date')		
	config.curArticleComments = comments
	n_r_comments = comments.filter(parent=None).order_by('-date')
	comment_list = []
	for n_r_comment in n_r_comments:
		comment_list.append(n_r_comment)
		r_comments = comments.filter(parent=n_r_comment.id).order_by('-date')
		for r_comment in r_comments:
			comment_list.append(r_comment)			
	C_LikedByCurUser = []	
	A_LikedByCurUser = False
	A_SharedByCurUser = False
	if request.user.is_authenticated:
		timezone.activate(request.user.profile.timezone)		
		curUser = request.user.username
		for comment in comments:			
			try:
				likedComment = LikedComment.objects.filter(comment=comment).get(user=curUser)
				C_LikedByCurUser.append(likedComment.comment.id)										
			except:
				pass
		try:
			LikedArticle.objects.filter(article=article).get(user=curUser)
			A_LikedByCurUser = True			
		except:
			pass	
		try:
			SharedArticle.objects.filter(article=article).get(user=curUser)
			A_SharedByCurUser = True			
		except:
			pass	
	context = { 
				'article':article,'comments':comment_list,'NoOfComments':NoOfComments,
				'C_LikedByCurUser':C_LikedByCurUser,'A_LikedByCurUser':A_LikedByCurUser,
				'A_SharedByCurUser':A_SharedByCurUser, 'A_SharedByCurUser':A_SharedByCurUser
			  }
	return context		  

def articles(request, article_id=''):
	try:
		Article.objects.count()		
	except:
		return render(request,'article.html',{'article':None,'NoOfComments':0})	
	if not article_id:
		article_id = genRandArticle()
	try:	
		article = Article.objects.get(id=article_id)
		article.likes = LikedArticle.objects.filter(article=article).count()
		article.save()				
	except:
		problems = []
		problems.append('Article never existed.')
		problems.append('Article maybe deleted.')
		return render(request, '404.html', {'problems': problems})	
	config.curArticle = article		
	context = get_article_data(request, article)
	comment_id = request.session.get('comment_id')
	article_id = request.session.get('article_id')		
	if comment_id:
		request.session['comment_id'] = ''
		notification_id = request.session.get('notification_id')
		request.session['notification_id'] = ''
		if Comment.objects.filter(id=comment_id).exists():
			context['target_comment'] = comment_id			
		else:	
			del_notification(request.user, None, None, comment_id)
			problems = []
			problems.append('Comment maybe deleted.')			
			return render(request, '404.html', {'problems':problems})	
	elif article_id:		
		context['target_article'] = article_id
		request.session['article_id'] = ''
	return render(request,'article.html',context)		

def get_article(request, article_id):
	data = {'article': ''}
	try:	
		article = Article.objects.get(id=article_id)		
		article.likes = LikedArticle.objects.filter(article=article).count()
		article.save()		
		data['article'] = serializers.serialize('json', [article])		
	except:
		pass
	return JsonResponse(data);

def mark_as_seen(request):
	notification_list = request.POST.getlist('notification_list[]')	
	non_existing_notifications = []
	existing_notifications = []
	for notification_id in notification_list:
		try:
			notification = Notifications.objects.get(id=notification_id)			
			notification.viewed = True
			notification.save()
			existing_notifications.append(notification_id)
		except:
			non_existing_notifications.append(notification_id)
			pass	
	data = {'non_existing_notifications': non_existing_notifications, 'existing_notifications': existing_notifications}		
	return JsonResponse(data)

def notifications_target(request):
	logged_in_user = request.user
	data = {'response':''}
	if logged_in_user.is_authenticated():
		notification_id = request.POST.get('notification_id')
		try:
			notification = Notifications.objects.get(id=notification_id)
			request.session['comment_id'] = notification.comment_id
			request.session['notification_id'] = notification_id
			message = notification.message
			if "liked your article." in message:
				request.session['article_id'] = notification.article_id				
			data['response'] = 'success'			
		except:
			data['response'] = 'fail'
	return JsonResponse(data)

def clear_notifications(request):
	notification_list = request.POST.getlist('notification_list[]')		
	for notification_id in notification_list:
		try:
			notification = Notifications.objects.get(id=notification_id).delete()
		except:
			pass	
	return JsonResponse({'response':'success'})		

def get_notifications(request):
	notification_list = Notifications.objects.filter(user=request.user).order_by('viewed')	
	data = serializers.serialize('json',notification_list)
	return JsonResponse(data, safe=False)	

def create_notification(reciver, message, comment_id, avatar_url, sender, target):		
	if reciver.username != sender:		
		notification = Notifications()
		notification.user = reciver
		notification.message = message	
		if comment_id:	
			notification.comment_id = comment_id		
		if avatar_url:			
			notification.avatar_url = avatar_url		
		notification.target = target
		notification.save()	

def del_notification(reciver, target, sender, comment_id):
	if reciver.username != sender:
		if comment_id:			
			try:
				Notifications.objects.get(comment_id=comment_id).delete()				
			except:				
				pass	
		else:
			try:	
				Notifications.objects.get(user=reciver, target=target).delete()				
			except:
				pass		

def del_article(request, article_id):
	data = {'response': '', 'responseType': 'fa fa-exclamation-circle'}
	try:
		article = Article.objects.get(id=article_id).delete()	
		data['response'] = 'Article deleted Successfully'			
		data['responseType'] = 'fa fa-check'
	except:
		pass
	return JsonResponse(data);	

def create_or_update(article, category, title, body, date, request, user=''):
	counter = 0		
	if article:
		article.category = category
		article.title = title
		article.body = body
		article.last_edit = date
		article.save()				
	else:			
		article = Article.objects.create(category=category, title=title, body=body, date=date, user=user)	
	images = request.FILES			
	end = -1
	while images:
		offset = body.find("src=\"blob", end+1)		
		if offset == -1:
			break	
		start = offset + 5
		end = body.find("\"", start)		
		old = body[start:end]										
		media = Media()
		media.article = article
		media.image = images[counter]				
		media.save()
		body = body.replace(old, media.img_url)													
		counter += 1
	article.body = body
	article.save()			

def postArticle(request):
	data = {'response':'Ops something went wrong.', 'responseType':'fa fa-exclamation-circle'}
	if request.user.is_authenticated() and request.user.is_superuser:		
		form = ArticleForm(request.POST)		
		if form.is_valid():
			timezone.activate(request.user.profile.timezone)
			article_form = form.save(commit=False)
			article_form.title = form.cleaned_data['title'].lower()
			body = form.cleaned_data['body']
			article_form.category = form.cleaned_data['category'].lower()
			article_form.user = request.user
			article_form.date = timezone.now()
			edit = request.POST.get('update_article').title()			
			try:			
				article = Article.objects.get(title=article_form.title)				
				if (edit):
					# updating the existing article
					create_or_update(article, article_form.category, article_form.title, article_form.body, article_form.date, request)					
					data['response'] = 'Article Updated Successfully.'
					data['responseType'] = 'fa fa-check'
				else:	
					data['response'] = 'Article already exists.'				
			except:
				# posting a new article	
				create_or_update(None, article_form.category, article_form.title, article_form.body, article_form.date, request, article_form.user)																							
				data['response'] = 'Article Posted Successfully.'
				data['responseType'] = 'fa fa-check'
	return JsonResponse(data)

def comment_edit_post(request):
	logged_in_user = request.user	
	if logged_in_user.is_authenticated():
		timezone.activate(request.user.profile.timezone)
		data = {'response':False}
		comment_text = request.POST.get('comment')
		article_id = request.POST.get('article_id')		
		comment_id = request.POST.get('comment_id')	
		comment = None
		if comment_text:
			try:
				article = Article.objects.get(id=article_id)
				try:
					comment = Comment.objects.get(id=comment_id)
					comment.text = comment_text					
					comment.last_edit = timezone.now()
					comment.save()
					data['comment_date'] = comment.date					
				except:
					return JsonResponse(data)
			except:
				return JsonResponse(data)
	return render(request, 'curComment.html',{'comment':comment})

def postComment(request):	
	logged_in_user = request.user
	if logged_in_user.is_authenticated():
		timezone.activate(request.user.profile.timezone)			
		article = config.curArticle
		comment = Comment()
		parent = request.POST.get('parent')
		comment.user = logged_in_user
		comment.text = request.POST.get('comment')		
		comment.date = timezone.now()				
		comment.article = article
		reciver = article.user
		message = "<strong>"+logged_in_user.username.title()+"</strong>"
		if parent:
			message = message + " replied to your comment."			
			try:
				parent_comment = Comment.objects.get(id=parent)
				comment.parent = parent			
				reciver = parent_comment.user
			except:
				problems = []
				problems.append('Comment maybe deleted.')
				return render(request, '404.html', {'problems':problems})					
		else:
			message = message + " commented on your article."	
		comment.save()	
		avatar_url = logged_in_user.profile.avatar_url
		create_notification(reciver, message, comment.id, avatar_url, logged_in_user.username, article.id)
	return render(request, 'curComment.html', {'comment': comment,'parent':parent})

def updateComment(request):
	data = {'success': False, 'noOfLikes': 0, 'Unliked': False}
	logged_in_user = request.user
	if logged_in_user.is_authenticated():		
		commentId = int(request.POST.get('commentId'))		
		try:
			article = config.curArticle
			comment = Comment.objects.filter(article=article).get(id=commentId)				
			curUser = logged_in_user.username
			message = "<strong>"+curUser.title()+"</strong> liked your comment."
			try:
				LikedComment.objects.filter(comment=comment).get(user=curUser).delete()
				data['Unliked'] = True				
				del_notification(comment.user, article.id, curUser, comment.id)
			except:
				user = LikedComment()
				user.user = curUser
				user.comment = comment
				user.save()				
				avatar_url = logged_in_user.profile.avatar_url				
				create_notification(comment.user, message, comment.id, avatar_url, curUser, article.id)
			likes = LikedComment.objects.filter(comment=comment).count()
			comment.likes = likes			
			comment.save()
			data['noOfLikes'] = likes	
			data['success'] = True
		except:
			pass	
	return JsonResponse(data)	

def del_comment(request):
	data = {'response':True}
	comment_id = request.POST.get('comment_id')	
	article_id = request.POST.get('article_id')	
	logged_in_user = request.user.username	
	try:
		parent = Comment.objects.get(id=comment_id)				
		replies = Comment.objects.filter(parent=comment_id)		
		reply_list = []
		for reply in replies:
			try:					
				sender = reply.user.username	
				message = "<strong>"+sender.title()+"</strong> replied to your comment."
				del_notification(parent.user, article_id, sender, reply.id)
				reply_list.append(reply.id)				
				reply.delete()
			except:
				pass				
		parent.delete()		
		data['replies'] = reply_list		
		try:
			article = Article.objects.get(id=article_id)			
			message = "<strong>"+logged_in_user.title()+"</strong> commented on your article."
			del_notification(article.user, article_id, logged_in_user, comment_id)
		except:
			pass		
	except:
		data['response'] = False
	return JsonResponse(data)		

def update_article_likes(request):
	data = {'success': False, 'total_likes': 0, 'liked': False}
	logged_in_user = request.user
	if logged_in_user.is_authenticated():
		article = config.curArticle
		curUser = logged_in_user.username
		message = "<strong>"+curUser.title()+"</strong> liked your article."
		total_likes = 0		
		try:
			LikedArticle.objects.filter(article=article).get(user=curUser).delete()
			del_notification(article.user, article.id, curUser, '')
		except:						
			LikedArticle.objects.create(user=curUser, article=article)				
			data['liked'] = True
			avatar_url = logged_in_user.profile.avatar_url
			create_notification(article.user, message, None, avatar_url, curUser, article.id)			
		likes = LikedArticle.objects.filter(article=article).count()
		article.likes = likes
		article.save()		
		data['total_likes'] = likes			
		data['success'] = True
	else:
		data['response'] = 'Please login to like.'	
	return JsonResponse(data)		
