
function renderMapSets(url) {
    $.getJSON(url, renderMapSets2);
}

function addMapSetList(htmlList, mapSetList) {
    if (mapSetList.length == 0) {
	htmlList.push('<div class="emptyList">(none created yet)</div>');
    } else {
	htmlList.push('<ul>');
	$.each(mapSetList, function (i, mapSet) {
   	    htmlList.push('<li><a class="mapSetLink" href="' + mapSet.viewUrl + '">' + mapSet.name + '</a></li>');
	});
	htmlList.push('</ul>');
    }
    
}

function renderMapSets2(mapSets) {
    var yourMapSets = [];
    var otherMapSets = [];
    $.each(mapSets, function (i, mapSet) {
	if (mapSet.author == userG) {
	    yourMapSets.push(mapSet);
	} else {
	    otherMapSets.push(mapSet);
	}
    });
    

    var result = [];
    result.push('<div class="sectionHeader">Your Map Sets</div>');
    addMapSetList(result, yourMapSets);

    result.push('<div class="sectionHeader">Other Map Sets</div>');
    addMapSetList(result, otherMapSets);

    $('#dashbody').html(result.join(''));
}