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
        'text': '../../external/js/text',
        'jquery-ui': '../../external/js/jquery-ui-1.8.18.custom.min',
        'geocamMapSetLib': '../../geocamMapSet/js/geocamMapSetLib'
    },

    hbs: {
        templateExtension: 'html',
        disableI18n: true
    }
});

require([
    'app'
], function () {});
