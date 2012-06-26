# __BEGIN_LICENSE__
# Copyright (C) 2008-2010 United States Government as represented by
# the Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
# __END_LICENSE__

import re
import os

from django.db import models
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse

from geocamUtil import anyjson as json
from geocamMapSet import settings


class LibraryLayer(models.Model):
    mtime = models.DateTimeField(null=True, blank=True, auto_now=True)
    author = models.ForeignKey(User, null=True, blank=True)

    # A layer is basically a pointer to a map file. If there is a local
    # copy, we'll give the local URL to users (local hosting). Otherwise
    # we'll give them the external URL (external hosting). Keeping track
    # of both lets us provide a way for the layer editor to refresh the
    # local copy (and later support automated refresh). If the user
    # created the layer by uploading a file, the externalUrl will be
    # unspecified.
    localCopy = models.FileField(null=True, blank=True,
                                 upload_to=os.path.join('geocamMapSet', 'layers'))
    externalUrl = models.URLField(blank=True, verify_exists=False)

    # Layer creation is a 2-step process where a file must be selected
    # first and required meta-data is entered later. The 'complete' flag
    # marks layer entries where both steps are done. Incomplete layers
    # should not be displayed in the user interface.
    complete = models.BooleanField()

    name = models.CharField(max_length=255)
    type = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    coverage = models.CharField(max_length=255, blank=True,
                                verbose_name='Region covered by the layer')
    creator = models.CharField(max_length=255, blank=True)
    contributors = models.CharField(max_length=512, blank=True,
                                    verbose_name='Other contributors')
    publisher = models.CharField(max_length=255, blank=True)
    rights = models.CharField(max_length=255, blank=True,
                              verbose_name='Copyright information')
    license = models.URLField(verify_exists=False, blank=True,
                              verbose_name='License',
                              choices=settings.LICENSE_CHOICES)
    morePermissions = models.TextField(blank=True,
                                       verbose_name='Other permissions')
    acceptTerms = models.BooleanField(verbose_name='Terms')
    json = models.TextField()

    class Meta:
        ordering = ('-mtime',)

    def __unicode__(self):
        return ' '.join((self.name, self.externalUrl))

    def get_absolute_url(self):
        return reverse('geocamMapSet_layerJson', args=[self.id])

    @classmethod 
    def getAllLayersInJson(cls):
        return json.dumps([json.loads(layer.json)
                           for layer in LibraryLayer.objects.all()
                           if layer.complete],
                          indent=4)

    def setJson(self):
        fields = ('name',
                  'description',
                  'coverage',
                  'creator',
                  'contributors',
                  'publisher',
                  'rights',
                  'license',
                  'morePermissions',
                  )
        obj = {}
        for f in fields:
            val = getattr(self, f)
            if val not in (None, ""):
                obj[f] = val
        if self.localCopy:
            obj['url'] = self.localCopy.url
        else:
            obj['url'] = self.externalUrl
        obj['metaUrl'] = self.get_absolute_url()
        obj.setdefault('type', 'kml.KML')
        self.json = json.dumps(obj, sort_keys=True, indent=4)


class MapSet(models.Model):
    mtime = models.DateTimeField(null=True, blank=True, auto_now=True)
    author = models.ForeignKey(User, null=True, blank=True)
    # shortName: a version of the name suitable for embedding into a URL (no spaces or special chars)
    shortName = models.CharField(max_length=255, blank=True)
    name = models.CharField(max_length=255, blank=True)
    description = models.CharField(max_length=255, blank=True)
    url = models.URLField(blank=True)
    mapsetjson = models.DecimalField(max_digits=5, decimal_places=2)
    json = models.TextField()

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
