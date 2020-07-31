var geocoder;
var map;
var add_location_marker;

function gmaps_init(){
    var latlng = new google.maps.LatLng(1.3667, 103.8000);

    var options = {
        zoom: 11,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById("gmaps-canvas"), options);

    geocoder = new google.maps.Geocoder();

    add_location_marker = new google.maps.Marker({
        map: map,
        draggable: true
    });

    google.maps.event.addListener(add_location_marker, "dragend", function() {
        geocode_lookup( "latLng", add_location_marker.getPosition() );
    });

    google.maps.event.addListener(map, "click", function(event) {
        add_location_marker.setPosition(event.latLng)
        geocode_lookup("latLng", event.latLng);
    });

    $("#gmaps-error").hide();
}

function update_map(geometry) {
    map.fitBounds(geometry.viewport)
    add_location_marker.setPosition(geometry.location)
}

function update_ui(address, latLng) {
    $("#gmaps-input-address").autocomplete("close");
    $("#gmaps-input-address").val(address);
    $("#add_location_lat").val(latLng.lat());
    $("#add_location_long").val(latLng.lng());
}

function geocode_lookup(type, value, update) {
    update = typeof update !== "undefined" ? update : false;

    request = {};
    request[type] = value;

    geocoder.geocode(request, function(results, status) {
        $("#gmaps-error").html("");
        $("#gmaps-error").hide();
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[0]) {
                update_ui(results[0].formatted_address, results[0].geometry.location)

                if(update) {update_map(results[0].geometry)}
            } else {
                $("#gmaps-error").html("Sorry, something went wrong. Try again!");
                $("#gmaps-error").show();
            }
        } else {

            if( type == 'address' ) {
                $("#gmaps-error").html("Sorry! We couldn't find " + value + ". Try a different search term, or click the map.");
                $("#gmaps-error").show();
            } else {
                $("#gmaps-error").html("Woah... that's pretty remote! You're going to have to manually enter a place name." );
                $("#gmaps-error").show();
                update_ui("", value)
            }
        }
    });
}

function autocomplete_init() {
    $("#gmaps-input-address").autocomplete({
        source: function(request,response) {
            geocoder.geocode({"address": request.term }, function(results, status) {
                response($.map(results, function(item) {
                    return {
                        label: item.formatted_address,
                        value: item.formatted_address,
                        geocode: item
                    }
                }));
            })
        },

        select: function(event,ui){
            update_ui(ui.item.value, ui.item.geocode.geometry.location)
            update_map(ui.item.geocode.geometry)
        }
    });

    $("#gmaps-input-address").bind("keydown", function(event) {
        if(event.keyCode == 13) {
            geocode_lookup("address", $("#gmaps-input-address").val(), true);

        $("#gmaps-input-address").autocomplete("disable")
        } else {
            $("#gmaps-input-address").autocomplete("enable")
        }
    });
}

$(document).ready(function() {
    if($("#gmaps-canvas").length) {
        gmaps_init();
        autocomplete_init();
    }
});
