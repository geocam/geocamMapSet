/*
| __BEGIN_LICENSE__
| Copyright (C) 2008-2010 United States Government as represented by
| the Administrator of the National Aeronautics and Space Administration.
| All Rights Reserved.
| __END_LICENSE__
*/

var geocamMapSetLib = geocamMapSetLib || {};

// TODO: point the default to mapmixer.org
//
var mapLibraryURL = "/mixer/library/";

geocamMapSetLib.dataMap = new Array();

/* MapSetManager(spec, map, editorDivId, libraryDivId, opts)
 *
 * Constructor that creates and displays a map set. It returns a MapSetManager
 * object, the status attribute of which indicates whether the mapSetJSON has
 * loaded.
 *
 * @spec is MapSetJSON document url string
 * @map is a Google API v3 map
 * @editorDivId is the id of an HTML div where the layer editor interface
 * widget will be displayed.
 * @libraryDivId
 * @opts passes in customization options (to be defined later).
 *
 * TODO: @spec can also be the eval’d JavaScript object for a MapSetJSON document
 * TODO: @map is a *Mapstraction* map
 * TODO: can we include css tags here? css styling here?
 */
geocamMapSetLib.MapSetManager = function (spec, map, editorDivId, libraryDivId, opts) {

    // TODO: input validation (google search 'javascript function type
    // checking', 'javascript function args', 'javascript typeof')
    //

    // setup MapSet object attributes
    //
    mapSetManager = new Object();
    mapSetManager.status = 'LOADING';
    mapSetManager.url = spec;
    mapSetManager.editorDivId = editorDivId;
    mapSetManager.libraryDivId = libraryDivId;
    mapSetManager.googleMap = map;
    mapSetManager.mapLayers = [];


    //    var mapLayers = [];

    // load the mapSetJSON asynchrously
    //
    $.getJSON(spec, function(obj) {
        mapSet = obj;

        // flesh out the wrapper object
        //
        mapSetManager.mapSet = mapSet;
        mapSetManager.status = 'FINISHED_LOADING';

        mapSetManager.drawEditorDivAndMapCanvas();

        // function to check editable mode status
        //
        mapSetManager.isEditable = function() {
            return !$('#mapLayerList').sortable("option", "disabled");
        }

        // function to disable the editable mode
        //
        mapSetManager.disableEditing = function () {
            // disable sorting
            $('#mapLayerList').sortable({disabled: true});

            // remove arrow-icon and draggable frame to each entry
            $('#mapLayerList span').removeClass('ui-icon ui-icon-arrowthick-2-n-s');
            $('.layerEntry').removeClass('ui-state-default');
        }

        // function to enable the editable mode
        //
        mapSetManager.enableEditing = function (savedUrl) {
            // enable sorting 
            $('#mapLayerList').sortable({disabled: false});

            // Add arrow-icon and draggable frame to each entry
            $('#mapLayerList span').addClass('ui-icon ui-icon-arrowthick-2-n-s');
            $('.layerEntry').addClass('ui-state-default');
        }

        // function to create mapSetJSON from the current state
        // (i.e., after editing). "You See Is What You Get"
        //
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
                if ($('.layerEntry > input').get(htmlIdx).checked) {
                    uiLayers[htmlIdx].show = 'true';
                } else {
                    delete uiLayers[htmlIdx].show;
                }                
            }

            // update the mapset json object with the new layer content
            //
            mapSet.children = uiLayers;
                            
  
	    // reset the ID of the metadata tag and the 
            // dataMap{htmlIdx:jsonIdx}.
            //
            $('.layerEntry').each(function (i, obj) {
                $(obj).find('.metadata').attr('id',i);
                geocamMapSetLib.dataMap[i] = i;
            })
           
            console.log("new json content: " + JSON.stringify(mapSet));
            return mapSet;
        }
    });  // end of asynchronous execution, i.e., $.getJSON() method.

    // Initialize the libraryDiv
    //
    $.getJSON(mapLibraryURL, function(obj) {

        mapSetManager.mapLibraryList = obj;
        
        mapSetManager.drawLibraryDiv();
    });

    // bind the function drawEditorDivAndMapCanvas() and drawLibraryDiv() 
    // needed in the asynchronous part of the initialization.
    mapSetManager.drawEditorDivAndMapCanvas = drawEditorDivAndMapCanvas;

    mapSetManager.drawLibraryDiv = drawLibraryDiv;

    return mapSetManager;
}


// mapSetManager.drawEditorDivAndMapCanvas()
//
// Clean the editorDiv and draw the html content based on the jsonObj
//
// @status is the indicator whether the @mapSet is loaded.
// @mapSet is the object representation of the MapSetJson document
// @editorDivId is the ID of the editorDiv. Usually, it will be used with
// the mapSetManager.editorDivId.
// @googleMap is the GoogleMap map object
// @mapLayers is the array of map layers binding to the @googleMap
//
// This function also writes the following global variables
//     geocamMapSetLib.dataMap[];
//
function drawEditorDivAndMapCanvas() {

    // return if mapSet is not ready
    if (this.status != 'FINISHED_LOADING') {
        console.log('Fail to execute drawEditorDivAndMapCanvas. mapSetManager.status is ' + this.status);
        return;
    }

    var mapLayers = this.mapLayers;
    var map = this.googleMap;

    // unpopulate all layers on the map
    while (mapLayers.length>0) {
        var m = mapLayers.pop();
        m.setMap(null);
        //console.log('Clearing layer ' + (mapLayers.length));
    }

    var mapSetViewHtml = [];

    mapSetViewHtml.push('<div id="mapLayerList">');

    $.each(this.mapSet.children, function (i, layer) {
        // initially, there will be a direct relationship between the JSON
        // order and the html display order
        //
        var htmlId = i;
        var jsonId = i;
        var checkbox;

        // build the { htmlId : jsonId } mapping to track reordering
        // editing.
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
    });  // end of .each() loop

    mapSetViewHtml.push('</div>');
    $(this.editorDivId).html(mapSetViewHtml.join(''));

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
}



// mapSetManager.drawLibraryDiv 
// 
// Clean the libraryDiv and draw the html content based on the map layer
// library in JSON format
//
// @mapLibraryList is the object representation of a set of map layers.
// @libraryDivId is the ID of the libraryDiv. 
//
function drawLibraryDiv() {
    
    var mapLibraryList = this.mapLibraryList;
    var mapLibraryViewHtml = [];

    mapLibraryViewHtml.push('<div id="mapLibraryList">');

    // iterate through the mapLibraryList and create the html entries
    //
    $.each(mapLibraryList, function (i, layer) {
        mapLibraryViewHtml.push('<div class="libraryEntry ui-state-default">' 
            + layer.name
            + '<div class="metadata" id="' + i + '" style="visibility:hidden"' + '></div>'
            + '</div>');
        console.log( "library layer " + i + ": " + layer.name );
    });

    mapLibraryViewHtml.push('</div>');

    // inject the html content to the libraryDiv
    //
    $(this.libraryDivId).html(mapLibraryViewHtml.join(''));

    // assign draggable attribute to each libraryEntry 
    //
    $('.libraryEntry').draggable({revert:'invalid', revertDuration:100});
}



// utility function to dump the current state of the ui for debugging
//
function dumpDataMap(dataMap) {
    for (i=0; i < dataMap.length; i++) {
        console.log("htmlID=" + i + " jsonId="+ dataMap[i]);
    }
}




