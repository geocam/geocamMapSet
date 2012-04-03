/*
| __BEGIN_LICENSE__
| Copyright (C) 2008-2010 United States Government as represented by
| the Administrator of the National Aeronautics and Space Administration.
| All Rights Reserved.
| __END_LICENSE__
*/

var geocamMapSetLib = geocamMapSetLib || {};

geocamMapSetLib.dataMap = new Array();

/* MapSetManager(spec, map, manageDivId, opts)
 *
 * Constructor that creates and displays a map set. It returns a MapSetManager
 * object, the status attribute of which indicates whether the mapSetJSON has
 * loaded.
 *
 * @spec is MapSetJSON document url string
 * @map is a Google API v3 map
 * @manageDivId is the id of an HTML div where the layer management interface
 * widget will be displayed.
 * @opts passes in customization options (to be defined later).
 *
 * TODO: @spec can also be the eval’d JavaScript object for a MapSetJSON document
 * TODO: @map is a *Mapstraction* map
 * TODO: can we include css tags here? css styling here?
 * TODO: is map layer construction for the map supposed to happen here? or
 *       somewhere else?
 */
geocamMapSetLib.MapSetManager = function (spec, map, manageDivId, opts) {

    // TODO: input validation (google search 'javascript function type
    // checking', 'javascript function args', 'javascript typeof')
    //

    // setup MapSet object attributes
    //
    mapSetManager = new Object();
    mapSetManager.status = 'LOADING';
    mapSetManager.url = spec;

    var mapLayers = [];

    // load the mapSetJSON asynchrously
    //
    $.getJSON(spec, function(obj) {
        mapSet = obj;

        // flesh out the wrapper object
        //
        mapSetManager.mapSet = mapSet;
        mapSetManager.status = 'FINISHED_LOADING';

        var mapSetViewHtml = [];

        mapSetViewHtml.push('<div id="mapLayerList">');

        $.each(mapSet.children, function (i, layer) {
            // initially, there will be a direct relationship between the JSON
            // order and the html display order
            //
            var htmlId = i;
            var jsonId = i;
            var checkbox;

            geocamMapSetLib.dataMap[htmlId] = jsonId;

            console.log(i, jsonId, htmlId);
            console.log(layer.url);

            // if the layer is set to 'show' by default, the layer
            // should be selected on the mapset viewer
            //
            if (layer.show == 'true') {
                checkbox = '<input type="checkbox" id="showLayer_' + jsonId + '" checked="checked"></input>';
            } else {
                checkbox = '<input type="checkbox" id="showLayer_' + jsonId + '"></input>';
            }

            // create mapset viewer content
            //
            mapSetViewHtml.push
                ('<div class="layerEntry ui-state-default">'
                 + '<span class="ui-icon ui-icon-arrowthick-2-n-s"></span>'
                 + checkbox
                 + '<label for="showLayer_' + jsonId + '">' + layer.name + '</label>'
                 + '<div class="metadata" id="' + jsonId + '" style="visibility:hidden"' + '></div>'
                 + '</div>');

            // add map layer to global array for map management
            //
            mapLayers[i] = new google.maps.KmlLayer(layer.url, {preserveViewport: true});
            
            // also load the layer on the map if it is enabled
            //
            if (layer.show == 'true') {
                mapLayers[i].setMap(map);
            }
        });

        mapSetViewHtml.push('</div>');
        manageDivId.html(mapSetViewHtml.join(''));

        // make the layer list sortable
        //
        $('#mapLayerList').sortable({
            // when the user 'drops' a ui element in the list, update
            // the state of the ui map
            //
            stop: function(event, ui) {
                $('.layerEntry').each(function (i, obj) {
                    var jsonId = $(obj).find('.metadata').attr("id");
                    geocamMapSetLib.dataMap[i] = jsonId;
                })
                dumpDataMap(geocamMapSetLib.dataMap);
            }
        });

        // attach handlers to each layer's checkbox in the mapset
        // viewer. The handler will run the layer's setMap function to
        // add/remove it from the map
        //
        $.each(mapSet.children, function (i, layer) {
            $('#showLayer_' + i).change(function (layer) {
                return function () {
                    var show = $(this).attr('checked');
                    if (show) {
                        console.log("showing layer " + layer.name);
                        mapLayers[i].setMap(map);
                    } else {
                        console.log("hiding layer " + layer.name);
                        mapLayers[i].setMap(null);
                    }
                }
            }(layer));
        });

        // add the editing mode switch
        //
        mapSetManager.isEditable = function() {
            return !$('#mapLayerList').sortable("option", "disabled");
        }

        mapSetManager.disableEditing = function () {
            // disable sorting
            $('#mapLayerList').sortable({disabled: true});

            // remove arrow-icon and draggable frame to each entry
            $('#mapLayerList span').removeClass('ui-icon ui-icon-arrowthick-2-n-s');
            $('.layerEntry').removeClass('ui-state-default');
        }

        mapSetManager.enableEditing = function (savedUrl) {
            // enable sorting 
            $('#mapLayerList').sortable({disabled: false});

            // Add arrow-icon and draggable frame to each entry
            $('#mapLayerList span').addClass('ui-icon ui-icon-arrowthick-2-n-s');
            $('.layerEntry').addClass('ui-state-default');
        }

        mapSetManager.getMapsetState = function () {
            var uiLayers = new Array();

            for (htmlIdx = 0; htmlIdx < geocamMapSetLib.dataMap.length; htmlIdx++) {
                // id of the json child in the ui 
                //
                var jsonIdx = geocamMapSetLib.dataMap[htmlIdx];

                // add the child at its new position based on the ui
                //
                uiLayers[htmlIdx] = mapSet.children[jsonIdx];

                // save the show status if enabled
                //
                if ($('#showLayer_' + jsonIdx).attr('checked')) {
                    uiLayers[htmlIdx].show = 'true';
                } else {
                    delete uiLayers[htmlIdx]["show"];
                }                
            }

            // update the mapset json object with the new layer content
            //
            mapSet.children = uiLayers;

            // reset the map now that everything is synced
            //
            $('.layerEntry').each(function (i, obj) {
                $(obj).find('.metadata').attr("id", i);
                geocamMapSetLib.dataMap[i] = i;
            })

            console.log("new json content: " + JSON.stringify(mapSet));
            return mapSet;
        }
    });

    return mapSetManager;
}


// utility function to dump the current state of the ui for debugging
//
function dumpDataMap(dataMap) {
    for (i=0; i < dataMap.length; i++) {
        console.log("htmlID=" + i + " jsonId="+ dataMap[i]);
    }
}

