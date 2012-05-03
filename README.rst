
===============================================================================
``geocamMapSet`` -- Django app for managing multi-layer mapsets with mapSetJSON
===============================================================================

The ``geocamMapSet`` Python/Django app provides a basic map layer
editor interface that can be easily integrated with other websites. It
is built on a Javascript library, geocamMapSetLib.js, which can can
add an editor to any webpage with just a few lines of code.

In fact, once you include the JS libraries and set up your map in a
web page, it takes just one additional statement to deploy the entire
map layer editing interface::

        mgr = new geocamMapSet.MapSetManager(“/mymapset.json, map, ‘manageDiv’, 'libraryDiv');


Setting up
==========
You can get ``geocamMapSet`` via ``Github`` by saying::

        git clone git@github.com:geocam/geocamMapSet.git

To run the application with the integrated items, do the following
(assuming your git clone is in /home/user/python/geocamMapSet)::

        cd /home/user/python/geocamMapSet
        export PYTHONPATH=$PYTHONPATH:$PWD/geocamMapSet
        python manage.py syncdb
        python manage.py runserver

Once the server is running, navigate to the landing page::
     
        http://localhost/

Or, navigate straight to the editor, which is currently available here::

        http://localhost/mixer/test/1/edit



Using the libraries in your web pages
=====================================
The ``geocamMapSet`` git repository integrates the following:

- the actual geocamMapSet Django app, in subtree ``geocamMapSet``
- the mapSetJSON management library, in subtree ``geocamMapSet/static/geocamMapSet/js``
- an example Django site, in subtree ``example``

First include the required JS libraries in your page::

        <script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?sensor=false"></script>
        <script type="text/javascript" src="{{ STATIC_URL }}external/js/jquery-1.7.1.min.js"></script>
        <script type="text/javascript" src="{{ STATIC_URL }}external/js/jquery-ui-1.8.18.custom.min.js"></script>
        <script type="text/javascript" src="{{ STATIC_URL }}geocamMapSet/js/geocamMapSetLib.js"></script>

Next provide div tags where you want to insert the mapset editor and
library::

        <table>
          <tr>
            <td><div id="map_canvas"></div></td>
            <td><div id="mapset_canvas"></div></td>
            <td><div id="mapsetlib_canvas"></div></td>
          </tr>
        </table>    

Now you can add a map, the simple mapset editor, and layer library
(aka feed finder) to your page::

        var mapOptions = {
            center: new google.maps.LatLng(35, -95),
            zoom: 4,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById('mapDiv'), mapOptions);
        mgr = new geocamMapSet.MapSetManager(“/mymapset.json, map, ‘manageDiv’, 'libraryDiv');


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

The ``geocamMapSetLib.js`` library is located within the project hierarchy here::

        geocamMapSet/static/geocamMapSet/js/geocamMapSetLib.js

The ``jQuery`` libraries can be found here::

        geocamMapSet/static/external/js/jquery-1.7.1.min.js
        geocamMapSet/static/external/js/jquery-ui-1.8.18.custom.min.js


Contributing
============
Maintanence of the mapSetJSON specification and development on this
application is managed by NASA and Carnegie Mellon University, as part
of the larger ``geocam`` disaster response management initiative.
However, third-party development and use is strongly encouraged.

Authors/Contact
---------------
* Hongdi Li, hongdi.li@sv.cmu.edu
* Ryan Lucio, ryan.lucio@sv.cmu.edu
* Trey Smith, trey.smith@sv.cmu.edu

