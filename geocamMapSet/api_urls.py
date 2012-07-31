# __BEGIN_LICENSE__
# Copyright (C) 2008-2010 United States Government as represented by
# the Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
# __END_LICENSE__

from django.conf.urls.defaults import url, patterns
from geocamMapSet import settings
from geocamMapSet.handlers import LayerHandler, MapSetHandler
from piston.resource import Resource

layer_handler = Resource(LayerHandler)
mapset_handler = Resource(MapSetHandler)

urlpatterns = patterns(
    '',
    url(r'^layers/$', layer_handler),
    url(r'^layer/(?P<id>\d+)$', layer_handler),
    url(r'^mapsets/$', mapset_handler),
    url(r'^mapset/(?P<username>[^/]+)/?$', mapset_handler),
    url(r'^mapset/(?P<username>[^/]+)/(?P<shortname>[^/]+)$', mapset_handler, name='mapset_resource'),
    #url(r'^mapset/(?P<id>\d+)$', mapset_handler),
)
