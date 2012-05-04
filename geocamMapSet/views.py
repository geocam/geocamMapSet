# __BEGIN_LICENSE__
# Copyright (C) 2008-2010 United States Government as represented by
# the Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
# __END_LICENSE__

from django.shortcuts import render_to_response, get_object_or_404
from django.template import RequestContext
from geocamMapSet.models import LibraryLayer
from geocamMapSet.models import MapSet, MapSetLayer, Extension
from django.utils import simplejson
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
import time

######################################################################
# views for generic map set viewing and editing

def mapSetEdit(request, username, setName):
    return render_to_response('geocamMapSet/mapSetEdit.html', {},
                              context_instance=RequestContext(request))

def mapSetViewJson(request, username, setName):
    mapset = get_object_or_404(MapSet, name=setName)
    return HttpResponse(mapset.json, 'application/json')

def mapSetView(request, username, setName):
    mapset = get_object_or_404(MapSet, name=setName)
    return render_to_response('geocamMapSet/mapSetEdit.html', {},
                              context_instance=RequestContext(request))

def mapSetIndex(request):
    json_str = []
    mapsets = MapSet.objects.all()
    for m in mapsets:
        json_str.append(m.json)
    return HttpResponse(json_str, 'application/json')

@csrf_exempt
def mapSetSave(request):
    if request.method == 'POST':
        json_data = simplejson.loads(request.raw_post_data)

        mapset = MapSet.fromJSON(json_data)
        mapset.save()

        if 'extensions' in json_data:
            extensions = json_data['extensions']
            for extension in extensions.keys():
                e = Extension(
                    name = extension,
                    url = extensions[extension])
                mapset.extension_set.add(e)
                e.save()

        if 'children' in json_data:
            children = json_data['children']
            for child in children:
                c = MapSetLayer.fromJSON(child)
                mapset.mapsetlayer_set.add(c)
                c.save()

    return HttpResponse("OK")

def mapSetCreate(request):
    return 'implement me'

def libraryView(request, layer_id):
    layer = get_object_or_404(LibraryLayer, pk=layer_id)
    return HttpResponse(layer.json, 'application/json')

def libraryIndex(request):
    json_str = LibraryLayer.getAllLayersInJson()
    return HttpResponse(json_str, 'application/json')

def dashboard(request):
    return render_to_response('geocamMapSet/dashboard.html',
                              {'mapSets': MapSet.objects.all()},
                              context_instance=RequestContext(request))

######################################################################
# views specific to mapmixer.org site

# these will be refactored into a separate repo later

def welcome(request):
    if request.user.is_authenticated():
        return dashboard(request)
    else:
        return render_to_response('mixer/welcome.html', {},
                                  context_instance=RequestContext(request))
