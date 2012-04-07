# __BEGIN_LICENSE__
# Copyright (C) 2008-2010 United States Government as represented by
# the Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
# __END_LICENSE__

from django.shortcuts import render_to_response, get_object_or_404
from django.template import RequestContext
from geocamMapSet.models import LibraryLayer,MapSet
from django.utils import simplejson
from django.http import HttpResponse

######################################################################
# views for generic map set viewing and editing

def mapSetEdit(request, user_name, set_id):
    return render_to_response('geocamMapSet/mapSetEdit.html', {},
                              context_instance=RequestContext(request))

def mapSetView(request, user_name, set_id):
    mapset = get_object_or_404(MapSet, pk=set_id)
    return HttpResponse(mapset.json, 'application/json')

def mapSetIndex(request):
    json_str = []
    mapsets = MapSet.objects.all()
    for m in mapsets:
        json_str.append(m.json)
    return HttpResponse(json_str, 'application/json')

#def mapSetIndex(request, userName):
#    json_str = []
#    mapsets = get_list_or_404(MapSet, pk=userName)
#    for m in mapsets:
#        json_str.append(m.json)
#    return HttpResponse(json_str, 'application/json')

def mapSetCreate(request):
    return 'implement me'

def libraryView(request, layer_id):
    layer = get_object_or_404(LibraryLayer, pk=layer_id)
    return HttpResponse(layer.json, 'application/json')

def libraryIndex(request):
    json_str = LibraryLayer.getAllLayersInJson()
    return HttpResponse(json_str, 'application/json')

######################################################################
# views specific to mapmixer.org site

# these will be refactored into a separate repo later

def welcome(request):
    return render_to_response('mixer/welcome.html', {},
                              context_instance=RequestContext(request))
