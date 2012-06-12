# __BEGIN_LICENSE__
# Copyright (C) 2008-2010 United States Government as represented by
# the Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
# __END_LICENSE__

from django.conf.urls.defaults import url, patterns
from geocamMapSet import settings

# web pages:

# home/ <- landing screen for a user, with map sets they can edit (for now, each set will have a single owner)
#   [create a map set]
#   map set 1
#   map set 2
#   ...
# <user>/<set_id>/ <- viewer for map set, can enable editing. editor allows importing a new layer

# api hooks:

# <user>/<set_id>.json <- fetch map set, post to save a map set
# layer/<user>/<layer_id>.json <- fetch layer info, post to import a layer
# library.json <- all layers, as map set
# sets.json <- list of metadata about all map sets: username and set_id

urlpatterns = patterns(
    'geocamMapSet.views',

    url(r'^home/$', 'mapSetDashboard', {},
        'geocamMapSet_dashboard'),

    url(r'^sets.json$', 'mapSetSetsJson', {},
        'geocamMapSet_setsJson'),

    url(r'^map/(?P<userName>[^/]+)/(?P<shortName>[^/]+).json$', 'mapSetSet', {},
        'geocamMapSet_setJson'),

    url(r'^createSet/$', 'mapSetCreate', {},
        'geocamMapSet_create'),

    url(r'^map/(?P<userName>[^/]+)/(?P<shortName>[^/]+)/$', 'mapSetView', {},
        'geocamMapSet_view'),

#    url(r'^(?P<user_name>[^/]+)/(?P<set_id>[^/]+)/edit/$', 'mapSetEdit', {},
#        'geocamMapSet_edit'),

    url(r'^sets/new$', 'mapSetSave', {},
        'geocamMapSet_save'),

    url(r'^sets/$', 'mapSetIndex', {},
        'geocamMapSet_index'),

    url(r'^library/(?P<layer_id>\d+)/$', 'libraryView'),

    url(r'^library.json$', 'libraryIndex', {},
        'geocamMapSet_libraryIndex'),

    url(r'^importLayerForm/$', 'importLayerForm', {},
        'geocamMapSet_importLayerForm'),

    url(r'^layer/(?P<layerId>[^/]+).json$', 'layerJson', {},
        'geocamMapSet_layerJson'),

    url(r'^layer/create/$', 'createLayer', {},
        'geocamMapSet_createLayer'),
)

mapMixerPatterns = patterns(
    '',

    url(r'^$', 'geocamMapSet.views.welcome', {},
        'geocamMapMixer_welcome'),

    url(r'^favicon.ico$', 'django.views.generic.simple.redirect_to',
        {'url': settings.STATIC_URL + 'mixer/icons/mapMixerFavicon.ico', 'permanent': False}),
)
