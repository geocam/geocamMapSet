# __BEGIN_LICENSE__
# Copyright (C) 2008-2010 United States Government as represented by
# the Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
# __END_LICENSE__

import re

from django.db import models
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse

from geocamUtil import anyjson as json


class LibraryLayer(models.Model):
    url = models.URLField()
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=255)
    show = models.BooleanField(default=False)
    json = models.TextField()

    def __unicode__(self):
        return self.name

    @classmethod 
    def getAllLayersInJson(cls):
        return json.dumps([json.loads(layer.json) for layer in LibraryLayer.objects.all()],
                          indent=4)

    def setJson(self):
        obj = {'type': 'kml.KML',
               'name': self.name,
               'url': self.url}
        self.json = json.dumps(obj, sort_keys=True, indent=4)


class MapSet(models.Model):
    mtime = models.DateTimeField(null=True, blank=True, auto_now=True)
    # shortName: a version of the name suitable for embedding into a URL (no spaces or special chars)
    shortName = models.CharField(max_length=255, blank=True)
    name = models.CharField(max_length=255, blank=True)
    description = models.CharField(max_length=255, blank=True)
    url = models.URLField(blank=True)
    mapsetjson = models.DecimalField(max_digits=5, decimal_places=2)
    json = models.TextField()
    author = models.ForeignKey(User, null=True, blank=True)

    def __unicode__(self):
        return self.name

    def get_absolute_url(self):
        """
        Return url that fetches the MapSetJSON document for this map set.
        """
        return reverse('geocamMapSet_setJson', args=[self.author.username, self.shortName])

    def getViewUrl(self):
        """
        Return url that gets an HTML page with a map viewing this map set.
        """
        return reverse('geocamMapSet_view', args=[self.author.username, self.shortName])

    @classmethod
    def shortNameFromName(cls, name):
        # switch to lowercase
        name = name.lower()
        # replaces spaces with hyphens
        name = re.sub(' +', '-', name)
        # remove special characters
        name = re.sub('[^a-zA-Z0-9_-]', '', name)
        return name

    @classmethod     
    def fromJSON(cls, userName, shortName, obj):
        vals = {}
        vals['json'] = json.dumps(obj)
        copyFields = ('name',
                      'description',
                      'id',
                      'url',
                      'mapsetjson')
        for field in copyFields:
            val = obj.get(field, None)
            if val is not None:
                vals[field] = val
        vals['author'] = User.objects.get(username=userName)
        vals['shortName'] = shortName
        return MapSet(**vals)

    class Meta:
        ordering = ['-mtime']
            

class MapSetLayer(models.Model):
    name = models.CharField(primary_key=True, max_length=255)
    type = models.CharField(max_length=255)
    url = models.URLField()
    show = models.BooleanField(default=False)
    json = models.TextField()
    mapset = models.ForeignKey(MapSet)

    def __unicode__(self):
        return self.name

    @classmethod     
    def fromJSON(cls, obj):
        vals = {}
        vals['json'] = json.dumps(obj)
        if 'name' in obj:
            vals['name'] = obj['name']
        if 'type' in obj:
            vals['type'] = obj['type']
        if 'url' in obj:
            vals['url'] = obj['url']
        if 'show' in obj:
            vals['show'] = obj['show']
        return MapSetLayer(**vals)



class Extension(models.Model):
    name = models.CharField(primary_key=True, max_length=255)
    url = models.URLField()
    mapset = models.ForeignKey(MapSet)

    def __unicode__(self):
        return self.name

    @classmethod     
    def fromJSON(cls, obj):
        vals = {}
        if 'name' in obj:
            vals['name'] = obj['name']
        if 'url' in obj:
            vals['url'] = obj['url']
        return Extension(**vals)
