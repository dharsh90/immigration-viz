/**
 * Created by nick on 5/23/17.
 */

let stateMap = {
    "Alabama": 1,
    "Alaska": 2,
    "Arizona": 4,
    "Arkansas": 5,
    "California": 6,
    "Colorado": 8,
    "Connecticut": 9,
    "Delaware": 10,
    "District of Columbia": 11,
    "Florida": 12,
    "Georgia": 13,
    "Hawaii": 15,
    "Idaho": 16,
    "Illinois": 17,
    "Indiana": 18,
    "Iowa": 19,
    "Kansas": 20,
    "Kentucky": 21,
    "Louisiana": 22,
    "Maine": 23,
    "Maryland": 24,
    "Massachusetts": 25,
    "Michigan": 26,
    "Minnesota": 27,
    "Mississippi": 28,
    "Missouri": 29,
    "Montana": 30,
    "Nebraska": 31,
    "Nevada": 32,
    "New Hampshire": 33,
    "New Jersey": 34,
    "New Mexico": 35,
    "New York": 36,
    "North Carolina": 37,
    "North Dakota": 38,
    "Ohio": 39,
    "Oklahoma": 40,
    "Oregon": 41,
    "Pennsylvania": 42,
    "Rhode Island": 44,
    "South Carolina": 45,
    "South Dakota": 46,
    "Tennessee": 47,
    "Texas": 48,
    "Utah": 49,
    "Vermont": 50,
    "Virginia": 51,
    "Washington": 53,
    "West Virginia": 54,
    "Wisconsin": 55,
    "Wyoming": 56,
};

$(function () {

    function padInt(number) {
        if (number <= 9) {
            number = ("0" + number).slice(-4);
        }
        return number;
    }

    let width = 1200,
        height = 600;

    let map = d3.map();
    let path = d3.geoPath();

    let svg = d3.select("#vis-us")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(0,0)");

    let colorScale = d3.scaleLog();

    let yeardomain = [2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016];

    let margin = {top: 20, right: 20, bottom: 20, left: 20},
        filterwidth = 1200 - margin.left - margin.right,
        filterheight = 90 - margin.top - margin.bottom;

    let xScale = d3.scaleLinear()
        .domain([d3.min(yeardomain), d3.max(yeardomain)])
        .range([0, filterwidth]);

    let xAxis = d3.axisBottom().scale(xScale);

    let svgfilter = d3.select("#svg-filter")
        .attr("width", filterwidth + margin.left + margin.right)
        .attr("height", filterheight);

    var filterGrid = svgfilter.append("g")
        .attr("class", "axis axis--grid")
        .attr("transform", "translate(0," + filterheight + ")")
        .call(d3.axisBottom().scale(xScale).tickSize(-filterheight).tickFormat(function() { return null; }));

    let xWidth = xScale(yeardomain[1]) - xScale(yeardomain[0]);

    var brush = d3.brushX()
        .extent([[0, 0], [filterwidth, filterheight]])
        .on("start brush", updateBrush)
        .on("end", brushed);

    svgfilter.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + 0 + ")")
        .call(xAxis.tickSize(filterheight).tickSize(0).tickFormat(d3.format("d")))
        .attr("text-anchor", null)
        .selectAll("text")
            .attr("x", xWidth / 2.0)
            .attr("y", (filterheight / 2) - 2)
            .style("text-anchor", "middle");

    var currCols = [2009, 2010, 2011, 2012];

    var gBrush = svgfilter.append("g")
        .attr("class", "brush")
        .call(brush);

    var handle = gBrush.selectAll(".handle--custom")
        .data([{type: "w"}, {type: "e"}])
        .enter().append("path")
        .attr("class", "handle--custom")
        .attr("fill", "#666")
        .attr("fill-opacity", 0.8)
        .attr("stroke", "#000")
        .attr("stroke-width", 1.5)
        .attr("cursor", "ew-resize")
        .attr("d", d3.arc()
            .innerRadius(0)
            .outerRadius(filterheight / 2)
            .startAngle(0)
            .endAngle(function(d, i) { return i ? Math.PI : -Math.PI; }));

    function updateBrush() {
        var s = d3.event.selection;
        if (s == null) {
            handle.attr("display", "none");
        } else {
            var sx = s.map(xScale.invert);
            handle.attr("display", null).attr("transform", function(d, i) { return "translate(" + s[i] + "," + filterheight / 2 + ")"; });
        }
    }

    function brushed() {
        if (!d3.event.sourceEvent) return;
        if (!d3.event.selection) {

        }
        let d0 = d3.event.selection.map(xScale.invert),
            d1 = d0.map(Math.round);

        if (d1[0] >= d1[1]) {
            d1[0] = Math.floor(d0[0]);
            d1[1] = d1[0] + 1;
        }

        console.log(d1.map(xScale));

        d3.select(this).transition().call(d3.event.target.move, d1.map(xScale));
        drawData([...Array(d1[1] - d1[0]).keys()].map(x => x + d1[0]))

        handle.attr("display", null).attr("transform", function(d, i) { return "translate(" + d0[i] + "," + filterheight / 2 + ")"; });
    }

    function drawData(cols) {
        currCols = cols;
        d3.queue()
            .defer(d3.json, "https://d3js.org/us-10m.v1.json")
            .defer(d3.csv, "./data/prep/USmap.csv", function (d) {

                if (d["State or territory of residence"] in stateMap) {
                    map.set(padInt(stateMap[d["State or territory of residence"]]), cols.map(x => parseInt(d[x].replace(/,/g, ""))).reduce((a, b) => a + b, 0))
                }
            })
            .await(ready);
    }

    function ready(error, us) {
        let min = d3.min(map.values());
        let max = d3.max(map.values());
        colorScale.domain(d3.range(min, max, ((max - min) / 10))).range(d3.schemeRdYlGn[10]);

        svg.append("g")
            .attr("class", "counties")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("fill", function (d) {
                return colorScale(d[2006] = map.get(d.id));
            })
            .attr("d", path);

        svg.append("g")
            .attr("class", "legendQuant")
            .attr("transform", "translate(1000,100)");

        let legend = d3.legendColor()
            .title("# Persons Obtaining Lawful Permanent Resident")
            .labelFormat(d3.format(".0f"))
            .labels(d3.legendHelpers.thresholdLabels)
            .scale(colorScale);

        svg.select(".legendQuant")
            .call(legend);
    }

    gBrush.call(brush.move, [2009, 2013].map(xScale));
    drawData(currCols);
});
