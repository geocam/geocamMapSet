import json
from piston.handler import BaseHandler
from piston.utils import rc
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
from django.http import HttpResponse
from django.db.models.query import QuerySet
from geocamMapSet.models import MapSet, LibraryLayer

"""
HANDY REFERENCE:

django-piston uses the following HTTP request to CRUD operation mapping:
GET -> read
POST -> create
PUT -> update
DELETE -> delete

"""

def BadRequestResponse(msg):
    "Shortcut to generate a 400 Response with some additional error info"
    response = rc.BAD_REQUEST
    response.content += ": " + msg
    return response


class LayerHandler(BaseHandler):
    model = LibraryLayer
    exclude = ()


class MapSetHandler(BaseHandler):
    model = MapSet

    def _fetch(self, username, shortname, *args, **kwargs):
        if username and shortname:
            try:
                return self.model.objects.get(author__username=username, shortName=shortname)
            except ObjectDoesNotExist:
                return rc.NOT_FOUND
            except MultipleObjectsReturned:
                return rc.DUPLICATE_ENTRY
        else:
            return self.model.objects.filter(*args, **kwargs)

    def read(self, request, username=None, shortname=None):
        if username and not shortname:
            return BadRequestResponse("Username given, but no slug")
        result = self._fetch(username, shortname)
        if isinstance(result, HttpResponse):
            return result
        if isinstance(result, QuerySet):    
            # it's a bit lame that we have to deserialize and reserialize again...
            return json.dumps( list(json.loads(inst.json) for inst in result) )
        else:
            return result.json

    def create(self, request, username='alice', shortname=None, *args, **kwargs):
        # return super(MapSetHandler, self).create(request, *args, **kwargs)
        if username and shortname:
            return BadRequestResponse("Declining to create a resource because a username and slug were given in the URL.")
        assert request.META['CONTENT_TYPE'] == 'application/json'
        attrs = self.flatten_dict(request.data)
        inst = self.model.fromJSON(username, None, attrs)
        inst.save()
        return inst.json
        
        
    def update(self, request, username=None, shortname=None):
        if not (username and shortname):
            return BadRequestResponse("Username and slug are both required for update operation.") 
        obj = self._fetch(username, shortname)
        if isinstance(obj, HttpResponse):
            # Error condition
            return obj
        else:
            return super(MapSetHandler, self).update(request, *args, pk=obj.pk, **kwargs)


    def delete(self, request, username=None, shortname=None):
        if not (username and shortname):
            return BadRequestResponse("Username and slug are both required for delete operation.") 
        obj = self._fetch(username, shortname)
        if isinstance(obj, HttpResponse):
            # Error condition
            return obj
        else:
            obj.delete()
            return rc.DELETED
