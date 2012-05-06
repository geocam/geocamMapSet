/*
| __BEGIN_LICENSE__
| Copyright (C) 2008-2010 United States Government as represented by
| the Administrator of the National Aeronautics and Space Administration.
| All Rights Reserved.
| __END_LICENSE__
*/

// FIX: figure out a better place to put this
var myMapSetManager;
function testToggle(myMapSetManager) {
    var editable = myMapSetManager.isEditable();
    if (editable) {
        myMapSetManager.disableEditing();
    } else {
        myMapSetManager.enableEditing();
    }
}

define([
    'jquery',
    'text!../templates/welcome.html',
    'text!../../geocamMapSet/templates/mapSet.html',
    'json2',
    'underscore',
    'backbone',
    'jquery-ui',
    'geocamMapSetLib'
], function ($, welcomeTemplate, mapSetTemplate) {

    // interpret underscore templates django-style -- {{ var }}
    _.templateSettings.interpolate = /\{\{(.+?)\}\}/g;

    var welcomeTemplate = _.template(welcomeTemplate);
    var mapSetTemplate = _.template(mapSetTemplate);

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

    return {};
});
