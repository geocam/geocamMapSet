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

LICENSE_CHOICES = (('http://creativecommons.org/publicdomain/mark/1.0/',
                    'Public Domain'),

                   ('http://creativecommons.org/licenses/by/3.0',
                    'Creative Commons CC-BY'),

                   ('http://creativecommons.org/licenses/by-nd/3.0',
                    'Creative Commons CC-BY-ND'),

                   ('http://creativecommons.org/licenses/by-nc-sa/3.0',
                    'Creative Commons CC-BY-NC-SA'),

                   ('http://creativecommons.org/licenses/by-sa/3.0',
                    'Creative Commons CC-BY-SA'),

                   ('http://creativecommons.org/licenses/by-nc/3.0',
                    'Creative Commons CC-BY-NC'),

                   ('http://creativecommons.org/licenses/by-nc-nd/3.0',
                    'Creative Commons CC-BY-NC-ND'),

                   )


class LibraryLayer(models.Model):
    mtime = models.DateTimeField(null=True, blank=True, auto_now=True)
    url = models.URLField(verify_exists=False)
    acceptTerms = models.BooleanField(verbose_name='Terms', blank=False)
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
                              choices=LICENSE_CHOICES)
    morePermissions = models.TextField(blank=True,
                                       verbose_name='Other permissions')
    json = models.TextField()

    class Meta:
        ordering = ('-mtime',)

    def __unicode__(self):
        return self.name

    @classmethod 
    def getAllLayersInJson(cls):
        return json.dumps([json.loads(layer.json) for layer in LibraryLayer.objects.all()],
                          indent=4)

    def setJson(self):
        fields = ('url',
                  'name',
                  'description',
                  'coverage',
                  'creator',
                  'contributors',
                  'publisher',
                  'rights',
                  'license',
                  'morePermissions',
                  )
        obj = dict(((f, getattr(self, f)) for f in fields))
        obj.setdefault('type', 'kml.KML')
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
