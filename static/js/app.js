function tConvert (time) {
    time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

    if (time.length > 1) {
        time = time.slice (1);
        time[5] = +time[0] < 12 ? ' AM' : ' PM';
        time[0] = +time[0] % 12 || 12;
        time[3] = "";
    }
    return time.join ('');
}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return !(a.indexOf(i) > -1);});
};

bootbox.setDefaults({
    closeButton: false,
    className: "alert-modal"
});

$.pnotify.defaults.styling = "bootstrap3";
$.pnotify.defaults.history = false;
$.pnotify.defaults.nonblock = true;
$.pnotify.defaults.nonblock_opacity = 0.5;
$.pnotify.defaults.closer = false;
$.pnotify.defaults.sticker = false;
$.pnotify.defaults.delay = 3000;
$.pnotify.defaults.mouse_reset = false;

$(".selectpicker").selectpicker({
    showContent: false
});

$("#datetimepicker").datetimepicker({
    format: "DD/MM/YYYY hh:mm A"
});

$(".linkeddatetimepicker").each(function() {
    $(this).find(".date").each(function() {
        $(this).datetimepicker({
            format: "DD/MM/YYYY hh:mm A"
        });

        if ($(this).attr("data-value")) {
            $(this).data("DateTimePicker").setDate($(this).attr("data-value"));
        }
    });

    $(this).find(".date").each(function() {
        if ($(this).closest(".form-group").is(":first-child")) {
            if ($(this).attr("data-value") && $(this).attr("data-value") != "None") {
                $(this).closest(".form-group").next().find(".input-group").data("DateTimePicker").setStartDate($(this).data("DateTimePicker").getDate());
            }

            $(this).on("change.dp",function (e) {
                $(this).closest(".form-group").next().find(".date").data("DateTimePicker").setStartDate(e.date);
            });
        }

        else {
            if ($(this).attr("data-value") && $(this).attr("data-value") != "None") {
                $(this).closest(".form-group").prev().find(".input-group").data("DateTimePicker").setEndDate($(this).data("DateTimePicker").getDate());
            }

            $(this).on("change.dp",function (e) {
                $(this).closest(".form-group").prev().find(".date").data("DateTimePicker").setEndDate(e.date);
            });
        }
    });
});

if ($("#datetimepicker").length != 0){
    $("#datetimepicker").data("DateTimePicker").setDate($("#datetimepicker[data-value]").attr("data-value"));
}

$(".wysihtml5").wysihtml5({
    stylesheets: ["https://fonts.googleapis.com/css?family=Open+Sans", "/static/css/bootstrap-typography.min.css"]
});

$("tr[data-toggle='tooltip']").tooltip();
$("a[data-toggle='tooltip']").tooltip();

$(".upvoteLocation, .downvoteLocation").click(function() {
    $(this).siblings(".btn").removeClass("active");
    $(this).addClass("active");
});

$(".eventDateTime").each(function() {
    $(this).text(moment($(this).text()).format("LLLL"));
});

if ($("input[name='event_datetime']").attr("value") != undefined){
    if ($("input[name='event_datetime']").attr("value") != "") {
        date = $("input[name='event_datetime']").attr("value").split(" ")[0];
        time = $("input[name='event_datetime']").attr("value").split(" ")[1];
        time = time.split(":")[0] + ":" + time.split(":")[1];
        $("input[name='event_datetime']").val(date+"T"+time);
    }
}

$(".time").each(function(){
    $(this).attr("data-toggle", "tooltip");
    $(this).attr("title", moment($(this).text() + " +0000").format("LLL"));
    $(this).tooltip();
    $(this).text(moment($(this).text() + " +0000").fromNow());
});

$(".parseDate").each(function() {
    $(this).text(moment($(this).text()).format("dddd, MMMM D YYYY"));
});

$(".parseTime").each(function() {
    $(this).text(moment($(this).text()).format("h:mm A"));
});

$(".gotoAdd").click(function() {
    $("html, body").animate({
        scrollTop: $(".add").offset().top - 70
    }, 500);
});

if ($("input[name='date_voting_enabled']").prop("checked") == true){
    $(".dateOptions").hide();
    $(".linkeddatetimepicker").find(".date").each(function() {
        $(this).data("DateTimePicker").disable();
    });
}

$("input[name='date_voting_enabled']:radio").change(function() {
    $(".dateOptions").animate({ height: "toggle", opacity: "toggle" }, "slow");
    if ($("input[name='date_voting_enabled']").prop("checked") == false){
        $(".linkeddatetimepicker").find(".date").each(function() {
            $(this).find("input").attr("required", "");
            $(this).data("DateTimePicker").enable();
        });
    }
    else {
        $(".linkeddatetimepicker").find(".date").each(function() {
            $(this).find("input").removeAttr("required");
            $(this).data("DateTimePicker").disable();
        });
    }
});

if ($("option[value='voting']").prop("selected") == true){
    $(".locationOptions").hide();
}

$("select[name='location_type']").change(function() {
    $(".locationOptions").animate({ height: "toggle", opacity: "toggle" }, "slow");
    gmaps_init();
    autocomplete_init();
});

$(".date input").focus(function() {
    $(this).closest(".date").data("DateTimePicker").show();
});

$(".money").each(function() {
    $(this).text(parseFloat($(this).text()).toFixed("2"));
});

if (window.location.search.split(/[?&]/g).pop() == "notification=createEvent") {
    $.pnotify({
        title: "Event Created",
        text: "You have created the event \"" + $(".event").attr("data-name") + "\".",
        type: "success"
    });
    history.pushState(null, null, "event?id=" + $(".event").attr("data-id"));
}

if (window.location.search.split(/[?&]/g).pop() == "notification=editEvent") {
    $.pnotify({
        title: "Event Edited",
        text: "You have edited the event \"" + $(".event").attr("data-name") + "\".",
        type: "success"
    });
    history.pushState(null, null, "event?id=" + $(".event").attr("data-id"));
}

if (window.location.search.split(/[?&]/g).pop() == "notification=batchEmail") {
    $.pnotify({
        title: "Email Sent",
        text: "You have sent an email for the event \"" + $(".event").attr("data-name") + "\".",
        type: "success"
    });
    history.pushState(null, null, "event?id=" + $(".event").attr("data-id"));
}

if (window.location.search.split(/[?&]/g).pop() == "notification=deleteEvent") {
    $.pnotify({
        title: "Event Deleted",
        text: "You have deleted the event \"" + window.location.search.split(/[?&]/g)[window.location.search.split(/[?&]/g).length - 2].split("=")[1] + "\".",
        type: "success"
    });
    history.pushState(null, null, "/");
}

if (window.location.search.split(/[?&]/g).pop() == "notification=confirmDate") {
    $.pnotify({
        title: "Date Confirmed",
        text: "You have confirmed the date for the event \"" + $(".event").attr("data-name") + "\".",
        type: "success"
    });
    history.pushState(null, null, "/");
}

if (window.location.search.split(/[?&]/g).pop() == "notification=confirmLocation") {
    $.pnotify({
        title: "Location Confirmed",
        text: "You have confirmed the location \"" + $("dd").first().text() + "\" for the event \"" + $(".event").attr("data-name") + "\".",
        type: "success"
    });
    history.pushState(null, null, "/");
}

if (window.location.pathname == "/thread") {
    if ($(".lockThread").hasClass("active")) {
        $(".addPostArea").hide();
    }
    else {
        $(".addPostDisabled").hide();
    }

    setInterval(function() {
        dataString = {"id": $(".event").attr("data-id"), "thread_id": $(".thread").attr("data-id"), "type": "first_post"};
        target = $(this).closest(".panel");

        $.ajax({
            type: "POST",
            url: "/updateThread",
            data: dataString,
            success: function(data) {
                $(".panel").first().find(".post").html(data);
            }
        });

        old_times = [];

        $(".panel[data-post-time]").each(function() {
            old_times.push($(this).attr("data-post-time"))
        });

        dataString = {"id": $(".event").attr("data-id"), "thread_id": $(".thread").attr("data-id"), "type": "update_posts"};

        $.ajax({
            type: "POST",
            url: "/updateThread",
            data: dataString,
            success: function(data) {
                data = data.split("/");

                auth = data[data.length-1];

                if (auth == "True") {
                    new_times = data.slice(0,-1);

                    to_delete = old_times.diff(new_times);
                    to_add = new_times.diff(old_times);

                    for (var i = 0; i < to_delete.length; i++) {
                        $("[data-post-time]").each(function() {
                            if ($(this).attr("data-post-time") == to_delete[i]) {
                                $(this).animate({ height: "toggle", opacity: "toggle" }, "slow", function() { $(this).remove(); });
                            }
                        });
                    }

                    for (var i = 0; i < to_add.length; i++) {
                        dataString = {"id": $(".event").attr("data-id"), "thread_id": $(".thread").attr("data-id"), "type": "post_content", "time": to_add[i]};

                        to_add_time = to_add[i];

                        $.ajax({
                            type: "POST",
                            url: "/updateThread",
                            data: dataString,
                            success: function(data) {
                                data = data.split("/");

                                auth = data[data.length-1];

                                if (auth == "True") {
                                    raw_time = to_add_time;
                                    date = new Date(raw_time + " UTC").toDateString();
                                    time = new Date(raw_time + " UTC").toLocaleTimeString();
                                    formatted_date = date + ", " + tConvert(time);
                                    content = data.slice(0,-1).join("/");

                                    dataString = {"id": $(".event").attr("data-id"), "thread_id": $(".thread").attr("data-id"), "type": "post_author", "time": to_add_time};

                                    $.ajax({
                                        type: "POST",
                                        url: "/updateThread",
                                        data: dataString,
                                        success: function(data) {
                                            data = data.split("/");

                                            auth = data[data.length-1];

                                            if (auth == "True") {
                                                author = data.slice(0,-1).join("/");

                                                dataString = {"id": $(".event").attr("data-id"), "thread_id": $(".thread").attr("data-id"), "type": "post_author_public_profile_url", "time": to_add_time};

                                                $.ajax({
                                                    type: "POST",
                                                    url: "/updateThread",
                                                    data: dataString,
                                                    success: function(data) {
                                                        data = data.split("/");

                                                        auth = data[data.length-1];

                                                        if (auth == "True") {
                                                            author_public_profile_url = data.slice(0,-1).join("/");

                                                            dataString = {"id": $(".event").attr("data-id"), "thread_id": $(".thread").attr("data-id"), "type": "post_author_public_profile_photo_url", "time": to_add_time};

                                                            $.ajax({
                                                                type: "POST",
                                                                url: "/updateThread",
                                                                data: dataString,
                                                                success: function(data) {
                                                                    data = data.split("/");

                                                                    auth = data[data.length-1];

                                                                    if (auth == "True") {
                                                                        author_public_profile_photo_url = data.slice(0,-1).join("/");

                                                                        if ($(".event").attr("data-permissions") == "admin") {
                                                                            $("<div class='panel panel-default' data-post-time='" + raw_time + "'><div class='panel-heading'><h3 class='panel-title'><img src='" + author_public_profile_photo_url + "' class='img-profile'> <a href='" + author_public_profile_url + "'>" + author + "</a><span class='text-muted pull-right'>Posted <a href='#' class='time' data-toggle ='tooltip' data-time='" + raw_time + "' title='" + formatted_date + "'>" + moment(formatted_date).fromNow() + "</a></span></h3></div><div class='panel-body'>" + content + "</div><div class='panel-footer text-right'><button class='btn btn-danger deletePost' data-id='" + $(".addPost").attr("data-id") + "' data-thread-id='" + $(".addPost").attr("data-thread-id") + "' data-post-time='" + raw_time + "'><span class='glyphicon glyphicon-trash'></span></button></div></div>").insertBefore($(".panel").last()).hide().animate({ height: "toggle", opacity: "toggle" }, "slow");

                                                                            $(".panel:not('.add'):not(:first)").find(".btn").each(function() {
                                                                                $(this).unbind("click");
                                                                            });

                                                                            $(".deletePost").click(function() {
                                                                                that = $(this);
                                                                                bootbox.dialog({
                                                                                    title: "<span class='glyphicon glyphicon-warning-sign'></span> Confirm Delete",
                                                                                    message: "Are you sure you want to delete this post?",
                                                                                    buttons: {
                                                                                        cancel: {
                                                                                            label: "<span class='glyphicon glyphicon-ban-circle'></span> Cancel",
                                                                                            className: "btn-default"
                                                                                        },
                                                                                        main: {
                                                                                            label: "<span class='glyphicon glyphicon-trash'></span> Delete",
                                                                                            className: "btn-danger",
                                                                                            callback: function() {
                                                                                                dataString = {"id": that.attr("data-id"), "thread_id": that.attr("data-thread-id"), "post_time": that.attr("data-post-time")};
                                                                                                target = that.closest("body").find(".panel[data-post-time='" + that.attr("data-post-time") + "']");
                                                                                                $.ajax({
                                                                                                    type: "POST",
                                                                                                    url: "/deletePost",
                                                                                                    data: dataString,
                                                                                                    success: function(auth) {
                                                                                                        if (auth == "True"){
                                                                                                            target.animate({ height: "toggle", opacity: "toggle" }, "slow", function() { $(this).remove(); });
                                                                                                        }
                                                                                                    }
                                                                                                });
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                });
                                                                            });

                                                                            $("a[data-toggle='tooltip']").tooltip();
                                                                        }

                                                                        else {
                                                                            $("<div class='panel panel-default' data-post-time='" + raw_time + "'><div class='panel-heading'><h3 class='panel-title'><img src='" + author_public_profile_photo_url + "' class='img-profile'> <a href='" + author_public_profile_url + "'>" + author + "</a><span class='text-muted pull-right'>Posted <a href='#' class='time' data-toggle ='tooltip' title='" + formatted_date + "'>" + moment(formatted_date).fromNow() + "</a></span></h3></div><div class='panel-body'>" + content + "</div></div>").insertBefore($(".panel").last()).hide().animate({ height: "toggle", opacity: "toggle" }, "slow");///

                                                                            $("a[data-toggle='tooltip']").tooltip();
                                                                        }
                                                                    }
                                                                }
                                                            });
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            }
        });
    }, 1000);
}

$(".saveChanges").click(function() {
    dataString = {"user_name": $(this).closest("form").find("input[name='user_name']").val()};
    target = $(this).closest("form").find("input[name='user_name']");
    $.ajax({
        type: "POST",
        url: "/profile",
        data: dataString,
        success: function() {
            $(".user").attr("data-name", target.val()).html(target.val() + " <b class='caret'></b>")
            $.pnotify({
                title: "Changes Saved",
                text: "Your name has been changed to \"" + target.val() + "\".",
                type: "success"
            });
        }
    });
});

$(".going, .maybe, .notgoing").click(function() {
    dataString = {"id": $(this).closest(".btn-group").attr("data-id"), "participation": $(this).find("input").val()};
    target = $(this);
    $.ajax({
        type: "POST",
        url: "/eventParticipation",
        data: dataString,
        success: function() {
            if ($(".guests").find("li[data-id='" + $(".user").attr("data-id") + "']").length == 0){
                $(".status_count").text(parseInt($(".status_count").text()) + 1);
            }

            if ($(".guests").find("li[data-id='" + $(".user").attr("data-id") + "']").length == 0){
                if (target.hasClass("going")){
                    $(".guests").append("<li class='list-group-item' data-id='" + $(".user").attr("data-id") + "'><a href='#' data-toggle='tooltip' title='" + $(".user").attr("data-email") + "'><span class='name'>" + $(".user").attr("data-name") + "</span></a><span class='pull-right text-success status'>Going</span></li>");
                }

                else if (target.hasClass("maybe")){
                    $(".guests").append("<li class='list-group-item' data-id='" + $(".user").attr("data-id") + "'><a href='#' data-toggle='tooltip' title='" + $(".user").attr("data-email") + "'><span class='name'>" + $(".user").attr("data-name") + "</span></a><span class='pull-right text-warning status'>Maybe</span></li>");
                }

                else if (target.hasClass("notgoing")){
                    $(".guests").append("<li class='list-group-item' data-id='" + $(".user").attr("data-id") + "'><a href='#' data-toggle='tooltip' title='" + $(".user").attr("data-email") + "'><span class='name'>" + $(".user").attr("data-name") + "</span></a><span class='pull-right text-danger status'>Not Going</span></li>");
                }
            }

            else {
                if (target.hasClass("going")){
                    $(".guests").find("li[data-id='" + $(".user").attr("data-id") + "']").children(".status").text("Going").removeClass().addClass("status text-success pull-right");
                }

                else if (target.hasClass("maybe")){
                    $(".guests").find("li[data-id='" + $(".user").attr("data-id") + "']").children(".status").text("Maybe").removeClass().addClass("status text-warning pull-right");
                }

                else if (target.hasClass("notgoing")){
                    $(".guests").find("li[data-id='" + $(".user").attr("data-id") + "']").children(".status").text("Not Going").removeClass().addClass("status text-danger pull-right");
                }
            }

            if (target.hasClass("going") && $(".guests_going").find("li[data-id='" + $(".user").attr("data-id") + "']").length == 0){
                $(".going_count").text(parseInt($(".going_count").text()) + 1);

                if ($(".guests_maybe").find("li[data-id='" + $(".user").attr("data-id") + "']").length == 1){
                    $(".maybe_count").text(parseInt($(".maybe_count").text()) - 1);
                    $(".guests_going").append($(".guests_maybe").find("li[data-id='" + $(".user").attr("data-id") + "']"));
                }
                else if ($(".guests_notgoing").find("li[data-id='" + $(".user").attr("data-id") + "']").length == 1){
                    $(".notgoing_count").text(parseInt($(".notgoing_count").text()) - 1);
                    $(".guests_going").append($(".guests_notgoing").find("li[data-id='" + $(".user").attr("data-id") + "']"));
                }

                else {
                    $(".guests_going").append("<li class='list-group-item' data-id='" + $(".user").attr("data-id") + "'><a href='#' data-toggle='tooltip' title='" + $(".user").attr("data-email") + "'>" + $(".user").attr("data-name") + "</a></li>");
                }
            }

            else if (target.hasClass("maybe") && $(".guests_maybe").find("li[data-id='" + $(".user").attr("data-id") + "']").length == 0){
                $(".maybe_count").text(parseInt($(".maybe_count").text()) + 1);

                if ($(".guests_going").find("li[data-id='" + $(".user").attr("data-id") + "']").length == 1){
                    $(".going_count").text(parseInt($(".going_count").text()) - 1);
                    $(".guests_maybe").append($(".guests_going").find("li[data-id='" + $(".user").attr("data-id") + "']"));
                }
                else if ($(".guests_notgoing").find("li[data-id='" + $(".user").attr("data-id") + "']").length == 1){
                    $(".notgoing_count").text(parseInt($(".notgoing_count").text()) - 1);
                    $(".guests_maybe").append($(".guests_notgoing").find("li[data-id='" + $(".user").attr("data-id") + "']"));
                }

                else {
                    $(".guests_maybe").append("<li class='list-group-item' data-id='" + $(".user").attr("data-id") + "'><a href='#' data-toggle='tooltip' title='" + $(".user").attr("data-email") + "'>" + $(".user").attr("data-name") + "</a></li>");
                }
            }

            else if (target.hasClass("notgoing") && $(".guests_notgoing").find("li[data-id='" + $(".user").attr("data-id") + "']").length == 0){
                $(".notgoing_count").text(parseInt($(".notgoing_count").text()) + 1);

                if ($(".guests_maybe").find("li[data-id='" + $(".user").attr("data-id") + "']").length == 1){
                    $(".maybe_count").text(parseInt($(".maybe_count").text()) - 1);
                    $(".guests_notgoing").append($(".guests_maybe").find("li[data-id='" + $(".user").attr("data-id") + "']"));
                }
                else if ($(".guests_going").find("li[data-id='" + $(".user").attr("data-id") + "']").length == 1){
                    $(".going_count").text(parseInt($(".going_count").text()) - 1);
                    $(".guests_notgoing").append($(".guests_going").find("li[data-id='" + $(".user").attr("data-id") + "']"));
                }

                else {
                    $(".guests_notgoing").append("<li class='list-group-item' data-id='" + $(".user").attr("data-id") + "'><a href='#' data-toggle='tooltip' title='" + $(".user").attr("data-email") + "'>" + $(".user").attr("data-name") + "</a></li>");
                }
            }

            $(".addPostArea, .addThreadArea, .addLogisticsArea, .addLocationArea").children("form").show().parent().children("span").hide();

            $("a[data-toggle='tooltip']").tooltip();
        }
    });
});

$(".deleteEvent").click(function() {
    that = $(this);
    bootbox.dialog({
        title: "<span class='glyphicon glyphicon-warning-sign'></span> Confirm Delete",
        message: "Are you sure you want to delete <em>" + that.attr("data-name") + "</em>?",
        buttons: {
            cancel: {
                label: "<span class='glyphicon glyphicon-ban-circle'></span> Cancel",
                className: "btn-default"
            },
            main: {
                label: "<span class='glyphicon glyphicon-trash'></span> Delete",
                className: "btn-danger",
                callback: function() {
                    dataString = {"id": that.attr("data-id")};
                    target = that.closest(".event");
                    $.ajax({
                        type: "POST",
                        url: "/deleteEvent",
                        data: dataString,
                        success: function(auth) {
                            if (auth == "True"){
                                if (window.location.pathname != "/"){
                                    window.location.replace("/?name=" + $(".event").attr("data-name") + "&notification=deleteEvent");
                                }

                                else{
                                    $.pnotify({
                                        title: "Event Edited",
                                        text: "You have deleted the event \"" + target.attr("data-name") + "\".",
                                        type: "success"
                                    });
                                    target.animate({ height: "toggle", opacity: "toggle" }, "slow", function() {
                                        $(this).remove();
                                        if ($(".event-container").has(".event").length == 0){
                                            $("<h2 class='text-center text-muted'>No events</h2>").appendTo(".event-container").hide().fadeIn("slow");
                                        }
                                    });
                                }
                            }
                        }
                    });
                }
            }
        }
    });
});

$(".invite").click(function() {
    that = $(this);
    bootbox.dialog({
        title: "<span class='glyphicon glyphicon-share'></span> Enter email to invite",
        message: "<input type='text' class='form-control' placeholder='Seperate multiple emails with commas' id='email'>",
        buttons: {
            cancel: {
                label: "<span class='glyphicon glyphicon-ban-circle'></span> Cancel",
                className: "btn-default"
            },
            main: {
                label: "<span class='glyphicon glyphicon-share'></span> Invite",
                className: "btn-primary",
                callback: function() {
                    $("#email").tagsManager("pushTag", $("#email").val());
                    dataString = {"id": that.attr("data-id"), "email": $("#email").siblings("input[type='hidden']").val()};
                    $.ajax({
                        type: "POST",
                        url: "/invite",
                        data: dataString,
                        success: function() {
                            $.pnotify({
                                title: "Invitation(s) Sent",
                                text: "You have sent invitation(s) for the event \"" + $(".event").attr("data-name") + "\".",
                                type: "success"
                            });
                        },
                        error: function(data) {
                            $.pnotify({
                                title: "Invitation(s) Not Sent",
                                text: "You did not enter an email address.",
                                type: "error"
                            });
                        }
                    });
                }
            }
        }
    });
    $("#email").tagsManager();
});

$(".addDate").click(function() {
    dataString = {"id": $(this).attr("data-id"), "event_datetime_start": $(this).closest("form").find("input[name='event_datetime_start']").val(), "event_datetime_end": $(this).closest("form").find("input[name='event_datetime_end']").val()};
    target = $(this).closest(".panel");
    $.ajax({
        type: "POST",
        url: "/addDate",
        data: dataString,
        success: function(data) {
            data = data.split("/");

            if (data[1] == undefined){
                auth = data[0];
            }

            else {
                auth = data[1];
            }

            if (auth == "True" && $("input[name='event_datetime_start']").val() != "" && $("input[name='event_datetime_end']").val() != ""){
                $("<div class='panel panel-default'><div class='panel-body dateShown'><div class='text-center col-xs-12 col-sm-5'><div class='large-text parseTime'>" + moment(target.find("input[name='event_datetime_start']").val(), "DD/MM/YYYY hh:mm A").format("h:mm A") + "</div><div class='parseDate'>" + moment(target.find("input[name='event_datetime_start']").val(), "DD/MM/YYYY hh:mm A").format("dddd, MMMM D YYYY") + "</div></div><br class='visible-xs'><div class='large-text text-center col-xs-12 col-sm-2'><span class='glyphicon glyphicon-forward'></span></div><br class='visible-xs'><div class='text-center col-xs-12 col-sm-5'><div class='large-text parseTime'>" + moment(target.find("input[name='event_datetime_end']").val(), "DD/MM/YYYY hh:mm A").format("h:mm A") + "</div><div class='parseDate'>" + moment(target.find("input[name='event_datetime_end']").val(), "DD/MM/YYYY hh:mm A").format("dddd, MMMM D YYYY") + "</div></div></div><table class='table dateVotes'><tbody></tbody></table><div class='panel-body dateVotes'><button type='button' class='btn btn-default cancelViewDate'><span class='glyphicon glyphicon-ban-circle'></span> Cancel</button></div><div class='panel-footer'><div class='row'><div class='col-xs-7 col-sm-10'><div class='btn-group' data-toggle='buttons' data-date-id='" + data[0] + "'><label class='btn btn-default available col-xs-hide'><input type='radio' name='availability' value='available'><span class='glyphicon glyphicon-ok'></span><span> Available</span></label><label class='btn btn-default maybeavailable col-xs-hide'><input type='radio' name='availability' value='maybe'><span class='glyphicon glyphicon-adjust'></span><span> Maybe</span></label><label class='btn btn-default notavailable col-xs-hide'><input type='radio' name='availability' value='notavailable'><span class='glyphicon glyphicon-remove'></span><span> Not Available</span></label></div></div><div class='col-xs-5 col-sm-2 text-right'><button class='btn btn-success confirmDate' data-id='" + $(".event").attr("data-id") + "' data-date-id='" + data[0] + "'><span class='glyphicon glyphicon-ok'></span></button> <button type='button' class='btn btn-primary viewDate' data-id='" + $(".event").attr("data-id") + "' data-date-id='" + data[0] + "'><span class='glyphicon glyphicon-eye-open'></span></button> <button type='button' class='btn btn-danger deleteDate' data-id='" + $(".event").attr("data-id") + "' data-date-id='" + data[0] + "'><span class='glyphicon glyphicon-trash'></span></button></div></div></div></div>").insertBefore(target).hide().animate({ height: "toggle", opacity: "toggle" }, "slow");

                $(".linkeddatetimepicker").each(function() {
                    $(this).find(".date").each(function() {
                        $(this).find("input").val("");
                        $(this).data("DateTimePicker").destroy();

                        $(this).datetimepicker({
                            format: "DD/MM/YYYY hh:mm A"
                        });

                        if ($(this).attr("data-value")) {
                            $(this).data("DateTimePicker").setDate($(this).attr("data-value"));
                        }
                    });

                    $(this).find(".date").each(function() {
                        if ($(this).closest(".form-group").is(":first-child")) {
                            if ($(this).attr("data-value") && $(this).attr("data-value") != "None") {
                                $(this).closest(".form-group").next().find(".input-group").data("DateTimePicker").setStartDate($(this).data("DateTimePicker").getDate());
                            }

                            $(this).on("change.dp",function (e) {
                                $(this).closest(".form-group").next().find(".date").data("DateTimePicker").setStartDate(e.date);
                            });
                        }

                        else {
                            if ($(this).attr("data-value") && $(this).attr("data-value") != "None") {
                                $(this).closest(".form-group").prev().find(".input-group").data("DateTimePicker").setEndDate($(this).data("DateTimePicker").getDate());
                            }

                            $(this).on("change.dp",function (e) {
                                $(this).closest(".form-group").prev().find(".date").data("DateTimePicker").setEndDate(e.date);
                            });
                        }
                    });
                });

                $.pnotify({
                    title: "Date Added",
                    text: "You have added a date for the event \"" + $(".event").attr("data-name") + "\".",
                    type: "success"
                });

                target.siblings(".panel").find(".btn").each(function() {
                    $(this).unbind("click");
                });

                $(".deleteDate").click(function() {
                    that = $(this);
                    bootbox.dialog({
                        title: "<span class='glyphicon glyphicon-warning-sign'></span> Confirm Delete",
                        message: "Are you sure you want to delete this date?",
                        buttons: {
                            cancel: {
                                label: "<span class='glyphicon glyphicon-ban-circle'></span> Cancel",
                                className: "btn-default"
                            },
                            main: {
                                label: "<span class='glyphicon glyphicon-trash'></span> Delete",
                                className: "btn-danger",
                                callback: function() {
                                    dataString = {"id": that.attr("data-id"), "date_id": that.attr("data-date-id")};
                                    target = that.closest(".panel");
                                    $.ajax({
                                        type: "POST",
                                        url: "/deleteDate",
                                        data: dataString,
                                        success: function(auth) {
                                            if (auth == "True"){
                                                $.pnotify({
                                                    title: "Date Deleted",
                                                    text: "You have deleted a date for the event \"" + $(".event").attr("data-name") + "\".",
                                                    type: "success"
                                                });
                                                target.animate({ height: "toggle", opacity: "toggle" }, "slow", function() { $(this).remove(); });
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    });
                });

                $(".confirmDate").click(function() {
                    that = $(this);
                    bootbox.dialog({
                        title: "<span class='glyphicon glyphicon-warning-sign'></span> Confirm Location",
                        message: "Are you sure you want to confirm this date & time for <em>" + $(".event").attr("data-name") + "'s</em>?",
                        buttons: {
                            cancel: {
                                label: "<span class='glyphicon glyphicon-ban-circle'></span> Cancel",
                                className: "btn-default"
                            },
                            main: {
                                label: "<span class='glyphicon glyphicon-ok'></span> Confirm",
                                className: "btn-success",
                                callback: function() {
                                    dataString = {"id": that.attr("data-id"), "date_id": that.attr("data-date-id")};
                                    $.ajax({
                                        type: "POST",
                                        url: "/confirmDate",
                                        data: dataString,
                                        success: function(auth) {
                                            if (auth == "True"){
                                                window.location.replace("/event?id=" + $(".event").attr("data-id") + "&notification=confirmDate");
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    });
                });

                $(".dateVotes").hide();

                $(".viewDate").click(function() {
                   $(this).closest(".panel").find(".panel-footer").animate({ height: "toggle", opacity: "toggle" }, "slow").closest(".panel").find(".dateShown").animate({ height: "toggle", opacity: "toggle" }, "slow").siblings(".dateVotes").animate({ height: "toggle", opacity: "toggle" }, "slow");
                });

                $(".cancelViewDate").click(function() {
                    $(this).closest(".panel").find(".panel-footer").animate({ height: "toggle", opacity: "toggle" }, "slow").closest(".panel").find(".dateShown").animate({ height: "toggle", opacity: "toggle" }, "slow").siblings(".dateVotes").animate({ height: "toggle", opacity: "toggle" }, "slow");
                });

                $(".available, .maybeavailable, .notavailable").click(function() {
                    dataString = {"id": $(".event").attr("data-id"), "date_id": $(this).closest(".btn-group").attr("data-date-id"), "availability": $(this).find("input").val()};
                    target = $(this).closest(".panel");
                    that = $(this);
                    $.ajax({
                        type: "POST",
                        url: "/dateVoting",
                        data: dataString,
                        success: function() {
                            if (target.find("tr[data-id='" + $(".user").attr("data-id") + "']").length == 0) {
                                if (that.hasClass("available")) {
                                    target.find("tbody").append("<tr data-id='" + $(".user").attr("data-id") + "'><td class='col-xs-8'><img src='" + $(".user").attr("data-public-profile-photo-url") + "' class='img-profile'> <a href='" + $(".user").attr("data-public-profile-url") + "' target='_blank'>" + $(".user").attr("data-name") + "</a></li></td><td class='col-xs-4 text-right'><span class='text-success'>Available</span></td></tr>");
                                }
                                if (that.hasClass("maybeavailable")) {
                                    target.find("tbody").append("<tr data-id='" + $(".user").attr("data-id") + "'><td class='col-xs-8'><img src='" + $(".user").attr("data-public-profile-photo-url") + "' class='img-profile'> <a href='" + $(".user").attr("data-public-profile-url") + "' target='_blank'>" + $(".user").attr("data-name") + "</a></li></td><td class='col-xs-4 text-right'><span class='text-warning'>Maybe</span></td></tr>");
                                }
                                if (that.hasClass("notavailable")) {
                                    target.find("tbody").append("<tr data-id='" + $(".user").attr("data-id") + "'><td class='col-xs-8'><img src='" + $(".user").attr("data-public-profile-photo-url") + "' class='img-profile'> <a href='" + $(".user").attr("data-public-profile-url") + "' target='_blank'>" + $(".user").attr("data-name") + "</a></li></td><td class='col-xs-4 text-right'><span class='text-danger'>Not Available</span></td></tr>");
                                }
                            }

                            else {
                                if (that.hasClass("available")) {
                                    target.find("tr[data-id='" + $(".user").attr("data-id") + "']").find("span").removeClass().addClass("text-success").text("Available");
                                }
                                if (that.hasClass("maybeavailable")) {
                                    target.find("tr[data-id='" + $(".user").attr("data-id") + "']").find("span").removeClass().addClass("text-warning").text("Maybe");
                                }
                                if (that.hasClass("notavailable")) {
                                    target.find("tr[data-id='" + $(".user").attr("data-id") + "']").find("span").removeClass().addClass("text-danger").text("Not Available");
                                }
                            }

                            $("a[data-toggle='tooltip']").tooltip();
                        }
                    });
                });
            }

            else {
                $.pnotify({
                    title: "Date Not Added",
                    text: "You did not enter either the starting or ending date.",
                    type: "error"
                });
            }
        }
    });
});

$(".deleteDate").click(function() {
    that = $(this);
    bootbox.dialog({
        title: "<span class='glyphicon glyphicon-warning-sign'></span> Confirm Delete",
        message: "Are you sure you want to delete this date?",
        buttons: {
            cancel: {
                label: "<span class='glyphicon glyphicon-ban-circle'></span> Cancel",
                className: "btn-default"
            },
            main: {
                label: "<span class='glyphicon glyphicon-trash'></span> Delete",
                className: "btn-danger",
                callback: function() {
                    dataString = {"id": that.attr("data-id"), "date_id": that.attr("data-date-id")};
                    target = that.closest(".panel");
                    $.ajax({
                        type: "POST",
                        url: "/deleteDate",
                        data: dataString,
                        success: function(auth) {
                            if (auth == "True"){
                                $.pnotify({
                                    title: "Date Deleted",
                                    text: "You have deleted a date for the event \"" + $(".event").attr("data-name") + "\".",
                                    type: "success"
                                });
                                target.animate({ height: "toggle", opacity: "toggle" }, "slow", function() { $(this).remove(); });
                            }
                        }
                    });
                }
            }
        }
    });
});

$(".confirmDate").click(function() {
    that = $(this);
    bootbox.dialog({
        title: "<span class='glyphicon glyphicon-warning-sign'></span> Confirm Location",
        message: "Are you sure you want to confirm this date & time for <em>" + $(".event").attr("data-name") + "'s</em>?",
        buttons: {
            cancel: {
                label: "<span class='glyphicon glyphicon-ban-circle'></span> Cancel",
                className: "btn-default"
            },
            main: {
                label: "<span class='glyphicon glyphicon-ok'></span> Confirm",
                className: "btn-success",
                callback: function() {
                    dataString = {"id": that.attr("data-id"), "date_id": that.attr("data-date-id")};
                    $.ajax({
                        type: "POST",
                        url: "/confirmDate",
                        data: dataString,
                        success: function(auth) {
                            if (auth == "True"){
                                window.location.replace("/event?id=" + $(".event").attr("data-id") + "&notification=confirmDate");
                            }
                        }
                    });
                }
            }
        }
    });
});

$(".dateVotes").hide();

$(".viewDate").click(function() {
   $(this).closest(".panel").find(".panel-footer").animate({ height: "toggle", opacity: "toggle" }, "slow").closest(".panel").find(".dateShown").animate({ height: "toggle", opacity: "toggle" }, "slow").siblings(".dateVotes").animate({ height: "toggle", opacity: "toggle" }, "slow");
});

$(".cancelViewDate").click(function() {
    $(this).closest(".panel").find(".panel-footer").animate({ height: "toggle", opacity: "toggle" }, "slow").closest(".panel").find(".dateShown").animate({ height: "toggle", opacity: "toggle" }, "slow").siblings(".dateVotes").animate({ height: "toggle", opacity: "toggle" }, "slow");
});

$(".available, .maybeavailable, .notavailable").click(function() {
    dataString = {"id": $(".event").attr("data-id"), "date_id": $(this).closest(".btn-group").attr("data-date-id"), "availability": $(this).find("input").val()};
    target = $(this).closest(".panel");
    that = $(this);
    $.ajax({
        type: "POST",
        url: "/dateVoting",
        data: dataString,
        success: function() {
            if (target.find("tr[data-id='" + $(".user").attr("data-id") + "']").length == 0) {
                if (that.hasClass("available")) {
                    target.find("tbody").append("<tr data-id='" + $(".user").attr("data-id") + "'><td class='col-xs-8'><img src='" + $(".user").attr("data-public-profile-photo-url") + "' class='img-profile'> <a href='" + $(".user").attr("data-public-profile-url") + "' target='_blank'>" + $(".user").attr("data-name") + "</a></li></td><td class='col-xs-4 text-right'><span class='text-success'>Available</span></td></tr>");
                }
                if (that.hasClass("maybeavailable")) {
                    target.find("tbody").append("<tr data-id='" + $(".user").attr("data-id") + "'><td class='col-xs-8'><img src='" + $(".user").attr("data-public-profile-photo-url") + "' class='img-profile'> <a href='" + $(".user").attr("data-public-profile-url") + "' target='_blank'>" + $(".user").attr("data-name") + "</a></li></td><td class='col-xs-4 text-right'><span class='text-warning'>Maybe</span></td></tr>");
                }
                if (that.hasClass("notavailable")) {
                    target.find("tbody").append("<tr data-id='" + $(".user").attr("data-id") + "'><td class='col-xs-8'><img src='" + $(".user").attr("data-public-profile-photo-url") + "' class='img-profile'> <a href='" + $(".user").attr("data-public-profile-url") + "' target='_blank'>" + $(".user").attr("data-name") + "</a></li></td><td class='col-xs-4 text-right'><span class='text-danger'>Not Available</span></td></tr>");
                }
            }

            else {
                if (that.hasClass("available")) {
                    target.find("tr[data-id='" + $(".user").attr("data-id") + "']").find("span").removeClass().addClass("text-success").text("Available");
                }
                if (that.hasClass("maybeavailable")) {
                    target.find("tr[data-id='" + $(".user").attr("data-id") + "']").find("span").removeClass().addClass("text-warning").text("Maybe");
                }
                if (that.hasClass("notavailable")) {
                    target.find("tr[data-id='" + $(".user").attr("data-id") + "']").find("span").removeClass().addClass("text-danger").text("Not Available");
                }
            }

            $("a[data-toggle='tooltip']").tooltip();
        }
    });
});

$(".addThread").click(function() {
    dataString = {"id": $(this).attr("data-id"), "user_id": $(".user").attr("data-id"), "thread_title": $("input[name='thread_title']").val(), "thread_content": $(".wysihtml5").val()};
    target = $(this).closest(".panel").siblings(".table-responsive").find(".table");
    $.ajax({
        type: "POST",
        url: "/addThread",
        data: dataString,
        success: function(data) {
            data = data.split("/");

            if (data[1] == undefined){
                auth = data[0];
            }

            else {
                auth = data[1];
            }

            if (auth == "True" && $("input[name='thread_title']").val() != "" && $(".wysihtml5").val() != ""){
                date = new Date();
                if ($(".event").attr("data-permissions") == "admin") {
                    $("<tr><td><span class='glyphicon glyphicon-comment glyphicon-lg'></span></td><td class='col-xs-5 col-sm-4 col-md-6'><a href='/thread?id=" + $(".event").attr("data-id") + "&thread_id=" + data[0] + "' class='forum-title'>" + $("input[name='thread_title']").val() + "</a><br>Started by <a href='" + $(".user").attr("data-public-profile-url") + "' target='_blank'>" + $(".user").attr("data-name") + "</a> <a href='#' class='time' data-toggle='tooltip' title='" + moment(date).format("LLL") + "'>" + moment(date).fromNow() + "</a></td><td class='col-xs-2 col-sm-3 col-md-2 text-right'><button class='btn btn-default lockThread' data-toggle='button' data-id='" + $(".event").attr("data-id") + "' data-thread-id='" + data[0] + "'><span class='glyphicon glyphicon-lock'></span></button> <button class='btn btn-default pinThread' data-toggle='button' data-id='" + $(".event").attr("data-id") + "' data-thread-id='" + data[0] + "'><span class='glyphicon glyphicon-pushpin'></span></button> <button class='btn btn-danger deleteThread' data-id='" + $(".event").attr("data-id") + "' data-thread-id='" + data[0] + "' data-name='" + $("input[name='thread_title']").val() + "'><span class='glyphicon glyphicon-trash'></span></button></td><td class='col-xs-1 col-sm-2 col-md-1 text-right'>1 replies<br>0 views</td><td class='col-xs-1 text-right'><img src='" + $(".user").attr("data-public-profile-photo-url") + "' class='img-profile img-thread'></td><td class='col-xs-3 col-sm-2'><a href='" + $(".user").attr("data-public-profile-url") + "' target='_blank'>" + $(".user").attr("data-name") + "</a><br><a href='#' class='time' data-toggle='tooltip' title='" + moment(date).format("LLL") + "'>" + moment(date).fromNow() + "</a></td></tr>").appendTo(target.find("tbody")).hide().fadeIn("slow");

                    $.pnotify({
                        title: "Thread Added",
                        text: "You have added the thread \"" + $("input[name='thread_title']").val() + "\" for the event \"" + $(".event").attr("data-name") + "\".",
                        type: "success"
                    });

                    target.closest(".table-responsive").siblings(".text-muted").fadeOut("slow");

                    target.find(".btn").each(function() {
                        $(this).unbind("click");
                    });

                    $(".deleteThread").click(function() {
                        that = $(this);
                        bootbox.dialog({
                            title: "<span class='glyphicon glyphicon-warning-sign'></span> Confirm Delete",
                            message: "Are you sure you want to delete <em>" + that.attr("data-name") + "</em>?",
                            buttons: {
                                cancel: {
                                    label: "<span class='glyphicon glyphicon-ban-circle'></span> Cancel",
                                    className: "btn-default"
                                },
                                main: {
                                    label: "<span class='glyphicon glyphicon-trash'></span> Delete",
                                    className: "btn-danger",
                                    callback: function() {
                                        dataString = {"id": that.attr("data-id"), "thread_id": that.attr("data-thread-id")};
                                        target = that.closest("tr");
                                        $.ajax({
                                            type: "POST",
                                            url: "/deleteThread",
                                            data: dataString,
                                            success: function(auth) {
                                                if (auth == "True"){
                                                    $.pnotify({
                                                        title: "Thread Deleted",
                                                        text: "You have deleted the thread \"" + target.find(".forum-title").text() + "\" for the event \"" + $(".event").attr("data-name") + "\".",
                                                        type: "success"
                                                    });

                                                    table = target.closest(".table");
                                                    target.fadeOut("slow", function(){ target.remove(); });
                                                    if (table.find("tr").length == 0){
                                                        $("<h2 class='text-center text-muted'>No threads</h2>").insertBefore(table).hide().fadeIn("slow");
                                                    }
                                                }
                                            }
                                        });
                                    }
                                }
                            }
                        });
                    });

                    $(".pinThread").click(function() {
                        dataString = {"id": $(this).attr("data-id"), "thread_id": $(this).attr("data-thread-id")};
                        target = $(this).closest("tr");
                        $.ajax({
                            type: "POST",
                            url: "/pinThread",
                            data: dataString,
                            success: function(auth) {
                                if (auth == "True"){
                                    if (target.hasClass("active")) {
                                        target.removeClass("active");
                                        target.find(".forum-title").unwrap();
                                        target.appendTo(".table");
                                        target.find(".glyphicon-lg").removeClass("glyphicon-pushpin").addClass("glyphicon-comment");
                                        $.pnotify({
                                            title: "Thread Unpinned",
                                            text: "You have unpinned the thread \"" + target.find(".forum-title").text() + "\" for the event \"" + $(".event").attr("data-name") + "\".",
                                            type: "success"
                                        });
                                    }

                                    else {
                                        target.addClass("active");
                                        target.find(".forum-title").wrap("<strong></strong>");
                                        target.prependTo(".table");
                                        target.find(".glyphicon-lg").removeClass("glyphicon-comment").addClass("glyphicon-pushpin");
                                        $.pnotify({
                                            title: "Thread Pinned",
                                            text: "You have pinned the thread \"" + target.find(".forum-title").text() + "\" for the event \"" + $(".event").attr("data-name") + "\".",
                                            type: "success"
                                        });
                                    }
                                }
                            }
                        });
                    });

                    $(".lockThread").click(function() {
                        dataString = {"id": $(this).attr("data-id"), "thread_id": $(this).attr("data-thread-id")};
                        if (window.location.pathname == "/forum") {
                            target = $(this).closest("tr");
                        }
                        else {
                            target = $(this).closest(".page-header");
                        }
                        $.ajax({
                            type: "POST",
                            url: "/lockThread",
                            data: dataString,
                            success: function(auth) {
                                if (auth == "True"){
                                    if (window.location.pathname == "/forum") {
                                        if (target.hasClass("text-muted")) {
                                            target.removeClass("text-muted");
                                            if (target.find(".pinThread").hasClass("active")) {
                                                target.find(".glyphicon-lg").removeClass("glyphicon-lock").addClass("glyphicon-pushpin");
                                            }
                                            else {
                                                target.find(".glyphicon-lg").removeClass("glyphicon-lock").addClass("glyphicon-comment");
                                            }
                                            target.find(".btn").removeAttr("disabled");
                                            $.pnotify({
                                                title: "Thread Unlocked",
                                                text: "You have unlocked the thread \"" + target.find(".forum-title").text() + "\" for the event \"" + $(".event").attr("data-name") + "\".",
                                                type: "success"
                                            });
                                        }

                                        else {
                                            target.addClass("text-muted");
                                            target.find(".glyphicon-lg").removeClass().addClass("glyphicon glyphicon-lock glyphicon-lg");
                                            target.find(".btn").attr("disabled", "");
                                            target.find(".lockThread").removeAttr("disabled");
                                            $.pnotify({
                                                title: "Thread Locked",
                                                text: "You have locked the thread \"" + target.find(".forum-title").text() + "\" for the event \"" + $(".event").attr("data-name") + "\".",
                                                type: "success"
                                            });
                                        }
                                    }

                                    else {
                                        if (target.find(".glyphicon").first().hasClass("glyphicon-lock")) {
                                            if (target.find(".pinThread").hasClass("active")) {
                                                target.find(".glyphicon").first().removeClass("glyphicon-lock").addClass("glyphicon-pushpin");
                                            }
                                            else {
                                                target.find(".glyphicon").first().removeClass("glyphicon-lock").addClass("glyphicon-comment");
                                            }
                                            target.find("small").remove();
                                            target.find(".btn").removeAttr("disabled");
                                            $(".gotoAdd").removeAttr("disabled");
                                            $(".addPostArea").animate({ height: "toggle", opacity: "toggle" }, "slow");
                                            $(".addPostDisabled").animate({ height: "toggle", opacity: "toggle" }, "slow");
                                            $.pnotify({
                                                title: "Thread Unlocked",
                                                text: "You have unlocked the thread \"" + target.find(".thread-title").text() + "\" for the event \"" + $(".event").attr("data-name") + "\".",
                                                type: "success"
                                            });
                                        }

                                        else {
                                            target.find(".glyphicon").first().removeClass().addClass("glyphicon glyphicon-lock");
                                            target.find(".thread-title").after(" <small>This thread has been locked</small>");
                                            target.find(".btn").attr("disabled", "");
                                            target.find(".lockThread").removeAttr("disabled");
                                            $(".gotoAdd").attr("disabled", "");
                                            $(".addPostArea").animate({ height: "toggle", opacity: "toggle" }, "slow");
                                            $(".addPostDisabled").animate({ height: "toggle", opacity: "toggle" }, "slow");
                                            $.pnotify({
                                                title: "Thread Locked",
                                                text: "You have locked the thread \"" + target.find(".thread-title").text() + "\" for the event \"" + $(".event").attr("data-name") + "\".",
                                                type: "success"
                                            });
                                        }
                                    }
                                }
                            }
                        });
                    });
                }

                else {
                    $("<tr><td><span class='glyphicon glyphicon-comment glyphicon-lg'></span></td><td class='col-xs-7 col-md-8'><a href='/thread?id=" + $(".event").attr("data-id") + "&thread_id=" + data[0] + "' class='forum-title'>" + $("input[name='thread_title']").val() + "</a><br>Started by <a href='" + $(".user").attr("data-public-profile-url") + "' target='_blank'>" + $(".user").attr("data-name") + "</a> <a href='#' class='time' data-toggle='tooltip' title='" + moment(date).format("LLL") + "'>" + moment(date).fromNow() + "</a></td><td class='col-xs-1 col-sm-2 col-md-1 text-right'>1 replies<br>0 views</td><td class='col-xs-1 text-right'><img src='" + $(".user").attr("data-public-profile-photo-url") + "' class='img-profile img-thread'></td><td class='col-xs-3 col-sm-2'><a href='" + $(".user").attr("data-public-profile-url") + "' target='_blank'>" + $(".user").attr("data-name") + "</a><br><a href='#' class='time' data-toggle='tooltip' title='" + moment(date).format("LLL") + "'>" + moment(date).fromNow() + "</a></td></tr>").appendTo(target.find("tbody")).hide().fadeIn("slow");
                }

                $("input[name='thread_title']").val("");
                $(".wysihtml5").data("wysihtml5").editor.clear();

                $("a[data-toggle='tooltip']").tooltip();
            }

            else {
                $.pnotify({
                    title: "Thread Not Added",
                    text: "You did not enter either the name or the contents of the forum thread.",
                    type: "error"
                });
            }
        }
    });
});

$(".deleteThread").click(function() {
    that = $(this);
    bootbox.dialog({
        title: "<span class='glyphicon glyphicon-warning-sign'></span> Confirm Delete",
        message: "Are you sure you want to delete <em>" + that.attr("data-name") + "</em>?",
        buttons: {
            cancel: {
                label: "<span class='glyphicon glyphicon-ban-circle'></span> Cancel",
                className: "btn-default"
            },
            main: {
                label: "<span class='glyphicon glyphicon-trash'></span> Delete",
                className: "btn-danger",
                callback: function() {
                    dataString = {"id": that.attr("data-id"), "thread_id": that.attr("data-thread-id")};
                    target = that.closest("tr");
                    $.ajax({
                        type: "POST",
                        url: "/deleteThread",
                        data: dataString,
                        success: function(auth) {
                            if (auth == "True"){
                                $.pnotify({
                                    title: "Thread Deleted",
                                    text: "You have deleted the thread \"" + target.find(".forum-title").text() + "\" for the event \"" + $(".event").attr("data-name") + "\".",
                                    type: "success"
                                });

                                table = target.closest(".table");
                                target.fadeOut("slow", function(){ target.remove(); });
                            }
                        }
                    });
                }
            }
        }
    });
});

$(".pinThread").click(function() {
    dataString = {"id": $(this).attr("data-id"), "thread_id": $(this).attr("data-thread-id")};
    if (window.location.pathname == "/forum") {
        target = $(this).closest("tr");
    }
    else {
        target = $(this).closest(".page-header");
    }
    $.ajax({
        type: "POST",
        url: "/pinThread",
        data: dataString,
        success: function(auth) {
            if (auth == "True"){
                if (window.location.pathname == "/forum") {
                    if (target.hasClass("active")) {
                        target.removeClass("active");
                        target.find(".forum-title").unwrap();
                        target.appendTo(".table");
                        target.find(".glyphicon-lg").removeClass("glyphicon-pushpin").addClass("glyphicon-comment");
                        $.pnotify({
                            title: "Thread Unpinned",
                            text: "You have unpinned the thread \"" + target.find(".forum-title").text() + "\" for the event \"" + $(".event").attr("data-name") + "\".",
                            type: "success"
                        });
                    }

                    else {
                        target.addClass("active");
                        target.find(".forum-title").wrap("<strong></strong>");
                        target.prependTo(".table");
                        target.find(".glyphicon").first().removeClass("glyphicon-comment").addClass("glyphicon-pushpin");
                        $.pnotify({
                            title: "Thread Pinned",
                            text: "You have pinned the thread \"" + target.find(".forum-title").text() + "\" for the event \"" + $(".event").attr("data-name") + "\".",
                            type: "success"
                        });
                    }
                }
                else {
                    if (target.find(".glyphicon").first().hasClass("glyphicon-pushpin")) {
                        target.find(".glyphicon").first().removeClass("glyphicon-pushpin").addClass("glyphicon-comment");
                        $.pnotify({
                            title: "Thread Unpinned",
                            text: "You have unpinned the thread \"" + target.find(".thread-title").text() + "\" for the event \"" + $(".event").attr("data-name") + "\".",
                            type: "success"
                        });
                    }

                    else {
                        target.find(".glyphicon").first().removeClass("glyphicon-comment").addClass("glyphicon-pushpin");
                        $.pnotify({
                            title: "Thread Pinned",
                            text: "You have pinned the thread \"" + target.find(".thread-title").text() + "\" for the event \"" + $(".event").attr("data-name") + "\".",
                            type: "success"
                        });
                    }
                }
            }
        }
    });
});

$(".lockThread").click(function() {
    dataString = {"id": $(this).attr("data-id"), "thread_id": $(this).attr("data-thread-id")};
    if (window.location.pathname == "/forum") {
        target = $(this).closest("tr");
    }
    else {
        target = $(this).closest(".page-header");
    }
    $.ajax({
        type: "POST",
        url: "/lockThread",
        data: dataString,
        success: function(auth) {
            if (auth == "True"){
                if (window.location.pathname == "/forum") {
                    if (target.hasClass("text-muted")) {
                        target.removeClass("text-muted");
                        if (target.find(".pinThread").hasClass("active")) {
                            target.find(".glyphicon-lg").removeClass("glyphicon-lock").addClass("glyphicon-pushpin");
                        }
                        else {
                            target.find(".glyphicon-lg").removeClass("glyphicon-lock").addClass("glyphicon-comment");
                        }
                        target.find(".btn").removeAttr("disabled");
                        $.pnotify({
                            title: "Thread Unlocked",
                            text: "You have unlocked the thread \"" + target.find(".forum-title").text() + "\" for the event \"" + $(".event").attr("data-name") + "\".",
                            type: "success"
                        });
                    }

                    else {
                        target.addClass("text-muted");
                        target.find(".glyphicon-lg").removeClass().addClass("glyphicon glyphicon-lock glyphicon-lg");
                        target.find(".btn").attr("disabled", "");
                        target.find(".lockThread").removeAttr("disabled");
                        $.pnotify({
                            title: "Thread Locked",
                            text: "You have locked the thread \"" + target.find(".forum-title").text() + "\" for the event \"" + $(".event").attr("data-name") + "\".",
                            type: "success"
                        });
                    }
                }

                else {
                    if (target.find(".glyphicon").first().hasClass("glyphicon-lock")) {
                        if (target.find(".pinThread").hasClass("active")) {
                            target.find(".glyphicon").first().removeClass("glyphicon-lock").addClass("glyphicon-pushpin");
                        }
                        else {
                            target.find(".glyphicon").first().removeClass("glyphicon-lock").addClass("glyphicon-comment");
                        }
                        target.find("small").remove();
                        target.find(".btn").removeAttr("disabled");
                        $(".gotoAdd, .editPost, .deletePost").removeAttr("disabled");
                        $(".addPostArea").animate({ height: "toggle", opacity: "toggle" }, "slow");
                        $(".addPostDisabled").animate({ height: "toggle", opacity: "toggle" }, "slow");
                        $.pnotify({
                            title: "Thread Unlocked",
                            text: "You have unlocked the thread \"" + target.find(".thread-title").text() + "\" for the event \"" + $(".event").attr("data-name") + "\".",
                            type: "success"
                        });
                    }

                    else {
                        target.find(".glyphicon").first().removeClass().addClass("glyphicon glyphicon-lock");
                        target.find(".thread-title").after(" <small>This thread has been locked</small>");
                        target.find(".btn").attr("disabled", "");
                        target.find(".lockThread").removeAttr("disabled");
                        $(".gotoAdd, .editPost, .deletePost").attr("disabled", "");
                        $(".addPostArea").animate({ height: "toggle", opacity: "toggle" }, "slow");
                        $(".addPostDisabled").animate({ height: "toggle", opacity: "toggle" }, "slow");
                        $.pnotify({
                            title: "Thread Locked",
                            text: "You have locked the thread \"" + target.find(".thread-title").text() + "\" for the event \"" + $(".event").attr("data-name") + "\".",
                            type: "success"
                        });
                    }
                }
            }
        }
    });
});

$(".addPost").click(function() {
    dataString = {"id": $(this).attr("data-id"), "thread_id": $(this).attr("data-thread-id"), "post_content": $(this).closest(".panel").find("textarea[name='post_content']").val()};
    target = $(this).closest(".panel");
    $.ajax({
        type: "POST",
        url: "/addPost",
        data: dataString,
        success: function(data) {
            data = data.split("/");

            if (data[1] == undefined){
                auth = data[0];
            }

            else {
                auth = data[1];
            }

            if (auth == "True" && target.find("textarea[name='post_content']").val() != ""){
                if ($(".event").attr("data-permissions") == "admin") {
                    raw_time = data[0];
                    date = new Date(raw_time + " UTC").toDateString();
                    time = new Date(raw_time + " UTC").toLocaleTimeString();
                    formatted_date = date + ", " + tConvert(time);
                    $("<div class='panel panel-default' data-post-time='" + raw_time + "'><div class='panel-heading'><h3 class='panel-title'><img src='" + $(".user").attr("data-public-profile-photo-url") + "' class='img-profile'> <a href='" + $(".user").attr("data-public-profile-url") + "' target='_blank'>" + $(".user").attr("data-name") + "</a><span class='text-muted pull-right'>Posted <a href='#' class='time' data-toggle ='tooltip' data-time='" + data[0] + "' title='" + formatted_date + "'>" + moment(formatted_date).fromNow() + "</a></span></h3></div><div class='panel-body'>" + target.find("textarea[name='post_content']").val() + "</div><div class='panel-footer text-right'><button class='btn btn-danger deletePost' data-id='" + $(".addPost").attr("data-id") + "' data-thread-id='" + $(".addPost").attr("data-thread-id") + "' data-post-time='" + raw_time + "'><span class='glyphicon glyphicon-trash'></span></button></div></div>").insertBefore(target).hide().animate({ height: "toggle", opacity: "toggle" }, "slow");

                    target.siblings(".panel").find(".btn").each(function() {
                        $(this).unbind("click");
                    });

                    $(".deletePost").click(function() {
                        that = $(this);
                        bootbox.dialog({
                            title: "<span class='glyphicon glyphicon-warning-sign'></span> Confirm Delete",
                            message: "Are you sure you want to delete this post?",
                            buttons: {
                                cancel: {
                                    label: "<span class='glyphicon glyphicon-ban-circle'></span> Cancel",
                                    className: "btn-default"
                                },
                                main: {
                                    label: "<span class='glyphicon glyphicon-trash'></span> Delete",
                                    className: "btn-danger",
                                    callback: function() {
                                        dataString = {"id": that.attr("data-id"), "thread_id": that.attr("data-thread-id"), "post_time": that.attr("data-post-time")};
                                        target = that.closest("body").find(".panel[data-post-time='" + that.attr("data-post-time") + "']");
                                        $.ajax({
                                            type: "POST",
                                            url: "/deletePost",
                                            data: dataString,
                                            success: function(auth) {
                                                if (auth == "True"){
                                                    target.animate({ height: "toggle", opacity: "toggle" }, "slow", function() { $(this).remove(); });
                                                }
                                            }
                                        });
                                    }
                                }
                            }
                        });
                    });

                    $(".editPostForm").hide();

                    $(".editPost").click(function() {
                        $(this).closest(".panel").find(".panel-footer").animate({ height: "toggle", opacity: "toggle" }, "slow").closest(".panel").find(".post").animate({ height: "toggle", opacity: "toggle" }, "slow").siblings(".editPostForm").animate({ height: "toggle", opacity: "toggle" }, "slow");
                    });

                    $(".submitEditPost").click(function() {
                        dataString = {"id": $(this).attr("data-id"), "thread_id": $(this).attr("data-thread-id"), "post_content": $(".editPost").val(), "post_time": $(this).attr("data-post-time")};
                        target = $(this).closest(".panel");
                        $.ajax({
                            type: "POST",
                            url: "/editPost",
                            data: dataString,
                            success: function(auth) {
                                if (auth == "True"){
                                    target.find(".panel-footer").animate({ height: "toggle", opacity: "toggle" }, "slow").closest(".panel").find(".post").html($(".editPost").val()).closest(".post").animate({ height: "toggle", opacity: "toggle" }, "slow").siblings(".editPostForm").animate({ height: "toggle", opacity: "toggle" }, "slow");
                                    $.pnotify({
                                        title: "Post Edited",
                                        text: "The post has been edited.",
                                        type: "success"
                                    });
                                }
                                else {
                                    if ($(".editPost").val() == "") {
                                        $.pnotify({
                                        title: "Post Not Edited",
                                        text: "The post cannot be empty.",
                                        type: "error"
                                    });
                                    }
                                }
                            }
                        });
                    });

                    $(".cancelEditPost").click(function() {
                        $(this).closest(".panel").find(".panel-footer").animate({ height: "toggle", opacity: "toggle" }, "slow").closest(".panel").find(".post").animate({ height: "toggle", opacity: "toggle" }, "slow").siblings(".editPostForm").animate({ height: "toggle", opacity: "toggle" }, "slow");
                        $(this).closest(".panel").find(".editPostForm")[0].reset();
                    });
                }

                else{
                    raw_time = data[0];
                    date = new Date(raw_time + " UTC").toDateString();
                    time = new Date(raw_time + " UTC").toLocaleTimeString();
                    formatted_date = date + ", " + tConvert(time);
                    $("<div class='panel panel-default' data-post-time='" + raw_time + "'><div class='panel-heading'><h3 class='panel-title'><img src='" + $(".user").attr("data-public-profile-photo-url") + "' class='img-profile'> <a href='" + $(".user").attr("data-public-profile-url") + "' target='_blank'>" + $(".user").attr("data-name") + "</a><span class='text-muted pull-right'>Posted <a href='#' class='time' data-toggle ='tooltip' title='" + formatted_date + "'>" + moment(formatted_date).fromNow() + "</a></span></h3></div><div class='panel-body'>" + $(".wysihtml5").val() + "</div></div>").insertBefore(target).hide().animate({ height: "toggle", opacity: "toggle" }, "slow");
                }

                $("a[data-toggle='tooltip']").tooltip();

                target.find("textarea[name='post_content']").data("wysihtml5").editor.clear();
            }
        }
    });
});

$(".deletePost").click(function() {
    that = $(this);
    bootbox.dialog({
        title: "<span class='glyphicon glyphicon-warning-sign'></span> Confirm Delete",
        message: "Are you sure you want to delete this post?",
        buttons: {
            cancel: {
                label: "<span class='glyphicon glyphicon-ban-circle'></span> Cancel",
                className: "btn-default"
            },
            main: {
                label: "<span class='glyphicon glyphicon-trash'></span> Delete",
                className: "btn-danger",
                callback: function() {
                    dataString = {"id": that.attr("data-id"), "thread_id": that.attr("data-thread-id"), "post_time": that.attr("data-post-time")};
                    target = that.closest("body").find(".panel[data-post-time='" + that.attr("data-post-time") + "']");
                    $.ajax({
                        type: "POST",
                        url: "/deletePost",
                        data: dataString,
                        success: function(auth) {
                            if (auth == "True"){
                                target.animate({ height: "toggle", opacity: "toggle" }, "slow", function() { $(this).remove(); });
                            }
                        }
                    });
                }
            }
        }
    });
});

$(".editPostForm").hide();

$(".editPost").click(function() {
    $(this).closest(".panel").find(".panel-footer").animate({ height: "toggle", opacity: "toggle" }, "slow").closest(".panel").find(".post").animate({ height: "toggle", opacity: "toggle" }, "slow").siblings(".editPostForm").animate({ height: "toggle", opacity: "toggle" }, "slow");
});

$(".submitEditPost").click(function() {
    dataString = {"id": $(this).attr("data-id"), "thread_id": $(this).attr("data-thread-id"), "post_content": $(".editPost").val(), "post_time": $(this).attr("data-post-time")};
    target = $(this).closest(".panel");
    $.ajax({
        type: "POST",
        url: "/editPost",
        data: dataString,
        success: function(auth) {
            if (auth == "True"){
                target.find(".panel-footer").animate({ height: "toggle", opacity: "toggle" }, "slow").closest(".panel").find(".post").html($(".editPost").val()).closest(".post").animate({ height: "toggle", opacity: "toggle" }, "slow").siblings(".editPostForm").animate({ height: "toggle", opacity: "toggle" }, "slow");
                $.pnotify({
                    title: "Post Edited",
                    text: "The post has been edited.",
                    type: "success"
                });
            }
            else {
                if ($(".editPost").val() == "") {
                    $.pnotify({
                    title: "Post Not Edited",
                    text: "The post cannot be empty.",
                    type: "error"
                });
                }
            }
        }
    });
});

$(".cancelEditPost").click(function() {
    $(this).closest(".panel").find(".panel-footer").animate({ height: "toggle", opacity: "toggle" }, "slow").closest(".panel").find(".post").animate({ height: "toggle", opacity: "toggle" }, "slow").siblings(".editPostForm").animate({ height: "toggle", opacity: "toggle" }, "slow");
    $(this).closest(".panel").find(".editPostForm")[0].reset();
});

$("#inputLogisticsType").change(function() {
    $(this).closest(".form-group").next().animate({ height: "toggle", opacity: "toggle" }, "slow");
});

$(".addLogistics").click(function() {
    if ($(this).closest(".panel").find("select[name='logistics_type']").val() == "crowdfunding") {
        dataString = {"id": $(this).attr("data-id"), "logistics_type": $(this).closest(".panel").find("select[name='logistics_type']").val(), "logistics_goal": $(this).closest(".panel").find("input[name='logistics_goal']").val(), "logistics_notes": $(".addLogisticsNotes").val()};
        target = $(this).closest(".panel");
        $.ajax({
            type: "POST",
            url: "/addLogistics",
            data: dataString,
            success: function(data) {
                data = data.split("/");

                if (data[1] == undefined){
                    auth = data[0];
                }

                else {
                    auth = data[1];
                }

                if (auth == "True"){
                    if ($(".event").attr("data-permissions") == "admin") {
                        $("<div class='panel panel-default' data-type='Crowdfunding'><div class='panel-heading'><h3 class='panel-title'>Crowdfunding</h3></div><div class='panel-body'><div class='logisticsShown'><div class='row'><div class='col-xs-12 col-md-9'><div class='row'><div class='col-xs-12'>" + $(".addLogisticsNotes").val() + "</div></div><br><div class='row'><div class='col-xs-12'><table class='table table-bordered'><tbody></tbody></table></div></div></div><div class='col-xs-12 col-md-3'><div class='large-text backers'>0</div><h4>backers</h4><div class='large-text pledged'>$<span class='money'>0.00</span></div><h4>pledged of $<span class='money'>" + target.find("input[name='logistics_goal']").val() + "</span> goal</h4></div></div></div><form class='form-horizontal editLogisticsForm' data-logistics-type='crowdfunding'><div class='form-group'><label for='inputLogisticsNotes' class='col-xs-3 col-sm-2 control-label'>Logistics Notes:</label><div class='col-xs-9 col-sm-10'><textarea class='form-control wysihtml5 editLogisticsNotes' id='inputLogisticsNotes' rows='10' placeholder='Notes for Logistics' name='logistics_notes'>" + $(".addLogisticsNotes").val() + "</textarea></div></div><div class='form-group'><div class='col-xs-3 visible-xs'></div><div class='col-xs-9 col-sm-10 col-sm-offset-2'><button type='button' class='btn btn-primary submitEditLogistics' data-id='" + $(".event").attr("data-id") + "' data-logistics-id='" + data[0] +"'><span class='glyphicon glyphicon-edit'></span> Edit Logistics</button> <button type='button' class='btn btn-default cancelEditLogistics'><span class='glyphicon glyphicon-ban-circle'></span> Cancel</button></div></div></form></div><div class='panel-footer text-right'><button class='btn btn-success suggestPledge' data-id='" + $(".event").attr("data-id") + "' data-logistics-id='" + data[0] +"'><span class='glyphicon glyphicon-gift'></span></button> <button class='btn btn-primary editLogistics' data-id='" + $(".event").attr("data-id") + "' data-logistics-id='" + data[0] +"'><span class='glyphicon glyphicon-edit'></span></button> <button class='btn btn-danger deleteLogistics' data-id='" + $(".event").attr("data-id") + "' data-logistics-id='" + data[0] +"'><span class='glyphicon glyphicon-trash'></span></button></div></div>").insertBefore(target).hide().animate({ height: "toggle", opacity: "toggle" }, "slow");

                        $(".wysihtml5").each(function() {
                            if ($(this).closest(".addLogisticsArea").length == 0) {
                                $(this).wysihtml5({
                                    stylesheets: ["http://fonts.googleapis.com/css?family=Open+Sans", "/static/css/bootstrap-typography.min.css"]
                                });
                            }
                        });

                        target.siblings(".panel").find(".btn").each(function() {
                            $(this).unbind("click");
                        });

                        $(".deleteLogistics").click(function() {
                            that = $(this);
                            bootbox.dialog({
                                title: "<span class='glyphicon glyphicon-warning-sign'></span> Confirm Delete",
                                message: "Are you sure you want to delete this logistics?",
                                buttons: {
                                    cancel: {
                                        label: "<span class='glyphicon glyphicon-ban-circle'></span> Cancel",
                                        className: "btn-default"
                                    },
                                    main: {
                                        label: "<span class='glyphicon glyphicon-trash'></span> Delete",
                                        className: "btn-danger",
                                        callback: function() {
                                            dataString = {"id": that.attr("data-id"), "logistics_id": that.attr("data-logistics-id")};
                                            target = that.closest(".panel");
                                            $.ajax({
                                                type: "POST",
                                                url: "/deleteLogistics",
                                                data: dataString,
                                                success: function(auth) {
                                                    if (auth == "True"){
                                                        $.pnotify({
                                                            title: "Logistic Deleted",
                                                            text: "You have deleted a logistic for the event \"" + $(".event").attr("data-name") + "\".",
                                                            type: "success"
                                                        });
                                                        target.animate({ height: "toggle", opacity: "toggle" }, "slow", function() { $(this).remove(); });
                                                    }
                                                }
                                            });
                                        }
                                    }
                                }
                            });
                        });

                        $(".editLogisticsForm").hide();

                        $(".editLogistics").click(function() {
                           $(this).closest(".panel").find(".panel-footer").animate({ height: "toggle", opacity: "toggle" }, "slow").closest(".panel").find(".logisticsShown").animate({ height: "toggle", opacity: "toggle" }, "slow").siblings(".editLogisticsForm").animate({ height: "toggle", opacity: "toggle" }, "slow");
                        });

                        $(".submitEditLogistics").click(function() {
                            if ($(this).closest("form").attr("data-logistics-type") == "crowdfunding") {
                                dataString = {"id": $(this).attr("data-id"), "logistics_id": $(this).attr("data-logistics-id"), "logistics_type": $(this).closest("form").attr("data-logistics-type"), "logistics_notes": $(this).closest(".form-horizontal").find(".editLogisticsNotes").val()};
                                target = $(this).closest(".panel");
                                $.ajax({
                                    type: "POST",
                                    url: "/editLogistics",
                                    data: dataString,
                                    success: function(auth) {
                                        if (auth == "True"){
                                            target.find(".panel-footer").animate({ height: "toggle", opacity: "toggle" }, "slow").closest(".panel").find(".col-md-9").find(".col-xs-12").first().html(target.find("textarea[name='logistics_notes']").val()).closest(".logisticsShown").animate({ height: "toggle", opacity: "toggle" }, "slow").siblings(".editLogisticsForm").animate({ height: "toggle", opacity: "toggle" }, "slow");
                                            $.pnotify({
                                                title: "Logistic Edited",
                                                text: "The logistic has been edited.",
                                                type: "success"
                                            });
                                        }
                                    }
                                });
                            }
                            if ($(this).closest("form").attr("data-logistics-type") == "crowdsourcing") {
                                dataString = {"id": $(this).attr("data-id"), "logistics_id": $(this).attr("data-logistics-id"), "logistics_type": $(this).closest("form").attr("data-logistics-type"), "logistics_notes": $(this).closest(".form-horizontal").find(".editLogisticsNotes").val()};
                                target = $(this).closest(".panel");
                                $.ajax({
                                    type: "POST",
                                    url: "/editLogistics",
                                    data: dataString,
                                    success: function(auth) {
                                        if (auth == "True"){
                                            target.find(".panel-footer").animate({ height: "toggle", opacity: "toggle" }, "slow").closest(".panel").find(".panel-body").first().html(target.find("textarea[name='logistics_notes']").val()).closest(".panel").find(".logisticsShown").animate({ height: "toggle", opacity: "toggle" }, "slow").siblings(".editLogisticsForm").animate({ height: "toggle", opacity: "toggle" }, "slow");
                                        }
                                    }
                                });
                            }
                        });

                        $(".cancelEditLogistics").click(function() {
                           $(this).closest(".panel").find(".panel-footer").animate({ height: "toggle", opacity: "toggle" }, "slow").closest(".panel").find(".logisticsShown").animate({ height: "toggle", opacity: "toggle" }, "slow").siblings(".editLogisticsForm").animate({ height: "toggle", opacity: "toggle" }, "slow");
                        });
                    }

                    else {
                        $("<div class='panel panel-default'><div class='panel-heading'><h3 class='panel-title'>Crowdfunding</h3></div><div class='panel-body'><div class='logisticsShown'><div class='row'><div class='col-xs-12 col-md-9'><div class='row'><div class='col-xs-12'>" + $(".addLogisticsNotes").val() + "</div></div><br><div class='row'><div class='col-xs-12'><table class='table table-bordered'><tbody></tbody></table></div></div></div><div class='col-xs-12 col-md-3'><div class='large-text backers'>0</div><h4>backers</h4><div class='large-text pledged'>$<span class='money'>0.00</span></div><h4>pledged of $<span class='money'>" + target.find("input[name='logistics_goal']").val() + "</span> goal</h4></div></div></div></div><div class='panel-footer text-right'><button class='btn btn-success suggestPledge' data-id='" + $(".event").attr("data-id") + "' data-logistics-id='" + data[0] +"'><span class='glyphicon glyphicon-gift'></span></button></div></div>").insertBefore(target).hide().animate({ height: "toggle", opacity: "toggle" }, "slow");
                    }

                    $(".suggestPledge").click(function() {
                        that = $(this);
                        bootbox.dialog({
                            title: "<span class='glyphicon glyphicon-gift'></span> How much would you like to pledge?",
                            message: "<div class='input-group'><span class='input-group-addon'><span class='glyphicon glyphicon-usd'></span></span><input type='number' class='form-control' id='pledgeAmount' min='0' placeholder='10' value='" + parseFloat(that.closest(".panel").find("td[data-pledge-id='" + $(".user").attr("data-id") + "']").text().substring(1)).toFixed("2") + "'></div>",
                            buttons: {
                                cancel: {
                                    label: "<span class='glyphicon glyphicon-ban-circle'></span> Cancel",
                                    className: "btn-default"
                                },
                                main: {
                                    label: "<span class='glyphicon glyphicon-gift'></span> Pledge",
                                    className: "btn-success",
                                    callback: function() {
                                        pledgeAmount = $("#pledgeAmount").val();
                                        dataString = {"id": that.attr("data-id"), "logistics_id": that.attr("data-logistics-id"), "pledge_amount": $("#pledgeAmount").val()};
                                        target = that.closest(".panel");
                                        $.ajax({
                                            type: "POST",
                                            url: "/pledge",
                                            data: dataString,
                                            success: function(auth) {
                                                if (auth == "True" && isNumber(pledgeAmount) && pledgeAmount != "" && pledgeAmount >= 0){
                                                    if (parseInt(pledgeAmount) == 0){
                                                        if (target.find("td[data-pledge-id='" + $(".user").attr("data-id") + "']").length == 1) {
                                                            target.find(".backers").text(parseInt(target.find(".backers").text()) - 1);
                                                            target.find(".pledged").html("$<span class='money'>" + (parseFloat($.trim(target.find(".pledged").text()).substring(1)) - parseFloat(target.find("td[data-pledge-id='" + $(".user").attr("data-id") + "']").text().substring(1))) + "</span>");
                                                            target.find("td[data-pledge-id='" + $(".user").attr("data-id") + "']").closest("tr").remove();
                                                        }
                                                        $.pnotify({
                                                            title: "Pledge Removed",
                                                            text: "You have removed your pledge.",
                                                            type: "success"
                                                        });
                                                    }
                                                    else {
                                                        if (target.find("td[data-pledge-id='" + $(".user").attr("data-id") + "']").length == 0) {
                                                            target.find(".backers").text(parseInt(target.find(".backers").text()) + 1);
                                                            target.find(".pledged").html("$<span class='money'>" + (parseFloat($.trim(target.find(".pledged").text()).substring(1)) + parseFloat(pledgeAmount)).toFixed("2") + "</span>");
                                                            $("<tr><td class='col-xs-5 col-sm-7 col-md-8 col-lg-9' data-pledge-id='" + $(".user").attr("data-id") + "'>$<span class='money'>" + parseFloat(pledgeAmount).toFixed("2") + "</span></td><td class='col-xs-7 col-sm-5 col-md-4 col-lg-3'><img src='" + $(".user").attr("data-public-profile-photo-url") + "' class='img-profile'> <a href='" + $(".user").attr("data-public-profile-url") + "' target='_blank'>" + $(".user").attr("data-name") + "</a></td></tr>").appendTo(target.find("tbody")).hide().fadeIn("slow");
                                                        }
                                                        else {
                                                            target.find(".pledged").html("$<span class='money'>" + (parseFloat($.trim(target.find(".pledged").text()).substring(1)) - parseFloat(target.find("td[data-pledge-id='" + $(".user").attr("data-id") + "']").text().substring(1)) + parseFloat(pledgeAmount)).toFixed("2") + "</span>");
                                                            target.find("td[data-pledge-id='" + $(".user").attr("data-id") + "']").html("$<span class='money'>" + parseFloat(pledgeAmount).toFixed("2") + "</span>");
                                                        }

                                                        $.pnotify({
                                                            title: "Pledge Added",
                                                            text: "You have pledged $" + parseFloat(pledgeAmount).toFixed("2") + ".",
                                                            type: "success"
                                                        });
                                                    }
                                                }

                                                $("a[data-toggle='tooltip']").tooltip();
                                            },
                                            error: function () {
                                                $.pnotify({
                                                    title: "Pledge Not Added",
                                                    text: "You entered a non-numerical pledge.",
                                                    type: "error"
                                                });
                                            }
                                        });
                                    }
                                }
                            }
                        });
                    });

                    $("input[name='logistics_goal']").val("");
                    $(".addLogisticsNotes").data("wysihtml5").editor.clear();
                }
            },
            error: function () {
                $.pnotify({
                    title: "Logistic Not Added",
                    text: "You either did not enter the goal of the logistic or entered a non-numerical goal.",
                    type: "error"
                });
            }
        });
    }

    if ($(this).closest(".panel").find("select[name='logistics_type']").val() == "crowdsourcing") {
        dataString = {"id": $(this).attr("data-id"), "logistics_type": $(this).closest(".panel").find("select[name='logistics_type']").val(), "logistics_notes": $(".addLogisticsNotes").val()};
        target = $(this).closest(".panel");
        $.ajax({
            type: "POST",
            url: "/addLogistics",
            data: dataString,
            success: function(data) {
                data = data.split("/");

                if (data[1] == undefined){
                    auth = data[0];
                }

                else {
                    auth = data[1];
                }

                if (auth == "True"){
                    if ($(".event").attr("data-permissions") == "admin") {
                        $("<div class='panel panel-default' data-type='Crowdsourcing'><div class='panel-heading'><h3 class='panel-title'>Crowdsourcing</h3></div><div class='panel-body logisticsShown'>" + $(".addLogisticsNotes").val() + "</div><ul class='list-group logisticsShown'></ul><div class='panel-body logisticsShown'><form method='post'><div class='form-group'><input type='text' class='form-control' id='inputItem' placeholder='Item' name='item_item' required></div><div class='form-group'><button type='button' class='btn btn-primary addItem' data-id='" + $(".event").attr("data-id") + "' data-logistics-id='" + data[0] + "'><span class='glyphicon glyphicon-plus'></span> Add Item</button></div></form></div><div class='panel-body editLogisticsForm'><form class='form-horizontal' data-logistics-type='crowdsourcing'><div class='form-group'><label for='inputLogisticsNotes' class='col-xs-3 col-sm-2 control-label'>Logistics Notes:</label><div class='col-xs-9 col-sm-10'><textarea class='form-control wysihtml5 editLogisticsNotes' id='inputLogisticsNotes' rows='10' placeholder='Notes for Logistics' name='logistics_notes'>" + $(".addLogisticsNotes").val() + "</textarea></div></div><div class='form-group'><div class='col-xs-3 visible-xs'></div><div class='col-xs-9 col-sm-10 col-sm-offset-2'><button type='button' class='btn btn-primary submitEditLogistics' data-id='" + $(".event").attr("data-id") + "' data-logistics-id='" + data[0] + "'><span class='glyphicon glyphicon-edit'></span> Edit Logistics</button> <button type='button' class='btn btn-default cancelEditLogistics'><span class='glyphicon glyphicon-ban-circle'></span> Cancel</button></div></div></form></div><div class='panel-footer text-right'><button class='btn btn-primary editLogistics' data-id='" + $(".event").attr("data-id") + "' data-logistics-id='" + data[0] + "'><span class='glyphicon glyphicon-edit'></span></button> <button class='btn btn-danger deleteLogistics' data-id='" + $(".event").attr("data-id") + "' data-logistics-id='" + data[0] + "'><span class='glyphicon glyphicon-trash'></span></button></div></div>").insertBefore(target).hide().animate({ height: "toggle", opacity: "toggle" }, "slow");

                        $(".wysihtml5").each(function() {
                            if ($(this).closest(".addLogisticsArea").length == 0) {
                                $(this).wysihtml5({
                                    stylesheets: ["http://fonts.googleapis.com/css?family=Open+Sans", "/static/css/bootstrap-typography.min.css"]
                                });
                            }
                        });

                        $(".deleteLogistics").click(function() {
                            that = $(this);
                            bootbox.dialog({
                                title: "<span class='glyphicon glyphicon-warning-sign'></span> Confirm Delete",
                                message: "Are you sure you want to delete this logistics?",
                                buttons: {
                                    cancel: {
                                        label: "<span class='glyphicon glyphicon-ban-circle'></span> Cancel",
                                        className: "btn-default"
                                    },
                                    main: {
                                        label: "<span class='glyphicon glyphicon-trash'></span> Delete",
                                        className: "btn-danger",
                                        callback: function() {
                                            dataString = {"id": that.attr("data-id"), "logistics_id": that.attr("data-logistics-id")};
                                            target = that.closest(".panel");
                                            $.ajax({
                                                type: "POST",
                                                url: "/deleteLogistics",
                                                data: dataString,
                                                success: function(auth) {
                                                    if (auth == "True"){
                                                        $.pnotify({
                                                            title: "Logistic Deleted",
                                                            text: "You have deleted a logistic for the event \"" + $(".event").attr("data-name") + "\".",
                                                            type: "success"
                                                        });
                                                        target.animate({ height: "toggle", opacity: "toggle" }, "slow", function() { $(this).remove(); });
                                                    }
                                                }
                                            });
                                        }
                                    }
                                }
                            });
                        });

                        $(".editLogisticsForm").hide();

                        $(".editLogistics").click(function() {
                           $(this).closest(".panel").find(".panel-footer").animate({ height: "toggle", opacity: "toggle" }, "slow").closest(".panel").find(".logisticsShown").animate({ height: "toggle", opacity: "toggle" }, "slow").siblings(".editLogisticsForm").animate({ height: "toggle", opacity: "toggle" }, "slow");
                        });

                        $(".submitEditLogistics").click(function() {
                            if ($(this).closest("form").attr("data-logistics-type") == "crowdfunding") {
                                dataString = {"id": $(this).attr("data-id"), "logistics_id": $(this).attr("data-logistics-id"), "logistics_type": $(this).closest("form").attr("data-logistics-type"), "logistics_notes": $(this).closest(".form-horizontal").find(".editLogisticsNotes").val()};
                                target = $(this).closest(".panel");
                                $.ajax({
                                    type: "POST",
                                    url: "/editLogistics",
                                    data: dataString,
                                    success: function(auth) {
                                        if (auth == "True"){
                                            target.find(".panel-footer").animate({ height: "toggle", opacity: "toggle" }, "slow").closest(".panel").find(".col-md-9").find(".col-xs-12").first().html(target.find("textarea[name='logistics_notes']").val()).closest(".logisticsShown").animate({ height: "toggle", opacity: "toggle" }, "slow").siblings(".editLogisticsForm").animate({ height: "toggle", opacity: "toggle" }, "slow");
                                            $.pnotify({
                                                title: "Logistics Edited",
                                                text: "The logistic has been edited.",
                                                type: "success"
                                            });
                                        }
                                    }
                                });
                            }
                            if ($(this).closest("form").attr("data-logistics-type") == "crowdsourcing") {
                                dataString = {"id": $(this).attr("data-id"), "logistics_id": $(this).attr("data-logistics-id"), "logistics_type": $(this).closest("form").attr("data-logistics-type"), "logistics_notes": $(this).closest(".form-horizontal").find(".editLogisticsNotes").val()};
                                target = $(this).closest(".panel");
                                $.ajax({
                                    type: "POST",
                                    url: "/editLogistics",
                                    data: dataString,
                                    success: function(auth) {
                                        if (auth == "True"){
                                            target.find(".panel-footer").animate({ height: "toggle", opacity: "toggle" }, "slow").closest(".panel").find(".panel-body").first().html(target.find("textarea[name='logistics_notes']").val()).closest(".panel").find(".logisticsShown").animate({ height: "toggle", opacity: "toggle" }, "slow").siblings(".editLogisticsForm").animate({ height: "toggle", opacity: "toggle" }, "slow");
                                            $.pnotify({
                                                title: "Logistics Edited",
                                                text: "The logistic has been edited.",
                                                type: "success"
                                            });
                                        }
                                    }
                                });
                            }
                        });

                        $(".cancelEditLogistics").click(function() {
                           $(this).closest(".panel").find(".panel-footer").animate({ height: "toggle", opacity: "toggle" }, "slow").closest(".panel").find(".logisticsShown").animate({ height: "toggle", opacity: "toggle" }, "slow").siblings(".editLogisticsForm").animate({ height: "toggle", opacity: "toggle" }, "slow");
                        });

                        $(".addItem").click(function() {
                            dataString = {"id": $(this).attr("data-id"), "logistics_id": $(this).attr("data-logistics-id"), "item_item": $(this).closest("form").find("input[name='item_item']").val()};
                            target = $(this).closest(".panel-body");
                            $.ajax({
                                type: "POST",
                                url: "/addItem",
                                data: dataString,
                                success: function(data) {
                                    data = data.split("/");

                                    if (data[1] == undefined){
                                        auth = data[0];
                                    }

                                    else {
                                        auth = data[1];
                                    }

                                    if (auth == "True"){
                                        $("<li class='list-group-item'>" + target.find("input[name='item_item']").val() + "<div class='pull-right'>&nbsp;<button class='btn btn-success btn-xs bringItem' data-toggle='button' data-id='" + target.find(".addItem").attr("data-id") + "' data-logistics-id='" + target.find(".addItem").attr("data-logistics-id") + "' data-time='" + data[0] + "'><span class='glyphicon glyphicon-ok'></span></button> <button class='btn btn-danger btn-xs deleteItem' data-id='" + target.find(".addItem").attr("data-id") + "' data-logistics-id='" + target.find(".addItem").attr("data-logistics-id") + "' data-time='" + data[0] + "'><span class='glyphicon glyphicon-trash'></span></button></div></li>").appendTo(target.siblings(".list-group")).hide().animate({ height: "toggle", opacity: "toggle" }, "slow");

                                        $.pnotify({
                                            title: "Item Added",
                                            text: "An item has been added.",
                                            type: "success"
                                        });

                                        target.siblings(".list-group").find(".btn").each(function() {
                                            $(this).unbind("click");
                                        });

                                        $(".bringItem").click(function() {
                                            dataString = {"id": $(this).attr("data-id"), "logistics_id": $(this).attr("data-logistics-id"), "item_time": $(this).attr("data-time")};
                                            target = $(this);
                                            $.ajax({
                                                type: "POST",
                                                url: "/bringItem",
                                                data: dataString,
                                                success: function(data) {
                                                    data = data.split("/");

                                                    if (data[1] == undefined){
                                                        auth = data[0];
                                                    }

                                                    else {
                                                        auth = data[1];
                                                    }

                                                    if (auth == "True"){
                                                        if (target.hasClass("active")) {
                                                            $("<span class='text-muted'><img src='" + $(".user").attr("data-public-profile-photo-url") + "' class='img-profile'> <a href='" + $(".user").attr("data-public-profile-url") + "' target='_blank'>" + $(".user").attr("data-name") + "</a> </span>").prependTo(target.parent()).hide().fadeIn("slow");
                                                            $.pnotify({
                                                                title: "Bringing Item",
                                                                text: "You are bringing \"" + target.closest("li").clone().children().remove().end().text().trim() + "\".",
                                                                type: "success"
                                                            });
                                                        }

                                                        else {
                                                            $.pnotify({
                                                                title: "Not Bringing Item",
                                                                text: "You are not bringing \"" + target.closest("li").clone().children().remove().end().text().trim() + "\".",
                                                                type: "success"
                                                            });
                                                            target.siblings(".text-muted").fadeOut("slow", function(){ $(this).remove(); });
                                                        }
                                                    }
                                                }
                                            });
                                        });

                                        $(".deleteItem").click(function() {
                                            that = $(this);
                                            bootbox.dialog({
                                                title: "<span class='glyphicon glyphicon-warning-sign'></span> Confirm Delete",
                                                message: "Are you sure you want to delete this item?",
                                                buttons: {
                                                    cancel: {
                                                        label: "<span class='glyphicon glyphicon-ban-circle'></span> Cancel",
                                                        className: "btn-default"
                                                    },
                                                    main: {
                                                        label: "<span class='glyphicon glyphicon-trash'></span> Delete",
                                                        className: "btn-danger",
                                                        callback: function() {
                                                            dataString = {"id": that.attr("data-id"), "logistics_id": that.attr("data-logistics-id"), "item_time": that.attr("data-time")};
                                                            target = that.closest(".list-group-item");
                                                            $.ajax({
                                                                type: "POST",
                                                                url: "/deleteItem",
                                                                data: dataString,
                                                                success: function(auth) {
                                                                    if (auth == "True"){
                                                                        target.animate({ height: "toggle", opacity: "toggle" }, "slow", function() { $(this).remove(); });
                                                                        $.pnotify({
                                                                            title: "Item Deleted",
                                                                            text: "You have deleted an item.",
                                                                            type: "success"
                                                                        });
                                                                    }
                                                                }
                                                            });
                                                        }
                                                    }
                                                }
                                            });
                                        });

                                        $("a[data-toggle='tooltip']").tooltip();
                                        target.find("input[name='item_item']").val("");
                                    }

                                    else {
                                        $.pnotify({
                                            title: "Item Not Added",
                                            text: "You did not enter the name of the item.",
                                            type: "error"
                                        });
                                    }
                                }
                            });
                        });

                        $(".bringItem").click(function() {
                            dataString = {"id": $(this).attr("data-id"), "logistics_id": $(this).attr("data-logistics-id"), "item_time": $(this).attr("data-time")};
                            target = $(this);
                            $.ajax({
                                type: "POST",
                                url: "/bringItem",
                                data: dataString,
                                success: function(data) {
                                    data = data.split("/");

                                    if (data[1] == undefined){
                                        auth = data[0];
                                    }

                                    else {
                                        auth = data[1];
                                    }

                                    if (auth == "True"){
                                        if (target.hasClass("active")) {
                                            $("<span class='text-muted'><img src='" + $(".user").attr("data-public-profile-photo-url") + "' class='img-profile'> <a href='" + $(".user").attr("data-public-profile-url") + "' target='_blank'>" + $(".user").attr("data-name") + "</a> </span>").prependTo(target.parent()).hide().fadeIn("slow");
                                            $.pnotify({
                                                title: "Bringing Item",
                                                text: "You are bringing \"" + target.closest("li").clone().children().remove().end().text().trim() + "\".",
                                                type: "success"
                                            });
                                        }

                                        else {
                                            $.pnotify({
                                                title: "Not Bringing Item",
                                                text: "You are not bringing \"" + target.closest("li").clone().children().remove().end().text().trim() + "\".",
                                                type: "success"
                                            });
                                            target.siblings(".text-muted").fadeOut("slow", function(){ $(this).remove(); });
                                        }
                                    }

                                    $("a[data-toggle='tooltip']").tooltip();
                                }
                            });
                        });

                        $(".deleteItem").click(function() {
                            that = $(this);
                            bootbox.dialog({
                                title: "<span class='glyphicon glyphicon-warning-sign'></span> Confirm Delete",
                                message: "Are you sure you want to delete this item?",
                                buttons: {
                                    cancel: {
                                        label: "<span class='glyphicon glyphicon-ban-circle'></span> Cancel",
                                        className: "btn-default"
                                    },
                                    main: {
                                        label: "<span class='glyphicon glyphicon-trash'></span> Delete",
                                        className: "btn-danger",
                                        callback: function() {
                                            dataString = {"id": that.attr("data-id"), "logistics_id": that.attr("data-logistics-id"), "item_time": that.attr("data-time")};
                                            target = that.closest(".list-group-item");
                                            $.ajax({
                                                type: "POST",
                                                url: "/deleteItem",
                                                data: dataString,
                                                success: function(auth) {
                                                    if (auth == "True"){
                                                        target.animate({ height: "toggle", opacity: "toggle" }, "slow", function() { $(this).remove(); });
                                                        $.pnotify({
                                                            title: "Item Deleted",
                                                            text: "You have deleted an item.",
                                                            type: "success"
                                                        });
                                                    }
                                                }
                                            });
                                        }
                                    }
                                }
                            });
                        });
                    }

                    else{
                        $("<div class='panel panel-default' data-type='Crowdsourcing'><div class='panel-heading'><h3 class='panel-title'>Crowdsourcing</h3></div><div class='panel-body logisticsShown'>" + $(".addLogisticsNotes").val() + "</div><ul class='list-group logisticsShown'></ul><div class='panel-body logisticsShown'><form method='post'><div class='form-group'><input type='text' class='form-control' id='inputItem' placeholder='Item' name='item_item' required></div><div class='form-group'><button type='button' class='btn btn-primary addItem' data-id='" + $(".event").attr("data-id") + "' data-logistics-id='" + data[0] + "'><span class='glyphicon glyphicon-plus'></span> Add Item</button></div></form></div><div class='panel-body editLogisticsForm'></div></div>").insertBefore(target).hide().animate({ height: "toggle", opacity: "toggle" }, "slow");
                    }

                    $("select[name='logistics_type']").prop("selectedIndex", 0).closest(".form-group").next().animate({ height: "toggle", opacity: 1 }, "toggle").find("input[name='logistics_goal']").val("");
                    $(".addLogisticsNotes").data("wysihtml5").editor.clear();
                }
            }
        });
    }
});

$(".deleteLogistics").click(function() {
    that = $(this);
    bootbox.dialog({
        title: "<span class='glyphicon glyphicon-warning-sign'></span> Confirm Delete",
        message: "Are you sure you want to delete this logistics?",
        buttons: {
            cancel: {
                label: "<span class='glyphicon glyphicon-ban-circle'></span> Cancel",
                className: "btn-default"
            },
            main: {
                label: "<span class='glyphicon glyphicon-trash'></span> Delete",
                className: "btn-danger",
                callback: function() {
                    dataString = {"id": that.attr("data-id"), "logistics_id": that.attr("data-logistics-id")};
                    target = that.closest(".panel");
                    $.ajax({
                        type: "POST",
                        url: "/deleteLogistics",
                        data: dataString,
                        success: function(auth) {
                            if (auth == "True"){
                                $.pnotify({
                                    title: "Logistic Deleted",
                                    text: "You have deleted a logistic for the event \"" + $(".event").attr("data-name") + "\".",
                                    type: "success"
                                });
                                target.animate({ height: "toggle", opacity: "toggle" }, "slow", function() { $(this).remove(); });
                            }
                        }
                    });
                }
            }
        }
    });
});

$(".editLogisticsForm").hide();

$(".editLogistics").click(function() {
   $(this).closest(".panel").find(".panel-footer").animate({ height: "toggle", opacity: "toggle" }, "slow").closest(".panel").find(".logisticsShown").animate({ height: "toggle", opacity: "toggle" }, "slow").siblings(".editLogisticsForm").animate({ height: "toggle", opacity: "toggle" }, "slow");
});

$(".submitEditLogistics").click(function() {
    if ($(this).closest("form").attr("data-logistics-type") == "crowdfunding") {
        dataString = {"id": $(this).attr("data-id"), "logistics_id": $(this).attr("data-logistics-id"), "logistics_type": $(this).closest("form").attr("data-logistics-type"), "logistics_notes": $(this).closest(".form-horizontal").find(".editLogisticsNotes").val()};
        target = $(this).closest(".panel");
        $.ajax({
            type: "POST",
            url: "/editLogistics",
            data: dataString,
            success: function(auth) {
                if (auth == "True"){
                    target.find(".panel-footer").animate({ height: "toggle", opacity: "toggle" }, "slow").closest(".panel").find(".col-md-9").find(".col-xs-12").first().html(target.find("textarea[name='logistics_notes']").val()).closest(".logisticsShown").animate({ height: "toggle", opacity: "toggle" }, "slow").siblings(".editLogisticsForm").animate({ height: "toggle", opacity: "toggle" }, "slow");
                    $.pnotify({
                        title: "Logistics Edited",
                        text: "The logistic has been edited.",
                        type: "success"
                    });
                }
            }
        });
    }
    if ($(this).closest("form").attr("data-logistics-type") == "crowdsourcing") {
        dataString = {"id": $(this).attr("data-id"), "logistics_id": $(this).attr("data-logistics-id"), "logistics_type": $(this).closest("form").attr("data-logistics-type"), "logistics_notes": $(this).closest(".form-horizontal").find(".editLogisticsNotes").val()};
        target = $(this).closest(".panel");
        $.ajax({
            type: "POST",
            url: "/editLogistics",
            data: dataString,
            success: function(auth) {
                if (auth == "True"){
                    target.find(".panel-footer").animate({ height: "toggle", opacity: "toggle" }, "slow").closest(".panel").find(".panel-body").first().html(target.find("textarea[name='logistics_notes']").val()).closest(".panel").find(".logisticsShown").animate({ height: "toggle", opacity: "toggle" }, "slow").siblings(".editLogisticsForm").animate({ height: "toggle", opacity: "toggle" }, "slow");
                    $.pnotify({
                        title: "Logistics Edited",
                        text: "The logistic has been edited.",
                        type: "success"
                    });
                }
            }
        });
    }
});

$(".cancelEditLogistics").click(function() {
   $(this).closest(".panel").find(".panel-footer").animate({ height: "toggle", opacity: "toggle" }, "slow").closest(".panel").find(".logisticsShown").animate({ height: "toggle", opacity: "toggle" }, "slow").siblings(".editLogisticsForm").animate({ height: "toggle", opacity: "toggle" }, "slow");
});

$(".suggestPledge").click(function() {
    that = $(this);
    bootbox.dialog({
        title: "<span class='glyphicon glyphicon-gift'></span> How much would you like to pledge?",
        message: "<div class='input-group'><span class='input-group-addon'><span class='glyphicon glyphicon-usd'></span></span><input type='number' class='form-control' id='pledgeAmount' min='0' placeholder='10' value='" + parseFloat(that.closest(".panel").find("td[data-pledge-id='" + $(".user").attr("data-id") + "']").text().substring(1)).toFixed("2") + "'></div>",
        buttons: {
            cancel: {
                label: "<span class='glyphicon glyphicon-ban-circle'></span> Cancel",
                className: "btn-default"
            },
            main: {
                label: "<span class='glyphicon glyphicon-gift'></span> Pledge",
                className: "btn-success",
                callback: function() {
                    pledgeAmount = $("#pledgeAmount").val();
                    dataString = {"id": that.attr("data-id"), "logistics_id": that.attr("data-logistics-id"), "pledge_amount": $("#pledgeAmount").val()};
                    target = that.closest(".panel");
                    $.ajax({
                        type: "POST",
                        url: "/pledge",
                        data: dataString,
                        success: function(auth) {
                            if (auth == "True" && isNumber(pledgeAmount) && pledgeAmount != "" && pledgeAmount >= 0){
                                if (parseInt(pledgeAmount) == 0){
                                    if (target.find("td[data-pledge-id='" + $(".user").attr("data-id") + "']").length == 1) {
                                        target.find(".backers").text(parseInt(target.find(".backers").text()) - 1);
                                        target.find(".pledged").html("$<span class='money'>" + (parseFloat($.trim(target.find(".pledged").text()).substring(1)) - parseFloat(target.find("td[data-pledge-id='" + $(".user").attr("data-id") + "']").text().substring(1))) + "</span>");
                                        target.find("td[data-pledge-id='" + $(".user").attr("data-id") + "']").closest("tr").remove();
                                    }
                                    $.pnotify({
                                        title: "Pledge Removed",
                                        text: "You have removed your pledge.",
                                        type: "success"
                                    });
                                }
                                else {
                                    if (target.find("td[data-pledge-id='" + $(".user").attr("data-id") + "']").length == 0) {
                                        target.find(".backers").text(parseInt(target.find(".backers").text()) + 1);
                                        target.find(".pledged").html("$<span class='money'>" + (parseFloat($.trim(target.find(".pledged").text()).substring(1)) + parseFloat(pledgeAmount)).toFixed("2") + "</span>");
                                        $("<tr><td class='col-xs-5 col-sm-7 col-md-8 col-lg-9' data-pledge-id='" + $(".user").attr("data-id") + "'>$<span class='money'>" + parseFloat(pledgeAmount).toFixed("2") + "</span></td><td class='col-xs-7 col-sm-5 col-md-4 col-lg-3'><img src='" + $(".user").attr("data-public-profile-photo-url") + "' class='img-profile'> <a href='" + $(".user").attr("data-public-profile-url") + "' target='_blank'>" + $(".user").attr("data-name") + "</a></td></tr>").appendTo(target.find("tbody")).hide().fadeIn("slow");
                                    }
                                    else {
                                        target.find(".pledged").html("$<span class='money'>" + (parseFloat($.trim(target.find(".pledged").text()).substring(1)) - parseFloat(target.find("td[data-pledge-id='" + $(".user").attr("data-id") + "']").text().substring(1)) + parseFloat(pledgeAmount)).toFixed("2") + "</span>");
                                        target.find("td[data-pledge-id='" + $(".user").attr("data-id") + "']").html("$<span class='money'>" + parseFloat(pledgeAmount).toFixed("2") + "</span>");
                                    }

                                    $.pnotify({
                                        title: "Pledge Added",
                                        text: "You have pledged $" + parseFloat(pledgeAmount).toFixed("2") + ".",
                                        type: "success"
                                    });
                                }
                            }

                            $("a[data-toggle='tooltip']").tooltip();
                        },
                        error: function () {
                            $.pnotify({
                                title: "Pledge Not Added",
                                text: "You entered a non-numerical pledge.",
                                type: "error"
                            });
                        }
                    });
                }
            }
        }
    });
});

$(".addItem").click(function() {
    dataString = {"id": $(this).attr("data-id"), "logistics_id": $(this).attr("data-logistics-id"), "item_item": $(this).closest("form").find("input[name='item_item']").val()};
    target = $(this).closest(".panel-body");
    $.ajax({
        type: "POST",
        url: "/addItem",
        data: dataString,
        success: function(data) {
            data = data.split("/");

            if (data[1] == undefined){
                auth = data[0];
            }

            else {
                auth = data[1];
            }

            if (auth == "True"){
                $("<li class='list-group-item'>" + target.find("input[name='item_item']").val() + "<div class='pull-right'>&nbsp;<button class='btn btn-success btn-xs bringItem' data-toggle='button' data-id='" + target.find(".addItem").attr("data-id") + "' data-logistics-id='" + target.find(".addItem").attr("data-logistics-id") + "' data-time='" + data[0] + "'><span class='glyphicon glyphicon-ok'></span></button> <button class='btn btn-danger btn-xs deleteItem' data-id='" + target.find(".addItem").attr("data-id") + "' data-logistics-id='" + target.find(".addItem").attr("data-logistics-id") + "' data-time='" + data[0] + "'><span class='glyphicon glyphicon-trash'></span></button></div></li>").appendTo(target.siblings(".list-group")).hide().animate({ height: "toggle", opacity: "toggle" }, "slow");

                $.pnotify({
                    title: "Item Added",
                    text: "An item has been added.",
                    type: "success"
                });

                target.siblings(".list-group").find(".btn").each(function() {
                    $(this).unbind("click");
                });

                $(".bringItem").click(function() {
                    dataString = {"id": $(this).attr("data-id"), "logistics_id": $(this).attr("data-logistics-id"), "item_time": $(this).attr("data-time")};
                    target = $(this);
                    $.ajax({
                        type: "POST",
                        url: "/bringItem",
                        data: dataString,
                        success: function(data) {
                            data = data.split("/");

                            if (data[1] == undefined){
                                auth = data[0];
                            }

                            else {
                                auth = data[1];
                            }

                            if (auth == "True"){
                                if (target.hasClass("active")) {
                                    $("<span class='text-muted'><img src='" + $(".user").attr("data-public-profile-photo-url") + "' class='img-profile'> <a href='" + $(".user").attr("data-public-profile-url") + "' target='_blank'>" + $(".user").attr("data-name") + "</a> </span>").prependTo(target.parent()).hide().fadeIn("slow");
                                    $.pnotify({
                                        title: "Bringing Item",
                                        text: "You are bringing \"" + target.closest("li").clone().children().remove().end().text().trim() + "\".",
                                        type: "success"
                                    });
                                }

                                else {
                                    $.pnotify({
                                        title: "Not Bringing Item",
                                        text: "You are not bringing \"" + target.closest("li").clone().children().remove().end().text().trim() + "\".",
                                        type: "success"
                                    });
                                    target.siblings(".text-muted").fadeOut("slow", function(){ $(this).remove(); });
                                }
                            }
                        }
                    });
                });

                $(".deleteItem").click(function() {
                    that = $(this);
                    bootbox.dialog({
                        title: "<span class='glyphicon glyphicon-warning-sign'></span> Confirm Delete",
                        message: "Are you sure you want to delete this item?",
                        buttons: {
                            cancel: {
                                label: "<span class='glyphicon glyphicon-ban-circle'></span> Cancel",
                                className: "btn-default"
                            },
                            main: {
                                label: "<span class='glyphicon glyphicon-trash'></span> Delete",
                                className: "btn-danger",
                                callback: function() {
                                    dataString = {"id": that.attr("data-id"), "logistics_id": that.attr("data-logistics-id"), "item_time": that.attr("data-time")};
                                    target = that.closest(".list-group-item");
                                    $.ajax({
                                        type: "POST",
                                        url: "/deleteItem",
                                        data: dataString,
                                        success: function(auth) {
                                            if (auth == "True"){
                                                target.animate({ height: "toggle", opacity: "toggle" }, "slow", function() { $(this).remove(); });
                                                $.pnotify({
                                                    title: "Item Deleted",
                                                    text: "You have deleted an item.",
                                                    type: "success"
                                                });
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    });
                });

                $("a[data-toggle='tooltip']").tooltip();
                target.find("input[name='item_item']").val("");
            }

            else {
                $.pnotify({
                    title: "Item Not Added",
                    text: "You did not enter the name of the item.",
                    type: "error"
                });
            }
        }
    });
});

$(".bringItem").click(function() {
    dataString = {"id": $(this).attr("data-id"), "logistics_id": $(this).attr("data-logistics-id"), "item_time": $(this).attr("data-time")};
    target = $(this);
    $.ajax({
        type: "POST",
        url: "/bringItem",
        data: dataString,
        success: function(data) {
            data = data.split("/");

            if (data[1] == undefined){
                auth = data[0];
            }

            else {
                auth = data[1];
            }

            if (auth == "True"){
                if (target.hasClass("active")) {
                    $("<span class='text-muted'><img src='" + $(".user").attr("data-public-profile-photo-url") + "' class='img-profile'> <a href='" + $(".user").attr("data-public-profile-url") + "' target='_blank'>" + $(".user").attr("data-name") + "</a> </span>").prependTo(target.parent()).hide().fadeIn("slow");
                    $.pnotify({
                        title: "Bringing Item",
                        text: "You are bringing \"" + target.closest("li").clone().children().remove().end().text().trim() + "\".",
                        type: "success"
                    });
                }

                else {
                    $.pnotify({
                        title: "Not Bringing Item",
                        text: "You are not bringing \"" + target.closest("li").clone().children().remove().end().text().trim() + "\".",
                        type: "success"
                    });
                    target.siblings(".text-muted").fadeOut("slow", function(){ $(this).remove(); });
                }
            }

            $("a[data-toggle='tooltip']").tooltip();
        }
    });
});

$(".deleteItem").click(function() {
    that = $(this);
    bootbox.dialog({
        title: "<span class='glyphicon glyphicon-warning-sign'></span> Confirm Delete",
        message: "Are you sure you want to delete this item?",
        buttons: {
            cancel: {
                label: "<span class='glyphicon glyphicon-ban-circle'></span> Cancel",
                className: "btn-default"
            },
            main: {
                label: "<span class='glyphicon glyphicon-trash'></span> Delete",
                className: "btn-danger",
                callback: function() {
                    dataString = {"id": that.attr("data-id"), "logistics_id": that.attr("data-logistics-id"), "item_time": that.attr("data-time")};
                    target = that.closest(".list-group-item");
                    $.ajax({
                        type: "POST",
                        url: "/deleteItem",
                        data: dataString,
                        success: function(auth) {
                            if (auth == "True"){
                                target.animate({ height: "toggle", opacity: "toggle" }, "slow", function() { $(this).remove(); });
                                $.pnotify({
                                    title: "Item Deleted",
                                    text: "You have deleted an item.",
                                    type: "success"
                                });
                            }
                        }
                    });
                }
            }
        }
    });
});

$(".addLocation").click(function() {
    dataString = {"id": $(this).attr("data-id"), "location_name": $(this).closest(".panel").find("input[name='location_name']").val(), "location_address": $(this).closest(".panel").find("input[name='location_address']").val(), "location_notes": $(".addLocationNotes").val(), "location_lat": $("#add_location_lat").val(), "location_long": $("#add_location_long").val()};
    target = $(this).closest(".panel");
    $.ajax({
        type: "POST",
        url: "/addLocation",
        data: dataString,
        success: function(data) {
            data = data.split("/");

            if (data[1] == undefined){
                auth = data[0];
            }

            else {
                auth = data[1];
            }

            if (auth == "True" && target.find("input[name='location_name']").val() != "" && target.find("input[name='location_address']").val() != ""){
                $("<div class='panel panel-default' data-name='" + target.find("input[name='location_name']").val() + "'><div class='panel-heading'><h3 class='panel-title'>" + target.find("input[name='location_name']").val() + " <span class='text-muted'>(" + target.find("input[name='location_address']").val() + ")</span><span class='text-muted pull-right'><img src='" + $(".user").attr("data-public-profile-photo-url") + "' class='img-profile'> <a href='" + $(".user").attr("data-public-profile-url") + "' target='_blank'>" + $(".user").attr("data-name") + "</a></span></h3></div><div class='panel-body'><div class='locationShown row'><div class='col-xs-12'>" + target.find(".addLocationNotes").val() + "</div><br><br><div class='gmaps-canvas-location col-xs-12' id='canvas-location-" + data[0] + "' data-lat='" + $("#add_location_lat").val() + "' data-lon='" + $("#add_location_long").val() + "'></div></div><form class='form-horizontal editLocationForm hide'><div class='form-group'><label for='inputLocationName' class='col-xs-3 col-sm-2 control-label'>Location Name:</label><div class='col-xs-9 col-sm-10'><input type='text' class='form-control' id='inputLocationName' placeholder='Name of Location' name='location_name' value='" + target.find("input[name='location_name']").val() + "'></div></div><div class='form-group'><label for='inputLocationNotes' class='col-xs-3 col-sm-2 control-label'>Location Notes:</label><div class='col-xs-9 col-sm-10'><textarea class='form-control wysihtml5 editLocationNotes' id='inputLocationNotes' rows='10' placeholder='Notes for Location' name='location_notes'>" + target.find(".addLocationNotes").val() + "</textarea></div></div><div class='form-group'><div class='col-xs-3 visible-xs'></div><div class='col-xs-9 col-sm-10 col-sm-offset-2'><button type='button' class='btn btn-primary submitEditLocation' data-id='" + $(".event").attr("data-id") + "' data-location-id='" + data[0] + "'><span class='glyphicon glyphicon-edit'></span> Edit Location</button> <button type='button' class='btn btn-default cancelEditLocation'><span class='glyphicon glyphicon-ban-circle'></span> Cancel</button></div></div></form></div><div class='panel-footer'><div class='row'><div class='col-xs-6 col-sm-3 col-md-2'><span class='voting' data-id='" + $(".event").attr("data-id") + "' data-location-id='" + data[0] + "'><button class='btn btn-default upvoteLocation' data-id='" + $(".event").attr("data-id") + "' data-location-id='" + data[0] + "'><span class='glyphicon glyphicon-chevron-up'></span></button> <span class='vote'>0</span> <button class='btn btn-default downvoteLocation' data-id='" + $(".event").attr("data-id") + "' data-location-id='" + data[0] + "'><span class='glyphicon glyphicon-chevron-down'></span></button></span></div><div class='col-xs-6 col-sm-3 col-lg-2 col-sm-offset-6 col-md-offset-7 col-lg-offset-8 text-right'><button class='btn btn-success confirmLocation' data-id='" + $(".event").attr("data-id") + "' data-location-id='" + data[0] + "' data-name='" + target.find("input[name='location_name']").val() + "'><span class='glyphicon glyphicon-ok'></span></button> <button class='btn btn-primary editLocation' data-id='" + $(".event").attr("data-id") + "' data-location-id='" + data[0] + "'><span class='glyphicon glyphicon-edit'></span></button> <button class='btn btn-danger deleteLocation' data-id='" + $(".event").attr("data-id") + "' data-location-id='" + data[0] + "' data-name='" + target.find("input[name='location_name']").val() + "'><span class='glyphicon glyphicon-trash'></span></button></div></div></div></div>").insertBefore(target).hide().animate({ height: "toggle", opacity: "toggle" }, "slow");

                $.pnotify({
                    title: "Location Added",
                    text: "You have added the location \"" + target.find("input[name='location_name']").val() + "\" for the event \"" + $(".event").attr("data-name") + "\".",
                    type: "success"
                });

                $(".wysihtml5").each(function() {
                    if ($(this).closest(".addLocationArea").length == 0) {
                        $(this).wysihtml5({
                            stylesheets: ["http://fonts.googleapis.com/css?family=Open+Sans", "/static/css/bootstrap-typography.min.css"]
                        });
                    }
                });

                $(".gmaps-canvas-location").each(function(i, obj){
                    show_location(obj.id, $(this).data("lat"), $(this).data("lon"));
                });

                target.prev().find(".editLocationForm").removeClass("hide").hide();

                target.siblings(".panel").find(".btn").each(function() {
                    $(this).unbind("click");
                });

                $(".deleteLocation").click(function() {
                    that = $(this);
                    bootbox.dialog({
                        title: "<span class='glyphicon glyphicon-warning-sign'></span> Confirm Delete",
                        message: "Are you sure you want to delete <em>" + that.attr("data-name") + "</em>?",
                        buttons: {
                            cancel: {
                                label: "<span class='glyphicon glyphicon-ban-circle'></span> Cancel",
                                className: "btn-default"
                            },
                            main: {
                                label: "<span class='glyphicon glyphicon-trash'></span> Delete",
                                className: "btn-danger",
                                callback: function() {
                                    dataString = {"id": that.attr("data-id"), "location_id": that.attr("data-location-id")};
                                    target = that.closest(".panel");
                                    $.ajax({
                                        type: "POST",
                                        url: "/deleteLocation",
                                        data: dataString,
                                        success: function(auth) {
                                            if (auth == "True"){
                                                $.pnotify({
                                                    title: "Location Deleted",
                                                    text: "You have deleted the location \"" + target.find("input[name='location_name']").val() + "\" for the event \"" + $(".event").attr("data-name") + "\".",
                                                    type: "success"
                                                });
                                                target.animate({ height: "toggle", opacity: "toggle" }, "slow", function() { $(this).remove(); });
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    });
                });

                $(".confirmLocation").click(function() {
                    that = $(this);
                    bootbox.dialog({
                        title: "<span class='glyphicon glyphicon-warning-sign'></span> Confirm Location",
                        message: "Are you sure you want to accept <em>" + that.attr("data-name") + "</em> as <em>" + $(".event").attr("data-name") + "'s</em> location?",
                        buttons: {
                            cancel: {
                                label: "<span class='glyphicon glyphicon-ban-circle'></span> Cancel",
                                className: "btn-default"
                            },
                            main: {
                                label: "<span class='glyphicon glyphicon-ok'></span> Confirm",
                                className: "btn-success",
                                callback: function() {
                                    dataString = {"id": that.attr("data-id"), "location_id": that.attr("data-location-id")};
                                    $.ajax({
                                        type: "POST",
                                        url: "/confirmLocation",
                                        data: dataString,
                                        success: function(auth) {
                                            if (auth == "True"){
                                                window.location.replace("/event?id=" + $(".event").attr("data-id") + "&notification=confirmLocation");
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    });
                });

                $(".editLocation").click(function() {
                   $(this).closest(".panel").find(".panel-footer").animate({ height: "toggle", opacity: "toggle" }, "slow").closest(".panel").find(".locationShown").animate({ height: "toggle", opacity: "toggle" }, "slow").siblings(".editLocationForm").animate({ height: "toggle", opacity: "toggle" }, "slow");
                });

                $(".submitEditLocation").click(function() {
                    dataString = {"id": $(this).attr("data-id"), "location_id": $(this).attr("data-location-id"), "location_name": $(this).closest(".form-horizontal").find("input[name='location_name']").val(), "location_notes": $(this).closest(".form-horizontal").find(".editLocationNotes").val()};
                    target = $(this).closest(".panel");
                    $.ajax({
                        type: "POST",
                        url: "/editLocation",
                        data: dataString,
                        success: function(auth) {
                            if (auth == "True"){
                                $.pnotify({
                                    title: "Location Edited",
                                    text: "You have edited the location \"" + target.find("input[name='location_name']").val() + "\" for the event \"" + $(".event").attr("data-name") + "\".",
                                    type: "success"
                                });
                                target.find(".panel-footer").animate({ height: "toggle", opacity: "toggle" }, "slow").closest(".panel").find(".panel-title").html(target.find("input[name='location_name']").val() + " <span class='text-muted'>" + target.find(".panel-title").find("span").first().html() + "</span><span class='text-muted pull-right'>" + target.find(".panel-title").find("span").last().html() + "</span>").closest(".panel").find(".locationShown").find(".col-xs-12").first().html(target.find("textarea[name='location_notes']").val()).closest(".locationShown").animate({ height: "toggle", opacity: "toggle" }, "slow").siblings(".editLocationForm").animate({ height: "toggle", opacity: "toggle" }, "slow");
                            }
                        }
                    });
                });

                $(".cancelEditLocation").click(function() {
                   $(this).closest(".panel").find(".panel-footer").animate({ height: "toggle", opacity: "toggle" }, "slow").closest(".panel").find(".locationShown").animate({ height: "toggle", opacity: "toggle" }, "slow").siblings(".editLocationForm").animate({ height: "toggle", opacity: "toggle" }, "slow");
                    $(this).closest(".panel").find(".editLocationForm")[0].reset();
                });

                $(".upvoteLocation").click(function() {
                    dataString = {"id": $(this).attr("data-id"), "location_id": $(this).attr("data-location-id"), "vote": "upvote"};
                    target = $(this).closest(".voting");
                    $.ajax({
                        type: "POST",
                        url: "/locationVoting",
                        data: dataString,
                        success: function(data) {
                            data = data.split("/");

                            voteCount = data[0];

                            auth = data[1];

                            if (auth == "True"){
                                target.find(".vote").text(voteCount);

                                if (voteCount > 0) {
                                    target.find(".vote").removeClass("text-danger").addClass("text-success");
                                }

                                else if (voteCount < 0) {
                                    target.find(".vote").removeClass("text-success").addClass("text-danger");
                                }

                                else {
                                    target.find(".vote").removeClass("text-success text-danger");
                                }
                            }
                        }
                    });
                });

                $(".downvoteLocation").click(function() {
                    dataString = {"id": $(this).attr("data-id"), "location_id": $(this).attr("data-location-id"), "vote": "downvote"};
                    target = $(this).closest(".voting");
                    $.ajax({
                        type: "POST",
                        url: "/locationVoting",
                        data: dataString,
                        success: function(data) {
                            data = data.split("/");

                            voteCount = data[0];

                            auth = data[1];

                            if (auth == "True"){
                                target.find(".vote").text(voteCount);

                                if (voteCount > 0) {
                                    target.find(".vote").removeClass("text-danger").addClass("text-success");
                                }

                                else if (voteCount < 0) {
                                    target.find(".vote").removeClass("text-success").addClass("text-danger");
                                }

                                else {
                                    target.find(".vote").removeClass("text-success text-danger");
                                }
                            }
                        }
                    });
                });

                $(".upvoteLocation, .downvoteLocation").click(function() {
                    $(this).siblings(".btn").removeClass("active");
                    $(this).addClass("active");
                });

                $("a[data-toggle='tooltip']").tooltip();
                $(target).find("input").val("");
                $(".addLocationNotes").data("wysihtml5").editor.clear();
                gmaps_init();
            }

            else {
                $.pnotify({
                    title: "Location Not Added",
                    text: "You did not enter either the name or the address of the location.",
                    type: "error"
                });
            }
        }
    });
});

$(".deleteLocation").click(function() {
    that = $(this);
    bootbox.dialog({
        title: "<span class='glyphicon glyphicon-warning-sign'></span> Confirm Delete",
        message: "Are you sure you want to delete <em>" + that.attr("data-name") + "</em>?",
        buttons: {
            cancel: {
                label: "<span class='glyphicon glyphicon-ban-circle'></span> Cancel",
                className: "btn-default"
            },
            main: {
                label: "<span class='glyphicon glyphicon-trash'></span> Delete",
                className: "btn-danger",
                callback: function() {
                    dataString = {"id": that.attr("data-id"), "location_id": that.attr("data-location-id")};
                    target = that.closest(".panel");
                    $.ajax({
                        type: "POST",
                        url: "/deleteLocation",
                        data: dataString,
                        success: function(auth) {
                            if (auth == "True"){
                                $.pnotify({
                                    title: "Location Deleted",
                                    text: "You have deleted the location \"" + target.find("input[name='location_name']").val() + "\" for the event \"" + $(".event").attr("data-name") + "\".",
                                    type: "success"
                                });
                                target.animate({ height: "toggle", opacity: "toggle" }, "slow", function() { $(this).remove(); });
                            }
                        }
                    });
                }
            }
        }
    });
});

$(".confirmLocation").click(function() {
    that = $(this);
    bootbox.dialog({
        title: "<span class='glyphicon glyphicon-warning-sign'></span> Confirm Location",
        message: "Are you sure you want to accept <em>" + that.attr("data-name") + "</em> as <em>" + $(".event").attr("data-name") + "'s</em> location?",
        buttons: {
            cancel: {
                label: "<span class='glyphicon glyphicon-ban-circle'></span> Cancel",
                className: "btn-default"
            },
            main: {
                label: "<span class='glyphicon glyphicon-ok'></span> Confirm",
                className: "btn-success",
                callback: function() {
                    dataString = {"id": that.attr("data-id"), "location_id": that.attr("data-location-id")};
                    $.ajax({
                        type: "POST",
                        url: "/confirmLocation",
                        data: dataString,
                        success: function(auth) {
                            if (auth == "True"){
                                window.location.replace("/event?id=" + $(".event").attr("data-id") + "&notification=confirmLocation");
                            }
                        }
                    });
                }
            }
        }
    });
});

$(".editLocationForm").hide();

$(".editLocation").click(function() {
   $(this).closest(".panel").find(".panel-footer").animate({ height: "toggle", opacity: "toggle" }, "slow").closest(".panel").find(".locationShown").animate({ height: "toggle", opacity: "toggle" }, "slow").siblings(".editLocationForm").animate({ height: "toggle", opacity: "toggle" }, "slow");
});

$(".submitEditLocation").click(function() {
    dataString = {"id": $(this).attr("data-id"), "location_id": $(this).attr("data-location-id"), "location_name": $(this).closest(".form-horizontal").find("input[name='location_name']").val(), "location_notes": $(this).closest(".form-horizontal").find(".editLocationNotes").val()};
    target = $(this).closest(".panel");
    $.ajax({
        type: "POST",
        url: "/editLocation",
        data: dataString,
        success: function(auth) {
            if (auth == "True"){
                $.pnotify({
                    title: "Location Edited",
                    text: "You have edited the location \"" + target.find("input[name='location_name']").val() + "\" for the event \"" + $(".event").attr("data-name") + "\".",
                    type: "success"
                });
                target.find(".panel-footer").animate({ height: "toggle", opacity: "toggle" }, "slow").closest(".panel").find(".panel-title").html(target.find("input[name='location_name']").val() + " <span class='text-muted'>" + target.find(".panel-title").find("span").first().html() + "</span><span class='text-muted pull-right'>" + target.find(".panel-title").find("span").last().html() + "</span>").closest(".panel").find(".locationShown").find(".col-xs-12").first().html(target.find("textarea[name='location_notes']").val()).closest(".locationShown").animate({ height: "toggle", opacity: "toggle" }, "slow").siblings(".editLocationForm").animate({ height: "toggle", opacity: "toggle" }, "slow");
            }
        }
    });
});

$(".cancelEditLocation").click(function() {
   $(this).closest(".panel").find(".panel-footer").animate({ height: "toggle", opacity: "toggle" }, "slow").closest(".panel").find(".locationShown").animate({ height: "toggle", opacity: "toggle" }, "slow").siblings(".editLocationForm").animate({ height: "toggle", opacity: "toggle" }, "slow");
    $(this).closest(".panel").find(".editLocationForm")[0].reset();
});

$(".upvoteLocation").click(function() {
    dataString = {"id": $(this).attr("data-id"), "location_id": $(this).attr("data-location-id"), "vote": "upvote"};
    target = $(this).closest(".voting");
    $.ajax({
        type: "POST",
        url: "/locationVoting",
        data: dataString,
        success: function(data) {
            data = data.split("/");

            voteCount = data[0];

            auth = data[1];

            if (auth == "True"){
                target.find(".vote").text(voteCount);

                if (voteCount > 0) {
                    target.find(".vote").removeClass("text-danger").addClass("text-success");
                }

                else if (voteCount < 0) {
                    target.find(".vote").removeClass("text-success").addClass("text-danger");
                }

                else {
                    target.find(".vote").removeClass("text-success text-danger");
                }
            }
        }
    });
});

$(".downvoteLocation").click(function() {
    dataString = {"id": $(this).attr("data-id"), "location_id": $(this).attr("data-location-id"), "vote": "downvote"};
    target = $(this).closest(".voting");
    $.ajax({
        type: "POST",
        url: "/locationVoting",
        data: dataString,
        success: function(data) {
            data = data.split("/");

            voteCount = data[0];

            auth = data[1];

            if (auth == "True"){
                target.find(".vote").text(voteCount);

                if (voteCount > 0) {
                        target.find(".vote").removeClass("text-danger").addClass("text-success");
                    }

                else if (voteCount < 0) {
                    target.find(".vote").removeClass("text-success").addClass("text-danger");
                }

                else {
                    target.find(".vote").removeClass("text-success text-danger");
                }
            }
        }
    });
});

$(window).resize(function() {
    if ($(window).width() < 768){
        $(".col-xs-hide").children("span").next().hide();
        $(".col-sm-hide").children("span").next().hide();
    }
    else if ($(window).width() < 992){
        $(".col-xs-hide").children("span").next().hide();
    }
    else {
        $(".col-xs-hide").children("span").next().show();
        $(".col-sm-hide").children("span").next().show();
    }

    if ($(window).width() >= 752 && $(window).width() < 992 ) {
        gapi.hangout.render("g-hangout", {
            "render": "createhangout",
            "widget_size": "72"
        });
    }

    else {
        gapi.hangout.render("g-hangout", {
            "render": "createhangout",
            "widget_size": "136"
        });
    }

    $(".vertical-align").css("margin-top", Math.round($(".vertical-align").prev().height()/2) - Math.round($(".vertical-align").height()/2));
    $(".vertical-align").css("margin-top", Math.round($(".vertical-align").prev().height()/2) - Math.round($(".vertical-align").height()/2));

    $(".gmaps-canvas-location").each(function(i, obj){
 		show_location(obj.id, $(this).data("lat"), $(this).data("lon"));
	});

    if($("#gmaps-edit-canvas").length) {
        latlng = new google.maps.LatLng($("input[name='location_lat']").val(), $("input[name='location_long']").val());

        options = {
            zoom: 16,
            center: latlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        map = new google.maps.Map(document.getElementById("gmaps-edit-canvas"), options);

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

        add_location_marker.setPosition(latlng);

        $("#gmaps-error").hide();

        autocomplete_init();
    }
});

$(window).resize();
