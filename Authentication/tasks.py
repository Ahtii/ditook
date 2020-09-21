from background_task import background
from django.contrib.auth.models import User

@background(schedule=86000) #after a day
def del_useless_user(user_id):
	try:
		user = User.objects.get(id=user_id)		
		if not user.is_active:
			user.delete()
	except:
		pass	
