from piston.handler import BaseHandler
from piston.utils import rc
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
from django.http import HttpResponse
from geocamMapSet.models import MapSet, LibraryLayer

class LayerHandler(BaseHandler):
    model = LibraryLayer
    exclude = ()


class MapSetHandler(BaseHandler):
    model = MapSet

    def _fetch(self, username, shortname, *args, **kwargs):
        if username and shortname:
            try:
                return self.queryset.get(author__username=username, shortName=shortname)
            except ObjectDoesNotExist:
                return rc.NOT_FOUND
            except MultipleObjectsReturned:
                return rc.BAD_REQUEST
        else:
            return self.queryset.filter(*args, **kwargs)

    def read(self, request, username=None, shortname=None):
        return self._fetch(username, shortname)

    def create(self, request, *args, **kwargs):
        return super(MapSetHandler, self).create(request, *args, **kwargs)
        
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
