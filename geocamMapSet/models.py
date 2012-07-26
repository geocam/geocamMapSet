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

from django.db.models.signals import pre_save
from django.dispatch import receiver

from geocamUtil import anyjson as json
from geocamMapSet import settings
storage_backend = getattr(settings, 'STORAGE_BACKEND', None)
if not storage_backend:
    from django.core.files.storage import default_storage
    storage_backend = default_storage

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
                                 upload_to=os.path.join('geocamMapSet', 'layers'),
                                 storage=storage_backend)
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
    acceptTerms = models.BooleanField(verbose_name='Terms', default=True) # Since False values here shouldn't get past client-side form validation if this field isn't true, I'm not sure we actually need this in the DB.
    #json = models.TextField()

    class Meta:
        ordering = ('-mtime',)

    def __unicode__(self):
        return ' '.join((self.name, self.externalUrl))

    def get_absolute_url(self):
        return reverse('geocamMapSet_layerJson', args=[self.id])

    @property
    def url(self):
        if self.localCopy:
            return self.localCopy.url
        else:
            return self.externalUrl

    @url.setter
    def url(self, value):
        if self.localCopy:
            raise Exception("url was set on a library instance where url points to a local file.")
        else:
            self.externalUrl = value

    json_fields = ('name',
              'description',
              'coverage',
              'creator',
              'contributors',
              'publisher',
              'rights',
              'license',
              'morePermissions',
              'type',
              'url'
              )

    @property
    def json(self):
        '''
        A replacement for the old json TextField property that exists to hopefully allow backwards compatability, 
        while eliminating the json blob being stored in the DB.
        '''
        obj = {}
        for f in self.json_fields:
            val = getattr(self, f)
            if val not in (None, ""):
                obj[f] = val
        obj['metaUrl'] = self.get_absolute_url()
        obj.setdefault('type', 'kml.KML')
        return json.dumps(obj, sort_keys=True, indent=4)

    @json.setter
    def json(self, value):
        obj = json.loads(value)
        for k in obj.keys():
            if k in self.json_fields:
                setattr(self, k, obj[k])
            else:
                raise AttributeError("Tried to set a JSON value with a key (%s) not listed in LibaryLayer.json_fields" % k)

    @classmethod 
    def getAllLayersInJson(cls):
        return json.dumps([json.loads(layer.json)
                           for layer in LibraryLayer.objects.all()
                           if layer.complete],
                          indent=4)

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
        
        # check for existing similar shortnames
        similar_names = set( ms.name for ms in cls.objects.filter(shortName__startswith=name).only('shortName') )
        if similar_names:
            root = name
            i = 0
            while name in similar_names:
                i += 1
                name = root + '-%d' % i

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
            
@receiver(pre_save, sender=MapSet)
def mapset_pre_save(sender, instance, raw, *args, **kwargs):
    '''
    Pre-save signal handler.
    Ensure that a shortName is assigned before save.
    '''
    if not raw:
        if not instance.shortName:
            instance.shortName = sender.shortNameFromName(instance.name)

class MapSetLayer(models.Model):
    name = models.CharField(primary_key=True, max_length=255)
    type = models.CharField(max_length=255)
    url = models.URLField()
    show = models.BooleanField(default=False)
    #json = models.TextField()
    mapset = models.ForeignKey(MapSet)

    def __unicode__(self):
        return self.name

    @property
    def json(self):
        return json.dumps( dict( (k, getattr(self, k)) for k in ('name', 'type', 'url') ) )

    @json.setter
    def json(self, value):
        for k,v in json.loads(value):
            setattr(self, k, v)

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
