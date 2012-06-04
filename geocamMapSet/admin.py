# __BEGIN_LICENSE__
# Copyright (C) 2008-2010 United States Government as represented by
# the Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
# __END_LICENSE__

from django.contrib import admin
from geocamMapSet.models import *

admin.site.register(LibraryLayer)
admin.site.register(MapSet)
admin.site.register(MapSetLayer)
