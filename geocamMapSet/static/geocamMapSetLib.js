/*
| __BEGIN_LICENSE__
| Copyright (C) 2008-2010 United States Government as represented by
| the Administrator of the National Aeronautics and Space Administration.
| All Rights Reserved.
| __END_LICENSE__
*/

var geocamMapSetLib = geocamMapSetLib || {};

geocamMapSetLib.dataMap = new Array();
geocamMapSetLib.sortableStartLoc;
geocamMapSetLib.sortableStopLoc;

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
    mapSetManager = new Object();
    mapSetManager.status = 'LOADING';
    mapSetManager.url = spec;

    var mapLayers = [];

    // load the mapSetJSON asynchrously
    $.getJSON(spec, function(obj) {
        mapSet = obj;

        // flesh out the wrapper object
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
            geocamMapSetLib.dataMap[htmlId] = jsonId;

            console.log(i, jsonId, htmlId);
            console.log(layer.url);

            // create mapset viewer content
            //
            mapSetViewHtml.push
                ('<div class="layerEntry ui-state-default">'
                 + '<span class="ui-icon ui-icon-arrowthick-2-n-s"></span>'
                 + '<input type="checkbox" id="showLayer_' + jsonId + '"></input>'
                 + '<label for="showLayer_' + jsonId + '">' + layer.name + '</label>'
                 + '<div class="metadata" id="' + jsonId + '" style="visibility:hidden"' + '></div>'
                 + '</div>');

            // add map layer to global array for map management
            //
            mapLayers[i] = new google.maps.KmlLayer(layer.url, {preserveViewport: true});
        });

        mapSetViewHtml.push('</div>');
        manageDivId.html(mapSetViewHtml.join(''));

        // make the layer list sortable
        $('#mapLayerList').sortable({
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
        mapSetManager.isEditable = function() {
            return !$('#mapLayerList').sortable("option", "disabled");
        }

        mapSetManager.disableEditing = function () {
            $('#mapLayerList').sortable({disabled: true});
            $('#mapLayerList span').removeClass('ui-icon');
        }

        mapSetManager.enableEditing = function (savedUrl) {
            $('#mapLayerList').sortable({disabled: false});
            $('#mapLayerList span').addClass('ui-icon');
        }

        mapSetManager.getMapsetState = function () {
            // TODO: make this more legitimate, eg to handle more complicated
            // documents - like nested hierarchies of layers
            //
            // var docStr = '{' + $('.metadataHeader').attr("title");
            // docStr+=',"children":[';

            $('.layerEntry').each(function (i, obj) {
                    // if (i !=0 ) docStr+=',';
                    // docStr+='{"name":"' + $(obj).find('.layerName').text() + '"';
                    // docStr+=',' + $(obj).find('.metadataChild').attr("title") + '}';
                });

            docStr+="]}";

            console.log(docStr);

            return JSON.parse(docStr);
        }
    });

    return mapSetManager;
}


    function dumpDataMap(dataMap) {
        for (i=0; i < dataMap.length; i++) {
            console.log("dataMap[" + i + "] = " + dataMap[i]);
        }
    }

