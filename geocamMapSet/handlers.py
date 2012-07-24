from piston.handler import BaseHandler
from geocamMapSet.models import MapSet, LibraryLayer

class LayerHandler(BaseHandler):
    model = LibraryLayer


class MapSetHandler(BaseHandler):
    model = MapSet
