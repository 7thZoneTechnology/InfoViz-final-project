// The SVG container
var width  = 1000,
    height = 500;

// var pointColors = ["#93AEA6", "#F9E526", "#DE0C06","#522F75" ]; //DNS-green, HTTP-yellow, both-red, triple-purple
var pointColors = ["#F9E526", "#93AEA6","#FFCC00","#DE0C06" ]; //DNS-yello, HTTP-green, both-orange, triple-red
var method = ["DNS Polution", "HTTP Reset", "DNS + HTTP", "DNS + HTTP + IP Blacklist"];

var projection = d3.geo.mercator()
                .translate([width/2, 300])
                .scale(160);

var path = d3.geo.path()
    .projection(projection);

var zoom = d3.behavior.zoom().scaleExtent([1, 200]);

var svg = d3.select("#map").append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .call(zoom.on("zoom", redraw))
    .append("g")

var tooltip = d3.select("#map").append("div")
    .attr("class", "tooltip");
tooltip.classed("hidden", true);

var infoWindow = d3.select("#map").append("div")
    .attr("class", "infoWindow");
infoWindow.classed("hidden", true);

queue()
    .defer(d3.json, "_data/world-50m.json")
    .defer(d3.tsv, "_data/world-country-names.tsv")
    .defer(d3.json, "_data/domainData.json")
    .defer(d3.json, "_data/countOfDomainsByCategory.json")
    .defer(d3.json, "_data/countOfDomainsByBlockMethod.json")
    .await(ready);

function redraw() {
    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    scalePoints();
}

function scalePoints(){
  svg.selectAll(".country").style("stroke-width", 0.5/d3.event.scale);
  svg.selectAll(".point")
    .style("stroke-width", 0.5/d3.event.scale)
    .attr("r", function(d){
      var rank = d.properties.rank;
      var size;
      if(rank <=150){
          size = 15;
        }
        else if(rank <=500){
          size = 13;
        }
        else if(rank <=1000){
          size = 9;;
        }
        else if(rank <=3000){
          size = 7;
        }
        else{
          size = 5;
        }
      return size/d3.event.scale;
    });
} //end function scale points

function ready(error, world, names, points, categoryBarChartData, methodBarChartData){
  var countries = topojson.feature(world, world.objects.countries).features;
  var neighbors = topojson.neighbors(world.objects.countries.geometries);
  var i = -1,
      n = countries.length;

  countries.forEach(function(d) {
    var tryit = names.filter(function(n) { return d.id == n.id; })[0];
    if (typeof tryit === "undefined"){
      d.name = "Undefined";
      // console.log(d);
    } else {
      d.name = tryit.name;
    }
  });

  svg.selectAll(".country")
      .data(countries)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("title", function(d,i) { return d.name; })
      .attr("d", path)
      .style("fill", function(d, i) {
        return "#5B585A";
        // if (d.name == "China"){
        //   return "#ED650F";
        // }
        // else{
        //   return "#5B585A";
        // }
      })
      .on("mouseover", function(d,i) {
        tooltip.classed("hidden", false)
              .style("top", (d3.event.pageY + 16) + "px")
              .style("left", (d3.event.pageX + 16) + "px")
              .html(d.name)
      })
      .on("mouseout",  function(d,i) {
        tooltip.classed("hidden", true);
      });


    $("#show-all").on("click", function(){
      svg.selectAll("circle")
          .style("visibility", "visible");
    });
    $("#show-top").on("click", function(){
      svg.selectAll("circle")
          .style("visibility", function(d){
            return d.id >=100 ? "hidden" : "visible";
          });

    });
    $("#show-heavy-blocked").on("click", function(){
      svg.selectAll("circle")
          .style("visibility", function(d){
            return d.properties.blocked ==1 ? "hidden" : "visible";
          });
    });

    renderPoints(points.domains);
    drawCategoryBarChart(categoryBarChartData);
    drawMethodBarChart(methodBarChartData);


  //render the points
  function renderPoints(dataset){
    var circles = svg.selectAll("circle")
          .data(dataset);
    circles.exit().remove();

    circles.enter().append("circle")
          .attr("class","point")
          .attr("cx", function(d){
            return projection(d.geometry.coordinates)[0];
          })
          .attr("cy", function(d){
            return projection(d.geometry.coordinates)[1];
          })
          .attr("r", function(d){
            var rank = d.properties.rank;
            var size;
            if(rank <=150){
                size = 17;
              }
              else if(rank <=500){
                size = 14;
              }
              else if(rank <=1000){
                size = 11;;
              }
              else if(rank <=3000){
                size = 8;
              }
              else{
                size = 5;
              }
            return size;
          })
          .style("fill", function(d){
            var blocked = d.properties.blocked;
            return pointColor(blocked);
          })
          .on("mouseover", function(d){
              var desc = d.properties.desc;
              if(desc ==""){
                desc = "A description has not been given to this website."
              }
              str = '<p>Domain Name: <b>'+
                  d.properties.name+ '</b></p>'+
                  '<p>Blocked On: <b>' + method[d.properties.blocked] + "</b></p>"+
                  '<p>Global Traffic Rank: <b>' + d.properties.rank +'</b></p>'+
                  '<p>' + desc + '</p>'

              infoWindow.classed("hidden", false)
                  .style("top", (d3.event.pageY + 16) + "px")
                  .style("left", (d3.event.pageX + 16) + "px")
                  .html(str);
          })
          .on("mouseout", function(d){
            infoWindow.classed("hidden", true);
          });

    drawLegend();
  } //end function renderPoints()

} //end function ready()
function pointColor(blocked){
    return pointColors[blocked];
}

function drawLegend(){
  // var legend = svg.append("g");
  var legend = d3.select("#maplegend").append("svg:svg");

  legend.attr("width", 150)
    .attr("height", 300);

  var padding = 10;
  var data = [{"size":15, "rank": "Rank 1-150"},
              {"size":13, "rank": "Rank 151-500"},
              {"size":9, "rank": "Rank 151-1000"},
              {"size":7, "rank": "Rank 1001-3000"},
              {"size":5, "rank": "Rank 3000+"}];

  legend.selectAll("g")
        .append("g")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "legend")
        .attr("cx", function(d,i){
          return 2*padding;
        })
        .attr("cy", function(d,i){
          return 2*padding + i*30;
        })
        .attr("r", function(d){
          return d.size;
        });

  legend.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "legendText")
        .attr("x", function(d,i){
          return padding +35;
        })
        .attr("y", function(d, i){
          return 2*padding + i*30+d.size/2;
        })
        .text(function(d){
          return d.rank;
        });
}// end function drawLegend

//************************ hightchart code starts ********************
function drawCategoryBarChart(data){

  var array = [];
  var categories = [];

  for (var i=0; i<data.length; i++){
    categories.push(data[i][0]);
    array.push(data[i][1].count);
  }

  var options = {
      chart: {
        renderTo: "category-bar-chart",
        type: "bar",
        style: {
          fontFamily: "Helvetica,Arial,sans-serif"
        },
        backgroundColor: "#e6e6e6",
      },

      legend: {
        borderRadius: 0,
        itemStyle: {
          color: "#000",
          fontFamily: "Helvetica,Arial,sans-serif"
        }
      },
      plotOptions: {
        bar: {
          borderColor: "#e6e6e6",
          dataLabels: {
            enabled: true
          },
          point:{
            events:{
              click:function(){
                var curCategory = categories[this.x];

                //get the list of domain names belonging to the current category
                var i=0;
                while(i<data.length && data[i][0]!= curCategory) {
                  // console.log(data[i][0]);
                  i++;
                }

                var domainList = data[i][1].domains;
                console.log(domainList);
                //clear info table first
                $("#data-table tbody tr").remove();
                //only show points on the map that are in current category
                svg.selectAll("circle")
                  .style("visibility", function(d){
                    if (jQuery.inArray(d.properties.name, domainList) !=-1){
                      //populate the info table with domains belong to the current category
                      var desc = d.properties.desc;
                      if(desc ==""){
                        desc = "A description has not been given to this website."
                      }

                      $("#data-table tbody").append("<tr id='"+d.properties.name+"'><td>"
                          +d.properties.name + "</td><td>"+method[d.properties.blocked]+"</td>"+
                          "<td>"+d.properties.rank+"</td>"+
                          "<td>"+desc+"</td></tr>");
                      return "visible";
                    }
                    else{
                      return "hidden";
                    }
                  });
              }// end click:function()
            }//end events:
          }//end point:
        }//end plotOptions:
      },
      series: [], //[{ name:"category", data: [10,20]}],
      title: {
        text: "# of Blocked Domains by Category",
        style: {
          color: "#000000",
          fontFamily: "Helvetica,Arial,sans-serif",
          fontSize: "16px",
          fontWeight: "bold"
        }
      },
      subtitle: {
        text: "among top 100 blocked domains",
        style: {
          color: "#000000",
          fontFamily: "Helvetica,Arial,sans-serif",
          fontSize: "13px",
        }
      },
      xAxis: {
        categories: [],
        labels: {
          style: {
            color: "#333333",
            fontFamily: "Helvetica,Arial,sans-serif",
            fontSize: "8px",
          }
        },
      },
      yAxis: {
        // hints: gridLineColor, gridLineDashStyle
        labels: {
          style: {
            color: "#333333",
            fontFamily: "Helvetica,Arial,sans-serif",
            fontSize: "12px"
          }
        },
        min: 0,
        tickInterval: 5,
        title: {
          style: {
            color: "#333333",
            fontFamily: "Helvetica,Arial,sans-serif"
          },
          text: "# of Blocked Domains"
        },
      }
    }; //end chart option

    options.xAxis.categories = categories;

    options.series.push({name: "# of Domains", data: array});

    var chart = new Highcharts.Chart(options);
}

function drawMethodBarChart(data){

  var array = [];
  var categories = [];

  for (var i=0; i<data.length; i++){
    categories.push(data[i][0]);
    array.push(data[i][1].count);
  }

  var options = {
      chart: {
        backgroundColor: "#e6e6e6",
        renderTo: "method-bar-chart",
        type: "bar",
        style: {
          fontFamily: "Helvetica,Arial,sans-serif",
        }
      },

      legend: {
        borderRadius: 0,
        itemStyle: {
          color: "#000",
          fontFamily: "Helvetica,Arial,sans-serif"
        }
      },
      plotOptions: {
        bar: {
          colorByPoint: true,
          colors: ['#93AEA6','#FFCC00','#DE0C06'],
          borderColor: "#e6e6e6",
          dataLabels: {
            enabled: true
          },
          point:{
            events:{
              click:function(){
                var curCategory = categories[this.x];
                console.log("foo");
                //get the list of domain names belonging to the current category
                var i=0;
                while(i<data.length && data[i][0]!= curCategory) {
                  // console.log(data[i][0]);
                  i++;
                }

                var domainList = data[i][1].domains;
                console.log(domainList);
                //clear info table first
                $("#data-table tbody tr").remove();
                //only show points on the map that are in current category
                svg.selectAll("circle")
                  .style("visibility", function(d){
                    if (jQuery.inArray(d.properties.name, domainList) !=-1){
                      //populate the info table with domains belong to the current category
                      var desc = d.properties.desc;
                      if(desc ==""){
                        desc = "A description has not been given to this website."
                      }

                      $("#data-table tbody").append("<tr id='"+d.properties.name+"'><td>"
                          +d.properties.name + "</td><td>"+method[d.properties.blocked]+"</td>"+
                          "<td>"+d.properties.rank+"</td>"+
                          "<td>"+desc+"</td></tr>");
                      return "visible";
                    }
                    else{
                      return "hidden";
                    }
                  });
              }// end click:function()
            }//end events:
          }//end point:
        }//end plotOptions:
      },
      series: [], //[{ name:"category", data: [10,20]}],
      title: {
        text: "# of Blocked Domains by Block Method",
        style: {
          color: "#000000",
          fontFamily: "Helvetica,Arial,sans-serif",
          fontSize: "16px",
          fontWeight: "bold"
        }
      },
      subtitle: {
        text: "among all blocked domains",
        style: {
          color: "#000000",
          fontFamily: "Helvetica,Arial,sans-serif",
          fontSize: "13px",
        }
      },
      xAxis: {
        categories: [],
        labels: {
          style: {
            color: "#333333",
            fontFamily: "Helvetica,Arial,sans-serif",
            fontSize: "8px",
          }
        },
      },
      yAxis: {
        // hints: gridLineColor, gridLineDashStyle
        labels: {
          style: {
            color: "#333333",
            fontFamily: "Helvetica,Arial,sans-serif",
            fontSize: "12px"
          }
        },
        min: 0,
        title: {
          style: {
            color: "#333333",
            fontFamily: "Helvetica,Arial,sans-serif"
          },
          text: "# of Blocked Domains"
        },
      }
    }; //end chart option

    options.xAxis.categories = categories;

    options.series.push({name: "# of Domains", data: array});

    var chart = new Highcharts.Chart(options);
}


