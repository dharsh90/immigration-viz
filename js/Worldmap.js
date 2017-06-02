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
    
    var draw = function(file, year) {

        var immigration = d3.map();
        var max = 0
        var min = Number.MAX_SAFE_INTEGER

        /* ****** Collect topojson and filter data ****** */
        d3.queue()
            .defer(d3.json, "https://unpkg.com/world-atlas@1/world/110m.json")
            .defer(d3.csv, file, function(d) {
                if (+d["ISO3116"].length != 3) {
                    d["ISO3116"] = d["ISO3116"].replace (/^/,'0');     
                }
                if(+d[year] < min) {
                    min = +d[year]
                } 
                if (d[year] == 'NA' || d[year] == " - ") {
                    d[year] = 0
                }
                if(+d[year] > max) {
                    max = +d[year]
                }
                if(+d[year] > 0 && +d[year] < min) {
                    min = +d[year]
                } 
                immigration.set(d["ISO3116"], +d[year])
            })
            .await(ready)

        function ready(error, data) {
            
            /* ****** TODO ****** */
            /* ****** Tooltip ****** */
            var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d) {
                  return "Hello World"  
                    // return d.university_name + "</br></br>" + 'World Rank: ' + d.world_rank;
                })
            g.call(tip);
            /* ****** Create colorscale ****** */
            var color = d3.scaleThreshold()
                .domain(d3.range(min, max, ((max - min) / 5)))
                .range(d3.schemeRdBu[5]);

            /* ****** Data bind ****** */ 
            var countries = topojson.feature(data, data.objects.countries).features
            var paths = g.selectAll("path").data(topojson.feature(data, data.objects.countries).features);
            
            paths.enter()
                .append("path")
                .on("mouseover", console.log("poop"))
                // .on('mouseover', tip.show)
                // .on('mouseout', tip.hide)  
                .merge(paths)
                .transition()
                .duration(1100)
                .attr("stroke", "black")
                .attr("stroke-width", 0.5)
                .attr("d", path)
                .attr("fill", function(d){ 
                    var value = immigration.get(d.id)
                    if (value > 1) {
                        return color(immigration.get(d.id));
                    } else {
                        return "#d3d3d3"
                    }
                })
            // paths.exit().remove()

        }
    }

    /* ****** Update map on selection ****** */ 
    $("input").on('change', function() {
        var value = $(this).val();
        var isTable  = $(this).hasClass('table')
        var base = "./data/prep/"
        var extension = ".csv"
        if (isTable) file = base.concat(value, extension)
        draw(file, year)
    });
    draw(file, year)
    
    /* ****** Tool tip selector ****** */ 
    // $(".my_circle").tooltip({
    //     'container': 'body',
    //     'placement': 'top'
    // });





})

// https://github.com/topojson/world-atlas