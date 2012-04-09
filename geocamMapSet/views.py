# __BEGIN_LICENSE__
# Copyright (C) 2008-2010 United States Government as represented by
# the Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
# __END_LICENSE__

from django.shortcuts import render_to_response, get_object_or_404
from django.template import RequestContext
from geocamMapSet.models import Layer
from django.utils import simplejson
from django.http import HttpResponse

def index(request):
    return render_to_response('index.html', None, context_instance=RequestContext(request))

def library_index(request):    
    json_str = Layer.getAllLayersInJson()
    return HttpResponse(json_str, 'application/json')
                      
def library_detail(request, layer_id):
    layer = get_object_or_404(Layer, pk=layer_id)    
    return HttpResponse(layer.json, 'application/json')
