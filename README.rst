| __BEGIN_LICENSE__
| Copyright (C) 2008-2010 United States Government as represented by
| the Administrator of the National Aeronautics and Space Administration.
| All Rights Reserved.
| __END_LICENSE__

===============================================================================
``geocamMapSet`` -- Django app for managing multi-layer mapsets with mapSetJSON
===============================================================================

                The ``geocamMapSet`` Python/Django app provides a map
                layer editor easily integrated with other websites. It
                is based on the MapSetJSON JavaScript library.

.. note::

                Maintenance of the mapSetJSON specification and
                development on this application is managed by NASA and
                Carnegie Mellon University, as part of the larger
                ``geocam`` disaster response management initiative.
                However, third-party development and use is strongly
                encouraged.

                ``geocamMapSet`` is licensed under the NASA OPEN
                SOURCE AGREEMENT VERSION 1.3, see the file ``LICENSE``
                for more information.

Setting up
==========
You can get ``geocamMapSet`` via ``Github`` by saying::

        git clone git@github.com:geocam/geocamMapSet.git

To run the application with the integrated items, do the following::

        python example/manage.py syncdb
        python example/manage.py runserver


Using the libraries in your web pages
=====================================
The ``geocamMapSet`` git repository integrates the following:

- the actual geocamMapSet Django app, in subtree ``geocamMapSet``
- the mapSetJSON management libraries, in subtree ``geocamMapSet/static``
- an example Django site, in subtree ``example``

Add the simple mapset viewer to your page::

        map = new mxn.Mapstraction('mapdiv','googlev3');
        mgr = new geocamMapSet.MapSetManager(“/mymapset.json”, map, 
                                             ‘manageDiv’);

Now add the mapset editor to your page::

        mgr.enableEditing(“/save/mymapset”);
        mgr.showLibrary(“/library?q={{ searchString }}&n={{ maxNumLayers }}”, 
                        “libraryDiv”);


Hosting the libraries on your web site
======================================
The mapSetJSON management library ``geocamMapSetLib.js`` can be hosted on
your site.  To get a copy, clone the geocamMapSet project or download the
latest source from the Github project page.  Then copy the library to the
location of your Javascript files for your site.

You will additionally need to include ``jQuery`` in your app, as it is
required by the geocamMapset library.  If you are not already using 
``jQuery`` you can use the version that is included with the ``geocamMapSet``
application.

The library is located within the project hierarchy here::

        geocamMapSet/geocamMapset/static/geocamMapSetLib.js

