from .base import *
if os.environ.get('DITOOK_VER') == 'production':
	from .prod import *
else:
	from .dev import *	