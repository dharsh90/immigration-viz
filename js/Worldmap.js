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

     // set default variables
    file = "./data/prep/table_2.csv"
    year = "2010"

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
    var draw = function(file, year) {
        // console.log(file)   
        var immigration = d3.map();
        d3.queue()
            .defer(d3.json, "https://unpkg.com/world-atlas@1/world/110m.json")
            .defer(d3.csv, file, function(d) {
                if (+d["ISO3116"].length != 3) {
                    d["ISO3116"] = d["ISO3116"].replace (/^/,'0');     
                }
                if (d[year] == 'NA') {
                    d[year] = 0
                }
                immigration.set(d["ISO3116"], +d[year])
            })
            .await(ready)
        
        /* ****** Data bind ****** */ 
        function ready(error, data) {
            var countries = topojson.feature(data, data.objects.countries).features
            var paths = g.selectAll("path").data(topojson.feature(data, data.objects.countries).features);
            
            paths.enter()
                .append("path")
                .attr("fill", "#d3d3d3")
                .attr("stroke", "black")
                .attr("stroke-width", 0.5)
                .attr("d", path)
                .attr("fill", function(d){ 
                    var value = immigration.get(d.id)
                    console.log(d)
                    if (file.includes("_2") && value >= 1) {
                        return 'yellow'
                    } else {
                        return '#d3d3d3'
                    }
                })



        }
    }

    /* ****** Update map on selection ****** */ 
    $("input").on('change', function() {
        var value = $(this).val();
        var isTable  = $(this).hasClass('table')
        var base = "./data/prep/"
        var extension = ".csv"
        // d3.csv(base.concat(value, extension))
        if (isTable) file = base.concat(value, extension)
        draw(file)
    });
    draw(file, year)





})

// https://github.com/topojson/world-atlas