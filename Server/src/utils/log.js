function _getDate() {
    var date = new Date();
    var year = date.getFullYear(),
        month= date.getMonth()+1,
        day  = date.getDate(), 
        hour = date.getHours(),
        min  = date.getMinutes(),
        sec  = date.getSeconds();
    month = month < 9 ? "0"+month : month;

    return year + "/" + (month < 10 ? "0" : "") + month + "/" + (day < 10 ? "0" : "") + day + ":" + (hour < 10 ? "0" : "") + hour + "-" + (min < 10 ? "0" : "") + min + "-" + (sec < 10 ? "0" : "") + sec;
}

module.exports = function Log(tags, msg) {
    if(tags.length > 0){
        if(tags[0].length < 6){
            for(var i=0; tags[0].length<6;i++)
                tags[0] += " ";
        }
        else
            tags[0] = tags[0].substr(0,6);
    }

    var stringifiedTags = "";
    for(var i=0;i<tags.length;i++){
        stringifiedTags += '[' + tags[i].toUpperCase() + ']';
    }

    console.log('[' + _getDate() + ']' + stringifiedTags + ' ' + msg);
}