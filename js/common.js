var _user_data = "";

$.ajax({
    url: "access/session_data.php",
    async: false,
    success: function(data){
        if(data != "")
        {
            _user_data = jQuery.parseJSON(data);
        }
    }
});