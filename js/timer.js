$.fn.timer = function(settings) {
    var container = $(this);
    settings = $.extend({
        format: mss,
        time: 0
    }, settings);

    var format = settings.format;
    var time = settings.time;
    if(time=="now")
        time=new Date().getTime();

    function mss(time){
        var t = Math.floor(time/1000);
        var s = t%60;
        return ( Math.floor(t/60) + ":" + (s<10 ? "0"+s : s) );
    }

    $(this).append(format(time));
    var startTime;
    var updater;
    var current_time;
    var initial_time = time;
    var playing=false;
    var action = {
        play: function(){
            if(!playing)
            {
                startTime = new Date();
                updater = setInterval( function(){
                    var currentTime = new Date();
                    current_time = initial_time + currentTime.getTime() - startTime.getTime();

                    container.text( format(current_time) );
                }, 200);

                playing=true;
            }
        },
        pause: function(){
            clearInterval(updater);

            var pauseTime = new Date();
            initial_time = initial_time + pauseTime.getTime() - startTime.getTime();
            playing=false;
        },
        stop: function(){
            clearInterval(updater);
            playing=false;
        },
        reset: function(value){
            if(value==null)
                value=time;
            initial_time = value;
            action.stop();
            container.text( format(value) );
            playing=false;
        },
        lap: function(){
            return current_time;
        },
        restart: function(time){
            action.reset(time);
            action.play();
        }
    };

    return action;
};