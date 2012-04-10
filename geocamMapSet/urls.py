# __BEGIN_LICENSE__
# Copyright (C) 2008-2010 United States Government as represented by
# the Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
# __END_LICENSE__

from django.conf.urls.defaults import url, patterns

from geocamMapSet import settings

urlpatterns = patterns(
    'geocamMapSet.views',

    url(r'^(?P<userName>[^/]+)/(?P<setName>[^/]+)/$', 'mapSetView', {},
        'geocamMapSet_view'),

    url(r'^(?P<userName>[^/]+)/(?P<setName>[^/]+)/edit/$', 'mapSetEdit', {},
        'geocamMapSet_edit'),

    url(r'^m/sets/$', 'mapSetIndex', {},
        'geocamMapSet_index'),

    url(r'^m/createSet/$', 'mapSetCreate', {},
        'geocamMapSet_create'),

    url(r'^library/(?P<layer_id>\d+)/$', 'libraryView'),

    url(r'^library/$', 'libraryIndex'),
)

mapMixerPatterns = patterns(
    '',

    url(r'^$', 'geocamMapSet.views.welcome', {},
        'geocamMapMixer_welcome'),

    url(r'^favicon.ico$', 'django.views.generic.simple.redirect_to',
        {'url': settings.STATIC_URL + 'mixer/icons/mapMixerFavicon.ico', 'permanent': False}),
)
