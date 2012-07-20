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


###
# URLs that return or accept JSON

urlpatterns = patterns(
    'geocamMapSet.views',

    # Retrieve a list of all library layers (JSON), without ID
    url(r'^library.json$', 'libraryIndex', {},
        'geocamMapSet_libraryIndex'),

    # Retrieve a specific library layer (JSON), without ID
    url(r'^library/(?P<layer_id>\d+)/$', 'libraryView'),

    # get returns json meta-data. ( identical to libraryView!!! )
    # put/post updates json meta-data. ( requires an additional "acceptTerms": true field in the JSON )
    url(r'^layer/(?P<layerId>[^/]+).json$', 'layerJson', {},
        'geocamMapSet_layerJson'),

    # A list of all mapset names and urls, e.g.:
    # {"url": "/map/alice/hurricane-irene-2011.json", "viewUrl": "/map/alice/hurricane-irene-2011/", "name": "Hurricane Irene 2011", "author": "alice"}]
    url(r'^sets.json$', 'mapSetSetsJson', {},
        'geocamMapSet_setsJson'),

    # Return a list of all MapSets as MapSetJSON objects, UTF-8 encoded.  e.g.:
    #     [ "{ \"name\": \"Hurricane Irene 2011\", \"id\": \"1\", \"mapsetjson\": \"0.1\",\"type\": \"Document\",\"extensions\": {\"kml\": \"http://mapmixer.org/mapsetjson/ext/kml/0.1/\",\"geojson\": \"http://mapmixer.org/mapsetjson/ext/geojson/0.1/\"},\"children\": [{ \"type\": \"kml.KML\", \"name\": \"US Significant River Flood Outlook\", \"url\": \"http://www.hpc.ncep.noaa.gov/kml/fop/fopbody.kml\" } ]}" ]
    url(r'^sets/$', 'mapSetIndex', {},
        'geocamMapSet_index'),

    # GET: Retreive mapset JSON for the MapSet with given userName and shortName
    # POST: Create or update a mapset with this userName and shortName using submitted JSON
    url(r'^map/(?P<userName>[^/]+)/(?P<shortName>[^/]+).json$', 'mapSetSet', {},
        'geocamMapSet_setJson'),

    # Create OR Update from a MapSetJSON representation
    url(r'^sets/new$', 'mapSetSave', {},
        'geocamMapSet_save'),

    # Not implemented.  mapSetSave can create a set.  Remove this?
    url(r'^createSet/$', 'mapSetCreate', {},
        'geocamMapSet_create'),
)

###
# Urls pertaining to new Layer form handling

urlpatterns += patterns(
    'geocamMapSet.views',


    # GET renders the form as HTML
    # POST accepts HTML form data, and returns a JSON representation of the new layer
    # (It's not clear if POST is used by the original client)
    url(r'^importLayerForm/$', 'importLayerForm', {},
        'geocamMapSet_importLayerForm'),

    # post json to create a new layer. response is json meta-data.
    # Note: To best fit our API concept, ideally we would have a single
    # url for creating a new layer that accepts multipart form data
    # where the header is json and the body is an attached file.
    # However, the browser-side FormData object doesn't currently
    # support that very well.  So we offer two urls: the standard url
    # accepts just json in case you don't need a file payload, and the
    # 'upload' url accepts multipart form data with a url-encoded header
    # and an attached file. (More accurately, we could put in a
    # url-encoded header but right now it's expected to be blank.)
    url(r'^layer/new/$', 'newLayer', {},
        'geocamMapSet_newLayer'),

    # post a file to create a new layer. response is json meta-data.
    url(r'^layer/new/upload/$', 'layerUpload', {},
        'geocamMapSet_layerUpload'),
)


###
# Urls that return HTML responses
urlpatterns += patterns(
    'geocamMapSet.views',

    url(r'^home/$', 'mapSetDashboard', {},
        'geocamMapSet_dashboard'),
    # HTML view of the specified mapset.
    # Remove trailing slash?
    url(r'^map/(?P<userName>[^/]+)/(?P<shortName>[^/]+)/$', 'mapSetView', {},
        'geocamMapSet_view'),

)

mapMixerPatterns = patterns(
    '',

    url(r'^$', 'geocamMapSet.views.welcome', {},
        'geocamMapMixer_welcome'),

    url(r'^favicon.ico$', 'django.views.generic.simple.redirect_to',
        {'url': settings.STATIC_URL + 'mixer/icons/mapMixerFavicon.ico', 'permanent': False}),
)
