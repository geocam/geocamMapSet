# __BEGIN_LICENSE__
# Copyright (C) 2008-2010 United States Government as represented by
# the Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
# __END_LICENSE__

import time
import sys
import os

from django.shortcuts import render_to_response, get_object_or_404
from django.template import RequestContext
from django.http import HttpResponse, HttpResponseNotAllowed, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt

from geocamUtil import anyjson as json

from geocamMapSet.models import LibraryLayer
from geocamMapSet.models import MapSet, MapSetLayer
from geocamMapSet.forms import LibraryLayerUploadForm, \
     LibraryLayerUrlForm, \
     LibraryLayerMetaForm
from geocamMapSet import settings

######################################################################
# views for generic map set viewing and editing

def jsonResponse(x, raw=False):
    if raw:
        text = x
    else:
        text = json.dumps(x, sort_keys=True, indent=4)
    return HttpResponse(text,
                        mimetype='application/json; charset=UTF-8')

def mapSetView(request, userName, shortName):
    mapset = get_object_or_404(MapSet, author__username=userName, shortName=shortName)
    settingsFields = ('GEOCAM_MAP_SET_DISABLE_MAPS',)
    settingsObj = dict(((f, getattr(settings, f)) for f in settingsFields))
    settingsJson = json.dumps(settingsObj, indent=4, sort_keys=True)
    return render_to_response('geocamMapSet/mapSetEdit.html',
                              {'mapset': mapset,
                               'settingsJson': settingsJson},
                              context_instance=RequestContext(request))

#def mapSetView(request, userName, shortName):
#    mapset = get_object_or_404(MapSet, author__username=userName, shortName=shortName)
#    return HttpResponse(mapset.json, 'application/json')


def mapSetIndex(request):
    json_str = []
    mapsets = MapSet.objects.all()
    for m in mapsets:
        json_str.append(m.json)
    return jsonResponse(json_str)


@csrf_exempt
def mapSetSave(request):
    if request.method == 'POST':
        json_data = json.loads(request.raw_post_data)

        mapset = MapSet.fromJSON(json_data)
        mapset.save()

        # if 'extensions' in json_data:
        #     extensions = json_data['extensions']
        #     for extension in extensions.keys():
        #         e = Extension(
        #             name = extension,
        #             url = extensions[extension])
        #         mapset.extension_set.add(e)
        #         e.save()

        # if 'children' in json_data:
        #     children = json_data['children']
        #     for child in children:
        #         c = MapSetLayer.fromJSON(child)
        #         mapset.mapsetlayer_set.add(c)
        #         c.save()

    return HttpResponse("OK")


def mapSetCreate(request):
    return 'implement me'


def libraryView(request, layer_id):
    layer = get_object_or_404(LibraryLayer, pk=layer_id)
    return jsonResponse(layer.json, raw=True)


def libraryIndex(request):
    json_str = LibraryLayer.getAllLayersInJson()
    return HttpResponse(json_str, 'application/json')


def mapSetDashboard(request):
    return render_to_response('geocamMapSet/mapSetDashboard.html', {},
                              context_instance=RequestContext(request))


def mapSetSetsJson(request):
    obj = [dict(url=s.get_absolute_url(),
                viewUrl=s.getViewUrl(),
                name=s.name,
                author=s.author.username)
           for s in MapSet.objects.all()]
    return HttpResponse(json.dumps(obj), mimetype='application/json')

# def mapSetById(request, setId):
#     if request.method == 'POST':
#         return postMapSet(request)
#     else:
#         s = get_object_or_404(MapSet, pk=setId)
#         return HttpResponse(s.json, mimetype='application/json')


@csrf_exempt
def mapSetSet(request, userName, shortName):
    if request.method == 'POST':
        json_data = json.loads(request.raw_post_data)
        mapset = MapSet.fromJSON(userName, shortName, json_data)
        mapset.save()
        return HttpResponse("OK")
    else:
        # get: user is requesting map set
        s = get_object_or_404(MapSet,
                              author__username=userName,
                              shortName=shortName)
        return jsonResponse(s.json, raw=True)


def importLayerForm(request):
    if request.method == 'POST':
        form = LibraryLayerForm(request.POST)
        print >> sys.stderr, 'raw_post_data:'
        print >> sys.stderr, request.raw_post_data
        if form.is_valid():
            layer = form.save(commit=False)
            layer.setJson()
            layer.save()
            return jsonResponse(layer.json, raw=True)
    else:
        form = LibraryLayerForm()
    return render_to_response('geocamMapSet/importLayerForm.html',
                              {'form': form},
                              context_instance=RequestContext(request))

@csrf_exempt
def layerJson(request, layerId):
    layer = get_object_or_404(LibraryLayer, id=layerId)
    if request.method in ('PUT', 'POST'):
        layerObject = json.loads(request.raw_post_data)
        if 'id' in layerObject:
            assert layerObject['id'] == layerId
        else:
            layerObject['id'] = layerId
        form = LibraryLayerMetaForm(layerObject)
        if form.is_valid():
            updatedLayer = form.save(commit=False)
            keepFields = ('id', 'externalUrl', 'localCopy')
            for f in keepFields:
                setattr(updatedLayer, f, getattr(layer, f))
            updatedLayer.complete = True
            updatedLayer.setJson()
            updatedLayer.save()
            return jsonResponse(updatedLayer.json, raw=True)
        else:
            return jsonFormErrorsResponse(form)
    elif request.method == 'GET':
        return jsonResponse(layer.json, raw=True)
    else:
        return HttpResponseNotAllowed(('PUT', 'POST', 'GET'))

def jsonErrorResponse(error):
    return HttpResponseBadRequest(json.dumps({'error': error},
                                             sort_keys=True,
                                             indent=4),
                                  mimetype='application/json; charset=UTF-8')


def jsonFormErrorsResponse(form):
    errorDict = dict(((k, v) for k, v in form.errors.iteritems()))
    return HttpResponseBadRequest(json.dumps({'error': errorDict},
                                             sort_keys=True,
                                             indent=4),
                                  mimetype='application/json; charset=UTF-8')

@csrf_exempt
def newLayer(request):
    if request.method == 'POST':
        layerObject = json.loads(request.raw_post_data)
        if 'externalUrl' in layerObject:
            form = LibraryLayerUrlForm(layerObject)
            layer = form.save()
        else:
            print >> sys.stderr, request.raw_post_data
            return jsonErrorResponse('did not get expected fields')
        layer.setJson()
        layer.save()
        return jsonResponse({'result': json.loads(layer.json)})
    else:
        return HttpResponseNotAllowed(('POST',))

@csrf_exempt
def layerUpload(request):
    if request.method == 'POST':
        form = LibraryLayerUploadForm(request.POST, request.FILES)
        if form.is_valid():
            layer = form.save()
            if layer.externalUrl:
                layer.name = os.path.basename(layer.externalUrl)
            elif layer.localCopy:
                pass # figure this out
            layer.setJson()
            layer.save()
            return jsonResponse({'result': json.loads(layer.json)})
        else:
            return jsonFormErrorsResponse(form)
    else:
        return HttpResponseNotAllowed(('POST',))
