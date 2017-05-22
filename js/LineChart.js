// LineChart
// Author: Matthew McKenna
//
// Code snipetts taken from:
// https://github.com/info474-s17/tp4-interactivity
// https://github.com/info474-s17/m15-reusability


// Main function used to load data set.
$(function () {
    // Variables to show

    var chartData, //Original Dataset 
        nestedData = []; //Dataset that has been nested using D3

    // Load data in using d3's csv function.
    d3.csv('INSERT PATH TO DATA FILE HERE', function (error, data) {
        // Put data into generic terms
        var prepData = function () {
            chartData = data.map(function (d) {
                return {
                    xValue: d.xValue,
                    value: d.value,
                    key: d.key,
                };
            });

            // Nest data by region
            nestedData = d3.nest()
                .key(function (d) {
                    return d.key;
                })
                .entries(chartData);
        };

        prepData();

        // Define function to draw ScatterPlot
        var line = LineChart().selectedKeys(["DEFUALT KEYS"])
            .xTitle("X-AXIS LABEL")
            .yTitle("Y-AXIS LABEL");

        // Function to make charts (doing a data-join to make charts)
        var draw = function () {
            // Prep data
            prepData();

            // Create chart
            var chart = d3.select("#vis")
                .datum(nestedData)
                .call(line);

        };

        // Call draw function
        draw();
    });
});






// ********************** Start of Line Chart **********************
// DO NOT MODIFY


var LineChart = function () {
    // Set default values
    var height = 500, //Height of the chart
        width = 960, //Width of the chart
        xScale = d3.scaleLinear(), //The type of scale used along the xaxis
        yScale = d3.scaleLinear(), //The type of scale used along the yaxis
        xTitle, //X-Axis label
        yTitle, //Y-axis label
        margin = { //Margin surround the chart graphic,
            top: 10,
            right: 120,
            bottom: 100,
            left: 80
        },
        selectedKeys = [], //Currently shown data keys, initialize for default values
        selectedData = [], //data that corresponds to keys shown.

        // Function returned by ScatterPlot
        chart = function (selection) {
            // Graph width and height - accounting for margins
            var drawWidth = width - margin.left - margin.right,
                drawHeight = height - margin.top - margin.bottom;

            // Iterate through selections, in case there are multiple
            selection.each(function (data) {
                var ele = d3.select(this),
                    svg = ele.selectAll("svg").data([data]),

                    svgEnter = svg.enter()
                    .append("svg")
                    .attr('width', width)
                    .attr("height", height),

                    /* ********************************** Append static elements  ********************************** */
                    // Append svg to hold elements
                    // Append g for holding chart markers
                    g = svgEnter.append("g")
                    .attr('id', 'graph')
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")"),

                    // xAxis labels
                    xAxisLabel = g.append("g")
                    .attr('transform', 'translate(0,' + drawHeight + ')')
                    .attr('class', 'axis');

                // xAxis Text
                g.append('text')
                    .attr('class', 'axis-label')
                    .attr('transform', 'translate(' + (drawWidth / 2) + ',' + (drawHeight + margin.top + 40) + ')')
                    .style('text-anchor', 'middle')
                    .text(xTitle);

                // yAxis labels
                var yAxisLabel = g.append("g")
                    .attr('class', 'axis');

                g.append('text')
                    .attr('class', 'axis-label')
                    .attr('transform', 'rotate(-90)')
                    .attr('y', 0 - margin.left)
                    .attr('x', 0 - (drawHeight / 2))
                    .attr('dy', '1em')
                    .style('text-anchor', 'middle')
                    .text(yTitle);

                // Apend an overlay rectangle to catch hover events
                var overlay = g.append('rect')
                    .attr("class", "overlay")
                    .attr('width', drawWidth)
                    .attr('height', drawHeight),

                    /* ********************************** Define scale and axis variables  ********************************** */

                    // Create an ordinal color scale for coloring lines
                    colorScale = d3.scaleOrdinal(d3.schemeCategory20),

                    // Global scale and axis variables
                    xFormat = d3.format("d"),
                    yFormat = d3.format('.2s'),
                    xAxis = d3.axisBottom().tickFormat(xFormat),
                    yAxis = d3.axisLeft().tickFormat(yFormat);

                // function for filtering data based on selected countries
                function filterData() {
                    selectedData = data.filter(function (d) {
                        return selectedKeys.indexOf(d.key) > -1
                    })
                }
                filterData;
                /* ********************************** selector  ********************************** */

                // Create a selector menu     
                var selector = $('#select');

                // fill in select menu
                data.forEach(function (d) {
                    var newOption = new Option(d.key, d.key);
                    selector.append(newOption);
                });

                // Set default selector countries in menu
                selector.val(selectedKeys);

                /* ********************************** Functions for setting scales and axes  ********************************** */

                // function for setting scales based on given data
                function setScales() {
                    // Get set of all values
                    var allValues = [];
                    selectedData.forEach(function (d) {
                        d.values.forEach(function (d) {
                            allValues.push(+d.value);
                        });
                    });

                    // Reset xScale
                    var xExtent = d3.extent(selectedData[0].values, function (d) {
                        return +d.xValue;
                    });
                    xScale.domain([xExtent[0], xExtent[1]]).rangeRound([0, drawWidth]);

                    // Reset yScale
                    var yExtent = d3.extent(allValues);
                    yScale.domain([yExtent[0] * 0.9, yExtent[1] * 1.1]).rangeRound([drawHeight, 0]);

                    // Reset color scale to current set of countries
                    colorScale.domain(selectedKeys);
                }

                function setAxes() {
                    xAxis.scale(xScale);
                    yAxis.scale(yScale);

                    xAxisLabel.transition().duration(1000).call(xAxis);
                    yAxisLabel.transition().duration(1000).call(yAxis);
                }


                /* ********************************** Function for calculating line path  ********************************** */

                // Line function that will return a `path` element based on data
                // Help from: https://bl.ocks.org/mbostock/3883245
                var line = d3.line()
                    .x(function (d) {
                        return xScale(+d.xValue);
                    })
                    .y(function (d) {
                        return yScale(+d.value);
                    })


                /* ********************************** Function for drawing lines  ********************************** */
                // function for drawing graph
                function draw(data) {
                    // Set your scales and axes
                    setScales();
                    setAxes();


                    // Datajoin between your path elements and the data passed to the draw function
                    var keys = g.selectAll('.keys')
                        .data(data);

                    // Handle entering elements
                    keys.enter()
                        .append('path')
                        .attr('class', 'keys')
                        .attr('d', function (d) {
                            return line(d.values);
                        })
                        .attr('fill', 'none')
                        .attr('stroke-width', 1.5)
                        .attr('stroke', function (d) {
                            return colorScale(d.key);
                        })
                        .attr('stroke-dasharray', function (d) {
                            var length = "" + d3.select(this).node().getTotalLength();
                            return length + " " + length;
                        })
                        .attr('stroke-dashoffset', function (d) {
                            return -1 * d3.select(this).node().getTotalLength();
                        })
                        // Handle updating elements
                        .merge(keys)
                        .transition()
                        .duration(1000)
                        .attr('stroke-dashoffset', function (d) {
                            return 0;
                        }).attr('stroke', function (d) {
                            return colorScale(d.key);
                        }).attr('d', function (d) {
                            return line(d.values);
                        });

                    // Handle exiting elements
                    keys.exit()
                        .transition()
                        .duration(1000)
                        .attr('stroke-dashoffset', function (d) {
                            let length = d3.select(this).node().getTotalLength()
                            return -1 * length;
                        }).attr('stroke-dasharray', function (d) {
                            let length = d3.select(this).node().getTotalLength()
                            return length + " " + length;
                        })
                        .remove();

                };

                /* ********************************** Function for drawing hovers (circles/text)  ********************************** */
                // Function to draw hovers (circles and text) based on xValue (called from the `overlay` mouseover)
                function drawHovers(xValue) {
                    // Bisector function to get closest data point: note, this returns an *index* in your array
                    var bisector = d3.bisector(function (d, x) {
                        return +d.xValue - x;
                    }).left;

                    // Get hover data by using the bisector function to find the y value
                    var hover_data = [];
                    selectedData.map(function (keyData) {
                        keyData.values.sort(function (a, b) {
                            return +a.xValue - +b.xValue;
                        });
                        hover_data.push(keyData.values[bisector(keyData.values, xValue)]);
                    });


                    // Data-join (enter, update, exit) to draw circles
                    var circles = g.selectAll('circle')
                        .data(hover_data);

                    circles.enter()
                        .append('circle')
                        .merge(circles)
                        .style('fill', 'none')
                        .attr('r', 7)
                        .attr('cx', function (d) {
                            return xScale(d.xValue)
                        })
                        .attr('cy', function (d) {
                            return yScale(d.value);
                        })
                        .attr('stroke', function (d) {
                            return colorScale(d.key);
                        });

                    circles.exit()
                        .remove()

                    // Data-join (enter, update, exit) draw text
                    var hover_text = g.selectAll('.hover_text').data(hover_data);

                    hover_text.enter()
                        .append('text')
                        .attr('class', 'hover_text')
                        .merge(hover_text)
                        .attr('x', function (d) {
                            return xScale(d.xValue);
                        })
                        .attr('y', function (d) {
                            return yScale(d.value);
                        })
                        .attr('dx', 10)
                        .attr('dy', -10)
                        .text(function (d) {
                            return d.key + " " + yScale(d.value) + "k";
                        });

                    hover_text.exit().remove();

                    overlay.on("mouseout", function (d) {
                        d3.selectAll('circle').remove();
                        d3.selectAll('.hoverLabel').remove();
                    }).on("mousemove", function (d) {
                        var val = xScale.invert(d3.mouse(this)[0]);
                        drawHovers(val);
                    });
                };


                // Filter your data and draw the initial layout
                filterData();
                draw(selectedData);

                // Assign an event listener to your overlay element
                /*
                    - On mousemove, detect the mouse location and use `xScale.invert` to get the data value that corresponds to the pixel value
                    
                    - On mouseout, remove all the circles and text from inside the g
                */

                overlay.on("mouseout", function (d) {
                    d3.selectAll('circle').remove();
                    d3.selectAll('.hoverLabel').remove();
                }).on("mousemove", function (d) {
                    var val = xScale.invert(d3.mouse(this)[0]);
                    drawHovers(val);
                });



                // event listener for selector change
                selector.change(function () {
                    // Reset selected keys
                    selectedKeys = [];

                    // Get selected keys from selector
                    $('#select option:selected').each(function () {
                        selectedKeys.push($(this).text());
                    });

                    // Filter and draw data
                    filterData();
                    draw(selectedData);
                });
            });

        };


    // Getter/setter methods to change locally scoped options
    chart.height = function (value) {
        if (!arguments.length) return height;
        height = value;
        return chart;
    };

    chart.width = function (value) {
        if (!arguments.length) return width;
        width = value;
        return chart;
    };

    chart.xTitle = function (value) {
        if (!arguments.length) return xTitle;
        xTitle = value;
        return chart;
    };

    chart.yTitle = function (value) {
        if (!arguments.length) return yTitle;
        yTitle = value;
        return chart;
    };

    chart.selectedData = function (value) {
        if (!arguments.length) return selectedData;
        selectedData = value;
        return chart;
    }

    chart.selectedKeys = function (value) {
        if (!arguments.length) return selectedKeys;
        selectedKeys = value;
        return chart;
    }
    return chart;
};
