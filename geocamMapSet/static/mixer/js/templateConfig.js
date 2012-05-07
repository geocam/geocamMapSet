// interpret underscore templates django-style -- {{ var }}
_.templateSettings.interpolate = /\{\{(.+?)\}\}/g;
