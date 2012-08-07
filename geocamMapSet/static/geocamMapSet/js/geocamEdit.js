/**************************
* Application
**************************/

/*
 * This is the main application where you would put any global variables.
 * You can also insert anything you want done at the start of the session inside the ready function.
 */
GeocamResponderMaps = Em.Application.create({
	//
	mapSetName: 'Untitled',
	HOST: 'http://'+window.location.host+'/',
	MAPSET: (window.location.pathname).slice(5,window.location.pathname.length-1),
	ready: function(){
			GeocamResponderMaps.MapController.showMap();
		$.get(GeocamResponderMaps.HOST+'api/layers/', function(data){
			GeocamResponderMaps.LibController.loadMapset();
			GeocamResponderMaps.NewFileController.loadLibrary(data);
    	});
		
	},
	cancel: function(event) {
        event.preventDefault();
        return false;
    },
    

});


/**************************
* Models
**************************/
/*
 * User model
 */
GeocamResponderMaps.User = Em.Object.extend({
    username: null,
    password: null,
    email: null,
});
/*
 * Map overlay metadata container that is used in the library
 */
GeocamResponderMaps.MapOverlay = Em.Object.extend({
    externalUrl: null,
    localCopy: null,
    complete: null,
    name: null,
    type: null,
    description: null,
    coverage: null,
    creator: null,
    contributors: null,
    publisher: null,
    rights: null,
    license: null,
    morePermissions: null,
    acceptTerms: false,
    json: null,
    toString: function(){
    	return this.name;
    },
 // ember objects cannot be stringified because they are circular. This creates a non-circular version of the object.
    getJson: function() { 
        var v, ret = [];
        for (var key in this) {
            if (this.hasOwnProperty(key)) {
                v = this[key];
                if (v === 'toString') {
                    continue;
                } // ignore useless items
                if (Ember.typeOf(v) === 'function') {
                    continue;
                }
                if (Ember.typeOf(v) === 'object')
                	continue;
                
                ret.push(key);
            }
        }
        return this.getProperties(ret);

    },
    //returns a deep copy of this object
    copy: function(){
    	var newOverlay = GeocamResponderMaps.MapOverlay.create({
		   	externalUrl: this.externalUrl,
		    localCopy: this.localCopy,
		    complete: this.complete,
		    name: this.name,
		    type: this.type,
		    description: this.description,
		    coverage: this.coverage,
		    creator: this.creator,
		    contributors: this.contributors,
		    publisher: this.publisher,
		    rights: this.rights,
		    license: this.license,
		    morePermissions: this.morePermissions,
		    acceptTerms: this.acceptTerms,
    	});
    	return newOverlay;
    },
    //returns a mapSetOverlay of this object
    toMapSetOverlay: function(){
    	var url;
    	if(this.externalUrl != '')
    		url = this.externalUrl;
    	else
    		url = this.localCopy;
    	var newOverlay = GeocamResponderMaps.MapSetOverlay.create({
    		kmlObj: new google.maps.KmlLayer(url),
		   	url: url,
		    name: this.name,
		    type: this.type,
    	});
    	return newOverlay;
    },
});

/*
 * Overlay container for modified for the MapSet
 */
GeocamResponderMaps.MapSetOverlay = Em.Object.extend({
    url: '',
    name: '',
    type: '',
    json: '',
    kmlObj: null,
    toString: function(){
    	return this.name;
    },
 // ember objects cannot be stringified because they are circular. This creates a non-circular version of the object.
    getJson: function() { 
        var v, ret = [];
        for (var key in this) {
            if (this.hasOwnProperty(key)) {
                v = this[key];
                if (v === 'toString') {
                    continue;
                } // ignore useless items
                if (Ember.typeOf(v) === 'function') {
                    continue;
                }
                if (Ember.typeOf(v) === 'object')
                	continue;
                
                ret.push(key);
            }
        }
        return this.getProperties(ret);

    },
    compare: function(overlay){
    	//TODO not sure if needed
    }, 
    // returns a deep copy of self
    copy: function(){
    	var newOverlay = GeocamResponderMaps.MapSetOverlay.create({
		   	url: this.url,
		    name: this.name,
		    type: this.type,
		    kmlObj: this.kmlObj,
    	});
    	return newOverlay;
    },
});


/*
 * The overlay library. This holds MapOverlay objects, not the overlays themselves
 */
GeocamResponderMaps.Library = Em.Object.extend({
    MapOverlays: Em.A([]),
    add: function(overlay){
    	this.MapOverlays.insertAt(0, overlay);
    },
    remove: function(overlayIndex){
    	this.MapOverlays.removeAt(overlayIndex);
    },
    findOverlay: function(overlayUrl){
    	for(var i = 0; i<this.MapOverlays.length; i++){
    		if(this.MapOverlays.objectAt(i).externalUrl == overlayUrl)
    			return i;
    	}
    	return -1;
    },
    numOfOverlays: function(){
    	return MapOverlays.length;
    },
    sort: function(){//change this to however the library should be sorted. Currently most recent first
    	var lastIndex = this.MapOverlays.length-1;
    	var temp;
    	for(var i = 0;i<lastIndex;i++){
    		temp = this.MapOverlays.shiftObject();
    		this.MapOverlays.insertAt(lastIndex-i, temp);
    	}
    }
});
//MapSet object
GeocamResponderMaps.MapSet = Em.Object.extend({
    name: '',
    type: '',
    url: '',
    mapsetjson: '',	
    extensions: null,
    children: [],
 // ember objects cannot be stringified because they are circular. This creates a non-circular version of the object.
    getJson: function() { 
        var v, ret = [];
        for (var key in this) {
            if (this.hasOwnProperty(key)) {
                v = this[key];
                if (v === 'toString') {
                    continue;
                } // ignore useless items
                if (Ember.typeOf(v) === 'function') {
                    continue;
                }
                
                
                ret.push(key);
            }
        }
        return this.getProperties(ret);

    },
});


/**************************
* Views
**************************/

GeocamResponderMaps.UrlDialog = Ember.View.create({
    classNames: ['url_dialog',],
	template: Em.Handlebars.compile('<div id="divModalDialogUrl" class="divModalDialog">\
										<div id="modalInner1" >\
											<table id="selectFileMethod">\
									  			<tr>\
									  				<td>\
												<h6>From a URL</h6>\
												</td>\
												</tr>\
												<tr>\
													<td>\
														\
															<a {{action "modalWinUpload" target="GeocamResponderMaps.NewFileController"}}>Upload</a>\
														\
													</td>\
												</tr>\
											</table>\
											<div id="selectFile">\
												\
													{{view GeocamResponderMaps.FileURLTextField placeholder="URL"\ valueBinding="GeocamResponderMaps.NewFileController.externalUrl"}}\
												\
											</div>\
											\
											<button {{action "modalWinClose" target="GeocamResponderMaps.NewFileController"}}>Back</button>\
											<button {{action "modalWinForm" target="GeocamResponderMaps.NewFileController"}}>Next</button>\
											\
										</div>\
									</div>')

    
}).appendTo('body');



GeocamResponderMaps.FileDialog = Ember.View.create({
    classNames: ['file_dialog',],
	template: Em.Handlebars.compile('<div id="divModalDialogUpload" class="divModalDialog">\
									<div id="modalInner1" >\
										<table id="selectFileMethod">\
								  			<tr>\
								  				<td>\
													\
														<a {{action "modalWinUrl" target="GeocamResponderMaps.NewFileController"}}>From a URL</a>\
													\
												</td>\
											</tr>\
											<tr>\
												<td>\
													<h6>Upload</h6>\
												</td>\
											</tr>\
										</table>\
					\
										<div id="selectFile">\
											\
												<input type="file" style="position: relative; left: 200px; top: -275px;" id="fileUploadButton" name="fileUploadButton" onchange="GeocamResponderMaps.NewFileController.localFileSelect();"></input>\
											\
										</div>\
										\
										<button {{action "modalWinClose" target="GeocamResponderMaps.NewFileController"}}>Back</button>\
										<button {{action "modalWinForm" target="GeocamResponderMaps.NewFileController"}}>Next</button>\
										\
									</div>\
								</div>')

    
}).appendTo('body');

GeocamResponderMaps.FormDialog = Ember.View.create({
    classNames: ['form_dialog',],
	template: Em.Handlebars.compile('<div id="divModalDialogForm" class="divModalDialog">\
										<div id="modalInner2" >\
										\
											<table id="metaForm">\
												<tr>\
													<td>\
														<h3>Name*</h3>\
													</td>\
													<td>\
														{{view GeocamResponderMaps.FormInformation placeholder="Name*" valueBinding="GeocamResponderMaps.NewFileController.name"}}\
													</td>\
\
												</tr>\
												<tr>\
													<td>\
														<h3>Type*</h3>\
													</td>\
													<td>\
														{{view GeocamResponderMaps.FormInformation placeholder="Type*" valueBinding="GeocamResponderMaps.NewFileController.type"}}\
													</td>\
\
												</tr>\
												<tr>\
													<td>\
														<h3>Coverage</h3>\
													</td>\
													<td>\
														{{view GeocamResponderMaps.FormInformation placeholder="Coverage" valueBinding="GeocamResponderMaps.NewFileController.coverage"}}\
													</td>\
\
												</tr>\
												<tr>\
													<td>\
														<h3>Description</h3>\
													</td>\
													<td>\
														{{view GeocamResponderMaps.FormInformation placeholder="Description" valueBinding="GeocamResponderMaps.NewFileController.description"}}\
													</td>\
\
												</tr>\
												<tr>\
													<td>\
														<h3>Creator</h3>\
													</td>\
													<td>\
														{{view GeocamResponderMaps.FormInformation placeholder="Contributer" valueBinding="GeocamResponderMaps.NewFileController.creator"}}\
													</td>\
\
												</tr>\
												<tr>\
													<td>\
														<h3>Publisher</h3>\
													</td>\
													<td>\
														{{view GeocamResponderMaps.FormInformation placeholder="Publisher" valueBinding="GeocamResponderMaps.NewFileController.publisher"}}\
													</td>\
\
												</tr>\
												<tr>\
													<td>\
														<h3>Rights</h3>\
													</td>\
													<td>\
														{{view GeocamResponderMaps.FormInformation placeholder="Rights" valueBinding="GeocamResponderMaps.NewFileController.rights"}}\
													</td>\
\
												</tr>\
												<tr>\
													<td>\
														<h3>License</h3>\
													</td>\
													<td>\
														{{view GeocamResponderMaps.FormInformation placeholder="License" valueBinding="GeocamResponderMaps.NewFileController.license"}}\
													</td>\
\
												</tr>\
												<tr>\
													<td>\
														<h3>Permissions</h3>\
													</td>\
													<td>\
														{{view GeocamResponderMaps.FormInformation placeholder="Permissions" valueBinding="GeocamResponderMaps.NewFileController.permissions"}}\
													</td>\
\
												</tr>\
												<tr>\
													<td>\
														<h3>Terms*</h3>\
													</td>\
													<td>\
														<h2>{{view Ember.Checkbox valueBinding="GeocamResponderMaps.NewFileController.acceptTerms"}} I have read and accept the terms of service for this site, which include a description of how the site can share my map layer with other users.</h2>\
													</td>\
\
												</tr>\
											</table>\
					\
											<button {{action "modalWinUpload" target="GeocamResponderMaps.NewFileController"}}>Back</button>\
											<button {{action "modalWinCloseAndCreate" target="GeocamResponderMaps.NewFileController"}}>Next</button>\
			\
											\
										</div>\
				\
									</div>')

    
}).appendTo('body');


/*
 * Displays the name of the mapset. This name is stored in GeocamResponderMaps.mapSetName. When a map set is saved this name overwrites the mapsets name.
 */
GeocamResponderMaps.MapSetNameView = Ember.View.create({
    classNames: ['nameContainer'],
    template: Ember.Handlebars.compile('{{#if isEditing}}\
							    		{{view textField class="editing" placeholderBinding="GeocamResponderMaps.mapSetName" valueBinding="change"}}\
							    		{{else}}\
							    		{{GeocamResponderMaps.mapSetName}}\
							    		{{/if}}'),
	isEditing: false,
	change: '',
	doubleClick: function(){
		this.set('isEditing', !this.isEditing);
    	if(!this.isEditing){
    		if(this.change != ''){
    			GeocamResponderMaps.set('mapSetName', this.change); 
				this.set('change','');
    		}
		   }
	},
	
	textField: Em.TextField.extend({
	    insertNewline: function(){
	    	GeocamResponderMaps.MapSetNameView.doubleClick();
	        
	    }
	})
    
}).appendTo('#mapSetName');	

/*
 * defines the Mapset area 
 */
GeocamResponderMaps.MapSetButtons = Ember.View.create({
    classNames: ['map_set', 'overlayContainer'],
    template: Ember.Handlebars.compile('<button id="undo" {{action "undo" target="GeocamResponderMaps.LibController"}}>Undo</button><button id="redo" {{action "redo" target="GeocamResponderMaps.LibController"}}>Redo</button><button id="save" {{action "saveMapset" target="GeocamResponderMaps.LibController"}} >Save</button>')//<button id="load" {{action "loadMapset" target="GeocamResponderMaps.LibController"}} >Load</button><button id="load" {{action "dev" target="GeocamResponderMaps.LibController"}} >Dev Button</button>
    
}).appendTo('#mapset_canvas');

/*
 * holds the mapset items and the 'drop here' box. This is the container in which the scrollbar appears when there is an overflow.
 */
GeocamResponderMaps.MapSetView = Ember.View.create({
    classNames: ['map_set_bottom',],

    
}).appendTo('.map_set');

/*
 * defines the library area
 */
GeocamResponderMaps.LibraryView = Ember.View.create({
    classNames: ['library', 'overlayContainer'],
    template: Ember.Handlebars.compile('<button {{action "modalWinUrl" target="GeocamResponderMaps.NewFileController"}}>New Layer</button>{{view GeocamResponderMaps.FormInformation placeholder="Search" valueBinding=""}}')

}).appendTo('#mapsetlib_canvas');
/*
 * within the mapset area, contains the list of elements in the map set
 */
GeocamResponderMaps.MapSetsLib = Ember.CollectionView.create({
    tagName: 'ul',
    classNames: ['ulList'],
    content: Em.A([]),
    
    itemViewClass: Ember.View.extend({
      template: Ember.Handlebars.compile("{{content}}"),
      attributeBindings: 'draggable',
      draggable: 'true',
      
      dragStart: function(event) {
    	  
          var dataTransfer = event.originalEvent.dataTransfer;
          dataTransfer.setData('index', this.get('contentIndex'));
          dataTransfer.setData('origin', 'lib');
      }
    })
  }).appendTo('.library');

/*
 * within the library area, contains the list of elements in the library
 */
GeocamResponderMaps.MapSets = Ember.CollectionView.create({
    tagName: 'ul',
    classNames: ['ulList', 'mapsetdiv'],
    content: Em.A([]),
    /*
     * representation of each list item. There is one list item for each item in content, but they are not the same object.
     */
    itemViewClass: Ember.View.extend({
        template: Ember.Handlebars.compile(//isEditing switches this template between editing mode
        '<span>{{view Ember.Checkbox checkedBinding="isChecked" }}</span>\
        		{{#if isEditing}}\
        		  	{{view Ember.TextField class="editing" placeholderBinding="alias" valueBinding="change"}}\
    				<img src="/media/mixer/icons/cancel.png" {{action cancelEdit}}/>\
    				<img src="/media/mixer/icons/save.png" {{action edit}}/>\
        		{{else}}\
        			<div id="alias">{{alias}}</div>\
        			<img src="/media/mixer/icons/delete.png" {{action removeAndAddToUndo}}/>\
        			<img src="/media/mixer/icons/edit.ico" {{action edit}}/>\
        			<br class="clearBoth" />\
        		{{/if}}	'
        ),
        
        attributeBindings: ['draggable', 'style'],
        draggable: 'true',
        isChecked: false,
        isEditing: false,
        style: '', //creates the orange border when moving items around
        alias: '', 
        lastAlias: '',
        change: '', 
        /*
         * keeps track of the edit checkbox state
         */
        _isCheckedChanged: function(){
            var isChecked = this.get('isChecked');
            GeocamResponderMaps.LibController.displayOverlay(isChecked, GeocamResponderMaps.MapSets.content.objectAt(this.contentIndex).kmlObj);
        }.observes('isChecked'),
        /*
         * updates the name of the item every time the alias is changed. this is done this way instead of through the item name directly because 
         * handlebars does not allow extensive logic in the html, which would be necessary 
         */
        _aliasChanged: function(){
            var alias = this.get('alias');
            GeocamResponderMaps.MapSets.content.objectAt(this.get('contentIndex')).name = alias;
          
        }.observes('alias'),
        //this is called whenever the edit/save button is pressed to change the items name
        edit: function(){
        	this.set('isEditing', !this.isEditing);
        	if(this.isEditing){
        		this.set('lastAlias', this.alias);
        	} else{
        		if(this.change != ''){
        			GeocamResponderMaps.LibController.addToUndoStack('e'+this.get('contentIndex')+'-'+this.get('alias'), '');
        			this.set('alias', this.change); 
					this.set('change','');
					
        		}
			   }
        },
        //this clears any change that would have been named
        cancelEdit: function(){
        	this.set('isEditing', !this.isEditing);
        	this.set('alias', this.lastAlias);
        	this.set('change','');
        },
        dragEnter: function(event){
        this.set('style', "border-top: 5px solid #CD3700");
        event.preventDefault();
    	},
    	dragLeave: function(event){
    		this.set('style', "");
            event.preventDefault();
    	},
    	//this does the same thing as dragEnter
        dragOver: function(event){
            this.set('style', "border-top: 5px solid #CD3700");
            event.preventDefault();
        	},
        //where the item is being dragged from and its index is stored in the dataTransfer object
        dragStart: function(event) {
            var dataTransfer = event.originalEvent.dataTransfer;
            dataTransfer.setData('index', this.get('contentIndex'));
            dataTransfer.setData('origin', 'set');
        },
        /*
         * This is an add/move method for each list item. when an item is added, the item takes the index of whatever item it was dropped on.
         * This method is slightly different from the 'drop here' box's drop method.
         */
        drop: function(event) {
            var indexFrom = parseInt(event.originalEvent.dataTransfer.getData('index'));
            var origin = event.originalEvent.dataTransfer.getData('origin'); //checks if you are bringing an overlay from the library or moving an item around in the mapSet
            var indexTo = GeocamResponderMaps.MapSets.content.indexOf(this.get('content'));
            var obj;
            var checked = false; //this allows me to keep track of the checked state through moving items 
            this.set('style', "");
            //if the overlay came from the mapset, save the object and remove it from the array. also adds it to the undo stack as a move
            if(origin=='set'){
            	obj = GeocamResponderMaps.MapSets.content.objectAt(indexFrom);
            	checked = GeocamResponderMaps.MapSets.get('childViews').objectAt(GeocamResponderMaps.MapSets.content.indexOf(obj)).get('isChecked');
            	GeocamResponderMaps.LibController.addToUndoStack('m'+indexTo+'-'+indexFrom, '');
            	GeocamResponderMaps.MapSets.content.removeAt(indexFrom);
            }
            else{ //else (if the item came from the library) copy the item from the library and add it to the undo stack
            	obj = GeocamResponderMaps.MapSetsLib.content.objectAt(indexFrom).toMapSetOverlay();
            	GeocamResponderMaps.LibController.addToUndoStack('a'+indexTo, obj);
            }
            
            
            
            GeocamResponderMaps.MapSets.content.insertAt(indexTo, obj);
            GeocamResponderMaps.LibController.updateContentIndices(indexTo);
            
            var that = GeocamResponderMaps.MapSets.get('childViews').objectAt(indexTo);
            that.set('alias', GeocamResponderMaps.MapSets.content.objectAt(that.get('contentIndex')).get('name'));
            that.set('isChecked', checked);

            event.preventDefault(); //this cancels the default drop method
           
            return false;
        },
        removeAndAddToUndo: function(){
        	GeocamResponderMaps.LibController.addToUndoStack('r'+this.get('contentIndex'), GeocamResponderMaps.MapSets.content.objectAt(this.get('contentIndex')));
        	this.remove();
        },
        remove: function(){
        	if(this.isChecked)
        		this.set('isChecked', false);
        	GeocamResponderMaps.LibController.removeOverlayFromMapSet(this);
        	GeocamResponderMaps.LibController.updateContentIndices(this.get('ContentIndex'));
        	
        },
        
        
    		
    
      })
  }).appendTo('.map_set_bottom');


//insert url text field
GeocamResponderMaps.FileURLTextField = Em.TextField.extend({
    insertNewline: function(){

    }
});


/*
 * The 'Drop Here' box. Similar to the drop method in the mapset items. Always added to the end of the list if dropped here.
 */
GeocamResponderMaps.DropHere = Ember.View.create({
    classNames: ['lastItem'],
    attributeBindings: ['display', 'style'],
	style: '',
    dragEnter: function(event){
        this.set('style', "border-top: 5px solid #CD3700");
        event.preventDefault();
    	},
    dragLeave: function(event){
    		this.set('style', "");
            event.preventDefault();
    	},
    	//this does the same thing as dragEnter
    dragOver: function(event){
            this.set('style', "border-top: 5px solid #CD3700");
            event.preventDefault();
        	},
        //where the item is being dragged from and its index is stored in the dataTransfer object
    dragStart: function(event) {
            var dataTransfer = event.originalEvent.dataTransfer;
            dataTransfer.setData('index', this.get('contentIndex'));

            dataTransfer.setData('origin', 'set');
        },
    drop: function(event){
    	this.set('style', "");
    	var indexFrom = parseInt(event.originalEvent.dataTransfer.getData('index'));
        var origin = event.originalEvent.dataTransfer.getData('origin');
        var indexTo =  GeocamResponderMaps.MapSets.content.length;
        var obj;
        var checked = false;
        if(origin=='set'){
        	obj = GeocamResponderMaps.MapSets.content.objectAt(indexFrom);
        	checked = GeocamResponderMaps.MapSets.get('childViews').objectAt(GeocamResponderMaps.MapSets.content.indexOf(obj)).get('isChecked');
        	GeocamResponderMaps.LibController.addToUndoStack('m'+(indexTo-1)+'-'+indexFrom, '');
        	GeocamResponderMaps.MapSets.content.removeAt(indexFrom);
         	indexTo = indexTo-1; //if just a move and not an add, removes the object from the content array and subtracts one from the index.
         						 // since the item is always added to the end of the array, this is always needed when moving
        }
        else{
        	obj = GeocamResponderMaps.MapSetsLib.content.objectAt(indexFrom).toMapSetOverlay();
        	GeocamResponderMaps.LibController.addToUndoStack('a'+indexTo, obj);
        }
        
        GeocamResponderMaps.MapSets.content.insertAt(indexTo, obj);
        
        GeocamResponderMaps.LibController.updateContentIndices(indexTo);
        var that = GeocamResponderMaps.MapSets.get('childViews').objectAt(indexTo);
    	that.set('alias', GeocamResponderMaps.MapSets.content.objectAt(that.get('contentIndex')).get('name'));
    	that.set('isChecked', checked);

        
        event.preventDefault();
       
        
    }
    
}).appendTo('.map_set_bottom');


/*
 * The 'Drop Here' box. Similar to the drop method in the mapset items. Always added to the end of the list if dropped here.
 */
GeocamResponderMaps.DropHere = Ember.View.create({
    classNames: ['DropHere'],
    attributeBindings: ['display'],
    template: Ember.Handlebars.compile('<h3>Drop Here</h3>'),
    dragEnter: GeocamResponderMaps.cancel,
    dragOver: GeocamResponderMaps.cancel,
    drop: function(event){
    	
    	var indexFrom = parseInt(event.originalEvent.dataTransfer.getData('index'));
        var origin = event.originalEvent.dataTransfer.getData('origin');
        var indexTo =  GeocamResponderMaps.MapSets.content.length;
        var obj;
        var checked = false;
        if(origin=='set'){
        	obj = GeocamResponderMaps.MapSets.content.objectAt(indexFrom);
        	checked = GeocamResponderMaps.MapSets.get('childViews').objectAt(GeocamResponderMaps.MapSets.content.indexOf(obj)).get('isChecked');
        	GeocamResponderMaps.LibController.addToUndoStack('m'+(indexTo-1)+'-'+indexFrom, '');
        	GeocamResponderMaps.MapSets.content.removeAt(indexFrom);
         	indexTo = indexTo-1; //if just a move and not an add, removes the object from the content array and subtracts one from the index.
         						 // since the item is always added to the end of the array, this is always needed when moving
        }
        else{
        	obj = GeocamResponderMaps.MapSetsLib.content.objectAt(indexFrom).toMapSetOverlay();
        	GeocamResponderMaps.LibController.addToUndoStack('a'+indexTo, obj);
        }
        
        GeocamResponderMaps.MapSets.content.insertAt(indexTo, obj);
        
        GeocamResponderMaps.LibController.updateContentIndices(indexTo);
        var that = GeocamResponderMaps.MapSets.get('childViews').objectAt(indexTo);
    	that.set('alias', GeocamResponderMaps.MapSets.content.objectAt(that.get('contentIndex')).get('name'));
    	that.set('isChecked', checked);

        
        event.preventDefault();
       
        
    }
    
}).appendTo('.map_set_bottom');


//the barebones textfield used in the new layer form for all the metadata
GeocamResponderMaps.FormInformation = Em.TextField.extend({
    insertNewline: function(){
        
    }
});




/***********************************************************************************
* Controllers
***********************************************************************************/
/*
 * Controls anything related to the library and mapset(except new overlay creation)
 */
GeocamResponderMaps.LibController = Em.ArrayController.create({
    contentLib: [],			
    undoStack: Em.A([]),	
    undoStackIndex: -1,		
    UNDO_STACK_MAX_SIZE: 50,
    currentMapSet: null,	
    library: GeocamResponderMaps.Library.create({MapOverlays: []}),
    updateLibrary: function() {
    	GeocamResponderMaps.MapSetsLib.content.clear();
    	GeocamResponderMaps.MapSetsLib.content.pushObjects(this.library.MapOverlays);
    },
    /*
     * The mapset consists of two arrays: content and display items. The display items have a contentIndex that is not updated
     * if it is moved in the array. This forces them to update and is called whenever an item is moved/removed/added.
     * It will update all display items from 'index' to the end
     */
    updateContentIndices: function(index){
    	var childs = GeocamResponderMaps.MapSets.get('childViews');
        for(index=0;index<GeocamResponderMaps.MapSets.content.length;index++){
        	childs.objectAt(index).set('contentIndex', index);
        }
    },
    /*
     * not currently used
     */
    setEmptyMapset: function(){
    	GeocamResponderMaps.LibController.currentMapSet = GeocamResponderMaps.MapSet.create({
			children: [],
			extensions: null,
			url: '',
			mapsetjson: '',
			name: GeocamResponderMaps.mapSetName,
			type: 'Document'
		});
    },
    dev: function(that){
    	console.log(GeocamResponderMaps.MapSets.content);
    	console.log(GeocamResponderMaps.LibController.currentMapSet);
    	console.log(GeocamResponderMaps.LibController.currentMapSet.getJson());
    	
    },
    /*
     * 'that' is an item object in the mapset. usually called with the 'this' keyword
     */
    removeOverlayFromMapSet: function(that){
    	var index = GeocamResponderMaps.MapSets.content.indexOf(that.get('content'));
    	GeocamResponderMaps.MapSets.content.removeAt(index);
    	
    },
    /*
     * Updates the mapset name and the overlays, then saves it.
     */
	saveMapset: function(){
		this.currentMapSet.name = GeocamResponderMaps.mapSetName;
		var temp = GeocamResponderMaps.MapSets.content;
		this.currentMapSet.children = [];
		for(var i=0;i<temp.length;i++){
			this.currentMapSet.children[i] = temp.objectAt(i).getJson();
		}
		$.ajax({
			   type: "PUT",
			   url: GeocamResponderMaps.HOST+'api/mapset/'+GeocamResponderMaps.MAPSET,
			   data: JSON.stringify(this.currentMapSet.getJson()),
			   contentType: 'application/json',
			   success: function(data) {
				   //console.log(data);
			   }
		});
    	
	},
	/*
	 * sets the currentMapSet to the loaded mapset, then creates mapsetOverlays from the loaded mapset and
	 * adds them to the mapset content array 
	 */
loadMapset: function(){
		
		//currently hardcoded url
		$.get(GeocamResponderMaps.HOST+'api/mapset/'+GeocamResponderMaps.MAPSET, function(data){
			var mapset = $.parseJSON(data);
			//console.log(mapset);
			GeocamResponderMaps.LibController.currentMapSet = GeocamResponderMaps.MapSet.create({
				children: mapset.children,
				extensions: mapset.extensions,
				url: GeocamResponderMaps.MAPSET,
				mapsetjson: mapset.mapsetjson,
				name: mapset.name,
				type: mapset.type
			});
			
			var overlay;
			GeocamResponderMaps.MapSets.content.clear();
			GeocamResponderMaps.set('mapSetName', mapset.name);
			for(var i = 0; i<mapset.children.length ;i++){
				overlay = GeocamResponderMaps.MapSetOverlay.create({
				    url: mapset.children[i].url,
				    name: mapset.children[i].name,
				    type: mapset.children[i].type,
				    kmlObj: new google.maps.KmlLayer(mapset.children[i].url)
				    });

					GeocamResponderMaps.LibController.undoSafeAdd((overlay), i);
				}
			
    	});

	},

	/*
	 * isChecked boolean: display overlay or hide it
	 * that itemViewClass: which overlay to display. usually called with 'this' keyword
	 */
    displayOverlay: function(isChecked, kmlObject){
    	if(isChecked){
    		GeocamResponderMaps.MapController.showOverlay(kmlObject);
    	}else{
    		GeocamResponderMaps.MapController.removeOverlay(kmlObject);

    	}
    },
    /*
	 * action based undo. If an undo, all redo's are cleared. If stack is full
	 * oldest action is removed before the new one is pushed on the top.
	 * 
	 * Udoable actions are:
	 * 	-remove		[r<position>]	[obj]
	 * 	-add		[a<position>]	[obj]
	 * 	-move		[m<position>-<from>]
	 *  -edit		[e<position>-<name>]
	 * 
	 * 
	 */
    addToUndoStack: function(action, obj){
    	
    	if(this.undoStackIndex == this.UNDO_STACK_MAX_SIZE){
    		this.undoStack.shiftObject();
    		this.undoStackIndex--;
    	}
    	this.undoStackIndex++;
    	this.undoStack = this.undoStack.slice(0, this.undoStackIndex);
    	this.undoStack.pushObject(Em.A([action, obj]));
    	//console.log('stack: '+this.undoStack+'   index: '+this.undoStackIndex);

    },
    /*
     * reads the next undo off of the stack and then removes it. Pop is not used because the last undo item is not
     * always the last item on the stack (redos use the same stack).
     * The inverse of the action is found and added to the stack. Then the undo action is done.
     */
    undo: function(){
    	if(this.undoStackIndex<0){
    		alert('No more undos');
    	}
    	else{

    		var action = ((this.undoStack).objectAt(this.undoStackIndex).slice(0));
    		this.undoStack.removeAt(this.undoStackIndex);
    		
    		this.undoStack.insertAt(this.undoStackIndex, this.inverse(action));
    		this.undoStackIndex--;
    		this.doAction(action);
    		//console.log('stack: '+this.undoStack+'   index'+this.undoStackIndex);
    	}
    		
    },
    /*
     * reads the next redo off of the stack and then removes it.
     * The inverse of the action is found and added to the stack. Then the redo action is done.
     */
    redo: function(){
    	if(this.undoStackIndex >= this.undoStack.length-1){
    		alert('No more redos');
    	}
    	else{

    		this.undoStackIndex++;
    		var action = this.undoStack.objectAt(this.undoStackIndex);
    		this.undoStack.removeAt(this.undoStackIndex);
    		this.undoStack.insertAt(this.undoStackIndex, this.inverse(action));
    		this.doAction(action);
    		//console.log('stack: '+this.undoStack+'   index'+this.undoStackIndex);
    	}
    	
    	
    },
    /*
     * actionA is the action array that consists of the action and an object (only used by add and remove).
     * reads the action and does it.
     */
    doAction: function(actionA){

    	var obj = actionA.objectAt(1);
    	var action = actionA.objectAt(0);
    	

    	var pos = parseInt(action.substring(1));
  	  	
    	switch(action.charAt(0))
    	{
    	case 'm':
    		var from = parseInt(action.substring(action.search('-')+1));
    	  this.undoSafeMove(pos, from);
    	  break;
    	case 'a':
    	  this.undoSafeRemove(pos);
    	  break;
    	case 'r':
    		this.undoSafeAdd(obj, pos);
    		break;
    	case 'e':    		
    		var name = action.substring(action.search('-')+1);
    		this.undoSafeEdit(name, pos);
    		break;
    	default:
    	  console.log('not an action');
    	}
    	
    },
    /*
     * actionA is the action array that consists of the action and an object (only used by add and remove).
     * Creates a new action that is the inverse of actionA
     */
    inverse: function(actionA){
    	
    	var inverted;
    	var obj = actionA.objectAt(1);
    	var action = actionA.objectAt(0);
    	switch(action.charAt(0))
    	{
    	case 'm':
    		var pos = parseInt(action.substring(1));
      	  var from = parseInt(action.substring(action.search('-')+1));
    	  inverted = Em.A(['m'+from+'-'+pos, obj]);
    	  break;
    	case 'a':
    	  inverted = Em.A(['r'+action.substring(1), obj]);
    	  break;
    	case 'r':
    		inverted = Em.A(['a'+action.substring(1), obj]);
    		break;
    	case 'e':
    		var pos = parseInt(action.substring(1));
        	 var name = GeocamResponderMaps.MapSets.get('childViews').objectAt(pos).get('alias');
        	 inverted = Em.A(['e'+pos+'-'+name, obj]);
    			break;
    	default:
    	  console.log('not an action');
    	}
    	return inverted;
    },
    undoSafeEdit: function(name, pos){
   	 	GeocamResponderMaps.MapSets.get('childViews').objectAt(pos).set('alias', name);
   	 	
    },
    undoSafeMove: function(from, to){
        var lastAlias = '';
        var obj; 
        
        obj = GeocamResponderMaps.MapSets.content.objectAt(from);
        lastAlias = GeocamResponderMaps.MapSets.get('childViews').objectAt(GeocamResponderMaps.MapSets.content.indexOf(obj)).get('lastAlias');	
        checked = GeocamResponderMaps.MapSets.get('childViews').objectAt(GeocamResponderMaps.MapSets.content.indexOf(obj)).get('isChecked');
        

        GeocamResponderMaps.MapSets.content.removeAt(from);
        
        GeocamResponderMaps.MapSets.content.insertAt(to, obj);
        
        GeocamResponderMaps.LibController.updateContentIndices(to);
        var that = GeocamResponderMaps.MapSets.get('childViews').objectAt(to);
        that.set('alias', GeocamResponderMaps.MapSets.content.objectAt(that.get('contentIndex')).get('name'));
        that.set('lastAlias', lastAlias);
        that.set('isChecked', checked);

    },
    undoSafeAdd: function(obj, to){
        
        GeocamResponderMaps.MapSets.content.insertAt(to, obj);
        GeocamResponderMaps.LibController.updateContentIndices(to);
        var that = GeocamResponderMaps.MapSets.get('childViews').objectAt(to);
        
        that.set('alias', GeocamResponderMaps.MapSets.content.objectAt(that.get('contentIndex')).get('name'));
        
        
    },
    undoSafeRemove: function(from){
    	GeocamResponderMaps.MapSets.get('childViews').objectAt(from).remove();
    },
    
});
/*
 * Controls creating new files (and updating once that is implimented)
 */
GeocamResponderMaps.NewFileController = Em.ArrayController.create({
    content: [],
    externalUrl: '',
    localCopy: null,
    complete: false,
    name: '',
    type: 'kml',
    description: '',
    coverage: '',
    creator: '',
    contributors: '',
    publisher: '',
    rights: '',
    license: '',
    morePermissions: '',
    acceptTerms: false,
    metaUrl: '',
    file: null,
    createPrep: function(){
    	//Anything that needs to be done before the form
   /* 	var metaUrl;
    	var externalUrl = this.externalUrl;
    	console.log(externalUrl);
    	$.post(GeocamResponderMaps.HOST+'layer/new/', JSON.stringify({externalUrl: externalUrl, hosting: "external"}), function(data){
			  metaUrl = data.result.metaUrl;
		  });
    	this.metaUrl = metaUrl;*/
    },
    /*
     * creates the new overlay and sends the data to the server, adds it to the library.
     */
    create: function(){
	   if(this.name == ''){
		   alert('Name must be filled in.');
		   return false;
	   }
	   else if(this.type == ''){
		   alert('Type must be filled in.');
		   return false;
	   }
	   else if(!this.acceptTerms){
		   alert('Must accept terms of service.');
		   return false;
	   }
	   else{
		   var newOverlay = GeocamResponderMaps.MapOverlay.create({
			   	externalUrl: this.externalUrl,
			    localCopy: this.localCopy,
			    complete: true,
			    name: this.name,
			    type: this.type,
			    description: this.description,
			    coverage: this.coverage,
			    creator: this.creator,
			    contributors: this.contributors,
			    publisher: this.publisher,
			    rights: this.rights,
			    license: this.license,
			    morePermissions: this.morePermissions,
			    acceptTerms: this.acceptTerms
	   });
		   //console.log(newOverlay.getJson());
	   
		   var formData = new FormData();
		   formData.append("externalUrl", this.externalUrl);
		   formData.append("localCopy", this.localCopy);
		   formData.append("complete", true);
		   formData.append("name", this.name);
		   formData.append("type", this.type);
		   formData.append("description", this.description);
		   formData.append("coverage", this.coverage);
		   formData.append("creator", this.creator);
		   formData.append("contributors", this.contributors);
		   formData.append("publisher", this.publisher);
		   formData.append("rights", this.rights);
		   formData.append("license", this.license);
		   formData.append("morePermissions", this.morePermissions);
		   formData.append("acceptTerms", this.acceptTerms);
		    $.ajax({
		        url: GeocamResponderMaps.HOST+'api/layers/',
		        type: 'POST',
		        data: formData,
		        async: false,
		        success: function (data) {
		            console.log(data);
		        },
		        cache: false,
		        contentType: false,
		        processData: false
		    });
	  GeocamResponderMaps.LibController.library.add(newOverlay);
	  GeocamResponderMaps.LibController.updateLibrary();
	  
	  this.resetValues();
	  return true;
	   }
   },
   /*
    * loads the library from the server. Each overlay must be created from the json and added to the library.
    */
   loadLibrary: function(data){//this loads the library
	   var i;
	  // var external;
	  // var id;
	   	for(var index = 0; index < data.length; index++){
	   		i = data[index];
	   		//id = i.json;
	   		//console.log(id);
	   		//external = false;
	   		//if(i.externalUrl != '')
	   		//	external = true;
		   var newOverlay = GeocamResponderMaps.MapOverlay.create({
			   	externalUrl: i.externalUrl,
			   	localCopy: GeocamResponderMaps.HOST +'media/'+ i.localCopy,
			    complete: i.complete,
			    name: i.name,
			    type: i.type,
			    description: i.description,
			    coverage: i.coverage,
			    creator: i.creator,
			    contributors: i.contributors,
			    publisher: i.publisher,
			    rights: i.rights,
			    license: i.license,
			    morePermissions: i.morePermissions,
			    acceptTerms: true,
		
	   });
	   	if(newOverlay.complete)
	   		GeocamResponderMaps.LibController.library.add(newOverlay);

	   	}
	   	GeocamResponderMaps.LibController.library.sort();
	  GeocamResponderMaps.LibController.updateLibrary();
	  this.resetValues();
	  return true;
	   },
	/*
	 * after the overlay is created, this clears all the values in the form so the information does not appear again
	 * the next time an overlay is created
	 */
	resetValues: function(){
		this.set('externalUrl', '');
		this.set('localCopy', null);
		this.set('complete', false);
		this.set('name', '');
	    this.set('type', 'kml');
	    this.set('description', '');
	    this.set('coverage', '');
	    this.set('creator', '');
	    this.set('contributors', '');
	    this.set('publisher', '');
	    this.set('rights', '');
	    this.set('license', '');
	    this.set('morePermissions', '');
	    this.set('acceptTerms', false);
	    document.getElementById('fileUploadButton').value='';
	},
	/*
	 * checks that the file is a kml file
	 */
	localFileSelect: function() {
	    var file = document.getElementById("fileUploadButton").files[0]; // FileList object
	    var type = "application/vnd.google-earth.kml+xml";
	    if(!type==file.type){
	    	alert("Please choose a kml file");
	    	document.getElementById('fileUploadButton').value='';
	    	return ;
	    }
	      var reader = new FileReader();
	      this.localCopy = file;
	      
	      
	  //    this.file = new FormData();
	      
	    //      this.file.append('', file);
	      
	      
	  },
	  /*
	   * TODO
	   * deals with uploading the file
	   */
	 fileUpload: function() {
			//starting setting some animation when the ajax starts and completes
		
		 
		 $.ajax({
			    url: GeocamResponderMaps.HOST+'layer/new/',
			    data: data,
			    cache: false,
			    contentType: false,
			    processData: false,
			    type: 'POST',
			    success: function(data){
			        alert(data);
			    }
			});
			
			return false;

	  },
	  /*
	   * opens the url choosing window
	   */
	  modalWinUrl: function() {
		  $( "#divModalDialogUrl" ).dialog({ closeText: '', closeOnEscape: false});
		  $( "#divModalDialogUpload" ).dialog('close');
		  $( "#divModalDialogForm" ).dialog('close');
	  },
	  /*
	   * opens the file choosing window
	   */
	  modalWinUpload: function() {
		  $( "#divModalDialogUpload" ).dialog({ closeText: '', closeOnEscape: false});
		  $( "#divModalDialogUrl" ).dialog('close');
		  $( "#divModalDialogForm" ).dialog('close');
	  },
	  /*
	   * opens the form window
	   */
	  modalWinForm: function() {
		  if(this.externalUrl != '')
			  this.createPrep();
		  else if(this.localCopy != null){
			  //console.log('');// this.fileUpload();
		  }
		  else{
			  alert('You need a file or a url.');
			  return false;
		  }
			  
		  $( "#divModalDialogForm" ).dialog({ closeText: '', closeOnEscape: false });
		  $( "#divModalDialogUrl" ).dialog('close');
		  $( "#divModalDialogUpload" ).dialog('close');
	  },
	  /*
	   * closes all the modal windows and resets the values without creating an overlay.
	   */
	  modalWinClose: function() {
		  $( "#divModalDialogForm" ).dialog('destroy');
		  $( "#divModalDialogUrl" ).dialog('destroy');
		  $( "#divModalDialogUpload" ).dialog('destroy');
		  this.resetValues();
	  },
	  /*
	   * closes all the modal windows and creats an overlay.
	   */
	  modalWinCloseAndCreate: function() {
		  if(this.create()){
		  $( "#divModalDialogForm" ).dialog('destroy');
		  $( "#divModalDialogUrl" ).dialog('destroy');
		  $( "#divModalDialogUpload" ).dialog('destroy');
		  }
		  
	  },

	  
    
});

/*
 * Controls the map logic (displaying the map and displaying/hiding overlays)
 */
GeocamResponderMaps.MapController = Em.ArrayController.create({
    content: Em.A([]),
    map: null,
     showMap: function() {
		
		// Creating a LatLng object containing the coordinate for the center of the map
		var latlng = new google.maps.LatLng(37.388163, -122.082138);
		// Creating an object literal containing the properties we want to pass to the map
		var options = {
		  zoom: 6,
		  center: latlng,
		  mapTypeId: google.maps.MapTypeId.ROADMAP
		}; 
		// Calling the constructor, thereby initializing the map
		var map = new google.maps.Map(document.getElementById("map_canvas"), options);
		this.map = map;
		
	},
	showOverlay: function(kml){
		kml.setMap(this.map);
	},
	removeOverlay: function(kml){
		kml.setMap(null);
	}
    
});

//http://www.littled.net/exp/gmap.kml?nocache=1341509049207
		//https://developers.google.com/kml/documentation/KML_Samples.kml
		//http://www.skisprungschanzen.com/EN/Ski+Jumps/USA-United+States/CA-California.kml
		//http://faculty.cs.wit.edu/~ldeligia/PROJECTS/TCP/StatesPolys/California.kml
		//http://cordc.ucsd.edu/projects/asbs/asbs_locations.kml
		//http://www.coolworks.com/listings/placemarks/california.kml
		//http://www.ca.gov/kml/CSU.kml
		/*
		 * 
		 */


