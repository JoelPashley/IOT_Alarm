var socket = io();

function setCharAt(str,index,chr) {
    if(index > str.length-1) return str;
    return str.substr(0,index) + chr + str.substr(index+1);
}

$(document).ready(function(){
    Push.Permission.request(null, null);
    socket.on("connected", function(data){
        if(data === true){
            $(".STATUSBAR").text("STATUS: ARMED");
        }else if(data === false){
            $(".STATUSBAR").text("STATUS: DISARMED");
        }else{
            $(".STATUSBAR").text("STATUS: TRIGGERED - "+data);
        }
    });

    $(".pin-button").click(function(){
        var text = $(".PINCODE").text();
        if(text.substr(0,1) === "#"){
            $(".PINCODE").text(setCharAt(text, 0, $(this).text()));
            return;
        }else if(text.substr(1,1) === "#"){
            $(".PINCODE").text(setCharAt(text, 1, $(this).text()));
            return;
        }else if(text.substr(2,1) === "#"){
            $(".PINCODE").text(setCharAt(text, 2, $(this).text()));
            return;
        }else if(text.substr(3,1) === "#"){
            $(".PINCODE").text(setCharAt(text, 3, $(this).text()));
        }
        if($(".PINCODE").text().substr(3,1) != "#"){
            socket.emit("passcode", $(".PINCODE").text());
        }
    });

    $("#ARM").click(function(){
        if($(this).hasClass("clickable")){
            var passcode = $(".PINCODE").text();
            $(".PINCODE").text("ARMED");
            $("#DISARM").removeClass("clickable");
            $("#ARM").removeClass("clickable");
            window.setTimeout(function(){
                $(".PINCODE").text(passcode);
                $("#DISARM").addClass("clickable");
                $("#ARM").addClass("clickable");
                socket.emit('armed', passcode);
            }, 1500);
        }
    });

    $("#DISARM").click(function(){
        if($(this).hasClass("clickable")){
            var passcode = $(".PINCODE").text();
            $(".PINCODE").text("DISARMED");
            $("#ARM").removeClass("clickable");
            $("#DISARM").removeClass("clickable");
            $(".STATUSBAR").removeClass("FAIL");
            window.setTimeout(function(){
                $(".PINCODE").text(passcode);
                $("#ARM").addClass("clickable");
                $("#DISARM").addClass("clickable");
                socket.emit('disarmed', passcode);
            }, 1500);
        }
    });

    socket.on("passwordRes", function(data){
        if(data == true){
            $(".PINCODE").addClass("SUCCESS");
            $(".disabled").addClass("clickable");
            $(".disabled").removeClass("disabled");
        }else{
            $(".PINCODE").addClass("FAIL");
            window.setTimeout(resetPINPAD, 2500);
        }
    });

    socket.on("triggered", function(data){
        $(".STATUSBAR").text("STATUS: TRIGGERED - "+data);
        $(".STATUSBAR").addClass("FAIL");
        Push.create("Alarm Notification", {
            body: "The alarm has been triggered.",
            icon: 'GUI/alarmicon.png',
            timeout: 10000,
            onClick: function(){
                window.focus();
                this.close();
            }
        });
    })
    
    socket.on("armedRes", function(data){
        if(data){
            $(".STATUSBAR").text("STATUS: ARMED");
            Push.create("Alarm Notification", {
                body: "The alarm has been armed.",
                icon: 'GUI/alarmicon.png',
                timeout: 10000,
                onClick: function(){
                    window.focus();
                    this.close();
                }
            });
        }
    });
    
    socket.on("disarmedRes", function(data){
        if(data){
            $(".STATUSBAR").text("STATUS: DISARMED");
            Push.create("Alarm Notification", {
                body: "The alarm has been disarmed.",
                icon: 'GUI/alarmicon.png',
                timeout: 10000,
                onClick: function(){
                    window.focus();
                    this.close();
                }
            });
        }
    });
});

function resetPINPAD(){
    $(".PINCODE").text("####");
    $(".PINCODE").removeClass("FAIL");
}