function show_location(map_div_id, lat, lon){
    var latlng = new google.maps.LatLng(lat, lon);

    var options = {
        zoom: 16,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var my_map = new google.maps.Map(document.getElementById(map_div_id), options);

    var geocoder = new google.maps.Geocoder();

    var show_location_marker = new google.maps.Marker({
        map: my_map,
        draggable: false
    });

    show_location_marker.setPosition(latlng);
}

$(document).ready(function() {
	$(".gmaps-canvas-location").each(function(i, obj){
 		show_location(obj.id, $(this).data("lat"), $(this).data("lon"));
	});
});
