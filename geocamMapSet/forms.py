# __BEGIN_LICENSE__
# Copyright (C) 2008-2010 United States Government as represented by
# the Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
# __END_LICENSE__

from django import forms
from django.forms import widgets

from geocamMapSet.models import LibraryLayer

class LibraryLayerUploadForm(forms.ModelForm):
    class Meta:
        model = LibraryLayer
        fields = ('localCopy',)

HOSTING_CHOICES = (('external',
                    'Display the externally hosted file (recommended)'),
                   ('local',
                    'Display a copy of the file hosted on this site'
                    ),
                   )

class LibraryLayerUrlForm(forms.ModelForm):
    hosting = forms.ChoiceField(HOSTING_CHOICES)

    class Meta:
        model = LibraryLayer
        fields = ('externalUrl',)

class LibraryLayerMetaForm(forms.ModelForm):
    url = forms.URLField(widget=widgets.TextInput(attrs=dict(size=60)),
                         required=False)
    acceptTerms = forms.BooleanField(label='Terms', required=True)

    class Meta:
        model = LibraryLayer
        fields = ('localCopy',
                  'externalUrl',
                  'name',
                  'description',
                  'coverage',
                  'creator',
                  'contributors',
                  'publisher',
                  'rights',
                  'license',
                  'morePermissions',
                  'acceptTerms',
				  'type',
				  'complete'
                  )
