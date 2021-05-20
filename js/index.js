d3.csv("2018_worldcup_v3.csv", function (data) {
    for (var i = 0; i < data.length; i++) {
        console.log(data[i].Referee);
    }
});