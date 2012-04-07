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
        layer_list = Layer.objects.all()
        json_list = []
        for layer in layer_list:
            json_list.append(layer.json)    
                
        return "[" +  ",".join(json_list) + "]"



class MapSet(models.Model):
    name = models.CharField(max_length=255, blank=True)
    description = models.CharField(max_length=255, blank=True)
    mapsetjson = models.DecimalField(max_digits=5, decimal_places=2)
    url = models.URLField(blank=True)
    json = models.TextField()
    # extensions held in separate table
    # mapsetlayer held in separate table

    def __unicode__(self):
        return self.name



class MapSetLayer(models.Model):
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=255)
    url = models.URLField()
    show = models.BooleanField(default=False)
    json = models.TextField()
    mapset = models.ForeignKey(MapSet)

    def __unicode__(self):
        return self.name



class Extension(models.Model):
    name = models.CharField(max_length=255)
    url = models.URLField()
    mapset = models.ForeignKey(MapSet)

    def __unicode__(self):
        return self.name



