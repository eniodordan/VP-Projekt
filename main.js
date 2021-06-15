d3.csv("2018_worldcup_v3.csv", function (data) {
    tournamentBracket(data);
    refereesPieChart(data);
    let teams = generateTeams(data)
    generateCountriesTable(teams, data)
    matchesPieChart(data, teams);
    attendanceHistogram(data);
});

function generateTeams(data)
{
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

    return teams
}

function tournamentBracket(data) {
    var quarterFinals1 = [];
    var quarterFinals2 = [];
    var matches = [];
    var semiFinals = [];
    var final = {};

    let quarterFinalsCount = 0;
    let semiFinalsCount = 0;

    for (let i = 0; i < data.length; i++) {
        if(data[i].Stage == "Quarter-finals") {
            if(quarterFinalsCount < 2) {
                quarterFinals1.push({
                    a: data[i].HomeTeamName,
                    b: data[i].AwayTeamName,
                    ascore: data[i].HomeTeamGoals,
                    bscore: data[i].AwayTeamGoals,
                    array: 'quarterFinals1',
                    index: i,
                    win: data[i].HomeTeamGoals > data[i].AwayTeamGoals ? true : false,
                });
            } else {
                quarterFinals2.push({
                    a: data[i].HomeTeamName,
                    b: data[i].AwayTeamName,
                    ascore: data[i].HomeTeamGoals,
                    bscore: data[i].AwayTeamGoals,
                    array: 'quarterFinals2',
                    index: i,
                    win: data[i].HomeTeamGoals > data[i].AwayTeamGoals ? true : false,
                });
            }

            quarterFinalsCount++;
        } else if (data[i].Stage == "Semi-finals") {
            if(semiFinalsCount < 1) {
                semiFinals.push({
                    a: data[i].HomeTeamName,
                    b: data[i].AwayTeamName,
                    ascore: data[i].HomeTeamGoals,
                    bscore: data[i].AwayTeamGoals,
                    array: 'semiFinals',
                    index: i,
                    win: data[i].HomeTeamGoals > data[i].AwayTeamGoals ? true : false,
                    children: quarterFinals1,
                });
            } else {
                semiFinals.push({
                    a: data[i].HomeTeamName,
                    b: data[i].AwayTeamName,
                    ascore: data[i].HomeTeamGoals,
                    bscore: data[i].AwayTeamGoals,
                    array: 'semiFinals',
                    index: i,
                    win: data[i].HomeTeamGoals > data[i].AwayTeamGoals ? true : false,
                    children: quarterFinals2,
                });
            }

            semiFinalsCount++;
        } else if(data[i].Stage == "Final") {
            final = {

                a: data[i].HomeTeamName,
                b: data[i].AwayTeamName,
                ascore: data[i].HomeTeamGoals,
                bscore: data[i].AwayTeamGoals,
                array: 'final',
                index: i,
                win: data[i].HomeTeamGoals > data[i].AwayTeamGoals ? true : false,
                children: semiFinals,
            };
        }

        matches.push(data[i]);
    }


    var margin = {top: 40, right: 90, bottom: 50, left: 150},
    width = 900 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom,
    separationConstant = 1;

    var line = d3.line()
        .x(d => width - d.y)
        .y(d => d.x)
        .curve(d3.curveStep);

    var treemap = d3.tree()
        .size([height, width])  
        .separation((a,b) =>a.parent == b.parent ? 1 : separationConstant);

    var nodes = d3.hierarchy(final);
    nodes = treemap(nodes);

    var svg = d3.select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left  + "," + margin.top + ")");

    var link = g.selectAll(".link")
        .data(nodes.descendants().slice(1))
        .enter().append("path")
            .attr("class", "link")
            .attr("d", d => line([d, d.parent ]))
                .classed("win", d => d.data.win)
                        
    function gameTemplate(d) {
        return '' +
        "<div data-array = '"+d.data.array+"' data-index = '"+d.data.index+"' class='row" + (d.data.ascore > d.data.bscore ? ' winner' : '') + "'>" +
            "<span class='cell name'>" + d.data.a + "</span>" + 
            "<span class='cell score'>" + (d.data.ascore >= 0 ? d.data.ascore : '') + "</span>" +  
        "</div>" +         
        "<div class='row" + (d.data.bscore > d.data.ascore ? ' winner' : '') + "'>" +
            "<span class='cell name'>" + (d.data.b || '') + "</span>" + 
            "<span class='cell score'>" + (d.data.bscore >= 0 ? d.data.bscore : '') + "</span>" +  
        "</div>";
    }

    var labels = d3.select('#labels')
        .selectAll('div')
        .data(nodes.descendants())
        .enter()
        .append("div")
            .classed("table", true)
            .classed("played", d => (d.data.ascore || d.data.bscore)) 
        .style('left', d => (width - d.y + margin.left - 100) + 'px')
        .style('top', d => (d.x + (!d.data.b ? 12 : 0) + (!d.data.children ? - 4 : 0) + 10) + 'px')
        .html(d => gameTemplate(d))


    $('.played').mouseenter(function () {
        $('.match-info').html('')
        $('.match-info').css('display', 'block')
        let array = $(this).find('div').attr('data-array')
        let index = $(this).find('div').attr('data-index')
        let stats = `<div>${matches[index].HomeTeamName} ${matches[index].HomeTeamGoals} - ${matches[index].AwayTeamGoals} ${matches[index].AwayTeamName}<br>
                        Date: ${matches[index].Datetime}<br>
                        Referee: ${matches[index].Referee}<br>
                        City: ${matches[index].City}<br>
                        Stadium: ${matches[index].Stadium}<br>
                        Attendance: ${matches[index].Attendance}</div>`
        $('.match-info').append(stats)
    });
}

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

    var svg = d3.select("#refereesPieChart")
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

    var refereesArray = []
    svg
        .selectAll('mySlices')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arcGenerator)
        .attr('fill', function (d) {
            refereesArray.push({
                'key': d.data.key
            })
            return (color(d.data.key))
        })
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)

    svg
        .selectAll('mySlices')
        .data(data_ready)
        .enter()
        .append('text')
        .text(function (d) { return d.data.value })
        .attr("transform", function (d) { return "translate(" + arcGenerator.centroid(d) + ")"; })
        .style("text-anchor", "middle")
        .style("font-size", 17)

    d3.select('#refereesPieChart').append("div").attr("id", "topReferees");
    d3.select("#topReferees").html(`Top 3 referees`);

    let refereesLegend = $('div.referees .legend')
    for (let referee of refereesArray){
        let markup = `<div style="display: flex; flex-flow: row nowrap; margin-bottom: 20px;"><div style="background-color: ${color(referee.key)}; width: 20px; height: 20px; margin-right: 10px;"></div>${referee.key}</div>`
        refereesLegend.append(markup)
    }
}

function matchesPieChart(data, teams, id = 0) {
    let team = teams[id];

    d3.select('#matchesPieChart').append("div").attr("id", "team-name");
    d3.select("#team-name").html(`Team name: ${team.name}`);

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

    data_ready = data_ready.filter(item => typeof item.data.value === 'number')

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

function generateCountriesTable(teams, data)
{
    function generateTableHead(table) {
        let thead = table.createTHead();
        let row = thead.insertRow();
        let th = document.createElement("td");
        th.style.fontWeight = '700'
        th.style.paddingLeft = '10px'
        let text = document.createTextNode('Select team');
        th.appendChild(text);
        row.appendChild(th);
    }

    function generateTable(table, data) {
        let i = 0;
        let row = table.insertRow();
        for (let element of data) {
            if(i % 7 === 0) row = table.insertRow();
            let cell = row.insertCell();
            cell.style.padding = '5px 10px';
            let text = document.createTextNode(element['name']);
            cell.setAttribute("id", i);
            cell.appendChild(text);
            i++;
        }
    }

    let table = document.querySelector("table");
    generateTableHead(table);
    generateTable(table, teams);

    $('#teamsTable td').click(function () {
        let id = $(this).closest('td').attr('id');
        $('#matchesPieChart').html('')
        matchesPieChart(data, teams, id)
    });
}