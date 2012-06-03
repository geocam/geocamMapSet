# __BEGIN_LICENSE__
# Copyright (C) 2008-2010 United States Government as represented by
# the Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
# __END_LICENSE__

from django.db import models
from django.utils import simplejson
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse


class LibraryLayer(models.Model):
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=255)
    url = models.URLField()
    show = models.BooleanField(default=False)
    json = models.TextField()

    def __unicode__(self):
        return self.name

    @classmethod 
    def getAllLayersInJson(cls):
        layer_list = LibraryLayer.objects.all()
        json_list = []
        for layer in layer_list:
            json_list.append(layer.json)    
                
        return "[" +  ",".join(json_list) + "]"



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
    def fromJSON(cls, json):
        # json is literally a simplejson object
        vals = {}
        vals['json'] = simplejson.dumps(json)
        if 'name' in json: 
            vals['name'] = json['name']
        if 'description' in json:
            vals['description'] = json['description']
        if 'id' in json:
            vals['id'] = json['id']
        if 'url' in json: 
            vals['url'] = json['url']
        if 'mapsetjson' in json: 
            vals['mapsetjson'] = json['mapsetjson']
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
    def fromJSON(cls, json):
        # json is literally a simplejson object
        vals = {}
        vals['json'] = simplejson.dumps(json)
        if 'name' in json: 
            vals['name'] = json['name']
        if 'type' in json: 
            vals['type'] = json['type']
        if 'url' in json: 
            vals['url'] = json['url']
        if 'show' in json: 
            vals['show'] = json['show']
        return MapSetLayer(**vals)



class Extension(models.Model):
    name = models.CharField(primary_key=True, max_length=255)
    url = models.URLField()
    mapset = models.ForeignKey(MapSet)

    def __unicode__(self):
        return self.name

    @classmethod     
    def fromJSON(cls, json):
        vals = {}
        if 'name' in json: 
            vals['name'] = json['name']
        if 'url' in json: 
            vals['url'] = json['url']
        return Extension(**vals)



