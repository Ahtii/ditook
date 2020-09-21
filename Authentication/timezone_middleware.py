
from django.utils import timezone
from datetime import datetime
import pytz

class TimezoneMiddleware:
	
	def __init__(self, get_response):
		self.get_response = get_response

	def __call__(self, request):
		return self.get_response(request)

	def process_request(self, request):			
		timezone = datetime.now(tz=pytz.UTC).astimezone(pytz.timezone(request.user.profile.timezone))
		request.session['timezone'] = timezone