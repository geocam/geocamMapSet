# __BEGIN_LICENSE__
# Copyright (C) 2008-2010 United States Government as represented by
# the Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
# __END_LICENSE__

from django.conf.urls.defaults import url, patterns
from geocamMapSet import settings
from geocamMapSet.handlers import LayerHandler, MapSetHandler
from piston.resource import Resource

urlpatterns = patterns(
    '',
    url(r'^layers/$', Resource(LayerHandler)),
    url(r'^layer/(?P<id>\d+)$', Resource(LayerHandler)),
    url(r'^mapsets/$', Resource(MapSetHandler)),
    url(r'^mapset/(?P<id>\d+)$', Resource(MapSetHandler)),
)
