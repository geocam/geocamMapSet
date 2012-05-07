# __BEGIN_LICENSE__
# Copyright (C) 2008-2010 United States Government as represented by
# the Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
# __END_LICENSE__

# Django settings for example project.

DEBUG = True
TEMPLATE_DEBUG = DEBUG
import os
import sys
APP = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
PROJ_ROOT = os.path.abspath(os.path.dirname(__file__))
sys.path.append(APP)

from django.conf import global_settings

ADMINS = (
    # ('Your Name', 'your_email@domain.com'),
)

MANAGERS = ADMINS

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(PROJ_ROOT, 'dev.db')
    }
}

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# If running in a Windows environment this must be set to the same as your
# system time zone.
TIME_ZONE = 'America/Los_Angeles'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# Absolute path to the directory that holds media.
# Example: "/home/media/media.lawrence.com/"
MEDIA_ROOT = ''

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash if there is a path component (optional in other cases).
# Examples: "http://media.lawrence.com", "http://example.com/media/"
MEDIA_URL = '/media/'

# Absolute path to the directory that holds data. This is different than media
# in that it's uploaded/processed data that's not needed for the operation of
# the site, but may need to be network-accessible, or be linked to from the
# database. Examples: images, generate kml files, etc.
# Example: "/data"
# DATA_ROOT = os.path.join(PROJ_ROOT, 'data')

# URL that handles the data served from DATA_ROOT. Make sure to use a
# trailing slash if there is a path component (optional in other cases).
# Examples: "http://data.lawrence.com", "http://example.com/data/"
# DATA_URL = '/data/'

# URL prefix for admin media -- CSS, JavaScript and images. Make sure to use a
# trailing slash.
# Examples: "http://foo.com/media/", "/media/".
# ADMIN_MEDIA_PREFIX = STATIC_URL + 'admin/'

# Make this unique, and don't share it with anybody.
SECRET_KEY = '_nfc4tc%kwrt#h!$s!xj@p&v%2lo7oucw=dh5qx!pk&t7r&uv#'

# List of callables that know how to import templates from various sources.
#TEMPLATE_LOADERS = (
#    'django.template.loaders.filesystem.load_template_source',
#    'django.template.loaders.app_directories.load_template_source',
#)

#MIDDLEWARE_CLASSES = (
#    'django.middleware.common.CommonMiddleware',
#    'django.contrib.sessions.middleware.SessionMiddleware',
#    'django.contrib.auth.middleware.AuthenticationMiddleware',
#)

ROOT_URLCONF = 'example.urls'

# Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
# Always use forward slashes, even on Windows.
# Don't forget to use absolute paths, not relative paths.
#TEMPLATE_DIRS = (
#)

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(APP, 'build', 'static')

TEMPLATE_CONTEXT_PROCESSORS = global_settings.TEMPLATE_CONTEXT_PROCESSORS + (
    'django.core.context_processors.request',
    'django.core.context_processors.static',
    'geocamUtil.context_processors.AuthUrlsContextProcessor.AuthUrlsContextProcessor',
)

INSTALLED_APPS = (
    'geocamMapSet',

    'pipeline',

    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.staticfiles',
    'django.contrib.databrowse',
)

SCRIPT_NAME = '/'
LOGIN_URL = SCRIPT_NAME + 'accounts/login/'
LOGOUT_URL = SCRIPT_NAME + 'accounts/logout/'
LOGIN_DEFAULT_NEXT_URL = SCRIPT_NAME

USE_DEBUG_TOOLBAR = False

if USE_DEBUG_TOOLBAR:
    import debug_toolbar
    INSTALLED_APPS = INSTALLED_APPS + (
        'debug_toolbar',
    )
    MIDDLEWARE_CLASSES = global_settings.MIDDLEWARE_CLASSES + (
        'debug_toolbar.middleware.DebugToolbarMiddleware',
    )
    INTERNAL_IPS = ('127.0.0.1',)

######################################################################
# django-pipeline setup

STATICFILES_STORAGE = 'pipeline.storage.PipelineCachedStorage'
PIPELINE_YUI_BINARY = os.path.join(APP, 'bin', 'yuicompressor')
PIPELINE_TEMPLATE_FUNC = '_.template'
PIPELINE_TEMPLATE_EXT = '.html'

PIPELINE_CSS = {
    'master': {
        'source_filenames': (
            'external/css/ui-lightness/jquery-ui-1.8.18.custom.css',
            'mixer/css/base.css',
        ),
        'output_filename': 'mixer/css/master.css',
    },
}

PIPELINE_JS = {
    'master': {
        'source_filenames': (
            # libs
            'external/js/jquery-1.7.1.min.js',
            'external/js/jquery-ui-1.8.18.custom.min.js',
            'external/js/json2.js',
            'external/js/underscore.js',
            'external/js/backbone-min.js',
            'geocamMapSet/js/geocamMapSetLib.js',

            # templates
            'mixer/js/templateConfig.js',
            'geocamMapSet/templates/mapSet.html',
            'mixer/templates/welcome.html',

            # app
            'mixer/js/app.js',
        ),
        'output_filename': 'mixer/js/master.js',
    }
}
