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
) + mapMixerPatterns

urlpatterns = urlpatterns + patterns('',
    (r'^static/(?P<path>.*)$', 'django.views.static.serve',
        {'document_root': settings.MEDIA_ROOT}),
#    (r'^data/(?P<path>.*)$', 'django.views.static.serve',
#        {'document_root': settings.DATA_ROOT}),
)
