// On-load
$(function () {
    /* ****** Graph Margins ****** */ 
    var width = 1200;
    var height = 600;

    var margin = {
        top: 10,
        right: 120,
        bottom: 50,
        left: 80
    };

    /* ****** Append SVG and G ****** */ 
    var svg = d3.select("#vis-world")
        .append("svg")
        .attr('width', width)
        .attr('height', height);

    var g = svg.append('g')
        .attr('id', 'map')        
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    /* ****** Map projection ****** */ 
    var projection = d3.geoMercator()
        .scale(150)
        .translate([width / 2, height / 1.5]);
    
    var path = d3.geoPath().projection(projection);

    /* ****** Collect topojson and filter data ****** */ 
    var immigration = d3.map();
    d3.queue()
        .defer(d3.json, "https://unpkg.com/world-atlas@1/world/110m.json")
        .defer(d3.csv, "./data/prep/table_2.csv", function(d) {
            if (+d["ISO3116"].length != 3) {
                d["ISO3116"] = d["ISO3116"].replace (/^/,'0');     
            }
            if (d["2010"] == 'NA') {
                d["2010"] = 0
            }
            immigration.set(d["ISO3116"], +d["2010"])
        })
        .await(ready)
    console.log(immigration)

    /* ****** Draw function ****** */ 
    function ready(error, data) {
        var countries = topojson.feature(data, data.objects.countries).features
        var paths = g.selectAll("path").data(topojson.feature(data, data.objects.countries).features);

        paths.enter()
            .append("path")
            .attr("fill", "#d3d3d3")
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .attr("d", path)
            // .attr("fill", function(d){

            // })



    }

    /* ****** Update map on selection ****** */ 
    $("input").on('change', function() {
        var value = $(this).val();
        var table  = $(this).hasClass('table')
        var base = "./data/prep/"
        var extension = ".csv"
        // something = d3.csv(base.concat(value, extension))
        console.log(base.concat(value, extension))
        
    });





})

// https://github.com/topojson/world-atlas