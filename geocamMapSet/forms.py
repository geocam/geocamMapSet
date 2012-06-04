# __BEGIN_LICENSE__
# Copyright (C) 2008-2010 United States Government as represented by
# the Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
# __END_LICENSE__

from django import forms

from geocamMapSet.models import LibraryLayer

class LibraryLayerForm(forms.ModelForm):
    class Meta:
        model = LibraryLayer
        fields = ('url', 'name')
