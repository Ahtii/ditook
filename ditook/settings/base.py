import os

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Application definition

INSTALLED_APPS = [
    'Authentication.apps.AuthenticationConfig',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'background_task',
    'articles',
    'ditook',
    'allauth',
    'django_visitor_information',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.facebook',
    'allauth.socialaccount.providers.twitter',
    'allauth.socialaccount.providers.linkedin',
    'allauth.socialaccount.providers.google'
]

HOME_PAGE = 'www.127.0.0.1'

USE_TZ = True

LOGIN_URL = '/authenticate/Login'
LOGOUT_URL = '/authenticate/Logout'
LOGIN_REDIRECT_URL = 'articles'

SITE_ID = 1

BACKGROUND_TASK_RUN_ASYNC = True

# for login with email
AUTHENTICATION_BACKENDS = [
    'allauth.account.auth_backends.AuthenticationBackend',
    'Authentication.backends.EmailBackend',
]

ACCOUNT_AUTHENTICATION_METHOD = 'email'
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_EMAIL_VERIFICATION = 'mandatory'
ACCOUNT_LOGIN_ON_EMAIL_CONFIRMATION = True
ACCOUNT_EMAIL_CONFIRMATION_AUTHENTICATED_REDIRECT_URL  = '/articles/'

SOCIALACCOUNT_QUERY_EMAIL = True
SOCIALACCOUNT_EMAIL_VERIFICATION = True
SOCIALACCOUNT_EMAIL_REQUIRED = True

ACCOUNT_ADAPTER = 'Authentication.adapter.CustomAdapter'
MIDDLEWARE = [
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.middleware.security.SecurityMiddleware',    
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'Authentication.middleware.ActiveUserMiddleware',
    'Authentication.timezone_middleware.TimezoneMiddleware',
]

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
        'LOCATION': '127.0.0.1:11211',
    }
}

USER_ONLINE_TIMEOUT = 300
USER_LASTSEEN_TIMEOUT = 60 * 60 * 24 * 7

USERNAME_LENGTH = 15

ROOT_URLCONF = 'ditook.urls'

SETTINGS_PATH = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

TEMPLATES = [
    {        
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(SETTINGS_PATH, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages', 
                'ditook.cp.show_quotation',             
                'articles.context_processors.show_popular_posts',             
                'articles.context_processors.show_latest_posts',             
                'articles.context_processors.show_categories',                     
            ],
        },
    },
]

WSGI_APPLICATION = 'ditook.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'ditook',                      
        'USER': 'postgres',
        'PASSWORD': 'wmd_9906',
        'HOST': 'localhost',
        'PORT': '',
    }
}


# Password validation
# https://docs.djangoproject.com/en/1.11/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/1.11/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.11/howto/static-files/

STATICFILES_DIRS = [
    os.path.join(BASE_DIR,"static"),
]

STATIC_URL = '/static/'

STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MEDIA_ROOT = os.path.join(BASE_DIR, 'media/images')
MEDIA_URL = '/media/images/'