# __BEGIN_LICENSE__
# Copyright (C) 2008-2010 United States Government as represented by
# the Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
# __END_LICENSE__

from django.conf.urls.defaults import url, patterns
from django.contrib import databrowse
from geocamMapSet.models import MapSet, Extension, MapSetLayer
from geocamMapSet import settings

databrowse.site.register(MapSet)
databrowse.site.register(Extension)
databrowse.site.register(MapSetLayer)

urlpatterns = patterns(
    'geocamMapSet.views',

    url(r'^createSet/$', 'mapSetCreate', {},
        'geocamMapSet_create'),

    url(r'^(?P<username>[^/]+)/(?P<setName>[^/]+)\.json$', 'mapSetViewJson', {},
        'geocamMapSet_viewJson'),

    url(r'^(?P<username>[^/]+)/(?P<setName>[^/]+)/?$', 'mapSetView', {},
        'geocamMapSet_view'),

    url(r'^(?P<username>[^/]+)/(?P<setName>[^/]+)/edit/$', 'mapSetEdit', {},
        'geocamMapSet_edit'),

    url(r'^sets.json', 'mapSetIndexJson', {},
        'geocamMapSet_indexJson'),

    url(r'^sets/new$', 'mapSetSave', {},
        'geocamMapSet_save'),

    url(r'^sets/$', 'mapSetIndex', {},
        'geocamMapSet_index'),

    url(r'^library/(?P<layer_id>\d+)/$', 'libraryView'),

    url(r'^library/$', 'libraryIndex'),

    url(r'^databrowse/(.*)', databrowse.site.root),

)

mapMixerPatterns = patterns(
    '',

    url(r'^$', 'geocamMapSet.views.app', {},
        'geocamMapMixer_app'),

    url(r'^favicon.ico$', 'django.views.generic.simple.redirect_to',
        {'url': settings.STATIC_URL + 'mixer/icons/mapMixerFavicon.ico', 'permanent': False}),
)
