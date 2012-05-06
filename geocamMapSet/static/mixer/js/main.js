/*
| __BEGIN_LICENSE__
| Copyright (C) 2008-2010 United States Government as represented by
| the Administrator of the National Aeronautics and Space Administration.
| All Rights Reserved.
| __END_LICENSE__
*/

// FIX: figure out where to put this
var myMapSetManager;
function testToggle(myMapSetManager) {
    var editable = myMapSetManager.isEditable();
    if (editable) {
        myMapSetManager.disableEditing();
    } else {
        myMapSetManager.enableEditing();
    }
}

requirejs.config({
    paths: {
        'json2': '../../external/js/json2',
        'underscore': '../../external/js/underscore',
        'backbone': '../../external/js/backbone-min',
        'Handlebars': '../../external/js/Handlebars',
        'hbs': '../../external/js/hbs',
        'jquery-ui': '../../external/js/jquery-ui-1.8.18.custom.min',
        'geocamMapSetLib': '../../geocamMapSet/js/geocamMapSetLib'
    },

    hbs: {
        templateExtension: 'html',
        disableI18n: true
    }
});

require([
    'jquery',
    'hbs!../templates/welcome',
    'hbs!../../geocamMapSet/templates/mapSet',
    'json2',
    'underscore',
    'backbone',
    'jquery-ui',
    'geocamMapSetLib'
], function ($, welcomeTemplate, mapSetTemplate) {

    var MapSetsView = Backbone.View.extend({
        el: '#mapSetList',

        initialize: function (mapSets) {
            _.bindAll(this, 'render');
            this.mapSets = mapSets;
        },

        render: function () {
            var text = [];
            $.each(this.mapSets, function (i, mapSet) {
                text.push('<li><a href="#user/' + mapSet.name + '">' + mapSet.name + '</a></li>');
            });
            $(this.el).html(text.join('\n'));
        }
    });

    var Workspace = Backbone.Router.extend({
        
        routes: {
            "dash": "dash",
            "welcome": "welcome",
            ":user/:mapSetName": "mapSet"
        },
        
        dash: function() {
            $('#content').html('<h3>Map Sets</h3>\n'
                               + '<ul id="mapSetList"></ul>\n');
            $.getJSON('/mixer/sets.json', function (mapSets) {
                var mapSetsView = new MapSetsView(mapSets);
                mapSetsView.render();
            });
        },
        
        welcome: function() {
            $('#content').html(welcomeTemplate({STATIC_URL: STATIC_URL}));
        },

        mapSet: function (user, mapSetName) {
            $('#content').html(mapSetTemplate({}));

            var spec = '/mixer/foo/HurricaneLayers.json';

            var myOptions = {
                center: new google.maps.LatLng(35, -95),
                zoom: 4,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

            myMapSetManager = geocamMapSetLib.MapSetManager(spec, map, '#mapset_canvas', '#mapsetlib_canvas');
        }
        
    });
    
    $(document).ready(function () {
        new Workspace();
        Backbone.history.start();
    });

});
