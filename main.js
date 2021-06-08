d3.csv("2018_worldcup_v3.csv", function (data) {
    tournamentBracket(data);
    //refereesPieChart(data);
    //matchesPieChart(data);
    //attendanceHistogram(data);
});

function tournamentBracket(data) { }

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

    var width = 450
    height = 450
    margin = 40
    var radius = Math.min(width, height) / 2 - margin

    var svg = d3.select("#matchesPieChart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var color = d3.scaleOrdinal()
        .domain(referees)
        .range(d3.schemeSet2);

    var pie = d3.pie()
        .value(function (d) { return d.value; })
    var data_ready = pie(d3.entries(referees))

    var arcGenerator = d3.arc()
        .innerRadius(0)
        .outerRadius(radius)

    svg
        .selectAll('mySlices')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arcGenerator)
        .attr('fill', function (d) { return (color(d.data.key)) })
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)

    svg
        .selectAll('mySlices')
        .data(data_ready)
        .enter()
        .append('text')
        .text(function (d) { return d.data.key + ": " + d.data.value })
        .attr("transform", function (d) { return "translate(" + arcGenerator.centroid(d) + ")"; })
        .style("text-anchor", "middle")
        .style("font-size", 17)

    /* var width = 500;
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
        .text(function (d, i) { return Object.keys(referees)[i]; }); */
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

    teams.forEach(
        function (element) {
            for (key in element) {
                if (element[key] === 0) {
                    delete element[key];
                }
            }
        }

    );

    function generateTableHead(table, data) {
        let thead = table.createTHead();
        let row = thead.insertRow();
        let th = document.createElement("th");
        let text = document.createTextNode('name');
        th.appendChild(text);
        row.appendChild(th);
    }

    function generateTable(table, data) {
        let i = 0;
        for (let element of data) {
            let row = table.insertRow();
            let cell = row.insertCell();
            let text = document.createTextNode(element['name']);
            row.setAttribute("id", i);
            cell.appendChild(text);
            i++;
        }
    }

    let table = document.querySelector("table");
    let datar = Object.keys(teams[0]);
    generateTableHead(table, datar);
    generateTable(table, teams);

    /* for (let i = 0; i < teams.length; i++) {
        d3.select("#dropdown-content").append("a").attr("href", "#").text(teams[i].name);
    } */

    var team = teams[0];

    $('#teamsTable tr').hover(function () {
        $(this).addClass('hover');
        id = $(this).closest('tr').attr('id');
        team = teams[id];
    }, function () {
        $(this).removeClass('hover');
        team = teams[0];
    });

    d3.select('#matchesPieChart').append("div").attr("id", "team-name");
    d3.select("#team-name").html(`Team name: ${team.name}`);
    delete team.name;

    var width = 450
    height = 450
    margin = 40
    var radius = Math.min(width, height) / 2 - margin

    var svg = d3.select("#matchesPieChart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var color = d3.scaleOrdinal()
        .domain(team)
        .range(d3.schemeSet2);

    var pie = d3.pie()
        .value(function (d) { return d.value; })
    var data_ready = pie(d3.entries(team))

    var arcGenerator = d3.arc()
        .innerRadius(0)
        .outerRadius(radius)

    svg
        .selectAll('mySlices')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arcGenerator)
        .attr('fill', function (d) { return (color(d.data.key)) })
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)

    svg
        .selectAll('mySlices')
        .data(data_ready)
        .enter()
        .append('text')
        .text(function (d) { return d.data.key + ": " + d.data.value })
        .attr("transform", function (d) { return "translate(" + arcGenerator.centroid(d) + ")"; })
        .style("text-anchor", "middle")
        .style("font-size", 17)
}

function attendanceHistogram(data) {
    var stadiums = [];

    for (let i = 0; i < data.length; i++) {
        let stadiumAttendance = Math.round(data[i].Attendance);

        if (!stadiums.some(stadium => stadium.name === data[i].Stadium)) {
            stadiums.push({ name: (data[i].Stadium), attendance: stadiumAttendance });
        } else {
            let stadiumIndex = stadiums.findIndex((stadium => stadium.name == data[i].Stadium));
            stadiums[stadiumIndex].attendance += stadiumAttendance;
        }
    }

    const titleText = 'Attendance per stadium';
    const xAxisLabelText = 'Attendance';

    const width = 960;
    const height = 500;

    const svg = d3.select("#attendanceHistogram").append("svg")
        .attr("width", width)
        .attr("height", height);

    const xValue = stadium => stadium.attendance;
    const yValue = stadium => stadium.name;
    const margin = { top: 50, right: 40, bottom: 77, left: 180 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(stadiums, xValue)])
        .range([0, innerWidth]);

    const yScale = d3.scaleBand()
        .domain(stadiums.map(yValue))
        .range([0, innerHeight])
        .padding(0.1);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    g.append('g').call(d3.axisLeft(yScale)).selectAll('.domain, .tick line').remove();

    const xAxisG = g.append('g').call(d3.axisBottom(xScale).tickSize(-innerHeight))
        .attr('transform', `translate(0, ${innerHeight})`);

    xAxisG.select('.domain').remove();

    xAxisG.append('text')
        .attr('class', 'axis-label')
        .attr('y', 65)
        .attr('x', innerWidth / 2)
        .attr('fill', 'black')
        .text(xAxisLabelText);

    g.selectAll('rect').data(stadiums)
        .enter().append('rect')
        .attr('y', stadium => yScale(yValue(stadium)))
        .attr('width', stadium => xScale(xValue(stadium)))
        .attr('height', yScale.bandwidth());

    g.append('text')
        .attr('class', 'title')
        .attr('y', -10)
        .text(titleText);
}

// d3.select("#dropdown-content").append("a").attr("href", "#").text(data[i].Referee);