/*
| __BEGIN_LICENSE__
| Copyright (C) 2008-2010 United States Government as represented by
| the Administrator of the National Aeronautics and Space Administration.
| All Rights Reserved.
| __END_LICENSE__
*/

requirejs.config({
    paths: {
        'json2': '../../external/js/json2',
        'underscore': '../../external/js/underscore',
        'backbone': '../../external/js/backbone-min',
        'Handlebars': '../../external/js/Handlebars',
        'hbs': '../../external/js/hbs',
    },

    hbs: {
        templateExtension: 'html',
        disableI18n: true
    }
});

require([
    'jquery',
    'hbs!../templates/welcome',
    'json2',
    'underscore',
    'backbone'
], function ($, welcomeTemplate) {

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
            "welcome": "welcome"
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
        }
        
    });
    
    $(document).ready(function () {
        new Workspace();
        Backbone.history.start();
    });

});
