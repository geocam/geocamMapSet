/*
| __BEGIN_LICENSE__
| Copyright (C) 2008-2010 United States Government as represented by
| the Administrator of the National Aeronautics and Space Administration.
| All Rights Reserved.
| __END_LICENSE__
*/

var geocamMapSetLib = geocamMapSetLib || {};

// UI-Data mapping: dataMap[htmlIdx] = jsonIdx
// Use the array dataMap as a lookup table for mapping the layer entries in
// the mapset editor back to the mapSetManager.mapSet.children[] array
//
geocamMapSetLib.dataMap = new Array();

// geocamMapSetLib.mapLibraryList will be populated with content
// downloaded from the map library url.
//
geocamMapSetLib.mapLibraryList = new Array();

geocamMapSetLib.newLayer = null;

geocamMapSetLib.qualifyUrl = function (url) {
    var a = document.createElement('a');
    a.href = url;
    return a.href;
}

// MapSetManager(spec, map, editorDivId, opts)
//
// Constructor that creates and displays a map set. It returns a MapSetManager
// object, the status attribute of which indicates whether the mapSetJSON has
// loaded.
//
// @spec is MapSetJSON document url string
// @map is a Google API v3 map
// @editorDivId is the id of an HTML div where the layer editor interface
// widget will be displayed.
// @opts passes in customization options (to be defined later).
//
//
geocamMapSetLib.MapSetManager = function (spec, map, editorDivId, opts) {

    // TODO: input validation (google search 'javascript function type
    // checking', 'javascript function args', 'javascript typeof')
    //
    
    mapSetManager = new Object();
    mapSetManager.opts = opts;
    mapSetManager.status = 'LOADING';
    mapSetManager.url = spec;
    mapSetManager.editorDivId = editorDivId;
    mapSetManager.googleMap = map;
    mapSetManager.mapLayers = [];   // use jsonId to index

    // make mapSetManager retrievable via global geocamMapSetLib instance.
    // It is used by the components inside the the mapset editor.
    geocamMapSetLib.managerRef = mapSetManager;


    // load the mapSetJSON asynchrously
    //
    $.getJSON(spec, function(obj) {
        mapSet = obj;
        
        mapSetManager.mapSet = mapSet;
        mapSetManager.status = 'FINISHED_LOADING';

        mapSetManager.drawEditorDivAndMapCanvas();

        // function to check editing mode status
        //
        mapSetManager.isEditable = function() {
            return !$('#mapLayerList').sortable("option", "disabled");
        }

        // function to disable the editing mode
        //
        mapSetManager.disableEditing = function () {
            // disable sorting
            $('#mapLayerList').sortable({disabled: true});

            // remove arrow-icon and draggable frame to each entry
            $('#mapLayerList span').removeClass('ui-icon ui-icon-arrowthick-2-n-s');
            $('.layerEntry').removeClass('ui-state-default');

            // disable remove button
            $('.layer-entry-right').hide();

            // disable save button
            setButtonDisabled($('#save'), true);
        }

        // function to enable the editing mode
        //
        mapSetManager.enableEditing = function (savedUrl) {
            // enable sorting 
            $('#mapLayerList').sortable({disabled: false});

            // Add arrow-icon and draggable frame to each entry
            $('#mapLayerList span').addClass('ui-icon ui-icon-arrowthick-2-n-s');
            $('.layerEntry').addClass('ui-state-default');

            // enable remove button
            $('.layer-entry-right').show();
            $('.removeButton').button('option','icons','{primary:null, secondary:null}');
            

            // disable save button
            setButtonDisabled($('#save'), false);
        }

        // function to create a mapSetJSON from the current state
        // (i.e., after editing). "What You See Is What You Get"
        //
        mapSetManager.getMapsetState = function () {
            var uiLayers = new Array();

            // extract the state from the HTML Editor View
            for (htmlIdx = 0; htmlIdx < geocamMapSetLib.dataMap.length; htmlIdx++) {
                // id of the json child in the ui 
                //
                var jsonIdx = geocamMapSetLib.dataMap[htmlIdx];

                // add the child at its new position based on the ui
                //
                uiLayers[htmlIdx] = mapSet.children[jsonIdx];

                // save the show status if enabled
                //
                if ($('.layer-entry-left > input').get(htmlIdx).checked) {
                    uiLayers[htmlIdx].show = 'true';
                } else {
                    delete uiLayers[htmlIdx].show;
                }                
            }

            // update the mapset json object with the new layer content
            //
            mapSet.children = uiLayers;                            
  	    
            // update mapLayers[] : remove the deleted entries (i.e. undefined)
            var mapLayers = this.mapLayers;
            var idx = 0;
            while (idx<mapLayers.length) {
                var entry = mapLayers[idx];
                if (entry == undefined) {
                    mapLayers.splice(idx, 1); // remove one element
                    //console.log(mapLayers);
                }
                else {
                    idx += 1;
                }
            }

            // Redraw the Editor Div.
            // pre-state: the ids in the html is out of sync with the new json!
            //       
            // Alternative for redrawing: update jsonId related components
            //     the metadata tag id
            //     the checkbox click() handler
            //     the remove-layer button click() handler
            this.drawEditorDivAndMapCanvas();            
                
            // the editor view should match the json state after redrawing
            // i.e., dataMap[htmlIdx] htmlIdx
            $('.layerEntry').each(function (i, obj) {
                geocamMapSetLib.dataMap[i] = i;
            })

            console.log("new json content: " + JSON.stringify(mapSet));
            return mapSet;
        }
    });  // end of asynchronous execution, i.e., $.getJSON() method.

    loadLibrary();

    // bind the function drawEditorDivAndMapCanvas() and drawLibraryDiv() 
    // needed in the asynchronous part of the initialization.
    mapSetManager.drawEditorDivAndMapCanvas = drawEditorDivAndMapCanvas;

    mapSetManager.drawLibraryDiv = drawLibraryDiv;

    return mapSetManager;
}

function loadLibrary(highlightNew) {
    var mapSetManager = geocamMapSetLib.managerRef;

    $.getJSON(mapSetManager.opts.libraryUrl, function(obj) {
        // store the map layer library as globally retrievable
        geocamMapSetLib.mapLibraryList = obj;

        mapSetManager.drawLibraryDiv();
        if (highlightNew) {
            brieflyHighlightFirstLibraryEntry();
        }
    });
}

// bindNewLayerToGoogleMap(layerEntry)
//
// Helper function for drawEditorDivAndMapCanvas. It bind the map set entry 
// (i.e., @layerEntry) to the mapSetManager.googleMap
// 
// Return value is the index of the new map layer in 
// geocamMapSetLib.managerRef.mapLayers.
//
// @layerEntry is a mapSetJSON layer object (expected fields: url, show).
//
// Notes: It retrieve the googleMap object via geocamMapSetLib.managerRef.
//
function bindNewLayerToGoogleMap(layerEntry) {
    if (settings.GEOCAM_MAP_SET_DISABLE_MAPS) return;

    var googleMap = geocamMapSetLib.managerRef.googleMap;
    var mapLayers = geocamMapSetLib.managerRef.mapLayers;
    var newLayerIdx = mapLayers.length;

    // add map layer to global array for map management    
    mapLayers[newLayerIdx] = new google.maps.KmlLayer(layerEntry.url, {preserveViewport: true});
            
    // also load the layer on the map if it is enabled
    if (typeof layerEntry.show !== 'undefined') {
        if (layerEntry.show.toLowerCase() == 'true') {
            mapLayers[newLayerIdx].setMap(googleMap);
            console.log('Showing map:' + layerEntry.url);
        }    
    }

    return newLayerIdx;
}



// addLibraryLayerToMapSet(mapLibraryLayer)
//
// Helper function for drawEditorDivAndMapCanvas.
// It returns the mapSet.children[] index for the newly-added map layer entry corresponding
// to the @mapLibraryLayer.
//
// @mapLibraryLayer is a map layer entry following the format of 
//  geocamMapSetLib.mapLibraryList.
// 
// Notes: It retrieves the MapSetJSON via geocamMapSetLib.managerRef.mapSet.
//
function addLibraryLayerToMapSet(mapLibraryLayer) {
    var mapSetList = geocamMapSetLib.managerRef.mapSet.children;
    var newItemIdx = mapSetList.length;

    mapSetList.push(mapLibraryLayer);
    
    // debugging
    console.log('New item added, mapSetJson.children[' + newItemIdx + ']:' 
                + mapSetList[newItemIdx].name);
    
    return newItemIdx;
}

// composeLayerEntry(layer, jsonId)
//
// Helper function for drawEditorDivAndMapCanvas. 
// It returns the HTML for the layer entry in the custom MapSet. 
//
// @layer is the MapSetJSON layer object (expected fields: name, show)
// @jsonId is the index of the corresponding child entry in the 
//  mapSetManager.mapSet.children[] array.
// 
function composeLayerEntry(layer, jsonId) {
    var mapSetEntryHtml = [];
    var checkbox;

    // if the layer is set to 'show' by default, the layer
    // should be selected on the mapset editor
    //
    if (typeof layer.show !== 'undefined') {
        if (layer.show.toLowerCase() == 'true') {
            checkbox = '<input type="checkbox" id="showLayer_' + jsonId + '" checked="checked"></input>';
        } 
    }
    else {
            checkbox = '<input type="checkbox" id="showLayer_' + jsonId + '"></input>';
    }
    

    // create mapset entry content
    //
    mapSetEntryHtml.push
        ('<div class="layerEntry ui-state-default">'
         + '<table width="100%"><tr valign="top">'
         + '<td class="layer-entry-left">' + checkbox + '</td>'
         + '<td class="layer-entry-mid"><label for="showLayer_' + jsonId + '">' + layer.name + '</label></td>'
         + '<td class="layer-entry-right"><span id="remove_' + jsonId + '"></span></td>'
         + '</tr></table>'
         + '<div class="metadata" id="' + jsonId + '" style="visibility:hidden"' + '></div>'
         + '</div>');

    return mapSetEntryHtml.join('');    
}



// initRemoveButton(jsonId)
//
// Helper function for drawEditorDivAndMapCanvas.
// It assigns the button attributes to the "#remove_{jsonId}" DOM element and
// bind the Click event handler that removes the map layer entry.
//
// @jsonId is the index of the corresponding child entry in the 
//  mapSetManager.mapSet.children[] array.
//
// Notes: the handler relies on geocamMapSetLib.managerRef.mapLayers[].
// 
function initRemoveButton(jsonId) {
    var buttonId = '#remove_' + jsonId;

    $(buttonId).button({
        text: false
    }).click(function() { 
         // onclick handler: remove the layer entry
         console.log('removing map layer: ' + buttonId);

         var mapLayers = geocamMapSetLib.managerRef.mapLayers;

         // unbind the GoogleMap if it is enabled.
         var show = $('#showLayer_'+jsonId).attr('checked');
         if (show) {
             console.log('It is on show.');             
             mapLayers[jsonId].setMap(null);
         }

         // remove the map layer from DOM
         $(this).parents(".layerEntry").remove();

         // look for htmlId

         // update dataMap[], i.e., Mapping: htmlId -> jsonId
         // 
         var dataMap = geocamMapSetLib.dataMap;
         var htmlIdx = dataMap.indexOf(jsonId);
         if (htmlIdx == -1) {
              console.log('Error: failed to find JsonId ' + jsonId + '. ' + htmlIdx + ' returned.');
              console.log(dataMap);
         }
         else {
              // remove the dataMap entry
              dataMap.splice(htmlIdx, 1);  
              console.log(dataMap);
         }

         // defer shrinking the mapLayers[] to when mapSetManager.mapSet gets
         // updated, i.e., in mapSetManager.getMapsetState()
         // 
         // "delete array" only marks that entry as undefined, which serves
         // as a marker for removed entry in mapLayers.
         delete mapLayers[jsonId];

         //console.log('--- mapLayer[] state after entry removed ---');
         //console.log('Note:the deleted layer entry is marked as undefined.');
         //console.log(mapLayers);

    }).addClass("removeButton ui-icon ui-icon-close").width("17px");

}



// connectMaplayerCheckboxToGoogleMap(mapEntry, jsonId)
//
// Helper function for drawEditorDivAndMapCanvas. 
// It initiates the checkbox "change" event handler. 
//
// @mapEntry is the map layer entry from the map library. (expect field: name)
// @jsonId is the index of the corresponding child entry in the 
//  mapSetManager.mapSet.children[] array.
//
// Note: the mapSetManager.mapLayers[] array is indexed by jsonId.
//
function connectMaplayerCheckboxToGoogleMap(mapEntry, jsonId) {

    $('#showLayer_' + jsonId).change(function (layer) {
        return function () {
            var mapLayers = geocamMapSetLib.managerRef.mapLayers;
            var map = geocamMapSetLib.managerRef.googleMap;            

            var show = $(this).attr('checked');
            if (show) {
                console.log("showing layer " + layer.name);
                if (!settings.GEOCAM_MAP_SET_DISABLE_MAPS) {
                    mapLayers[jsonId].setMap(map);
                }
            } else {
                console.log("hiding layer " + layer.name);
                if (!settings.GEOCAM_MAP_SET_DISABLE_MAPS) {
                    mapLayers[jsonId].setMap(null);
                }
            }
        }
    }(mapEntry));

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

    // add buttons and name 
    //
    var mapSetName = "Unnamed Mapset";
    if (this.mapSet.hasOwnProperty('name')) {
        mapSetName = this.mapSet.name;
    }
    mapSetViewHtml.push('<label id="mapSetName">' + mapSetName + '</label><br>');
    mapSetViewHtml.push('<button id="save" type="button">Save</button>');
    mapSetViewHtml.push('<img id="activityIndicator"' +
                        'src="' + STATIC_URL + 'geocamMapSet/images/indicator.white.gif"' +
                        'style="display:none"/>');
    mapSetViewHtml.push('<label id="activityStatus" style="display:none">' +
                        'save complete.</label>');

    mapSetViewHtml.push('<div id="mapLayerList">');

    $.each(this.mapSet.children, function (i, layer) {
        // initially, there will be a direct relationship between the JSON
        // order and the html display order
        //
        var htmlId = i;
        var jsonId = i;
        var checkbox;

        // build the { htmlId : jsonId } mapping to track reordering
        // operations.
        geocamMapSetLib.dataMap[htmlId] = jsonId;

        //console.log(i, jsonId, htmlId);
        //console.log(layer.url);

        var layerEntryHtml = composeLayerEntry(layer, jsonId);
        mapSetViewHtml.push(layerEntryHtml);

        // add map layer to global array for map management
        //
        if (!settings.GEOCAM_MAP_SET_DISABLE_MAPS) {
            mapLayers[i] = new google.maps.KmlLayer(geocamMapSetLib.qualifyUrl(layer.url),
                                                    {preserveViewport: true});
            
            // also load the layer on the map if it is enabled
            //
            if (typeof layer.show !== 'undefined') {
                if (layer.show.toLowerCase() == 'true') {
                    mapLayers[i].setMap(map);
                }
            }
        }
    });  // end of .each() loop

    mapSetViewHtml.push('</div>');

    $(this.editorDivId).html(mapSetViewHtml.join(''));

    // add callback for button click here
    //
    $('#save').button();
    $('#save').click(function() {

        m = geocamMapSetLib.managerRef.getMapsetState();

        //setButtonDisabled($('#save'), true);
        $('#activityIndicator').show();

        $.post(geocamMapSetLib.managerRef.url, JSON.stringify(m), function(data) {
                //setButtonDisabled($('#save'), false);
                $('#activityIndicator').hide();

                $('#activityStatus').show('slow', function() {
                    setTimeout("$('#activityStatus').hide()", 1000);
                })
        })
    })
    
    // make the layer list sortable
    //
    $('#mapLayerList').sortable({
        // show placeholder during sorting 
        // TODO: enlage the box in ui-state-highlight styling
        placeholder: 'ui-state-highlight',

        // Event handler for the change of state in mapset editor, i.e.,
        //     Add a new layer
        //     Reorder a layer
        //
        stop: function(event, ui) {
            // Handle adding new entry and sorting separately
            //
            if (ui.item.hasClass('libraryEntry')) {
                // retrieve the map layer from the mapLibraryList
                var mapLibraryList = geocamMapSetLib.mapLibraryList;
                var libIdx = ui.item.find('.metadata').attr('id');                
                var libEntry = mapLibraryList[libIdx];
                
                // add item to the mapSet.children and retrieve its index
                var jsonId = addLibraryLayerToMapSet(libEntry);

                // generate the map set entry HTML and update the placeholder 
                var newEntryHtml = composeLayerEntry(libEntry, jsonId);
                ui.item.replaceWith(newEntryHtml);

                // create the Google map binding to the new entry and initiate
                // the checkbox "change" event handler.
                bindNewLayerToGoogleMap(libEntry);
                connectMaplayerCheckboxToGoogleMap(libEntry,jsonId);

                // create the "remove layer" button
                initRemoveButton(jsonId);

                console.log('Add new entry from lib #' + libIdx);
            }
            else {
                console.log('Sort only');
            }

            // rebuild the dataMap[] based on the updated Html Editor View
            // 
            $('.layerEntry').each(function (i, obj) {
                var jsonId = $(obj).find('.metadata').attr("id");
                // Don't assign string to dataMap!!!
                geocamMapSetLib.dataMap[i] = parseInt(jsonId, 10); 
            });
            
            // for debugging
            dumpDataMap(geocamMapSetLib.dataMap);
        }
    });

    // attach handlers to each layer's components:
    // (1) checkbox handler will run the layer's setMap function to
    // add/remove it from the map.
    // (2) "remove-layer" button handler will remove the associate 
    // map layer entry.
    $.each(mapSet.children, function (i, layer) {
        connectMaplayerCheckboxToGoogleMap(layer, i, i);

        initRemoveButton(i);
    });
}

function brieflyHighlightFirstLibraryEntry() {
    var libraryDiv = $(geocamMapSetLib.managerRef.opts.libraryDiv);
    var firstEntry = libraryDiv.find('.libraryEntry:first')

    var originalBorderColor = firstEntry.css('border-color');
    var originalBackground = firstEntry.css('background');

    // highlight
    firstEntry.css('border-color', '#ff8');
    firstEntry.animate({backgroundColor: '#ffa'}, 1000);

    setTimeout(function () {
        // unhighlight
        firstEntry.css('border-color', originalBorderColor);
        firstEntry.animate({backgroundColor: originalBackground}, 500);
    }, 1500);
}

function newLayerStep1() {
    var dialogDiv = $('#dialogDiv');
    dialogDiv.attr('title', 'New Layer');

    dialogDiv.html
    ('<div class="dialogSteps">'
     + '<span class="dialogStep dialogStepHighlight">1. Select a file</span>'
     + '<span class="dialogStep">2. Describe your layer</span>'
     + '</div>'
     
     + '<table><tr>'

     + '<td class="sidebarChoices">'
     + '<div id="dialogNav_upload" class="sidebarChoice">Upload</div>'
     + '<div id="dialogNav_url" class="sidebarChoice">From a URL</div>'
     + '</td>'

     + '<td class="selectFile">'
     + '<div id="selectFile"></div>'
     + '</td>'

     + '</tr></table>'

     + '<div id="dialogError" class="error"></div>'

    );

    var saveErrorHandler = function (xhr) {
        var errText;
        if (xhr.readyState == 0) {
            errText = "couldn't connect to server";
        } else if (xhr.readyState == 4) {
            var hasJsonError = false;
            if (xhr.responseText != null) {
                var response = null;
                try {
                    response = JSON.parse(xhr.responseText);
                } catch (SyntaxError) {
                    // do nothing
                }
                if (response != null && response.error != null) {
                    $.each(response.error, function (field, error) {
                        $('#error_' + field).html(error.join('<br/>'));
                        hasJsonError = true;
                    });
                }
            }
            if (!hasJsonError) {
                errText = "HTTP error " + xhr.status
                    + " (" + xhr.statusText + ")";
            }
        } else {
            errText = "unknown error";
        }
        if (errText != null) {
            $('#dialogError').html('Last save failed: ' + errText);
        }
        return false;
    };

    var saveSuccessHandler = function (response) {
        $('#dialogDiv').dialog('close');
        newLayerStep2(response);
        return false;
    };

    var submitHandlerUrlMode = function () {
        var text = JSON.stringify($('#newLayerForm').serializeObject());
	$.post(geocamMapSetLib.managerRef.opts.newLayerUrl,
               text,
               saveSuccessHandler,
               'json')
            .fail(saveErrorHandler);
	return false;
    };

    var submitHandlerUploadMode = function () {
        var formData = new FormData();
        var file = $('#id_localCopy')[0].files[0];
        formData.append('localCopy', file);

	$.ajax({
            url: geocamMapSetLib.managerRef.opts.newLayerUrl + 'upload/',
            data: formData,
            cache: false,
            contentType: false, // suppress jQuery automatic content type header
            processData: false,
            type: 'POST',
            success: saveSuccessHandler
        }).fail(saveErrorHandler);

	return false;
    };

    dialogDiv.dialog({
        modal: true,
        draggable: false,
        width: 800,
        buttons: [

            {
                'text': 'Next',
                'click': function () {
                    $('#dialogDiv .formError').html('');
                    if (dialogNavMode == 'url') {
                        return submitHandlerUrlMode();
                    } else {
                        return submitHandlerUploadMode();
                    }
                }
            },

            {
                'text': 'Cancel',
                'click': function () {
                    $(this).dialog("close");
                }
            }
            
        ]
    });

    var dialogNavMode = null;

    var setModeUpload = function () {
        if (dialogNavMode != 'upload') {
            $('#dialogNav_upload').addClass('sidebarChoiceHighlight');
            $('#dialogNav_url').removeClass('sidebarChoiceHighlight');
            $('#selectFile').html
            ('<form id="newLayerForm" method="post" action=".">'
             + '<input type="file" name="localCopy" id="id_localCopy" />'
             + '</form>'
            );
            dialogNavMode = 'upload';
        }
    };

    var setModeUrl = function () {
        if (dialogNavMode != 'url') {
            $('#dialogNav_url').addClass('sidebarChoiceHighlight');
            $('#dialogNav_upload').removeClass('sidebarChoiceHighlight');
            $('#selectFile').html
            ('<form id="newLayerForm" method="post" action=".">'
             + '<table><tr>'
             + '<th><label for="id_externalUrl">URL</label></th>'
             + '<td><input type="text" name="externalUrl" id="id_externalUrl" size="50" /></td>'
             + '</tr><tr>'
             + '<th><label for="id_hosting">Hosting</label></th>'
             + '<td>'
             + '<table><tr>'
             + '<td><input type="radio" name="hosting" value="external" checked="checked" id="id_hosting"/></td>'
             + '<td class="radioOption">Display the externally hosted file (recommended)</td>'
             + '</tr><tr>'
             + '<td/>'
             + '<td class="radioOptionDescription">If the external file changes, people viewing your layer will see the new version. However, if the service hosting the file takes it down or moves it, your layer will no longer display properly.</td>'
             + '</tr><tr>'
             + '<td><input type="radio" name="hosting" value="local" id="id_hosting"/></td>'
             + '<td class="radioOption">Display a copy of the file hosted on this site</td>'
             + '</tr><tr>'
             + '<td/>'
             + '<td class="radioOptionDescription">If the external file changes, people viewing your layer will continue to see the old version.</td>'
             + '</tr></table>'
             + '</td>'
             + '</tr></table>'
             + '</form>'
            );
            dialogNavMode = 'url';
        }
    };

    $('#dialogNav_upload').click(setModeUpload);
    $('#dialogNav_url').click(setModeUrl);
    setModeUpload();

    // pressing enter in the dialog should click the 'Next' button
    if (geocamMapSetLib.managerRef.dialogKeypressBound == null) {
        $('#dialogDiv').keypress(function (e) {
            if (e.keyCode == $.ui.keyCode.ENTER) {
                $(this).parent().find('.ui-dialog-buttonpane button:first').click();
            }
        });
        geocamMapSetLib.managerRef.dialogKeypressBound = true;
    }
}

function newLayerStep2(response) {
    console.log(response);
    geocamMapSetLib.newLayer = response.result;
    var dialogDiv = $('#dialogDiv');
    dialogDiv.attr('title', 'New Layer');

    // this html was mostly copy-and-pasted from the django-rendered form.
    // a better workflow would be better.
    dialogDiv.html
    (''
     + '<div class="dialogSteps">'
     + '<span class="dialogStep">1. Select a file</span>'
     + '<span class="dialogStep dialogStepHighlight">2. Describe your layer</span>'
     + '</div>'

     + '<form id="newLayerForm" method="post" action=".">'
     + '<table>'
     + '<tr><th/><td><div id="error_name" class="formError"></div></td></tr>'
     + '<tr><th><label for="id_name">Name *</label></th><td><input id="id_name" type="text" name="name" maxlength="255" size="60"/></td></tr>'
     + '<tr><th/><td><div id="error_description" class="formError"></div></td></tr>'
     + '<tr><th><label for="id_description">Description</label></th><td><textarea id="id_description" rows="2" cols="65" name="description"></textarea></td></tr>'
     + '<tr><th/><td><div id="error_coverage" class="formError"></div></td></tr>'
     + '<tr><th><label for="id_coverage">Region covered</label></th><td><input id="id_coverage" type="text" name="coverage" maxlength="255" size="60"/></td></tr>'
     + '<tr><th/><td><div id="error_creator" class="formError"></div></td></tr>'
     + '<tr><th><label for="id_creator">Creator</label></th><td><input id="id_creator" type="text" name="creator" maxlength="255" size="60"/></td></tr>'
     + '<tr><th/><td><div id="error_contributors" class="formError"></div></td></tr>'
     + '<tr><th><label for="id_contributors">Other contributors</label></th><td><input id="id_contributors" type="text" name="contributors" maxlength="512" size="60"/></td></tr>'
     + '<tr><th/><td><div id="error_publisher" class="formError"></div></td></tr>'
     + '<tr><th><label for="id_publisher">Publisher</label></th><td><input id="id_publisher" type="text" name="publisher" maxlength="255" size="60"/></td></tr>'
     + '<tr><th/><td><div id="error_rights" class="formError"></div></td></tr>'
     + '<tr><th><label for="id_rights">Copyright information</label></th><td><input id="id_rights" type="text" name="rights" maxlength="255" size="60"/></td></tr>'
     + '<tr><th/><td><div id="error_license" class="formError"></div></td></tr>'
     + '<tr><th><label for="id_license">License</label></th><td><select name="license" id="id_license"><option value="" selected="selected">---------</option><option value="http://creativecommons.org/publicdomain/mark/1.0/">Public Domain</option><option value="http://creativecommons.org/licenses/by/3.0">Creative Commons CC-BY</option><option value="http://creativecommons.org/licenses/by-nd/3.0">Creative Commons CC-BY-ND</option><option value="http://creativecommons.org/licenses/by-nc-sa/3.0">Creative Commons CC-BY-NC-SA</option><option value="http://creativecommons.org/licenses/by-sa/3.0">Creative Commons CC-BY-SA</option><option value="http://creativecommons.org/licenses/by-nc/3.0">Creative Commons CC-BY-NC</option><option value="http://creativecommons.org/licenses/by-nc-nd/3.0">Creative Commons CC-BY-NC-ND</option></select></td></tr>'
     + '<tr><th/><td><div id="error_morePermissions" class="formError"></div></td></tr>'
     + '<tr><th><label for="id_morePermissions">Other permissions</label></th><td><textarea id="id_morePermissions" rows="2" cols="65" name="morePermissions"></textarea></td></tr>'
     + '<tr><th/><td><div id="error_acceptTerms" class="formError"></div></td></tr>'
     + '<tr><th><label for="id_acceptTerms">Terms *</label></th><td><input type="checkbox" name="acceptTerms" id="id_acceptTerms" /> I have read and accept the <a href="'
     + geocamMapSetLib.managerRef.opts.termsOfServiceUrl
     + '" target="termsOfService" style="font-weight: bold; text-decoration: underline;">terms of service for this site</a>, which include a description of how the site can share my map layer with other users.</td></tr>'
     + '<tr><th/><td class="formInstructions"><br/>* indicates required fields.</td></tr>'
     + '</table>'
     + '</form>'
     + '<div id="dialogError" class="error"></div>');

    dialogDiv.dialog({
        modal: true,
        draggable: false,
        width: 800,
        buttons: [

            {
                'text': 'Save',
                'click': function () {
                    $('#dialogDiv .formError').html('');
	            var text = JSON.stringify($('#newLayerForm').serializeObject());
	            $.post(geocamMapSetLib.newLayer.metaUrl,
                           text,
		           function (response) {
                               $('#dialogDiv').dialog('close');
                               loadLibrary(true);
                               return false;
		           },
                           'json')
                        .fail(function (xhr) {
                            var errText;
                            if (xhr.readyState == 0) {
                                errText = "couldn't connect to server";
                            } else if (xhr.readyState == 4) {
                                var hasJsonError = false;
                                if (xhr.responseText != null) {
                                    var response = null;
                                    try {
                                        response = JSON.parse(xhr.responseText);
                                    } catch (SyntaxError) {
                                        // do nothing
                                    }
                                    if (response != null && response.error != null) {
                                        $.each(response.error, function (field, error) {
                                            $('#error_' + field).html(error.join('<br/>'));
                                            hasJsonError = true;
                                        });
                                    }
                                }
                                if (!hasJsonError) {
                                    errText = "HTTP error " + xhr.status
                                        + " (" + xhr.statusText + ")";
                                }
                            } else {
                                errText = "unknown error";
                            }
                            if (errText != null) {
                                $('#dialogError').html('Last save failed: ' + errText);
                            }
                            return false;
                        });
	            return false;
	        }
            },

            {
                'text': 'Cancel',
                'click': function () {
                    $(this).dialog("close");
                }
            }
            
        ]
    });

    // pressing enter in the dialog should click the 'Save' button
    if (geocamMapSetLib.managerRef.dialogKeypressBound == null) {
        $('#dialogDiv').keypress(function (e) {
            if (e.keyCode == $.ui.keyCode.ENTER) {
                $(this).parent().find('.ui-dialog-buttonpane button:first').click();
            }
        });
        geocamMapSetLib.managerRef.dialogKeypressBound = true;
    }
}

// mapSetManager.drawLibraryDiv() 
// 
// Clean the libraryDiv and draw the html content based on the map layer
// library in JSON format
//
// Dependencies:
// @geocamMapSetLib.mapLibraryList is the object representation of a set of map layers.
// @this.libraryDivId is the ID of the libraryDiv. 
//
function drawLibraryDiv() {
    
    var mapLibraryList = geocamMapSetLib.mapLibraryList;
    var mapLibraryViewHtml = [];

    mapLibraryViewHtml.push('<button id="newLayer">New Layer</button>');
    mapLibraryViewHtml.push('<div id="mapLibraryList">');

    // iterate through the mapLibraryList and create the html entries
    //
    $.each(mapLibraryList, function (i, layer) {
        mapLibraryViewHtml.push('<div class="libraryEntry">' 
            + layer.name
            + '<div class="metadata" id="' + i + '" style="visibility:hidden"' + '></div>'
            + '</div>');
        //console.log( "library layer " + i + ": " + layer.name );
    });

    mapLibraryViewHtml.push('</div>');

    // inject the html content to the libraryDiv
    //
    $(this.opts.libraryDiv).html(mapLibraryViewHtml.join(''));

    // assign draggable attribute to each libraryEntry 
    //
    // TODO: Synchronize is needed to ensure #mapLayerList is created.
    //       Alternatively, invoke drawLibraryDiv() after finishing
    //       drawEditorDivAndMapCanvas() explicitly.
    //
    $('.libraryEntry').draggable({
            connectToSortable: '#mapLayerList',
            helper: 'clone',
            revert: 'invalid', 
            revertDuration: 100
    });

    newLayerButton = $('#newLayer');
    newLayerButton.button();
    newLayerButton.click(newLayerStep1);
}



// utility function to dump the current state of the ui for debugging
//
function dumpDataMap(dataMap) {
    for (i=0; i < dataMap.length; i++) {
        console.log("htmlID=" + i + " jsonId="+ dataMap[i]);
    }
}


// toggle a button as enabled or disabled
//
function setButtonDisabled(button, disabled) {
    if (disabled) {
        button.button('disable');
    } else {
        button.button('enable');
    }
}

// FIX: this should probably be in a different file
jQuery.fn.serializeObject = function() {
    var arrayData, objectData;
    arrayData = this.serializeArray();
    objectData = {};

    $.each(arrayData, function() {
	var value;

	if (this.value != null) {
	    value = this.value;
	} else {
	    value = '';
	}

	if (objectData[this.name] != null) {
	    if (!objectData[this.name].push) {
		objectData[this.name] = [objectData[this.name]];
	    }

	    objectData[this.name].push(value);
	} else {
	    objectData[this.name] = value;
	}
    });

    return objectData;
};
