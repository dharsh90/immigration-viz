## Line Chart

The <code>LineChart.js</code> file is a reusable chart file that will take in a data set and allow the user to select multiple keys from a <code>select</code> menu to be displayed on the graph. 


### Chart Property description

<b>height: </b> Height of the chart
<b>width: </b> Width of the chart
<b>xScale: </b> The type of scale used along the x-axis
<b>yScale: </b> The type of scale used along the y-axis
<b>xTitle: </b> The x-axis label
<b>yTitle: </b> The y-axis label
<b>margin: </b> The margin that surrounds the chart graphic
<b>selectedKeys: </b> Currently shown data keys, initialize for default values
<b>selectedData: </b> Data that corresponds to keys shown.


###How to use:

1) Make sure the csv file contains three columns: Key, xValue, yValue

- Key: is the object that corresponds to the data (e.g. A team name) 
- xValue: is the data point along the x-axis
- yValue: is the data point along the y-axis

Each row in the csv file corresponds to on point along the line.

2) Replace the string on line 17, <code>'INSERT PATH TO DATA FILE HERE'</code> with the path to the data file.

3) If needed, replace the string on line 39 <code>DEFAULT KEYS</code>, with the list of keys you want the chart to display by default when loaded; otherwise delete.

4) Replace the strings on line 40 and 41 <code>X/Y-AXIS LABEL</code> with the associated axis labels.

