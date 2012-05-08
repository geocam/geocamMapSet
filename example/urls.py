# __BEGIN_LICENSE__
# Copyright (C) 2008-2010 United States Government as represented by
# the Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
# __END_LICENSE__

from django.conf.urls.defaults import patterns, include, url
from django.conf import settings

from django.contrib import admin
admin.autodiscover()

from geocamMapSet.urls import mapMixerPatterns

urlpatterns = patterns('',
    (r'^admin/', include(admin.site.urls)),
    (r'^mixer/', include('geocamMapSet.urls')),
    (r'^accounts/login/$', 'django.contrib.auth.views.login', {}, 'login'),
    (r'^accounts/logout/$', 'django.contrib.auth.views.logout', {}, 'logout'),
    url('^static/(?P<path>.*)$',
        'django.views.static.serve',
        {'document_root': settings.STATIC_ROOT,
         'show_indexes': True}, 'dev_static')
) + mapMixerPatterns

