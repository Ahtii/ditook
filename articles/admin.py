
from django.contrib import admin
from .models import*

admin.site.register(Article)
admin.site.register(Comment)
admin.site.register(LikedComment)
admin.site.register(LikedArticle)
admin.site.register(Quotations)
admin.site.register(Media)
admin.site.register(Notifications)
