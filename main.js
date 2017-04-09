var config  = {
      svgWidth : 1000,
      svgHeight : 500,
      svgMargin : {
          top : 40,
          bottom : 70,
          left : 50,
          right : 60,
      }
};



var monthNames = [
    {n: 1, name :"Jan"},
    {n: 2, name :"Feb"},
    {n: 3, name :"Mar"},
    {n: 4, name :"Apr"},
    {n: 5, name :"May"},
    {n: 6, name :"Jun"},
    {n: 7, name :"Jul"},
    {n: 8, name :"Aug"}, 
    {n: 9, name :"Sep"},
    {n: 10, name :"Oct"},
    {n: 11, name :"Nov"},
    {n: 12, name :"Dec"}
];
var parsedData = [];
var chartData = [];

var width = config.svgWidth - config.svgMargin.left - config.svgMargin.right;
var height = config.svgHeight - config.svgMargin.top - config.svgMargin.bottom;

var parseDate = d3.time.format("%m/%d/%Y").parse;

var svg = d3.select("body")
            .append("svg")
            .attr("width", config.svgWidth)
            .attr("height", config.svgHeight);

 g = svg.append("g").attr("transform", "translate(" + config.svgMargin.left + "," + config.svgMargin.top + ")");
 
d3.csv("currency_data.csv")
        .row(function(d,i) { 
            return {
                date: parseDate(d.date), 
                value: + d.value
                }; 
            })
        .get(function(error, callBackData) { 
            if(error) throw error;
            parsedData = callBackData;
            ProcessData();
});


function ProcessData(){
    
 d3.nest()
   .key(function(d) { return d.date.getMonth() + 1; })
   .key(function(d) { return d.date.getFullYear(); })
   .rollup(function(monthData) { 
       var month = monthData[0].date.getMonth();
       
       if(chartData[month] == null) {  chartData[month] = []; }
       chartData[month].push({
              "month" : month + 1,
              "year" : monthData[0].date.getFullYear(),
              "ccy" : d3.sum(monthData, function(d) {return parseFloat(d.value)}) / monthData.length 
       });

       return {
                  "avgCcy": d3.sum(monthData, function(d) {return parseFloat(d.value)}) / monthData.length
             } 
      })
   .entries(parsedData);
   
   console.log(chartData);
   PaintChart();
}

function PaintChart(){


var xScale = d3.scale.linear() 
               .domain(d3.extent(monthNames, function(d) { return d.n; }))
               .range([0,width]);

var yScale = d3.scale.linear()
               .domain([0,d3.max(parsedData, function(d) { return d.value; })])
               .range([ height,0]);


var x2Scale =  d3.scale.linear()
                        .domain([2014,2015,2016])
                        .range([0, width / 12]);

var line = d3.svg.line()
       .interpolate("basis")
        .x(function(d) { console.log(x2Scale(d.year)); return  x2Scale(d.year);}) 
        .y(function(d) { console.log(yScale(d.ccy)); return yScale(d.ccy)}); 


var lines  = g.selectAll("g")
              .data(chartData)
              .enter()
              .append("g")
              .attr("transform", function(d,i){ return  "translate(" +  i * (width / 12)+ ")" }) 
                .selectAll("path") 
                .data( function(d) { return d; } ) //lines
                .enter() 
                .append("path")
                .attr("stroke", "red")
                .attr("class", "line")
                .attr("d", d3.svg.line()
                                .x(function(d) { return  x2Scale(d.year);}) 
                                .y(function(d) { return yScale(d.ccy)})
                );



var yAxis = d3.svg.axis()
              .scale(yScale)
              .orient("left");

var xAxis = d3.svg.axis()
              .scale(xScale)
              .tickFormat(function(d) {  return monthNames[d-1].name; })
              .orient("bottom");

 g.append("g")
            .attr("class", "xaxis")
            .attr("transform", "translate(0," + height  + ")")
            .call(xAxis)
             .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", function(d) { return "rotate(-65)" })
            .append("text")
            .attr("x", width - config.svgMargin.right)
            .attr("y", -25)
            .style("text-anchor", "end")
            .text("Month");

g.append("g")
            .attr("class", "yaxis")
            .call(yAxis);
}
