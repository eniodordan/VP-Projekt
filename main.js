

d3.csv("2018_worldcup_v3.csv", function (data) {
    // refereesPieChart(data);
    matchesPieChart(data);
});

function refereesPieChart(data) {
    var referees = {};

    for (let i = 0; i < data.length; i++) {
        referees[data[i].Referee] = (referees[data[i].Referee] + 1) || 1;
    }

    var otherRefereesCount = 0;

    for (const referee in referees) {
        if (referees[referee] <= 3) {
            delete referees[referee];
            otherRefereesCount++;
        }
    }

    referees['Ostali'] = otherRefereesCount;

    var width = 500;
    var height = 500;
    var outerRadius = 200;
    var innerRadius = 50;

    var color = d3.scale.category20();

    var arc = d3.svg.arc()
        .outerRadius(outerRadius);

    var pie = d3.layout.pie()
        .value(function (d) { return d.value; })
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
            return "translate(" + arc.centroid(d) + ")";
        })
        .attr("text-anchor", "middle")
        .text(function (d, i) { return Object.keys(referees)[i]; });
}

function matchesPieChart(data) {
    var teams = [];

    for (let i = 0; i < data.length; i++) {
        if (!teams.some(team => team.name === data[i].HomeTeamName) && !teams.some(team => team.name === data[i].AwayTeamName)) {
            let win = 0;
            let lose = 0;
            let draw = 0;

            if (data[i].HomeTeamGoals > data[i].AwayTeamGoals) {
                win = 1;
            } else if (data[i].HomeTeamGoals < data[i].AwayTeamGoals) {
                lose = 1;
            } else {
                draw = 1;
            }

            teams.push({ name: data[i].HomeTeamName, win: win, lose: lose, draw: draw });
            teams.push({ name: data[i].AwayTeamName, win: lose, lose: win, draw: draw });
        } else {
            let homeTeamIndex = teams.findIndex((team => team.name == data[i].HomeTeamName));
            let awayTeamIndex = teams.findIndex((team => team.name == data[i].AwayTeamName));

            if (data[i].HomeTeamGoals > data[i].AwayTeamGoals) {
                teams[homeTeamIndex].win++;
                teams[awayTeamIndex].lose++;
            } else if (data[i].HomeTeamGoals < data[i].AwayTeamGoals) {
                teams[awayTeamIndex].win++;
                teams[homeTeamIndex].lose++;
            } else {
                teams[homeTeamIndex].draw++;
                teams[awayTeamIndex].draw++;
            }
        }
    }

    for (let i = 0; i < teams.length; i++) {
        d3.select("#dropdown-content").append("a").attr("href", "#").text(teams[i].name);
    }

    var team = teams[7];

    d3.select("body")
        .append("div")
        .attr("id", "team-name");

    d3.select("#team-name").html(`Team name: ${team.name}`);

    delete team.name;

    var width = 500;
    var height = 500;
    var outerRadius = 200;
    var innerRadius = 50;

    var color = d3.scale.category20();

    var arc = d3.svg.arc()
        .outerRadius(outerRadius);

    var pie = d3.layout.pie()
        .value(function (d) { return d.value; })
    var data_ready = pie(d3.entries(team))

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
            return "translate(" + arc.centroid(d) + ")";
        })
        .attr("text-anchor", "middle")
        .text(function (d, i) { return Object.keys(team)[i]; });



    console.log(teams);
}

// d3.select("#dropdown-content").append("a").attr("href", "#").text(data[i].Referee);