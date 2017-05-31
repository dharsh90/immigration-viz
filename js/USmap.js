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
}

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
        .attr("height", height);

    let colorScale = d3.scaleLog();

    d3.queue()
        .defer(d3.json, "https://d3js.org/us-10m.v1.json")
        .defer(d3.csv, "./data/prep/USmap.csv", function (d) {

            if (d["State or territory of residence"] in stateMap) {
                map.set(padInt(stateMap[d["State or territory of residence"]]), parseInt(d[2006].replace(/,/g, "")))
            }
        })
        .await(ready);

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

        var legend = d3.legendColor()
            .title("# Persons Obtaining Lawful Permanent Resident")
            .labelFormat(d3.format(".0f"))
            .labels(d3.legendHelpers.thresholdLabels)
            .scale(colorScale);

        svg.select(".legendQuant")
            .call(legend);
    }
});
