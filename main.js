d3.csv("2018_worldcup_v3.csv", function (data) {
    // refereesPieChart(data);
    matchesPieChart(data);
    // attendanceHistogram(data);
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

    var team = teams[0];

    d3.select("body")
        .append("div")
        .attr("id", "team-name");

    d3.select("#team-name").html(`Team name: ${team.name}`);

    delete team.name;

    var width = 500;
    var height = 500;
    var outerRadius = 200;
    var innerRadius = 50;

    var color = d3.scaleOrdinal().range(["#98abc5", "#8a89a6", "#7b6888"]);

    var arc = d3.arc()
        .outerRadius(outerRadius);

    var pie = d3.pie()
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
        .attr("d", arc)
        .attr("fill", function (d) { return color(d.value); });

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

    const svg = d3.select('svg');
    const width = +svg.attr('width');
    const height = +svg.attr('height');

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

    /*const titleText = 'Attendance per stadium';
    const xAxisLabelText = 'Attendance';

    const svg = d3.select('svg');

    const width = 960;
    const height = 500;

    const render = data => {
        const xValue = d => d['attendance'];
        const yValue = d => d.stadium;
        const margin = { top: 50, right: 40, bottom: 77, left: 180 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const xScale = d3.scaleLinear()
            .domain([0, d3.max(data, xValue)])
            .range([0, innerWidth]);

        const yScale = d3.scaleBand()
            .domain(data.map(yValue))
            .range([0, innerHeight])
            .padding(0.1);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const xAxisTickFormat = number =>
            d3.format('.3s')(number)
                .replace('G', 'B');

        const xAxis = d3.axisBottom(xScale)
            .tickFormat(xAxisTickFormat)
            .tickSize(-innerHeight);

        g.append('g')
            .call(d3.axisLeft(yScale))
            .selectAll('.domain, .tick line')
            .remove();

        const xAxisG = g.append('g').call(xAxis)
            .attr('transform', `translate(0,${innerHeight})`);

        xAxisG.select('.domain').remove();

        xAxisG.append('text')
            .attr('class', 'axis-label')
            .attr('y', 65)
            .attr('x', innerWidth / 2)
            .attr('fill', 'black')
            .text(xAxisLabelText);

        g.selectAll('rect').data(data)
            .enter().append('rect')
            .attr('y', d => yScale(yValue(d)))
            .attr('width', d => xScale(xValue(d)))
            .attr('height', yScale.bandwidth());

        g.append('text')
            .attr('class', 'title')
            .attr('y', -10)
            .text(titleText);
    };

    render(stadiums);*/
}

// d3.select("#dropdown-content").append("a").attr("href", "#").text(data[i].Referee);