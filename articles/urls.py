
from django.conf.urls import url
from . import views

urlpatterns = [

	url(r'postComment/$', views.postComment, name='postComment'),
	url(r'updateComment/$', views.updateComment, name='updateComment'),
	url(r'del_comment/$', views.del_comment, name='del_comment'),
	url(r'comment_edit_post/$', views.comment_edit_post, name='comment_edit_post'),
	url(r'update_article_likes/$', views.update_article_likes, name='update_article_likes'),		
	url(r'get_article/(?P<article_id>[0-9]+)$', views.get_article, name='get_article'),
	url(r'del_article/(?P<article_id>[0-9]+)$', views.del_article, name='del_article'),
    url(r'notifications_target/',views.notifications_target, name="notifications_target"),
	url(r'get_notifications/',views.get_notifications, name="get_notifications"),
    url(r'mark_as_seen/',views.mark_as_seen, name="mark_as_seen"),
    url(r'clear_notifications/',views.clear_notifications, name="clear_notifications"),
	url(r'(?P<article_id>[0-9]+)', views.articles, name='articles'),
	url(r'postArticle/$', views.postArticle, name='postArticle'),
	url(r'^$', views.articles, name='articles')
]