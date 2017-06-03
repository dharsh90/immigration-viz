// Reusable treemap visualization
// Ishan Saksena


var treemap = function () {
    // Setting defaults
    var margin = {
        top: 40,
        right: 10,
        bottom: 10,
        left: 10
    },
        width = 1200,
        height = 700,
        drawWidth = width - margin.left - margin.right,
        drawHeight = height - margin.top - margin.bottom,
        measure = 'Total'; // variable to visualize

    var nodes;

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function (d) {
            keys = ["Total","Family-sponsored preferences","Employment-based preferences","Immediate relatives of U.S. citizens","Diversity", "Refugees and asylees"]
            return "<strong>Country:</strong> <span style='color:red'>" + d.data.Country + "</span> <br> \
                    <strong>Total: </strong> <span style='color:gray'>" + d.data[(keys[0])] + "</span>  <br> \
                    <strong>Family Sponsored: </strong> <span style='color:gray'>" + d.data[keys[1]] + "</span>  <br> \
                    <strong>Employment: </strong> <span style='color:gray'>" + d.data[keys[2]] + "</span>  <br> \
                    <strong>Relativies in US: </strong> <span style='color:gray'>" + d.data[keys[3]] + "</span>  <br> \
                    <strong>Diversity: </strong> <span style='color:gray'>" + d.data[keys[4]] + "</span>  <br> \
                    <strong>Refugees and Asylees: </strong> <span style='color:gray'>" + d.data[keys[5]] + "</span>  <br>";
        })
    // Function returned by treemap
    var chart = function (nestedData) {

        // Append a wrapper div for the chart
        var div = d3.select('#treemap')
            .append("svg")
            .attr('id', 'treemap-svg')
            .attr('height', drawHeight)
            .attr('width', drawWidth)
            .style("left", margin.left + "px")
            .style("top", margin.top + "px");

        div.call(tip);
        /* ********************************** Create hierarchical data structure & treemap function  ********************************** */

        // Define a hierarchy for your data
        var root = d3.hierarchy({
            values: nestedData
        }, function (d) {
            return d.values;
        });

        // Create a *treemap function* that will compute your layout given your data structure
        var treemap = d3.treemap() // function that returns a function!
            .size([width, height]) // set size: scaling will be done internally
            .round(true)
            .tile(d3.treemapResquarify)
            .padding(0);

        /* ********************************** Create an ordinal color scale  ********************************** */

        // Get list of regions for colors
        var regions = nestedData.map(function (d) {
            return d.key;
        });

        // Set an ordinal scale for colors
        var colorScale = d3.scaleOrdinal().domain(regions).range(d3.schemeCategory10);

        // Redefine which value you want to visualize in your data by using the `.sum()` method
        root.sum(function (d) {
            return +d[measure];
        });

        // (Re)build your treemap data structure by passing your `root` to your `treemap` function
        treemap(root);

        // Bind your data to a selection of elements with class node
        // The data that you want to join is array of elements returned by `root.leaves()`
        nodes = div.selectAll(".node").data(root.leaves());

        // Enter and append elements, then position them using the appropriate *styles*
        nodes.enter()
            .append("rect")
            .merge(nodes)
            .attr('class', 'node')
            .attr("x", function (d) {
                return d.x0;
            })
            .attr("y", function (d) {
                return d.y0;
            })
            .attr('width', function (d) {
                return d.x1 - d.x0;
            })
            .attr("height", function (d) {
                return d.y1 - d.y0;
            })
            .attr("fill", function (d) {
                return colorScale(d.data.Continent);
            })
            .attr('stroke', "black")
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

        nodes.enter()
            .append("text")
            .merge(nodes)
            .attr('class', 'node-text')
            .attr("x", function (d, i) {
                return d.x0 + margin.left;
            })
            .attr("y", function (d) {
                return d.y0 + margin.left + 2;
            })
            .text(function (d) {
                w = d.x1 - d.x0;
                h = d.y1 - d.y0;
                area = w * h;
                if (area > 2000 && w > 30 && h > 30) {
                    return d.data.ISO3;
                } else {
                    return ""
                }
            });

        nodes.exit().remove();
    };

    // Getter/setter methods 
    chart.height = function (value) {
        if (!arguments.length) return height;
        height = value;
        drawHeight = height - margin.top - margin.bottom;
        return chart;
    };

    chart.width = function (value) {
        if (!arguments.length) return width;
        width = value;
        drawWidth = width - margin.left - margin.right;
        return chart;
    };

    chart.measure = function (value) {
        if (!arguments.length) return measure;
        measure = value;
        return chart;
    };

    return chart;
};

// Render treemap
$(function () {
    // Prep data
    //d3.csv('data/treedata.csv', function (error, data) {
    d3.csv('data/prep/table_11region.csv', function (error, data) {
        var tree = treemap();
        // Nest your data *by region* using d3.nest()
        var nestedData = d3.nest()
            .key(function (d) {
                return d.Continent;
            })
            .entries(data);

        tree(nestedData);


        $('#why label').click(function () {
            $(this).addClass('active').siblings().removeClass('active');
        });

        $("#why :input").change(function () {
            d3.selectAll("#treemap-svg").remove();
            tree.measure($(this).val());
            tree(nestedData);
        });
    });
});
