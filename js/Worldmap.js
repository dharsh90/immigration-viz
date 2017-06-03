// On-load
$(function () {
    /* ****** Graph Margins ****** */ 
    var width = 1200;
    var height = 600;

    var margin = {
        top: 10,
        right: 20,
        bottom: 20,
        left: 20
    };

     // set default variables
    var years = [
                "1820 to 1829",
                "1830 to 1839",
                "1840 to 1849",
                "1850 to 1859",
                "1860 to 1869",
                "1870 to 1879",
                "1880 to 1889",
                "1890 to 1899",
                "1900 to 1909",
                "1910 to 1919",
                "1920 to 1929",
                "1930 to 1939",
                "1940 to 1949",
                "1950 to 1959",
                "1960 to 1969",
                "1970 to 1979",
                "1980 to 1989",
                "1990 to 1999",
                "2000 to 2009",
                "2010",
                "2011",
                "2012",
                "2013",
                "2014",
                "2015"]
    file = "./data/prep/table_2.csv"
    year = years[0]

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


    /* ****** Slider ****** */
    $("#slider").slider({
        value: 1,
        min: 1,
        max: 25,
        step: 1
    })
    .each(function() {
        // Add labels to slider whose values 
        // are specified by min, max

        // Get the options for this slider (specified above)
        var opt = $(this).data().uiSlider.options;

        // Get the number of possible values
        var vals = opt.max - opt.min;

        // Position the labels
        for (var i = 1; i <= vals; i++) {

        // Create a new element and position it with percentages
        var el = $('<label id = "tick-label">' + years[i] + '</label>').css('left', (i / vals * 100) + '%');
        

        // Add the element inside #slider
        $("#slider").append(el);

        }
    });
    var val = $('#slider').slider("option", "value");
    console.log(val)
    
    var draw = function(year) {

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
                .on("mouseover", console.log("Mouse over?"))
                // .on('mouseover', tip.show)
                // .on('mouseout', tip.hide)  
                .merge(paths)
                .transition()
                .duration(800)
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

            /* ****** Legend ****** */ 
             svg.append("g")
                .attr("class", "legendQuant")
                .attr('transform', "translate(" + (width - margin.right * 9.69) + "," + (309 - margin.top) + ")")

            var legend = d3.legendColor()
                .labelFormat(d3.format(","))
                .title('Number of Immigrants')
                .labels(d3.legendHelpers.thresholdLabels)
                .scale(color)
        
            svg.select(".legendQuant")
                .call(legend);

        }
    }

    /* ****** Update map on selection ****** */ 
    $("#slider").on('slidechange', function(event, ui) {
        var index = ui.value
        year = years[index - 1]
        draw(year)
    });
    draw(year)
    
    /* ****** Tool tip selector ****** */ 
    // $(".my_circle").tooltip({
    //     'container': 'body',
    //     'placement': 'top'
    // });





})

// https://github.com/topojson/world-atlas