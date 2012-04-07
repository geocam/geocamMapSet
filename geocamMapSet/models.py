# __BEGIN_LICENSE__
# Copyright (C) 2008-2010 United States Government as represented by
# the Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
# __END_LICENSE__

from django.db import models



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
    name = models.CharField(max_length=255, blank=True)
    description = models.CharField(max_length=255, blank=True)
    url = models.URLField(blank=True)
    mapsetjson = models.DecimalField(max_digits=5, decimal_places=2)
    json = models.TextField()

    def __unicode__(self):
        return self.name

    @classmethod     
    def fromJSON(cls, json):
        vals = {}
        vals['json'] = json
        if 'name' in json: 
            vals['name'] = json['name']
        if 'description' in json:
            vals['description'] = json['description']
        if 'url' in json: 
            vals['url'] = json['url']
        if 'mapsetjson' in json: 
            vals['mapsetjson'] = json['mapsetjson']
        return MapSet(**vals)


            
class MapSetLayer(models.Model):
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=255)
    url = models.URLField()
    show = models.BooleanField(default=False)
    json = models.TextField()
    mapset = models.ForeignKey(MapSet)

    def __unicode__(self):
        return self.name

    @classmethod     
    def fromJSON(cls, json):
        vals = {}
        vals['json'] = json
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
    name = models.CharField(max_length=255)
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



