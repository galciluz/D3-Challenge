// @TODO: YOUR CODE HERE!
// Define SVG area dimensions
var svgWidth = 960;
var svgHeight = 500;

// Define the chart's margins as an object
var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

// Define dimensions of the chart area
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Select body, append SVG area to it, and set its dimensions
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight); 

// Append a group area, then set its margins
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

function updateToolTip(circlesGroup) {
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return (`<strong>${d.state}<br>Health Risk: ${d.healthcareLow}%<br>Poverty: ${d.poverty}%`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(d) {
      toolTip.show(d, this);
    })
      // onmouseout event
      .on("mouseout", function(d) {
        toolTip.hide(d);
      });
  
    return circlesGroup;
  }

d3.csv("assets/data/data.csv").then((data, err) => {
    if (err) throw err;
    // parse data
    console.log(data);
    data.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
    });
    // xLinearScale function above csv import
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d["poverty"])*0.8,
        d3.max(data, d => d["poverty"])*1.2])
        /*.domain(d3.extent(data, d => d["poverty"]-0.8))*/
        .range([0, width]);

    // Create y scale function
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d["healthcare"])*0.8,
        d3.max(data, d => d["healthcare"])*1.2])
        .range([height, 0]);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
    
    // append x axis
    chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    
    // append y axis
    chartGroup.append("g")
        .call(leftAxis);
    //append circle
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d=> xLinearScale(d["poverty"]))
        .attr("cy", d=> yLinearScale(d["healthcare"]))
        .attr("r","10")
        .attr("fill", "lightblue")
        .attr("class", "stateCircle")
        .attr("opacity", ".8");
        
    //append state abbr text to the circle 
    chartGroup.selectAll("li")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "stateText")
        .attr("dx", d=> xLinearScale(d["poverty"]))
        .attr("dy", d=> yLinearScale(d["healthcare"]))
        .attr('font-size', 8)
        .text(d=> d.abbr);

     // append x axis text 
    chartGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .text("In Poverty(%)")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
    // append y axis text
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "healthcare")
        .classed("atext", true)
        .text("Health Care(%)");

    // updateToolTip function
    circlesGroup = updateToolTip(circlesGroup);
}).catch(function(error) {
 console.log(error);
});