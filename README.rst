| __BEGIN_LICENSE__
| Copyright (C) 2008-2010 United States Government as represented by
| the Administrator of the National Aeronautics and Space Administration.
| All Rights Reserved.
| __END_LICENSE__

===============================================================================
``geocamMapSet`` -- django app for managing multi-layer mapsets with mapSetJSON
===============================================================================

                The ``geocamMapSet`` Python/Django app provides a map
                layer editor easily integrated with other websites. It
                is based on the MapSetJSON JavaScript library.

.. note::

                Maintanence of the mapSetJSON specification and
                development on this application is managed by NASA and
                Carnegie Mellon University, as part of the larger
                ``geocam`` disaster response management initiative.
                However, third-party development and use is strongly
                encouraged.

``geocamMapSet`` is licensed under the NASA OPEN SOURCE AGREEMENT
VERSION 1.3, see the file ``LICENSE`` for more information.

You can get ``geocamMapSet`` via ``github`` by saying::

        git clone git@github.com:geocam/geocamMapSet.git


Setting up
==========
The ``geocamMapSet`` git repository integrates the following:

- the actual geocamMapSet DJango app, in subtree ``geocamMapSet``
- the mapSetJSON management libaries, in subtree ``geocamMapSet/static``
- an example django site, in subtree ``example``

To run the application with the integrated items, do the following::

        python example/manage.py syncdb
        python example/manage.py runserver


Using the libraries in your web pages
=====================================
< TBD >


Hosting the libraries on your web site
======================================
< TBD >
