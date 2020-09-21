import os

DEBUG = False

# for heroku

CORS_REPLACE_HTTPS_REFERER      = True
HOST_SCHEME                     = "https://"
SECURE_PROXY_SSL_HEADER         = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT             = True
SESSION_COOKIE_SECURE           = True
CSRF_COOKIE_SECURE              = True
SECURE_HSTS_INCLUDE_SUBDOMAINS  = True
SECURE_HSTS_SECONDS             = 1000000
SECURE_FRAME_DENY               = True

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY','!$(@w&yuaz=-h*xywrm+x!$9of+m8@=kpny^o&e##sz*l+xj+0')

# for sending email (gmail server)

EMAIL_USE_TLS = True
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_HOST_USER = 'ditookweb@gmail.com'
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_PASSWORD')
EMAIL_PORT = 587

LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'formatters': {
        'standard' : {
            'format' : '%(asctime)s [%(levelname)s] %(name)s: %(message)s'
        },
    },
    'handlers': {
        'default':{
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename':'logs/ditook.log',
            'maxBytes': 1024*1024*5, 
            'backupCount': 5,
            'formatter': 'standard'
        },
        'server_errors':{
            'level': 'ERROR',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename':'logs/ditook_critical.log',
            'maxBytes': 1024*1024*5, 
            'backupCount': 5,
            'formatter': 'standard'  
        }
    },
    'loggers':{
        '': {
            'handlers': ['default'],
            'level':'DEBUG',
            'propagate': True
        },
        'django.request': {
            'handlers': ['server_errors'],
            'level':'ERROR',
            'propagate': False  
        }
    }
}

# database for production

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'ditook',                      
        'USER': 'postgres',
        'PASSWORD': 'wmd_9906',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# setup database for production
import dj_database_url
db_from_env = dj_database_url.config()
DATABASES['default'].update(db_from_env)
#DATABASES['default']['CONN_MAX_AGE'] = 500

ALLOWED_HOSTS = ['https://ditook.herokuapp.com','www.ditook.com','ditook.com','45.120.149.226']