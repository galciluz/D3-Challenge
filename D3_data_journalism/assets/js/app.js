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

var chosenXAxis = "poverty";
var chosenYAxis = "healthcare"
// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenXAxis])*0.8,d3.max(data, d => d[chosenXAxis])*1.2])
      .range([0, width]);
    return xLinearScale;
}
function yScale(data,chosenYAxis){
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenYAxis])*0.8,d3.max(data, d => d[chosenYAxis])*1.2])
      .range([height, 0]);
    return yLinearScale;
}
// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
    return xAxis;
  }
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
    return yAxis;
}
  // function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));
  return circlesGroup;
}

function updateToolTip(chosenXAxis,chosenYAxis,circlesGroup) {
  var xlabel;
    if (chosenXAxis === "poverty") {
      xlabel = "Poverty:";
    }
    else if (chosenXAxis === "income") {
      xlabel = "Income:";
    }
    else {
      xlabel = "Age:";
    }
  var ylabel;
    if (chosenYAxis === "healthcare") {
      ylabel = "Healthcare:";
    }
    else if (chosenYAxis === "smokes") {
      ylabel = "Smokes:";
    }
    else {
      ylabel = "Obese:";
    }
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return (`<strong>${d.state}<br>${xlabel} ${d[chosenXAxis]}%<br>${ylabel} ${d[chosenYAxis]}%`);
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
        data.age = +data.age;
        data.obesity = +data.obesity;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.smokes = +data.smokes;
  });
  // xLinearScale function 
  var xLinearScale = xScale(data, chosenXAxis);
  // yLinear Scale function
  var yLinearScale = yScale(data, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);
  // append x axis
  var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  // append y axis
  var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .call(leftAxis);
    //append circle
  var circlesGroup = chartGroup.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d=> xLinearScale(d[chosenXAxis]))
      .attr("cy", d=> yLinearScale(d[chosenYAxis]))
      .attr("r","10")
      .attr("fill", "lightblue")
      .attr("class", "stateCircle")
      .attr("opacity", ".8");
  //append state abbr text to the circle 
  var textGroup= chartGroup.selectAll("li")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "stateText")
      .attr("x", d=> xLinearScale(d[chosenXAxis]))
      .attr("y", d=> yLinearScale(d[chosenYAxis]))
      .attr('font-size', 8)
      .text(d=> d.abbr);
        
  // Create group for  x-axis labels
  var XlabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = XlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 15)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty(%)");
  var houseLabel = XlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 35)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("House Hold Income (Mediam)");
  var ageLabel = XlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 55)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age(Median)");

  // Create group for y-axis labels
  var YlabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(-25, ${height / 2})`);

    var healthLabel = YlabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -30)
      .attr("x", 0)
      .attr("dy", "1em")
      .classed("aText", true)
      .classed("active", true)
      .attr("value", "healthcare")
      .text("Lacks Healthcare (%)");
    var smokeLabel = YlabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", 0)
      .attr("dy", "1em")
      .classed("aText", true)
      .classed("inactive", true)
      .attr("value", "smokes")
      .text("Smokes (%)");
    var obesityLabel = YlabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -70)
      .attr("x", 0)
      .attr("dy", "1em")
      .classed("aText", true)
      .classed("inactive", true)
      .attr("value", "obesity")
      .text("Obese (%)");

  // updateToolTip function
  circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  XlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {
          // replaces chosenXAxis with value
          chosenXAxis = value;
          console.log(chosenXAxis)
          // updates x scale for new data
          xLinearScale = xScale(data, chosenXAxis);
          // updates x axis with transition
          xAxis = renderXAxes(xLinearScale, xAxis);
          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis,chosenYAxis);
          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis,chosenYAxis,circlesGroup);
          textGroup.transition()
            .duration(1000)
            .attr("x", d=> xLinearScale(d[chosenXAxis]))
            .attr("y", d=> yLinearScale(d[chosenYAxis]))
            .text(d=> d.abbr);
          // changes classes to change bold text
          if (chosenXAxis === "age") {
            ageLabel
                .classed("active", true)
                .classed("inactive", false);
            povertyLabel
                .classed("active", false)
                .classed("inactive", true);
            houseLabel
                .classed("active", false)
                .classed("inactive", true);
          }
          else if (chosenXAxis === "income") {
            houseLabel
                .classed("active", true)
                .classed("inactive", false);
            povertyLabel
                .classed("active", false)
                .classed("inactive", true);
            ageLabel
                .classed("active", false)
                .classed("inactive", true);
          }    
          else {
            ageLabel
                .classed("active", false)
                .classed("inactive", true);
            povertyLabel
                .classed("active", true)
                .classed("inactive", false);
            houseLabel
                .classed("active", false)
                .classed("inactive", true);
          }
      }
  });

  // y axis labels event listener
  YlabelsGroup.selectAll("text")
    .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {
      // replaces chosenXAxis with value
      chosenYAxis = value;
      console.log(chosenYAxis)
      // updates x scale for new data
      yLinearScale = yScale(data, chosenYAxis);
      // updates x axis with transition
      yAxis = renderYAxes(yLinearScale, yAxis);
      // updates circles with new x values
      circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis,chosenYAxis);
      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis,chosenYAxis,circlesGroup);
      textGroup.transition()
        .duration(1000)
        .attr("x", d=> xLinearScale(d[chosenXAxis]))
        .attr("y", d=> yLinearScale(d[chosenYAxis]))
        .text(d=> d.abbr);
      // changes classes to change bold text
      if (chosenYAxis === "healthcare") {
          healthLabel
            .classed("active", true)
            .classed("inactive", false);
          smokeLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
      }
      else if (chosenYAxis === "smokes") {
        smokeLabel
            .classed("active", true)
            .classed("inactive", false);
        healthLabel
            .classed("active", false)
            .classed("inactive", true);
        obesityLabel
            .classed("active", false)
            .classed("inactive", true);
      }    
      else {
        obesityLabel
            .classed("active", true)
            .classed("inactive", false);
        healthLabel
            .classed("active", false)
            .classed("inactive", true);
        smokeLabel
            .classed("active", false)
            .classed("inactive", true);
      }
  }
 });

}).catch(function(error) {
 console.log(error);
});