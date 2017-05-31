// On-load
$(function () {
    // Set global variables (width, height, etc.)
    var width = 1200;
    var height = 600;

    var margin = {
        top: 10,
        right: 120,
        bottom: 50,
        left: 80
    };

    // Create svg and g elements
    var svg = d3.select("#vis-world")
        .append("svg")
        .attr('width', width)
        .attr('height', height);

    var g = svg.append('g')
        .attr('id', 'map')        
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var path = d3.geoPath();
    // Where everything happens
    var x = d3.queue()
        .defer(d3.json, "https://d3js.org/us-10m.v1.json")
        .defer(d3.csv, "./data/prep/table_2.csv")
    
    console.log(x)

    // Listen for button selection
    $("input").on('change', function() {
    });





})