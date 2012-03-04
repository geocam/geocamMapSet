var geocamMapSetLib = geocamMapSetLib || {};

/* MapSet(spec, map, manageDivId, opts)
 *
 * Constructor that creates and displays a map set.
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
geocamMapSetLib.MapSet = function (spec, map, manageDivId, opts) {

    // TODO: input validation (google search 'javascript function type
    // checking', 'javascript function args', 'javascript typeof')
    //
    
    var url = spec;
    var mapsetjson = "something";

    var mapLayers = [];

    $.getJSON(spec, function (obj) {
        mapSet = obj;
        var mapSetViewHtml = [];

        $.each(mapSet.children, function (i, layer) {
            console.log(i)
            console.log(layer.url)

            // create mapset viewer content
            //
            mapSetViewHtml.push
                ('<div class="layerEntry">'
                 +'<input type="checkbox" id="showLayer_' + i +'"></input>'
                 +'<label for="showLayer_' + i + '"><b>' + layer.name + '</b></label>'
                 +'<ul>'
                 + '<li>Type: ' + layer.type + '</li>'
                 +'<li>Url: <a href=' + layer.url + '>' + layer.url + '</a></li>'
                 + '</ul></div>');

            // add map layer to global array for map management
            //
            mapLayers[i] = new google.maps.KmlLayer(layer.url, {preserveViewport: true});
        });

        manageDivId.html(mapSetViewHtml.join(''));

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
    });
}
