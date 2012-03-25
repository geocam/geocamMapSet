var geocamMapSetLib = geocamMapSetLib || {};



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
            console.log(i)
            console.log(layer.url)

            // create mapset viewer content
            //
            mapSetViewHtml.push
                ('<div class="layerEntry">'
                 +'<input type="checkbox" id="showLayer_' + i +'"></input>'
                 +'<label for="showLayer_' + i + '"><b>' + layer.name + '</b> (KML)[<a href=' + layer.url +'>SRC</a>]'+ '</label>'
                 + '</ul></div>');

            
            // add map layer to global array for map management
            //
            mapLayers[i] = new google.maps.KmlLayer(layer.url, {preserveViewport: true});
        });

        mapSetViewHtml.push('</div>');
        manageDivId.html(mapSetViewHtml.join(''));
  
        // make the layer list sortable 
        $('#mapLayerList').sortable();

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

        mapSetManager.disableEditing = function () {
            $('#mapLayerList').sortable({disabled: true});
        }

        mapSetManager.enableEditing = function (savedUrl) {
            $('#mapLayerList').sortable({disabled: false});
        }
 
    });

    return mapSetManager;
}
