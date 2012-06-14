# __BEGIN_LICENSE__
# Copyright (C) 2008-2010 United States Government as represented by
# the Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
# __END_LICENSE__

from django import forms
from django.forms import widgets

from geocamMapSet.models import LibraryLayer

class LibraryLayerForm(forms.ModelForm):
    url = forms.URLField(widget=widgets.TextInput(attrs=dict(size=60)))
    acceptTerms = forms.BooleanField(required=True)

    class Meta:
        model = LibraryLayer
        fields = ('url',
                  'acceptTerms',
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
