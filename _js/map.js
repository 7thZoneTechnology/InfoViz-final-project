var map;
var markers =[];
var markerSizeArray = [20, 15, 10, 7, 5]

function initialize() {

  var mapStyleArray	=[
					  {
					    "stylers": [
					      { "saturation": -80 }
					    ]
					  },{
					    "featureType": "landscape.natural",
					    "stylers": [
					      { "visibility": "off" }
					    ]
					  },{
					    "featureType": "administrative",
					    "elementType": "labels.text.fill",
					    "stylers": [
					      { "color": "#808080" }
					    ]
					  },{
					    "featureType": "transit",
					    "stylers": [
					      { "visibility": "off" }
					    ]
					  },{
					    "featureType": "road",
					    "stylers": [
					      { "visibility": "off" }
					    ]
					  }
					]

  var mapOptions = {
    zoom: 2,
    center: {lat: 39.9040300, lng: 116.4075260}
    // center: {lat:37.459,lng:-122.1781}
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);
  map.setOptions({styles: mapStyleArray});

  drawMarkers();
}

function drawMarkers(){
	//read data table to plot IP geolocations
	$.get("_data/domainData.csv", function (data){
	  // split the csv by line ("\n")
	  lines = data.split("\n");

	  mapMarkerArray = [];
	  // loop through each line using $.each
	  $.each(lines, function(lineNo, line) {
	  	if(lineNo !=0 ){
	  		items = line.split(";");
	  		domainname = items[0];
	  		rank = parseInt(items[1]);
	  		blocked = parseInt(items[2]);
	  		ipAddress = items[3];
	  		country = items[4];
	  		city = items[5];
	  		lat = parseFloat(items[6]);
	  		lon = parseFloat(items[7]);
	  		siteDesc = items[8];

	  		//convert domain rank to marker size
	  		if(rank <=150){
	  			markerSize = markerSizeArray[0];
	  		}
	  		else if(rank <=500){
	  			markerSize = markerSizeArray[1];
	  		}
	  		else if(rank <=1000){
	  			markerSize = markerSizeArray[2];
	  		}
	  		else if(rank <=3000){
	  			markerSize= markerSizeArray[3];
	  		}
	  		else{
	  			markerSize = markerSizeArray[4];
	  		}
	  		//convert blocked times to marker color
	  		if(blocked == 1){
	  			markerColor = "#FDFF3A"; //yellow
	  		}
	  		else if(blocked == 2){
	  			markerColor = "#F15E00"; //orange red
	  			// markerColor = "#DA251D";
	  		}
	  		else{
	  			markerColor = "#A12E33"; //red
	  			// markerColor = "#5A1A74";
	  		}

	  		//create info window content
	  		var contentStr = '<div id="infoContent"><p><b>'+ 
	  						domainname+ '</b></p>'+
	  						'<p>Global Traffic Rank: ' + rank +'</p>'+
	  						'<p>' + siteDesc + '</p></div>'
	  		var infowindow = new google.maps.InfoWindow({
							      content: contentStr
							  });

	  		var marker = new google.maps.Marker({
				    position: {lat: lat, lng: lon},
				    icon: {
				      path: google.maps.SymbolPath.CIRCLE,
				      fillColor: markerColor,
				    fillOpacity: .4,
				    scale: markerSize,
				    strokeColor: markerColor,
				    strokeWeight: 0.5,
				    strokeOpacity: 0.3
				    },
				    map: map
				  });
	  		markers.push(marker);

	  		google.maps.event.addListener(marker, 'mouseover', function() {
			    infowindow.open(map,marker);
			  });
	  		google.maps.event.addListener(marker, 'mouseout', function() {
			    infowindow.close();
			  });

	  	} //end if lineNo =0
	   }); //end for each line in csv file
	 }); //end $.get csv file
}//end drawMarkers

function showAll(){
	setAllMarkers(map);
}

//show only the top 150(based on Alexa rank) blocked website
function showTopBlocked(){
	clearAllMarkers();
	for (var i = 0; i < 150; i++) {
		markers[i].setMap(map);	
	 }
}

//show only the sites that are blocked by both DNS and HTTP, and IP if applicable
function showMostBlocked(){
	clearAllMarkers();
	for (var i = 0; i < markers.length; i++) {
		//if marker color is not yellow, show marker.
		// domain that is blocked by only one of DNS or HTTP is yellow
		if (markers[i].icon.strokeColor != "#FDFF3A"){
			markers[i].setMap(map);		
		}
	 }
}

function clearAllMarkers(){
	setAllMarkers(null);
}

function setAllMarkers(map){
	for (var i = 0; i < markers.length; i++) {
	    markers[i].setMap(map);
	 }
}

