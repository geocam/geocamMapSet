import json
from piston.handler import BaseHandler
from piston.utils import rc
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
from django.http import HttpResponse
from django.db.models.query import QuerySet
from geocamMapSet.models import MapSet, LibraryLayer

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
                return rc.BAD_REQUEST
        else:
            return self.model.objects.filter(*args, **kwargs)

    def read(self, request, username=None, shortname=None):
        if username and not shortname:
            return rc.BAD_REQUEST
        result = self._fetch(username, shortname)
        if isinstance(result, QuerySet):    
            # it's a bit lame that we have to deserialize and reserialize again...
            return json.dumps( list(json.loads(inst.json) for inst in result) )
        else:
            return result.json

    def create(self, request, username='alice', *args, **kwargs):
        # return super(MapSetHandler, self).create(request, *args, **kwargs)
        attrs = self.flatten_dict(request.data)

        try:
            inst = self.queryset(request).get(**attrs)
            return rc.DUPLICATE_ENTRY
        except self.model.DoesNotExist:
            inst = self.model.fromJSON(username, None, attrs)
            inst.save()
            return inst
        except self.model.MultipleObjectsReturned:
            return rc.DUPLICATE_ENTRY
        
        
    def update(self, request, username=None, shortname=None):
        if not (username and shortname):
            return rc.BAD_REQUEST
        obj = self._fetch(username, shortname)
        if isinstance(obj, HttpResponse):
            # Error condition
            return obj
        else:
            return super(MapSetHandler, self).update(request, *args, pk=obj.pk, **kwargs)


    def delete(self, request, username=None, shortname=None):
        if not (username and shortname):
            return rc.BAD_REQUEST
        obj = self._fetch(username, shortname)
        if isinstance(obj, HttpResponse):
            # Error condition
            return obj
        else:
            obj.delete()
            return rc.DELETED
