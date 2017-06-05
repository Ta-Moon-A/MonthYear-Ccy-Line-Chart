var config  = {
      svgWidth : 1000,
      svgHeight : 500,
      svgMargin : {
          top : 20,
          bottom : 50,
          left : 50,
          right : 50,
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
var chartData2 = [];

var width = window.innerWidth - config.svgMargin.left - config.svgMargin.right -50;
var height = window.innerHeight/2 - 10 - config.svgMargin.top - config.svgMargin.bottom;

var parseDate = d3.time.format("%Y-%m-%d").parse;

var svg = d3.select("body")
            .append("svg")
            .attr("width", window.innerWidth - 50)
            .attr("height",window.innerHeight/2 -10)
            .attr("class","svg");

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
   
   //console.log(chartData);
   PaintChart();
}

function PaintChart(){


var xScale = d3.scale.linear() 
               .domain(d3.extent(monthNames, function(d) { return d.n; }))
               .range([0,width]);

var yScale = d3.scale.linear()
                .domain([d3.min(parsedData, function (d) { return d.value; }) - 0.7, 
                         d3.max(parsedData, function (d) { return d.value; }) + 0.3])
               .range([ height,0]);


var x2Scale =  d3.scale.linear()
                        .domain([2012,2017])
                        .range([0, width / 12]);


var line = d3.svg.line()
           //.interpolate("basis")
             .x(function(d) { return  x2Scale(d.year);}) 
             .y(function(d) {  return yScale(d.ccy)}); 


var myGroups  = g.selectAll("g")
              .data(chartData);

var enteredGroups = myGroups.enter()
                            .append("g")
                            .attr("transform", function(d,i){ return  "translate(" +  i * (width / 12)+ ")" }) ;

enteredGroups.append("path");
enteredGroups.append("line");


myGroups.select("path")
        .attr("class", "line")
        .attr("d", function(d){ return line(d) });

myGroups.select("line")
        .attr("x1", function(d){ return  x2Scale(2017)})
        .attr("x2", function(d){ return  x2Scale(2017)})
        .attr("y1", 0)
        .attr("y2", height)
        .attr("class", "dashed");

var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

g.append("line")
     .attr("x1", 0)
     .attr("x2", width)
     .attr("y1", yScale(1.5))
     .attr("y2", yScale(1.5))
     .attr("class", "dashed");

g.append("line")
     .attr("x1", 0)
     .attr("x2", width)
     .attr("y1", yScale(2))
     .attr("y2", yScale(2))
     .attr("class", "dashed");

     
     g.append("line")
     .attr("x1", 0)
     .attr("x2", width)
     .attr("y1", yScale(2.5))
     .attr("y2", yScale(2.5))
     .attr("class", "dashed")

myGroups.selectAll("dot")	
        .data(function(d){ return d})			
    .enter().append("circle")								
        .attr("r", 5)
        .attr("class","circle")		
        .attr("cx", function(d) { return x2Scale(d.year); })		 
        .attr("cy", function(d) { return yScale(d.ccy); })		
        .on("mouseover", function(d) {		
            div.transition()		
                .duration(200)		
                .style("opacity", .9);		
            div.html( "Date:"+ d.year + "/"+d.month +"<br/>"  +"Ccy:"+ d.ccy.toFixed(2))	
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");	
            })					
        .on("mouseout", function(d) {		
            div.transition()		
                .duration(500)		
                .style("opacity", 0);	
        });


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
