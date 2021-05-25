var referees = {};

d3.csv("2018_worldcup_v3.csv", function (data) {
    for (let i = 0; i < data.length; i++) {
        referees[data[i].Referee] = (referees[data[i].Referee] + 1) || 1;
    }

    for(const referee in referees) {
        if(referees[referee] == 1) {
            delete referees[referee];
        }
    }

    var width = 500;
    var height = 500;
    var outerRadius = 200;
    var innerRadius = 50;

    var color = d3.scale.category20();

    var arc = d3.svg.arc()
        .outerRadius(outerRadius);

    /*var pie = d3.layout.pie()
        .value(function (d) { return d.value; }); */

    var pie = d3.layout.pie()
        .value(function(d) {return d.value; })
    var data_ready = pie(d3.entries(referees))

    var svg = d3.select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    var pieArcs = svg.selectAll("g.pie")
        .data(data_ready)
        .enter()
        .append("g")
        .attr("class", "pie")
        .attr("transform", "translate(" + (width / 2) + ", " + (height / 2) + ")");

    pieArcs.append("path")
        .attr("fill", function (d, i) { return color(i); })
        .attr("d", arc);
    
    console.log(referees);
});

pieArcs.append("text")
    .attr("transform", function (d) {
        d.outerRadius = outerRadius;
        d.innerRadius = innerRadius;
        return "translate(" + arc.centroid(d) + ")";
    })
    .attr("text-anchor", "middle")
    .text(function (d) { return d.value; });

pieArcs.append("text")
    .attr("transform", function (d) {
        d.outerRadius = outerRadius + 50;
        d.innerRadius = outerRadius + 50;
        return "translate(" + arc.centroid(d) + ") rotate(" + 300 + ")";
    })
    .attr("text-anchor", "middle")
    .text(function (d, i) { return referees[i]; });

// d3.select("#dropdown-content").append("a").attr("href", "#").text(data[i].Referee);