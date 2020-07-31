function gplus(){
    var authResult = undefined;

    return {
        onSignInCallback: function(authResult) {
            if (authResult["access_token"]) {
                this.authResult = authResult;
                this.connectServer();
                gapi.client.load("plus", "v1", this.renderProfile);
            }
        },
        connectServer: function() {
            $.ajax({
                type: "POST",
                url: window.location.href + "gplusconnect?key=" + global_hidden_key,
                contentType: "application/octet-stream; charset=utf-8",
                success: function(result) {
                    window.location.replace("/");
                },
                processData: false,
                data: this.authResult.code
            });
        }
    };
};
