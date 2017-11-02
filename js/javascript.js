 queue()
        .defer(d3.csv, "data/gtd.csv")
        .defer(d3.json, "data/countries.geo.json")
        .await(makeGraphs);
    function makeGraphs(error, countryData, geoData) {

        var ndx = crossfilter(countryData);
        
        var parseDate = d3.time.format("%m/%d/%Y").parse;
        countryData.forEach(function(d){
            d.iyear = parseInt(d.iyear);
        });
        
        // var yearDim = ndx.dimension(function(d){
        //     return d.iyear;
        // });
        
        yearDim = ndx.dimension(dc.pluck('iyear'))
        
        var minDate = yearDim.bottom(1)[0].iyear;
        var maxDate = yearDim.top(1)[0].iyear;
        
       
// ---------------------------------------------------------------------------------------------------------------------------        

        // Number Display Killed people
        var allKilled = ndx.groupAll().reduceSum(dc.pluck('nkill'))
        var numberKilled = dc.numberDisplay("#number-display");
            numberKilled
                .formatNumber(d3.format("nkill"))
                .valueAccessor(function (d) {
                      return d;
                  })
                .group(allKilled);
                
        
        

// ---------------------------------------------------------------------------------------------------------------------------        

        // Number Display Wounded people
        var allWounded = ndx.groupAll().reduceSum(dc.pluck('nwound'))
        var numberWounded = dc.numberDisplay("#wounded-display");
            numberWounded
                .formatNumber(d3.format("nwound"))
                .valueAccessor(function (d) {
                      return d;
                  })
                .group(allWounded);
        
// ---------------------------------------------------------------------------------------------------------------------------   

 
        //Average killed by way Killed
        
        var weapon_dim = ndx.dimension(function (d){
            return attackType(d['weaptype1_txt']);
        })
    
        function attackType (d){
            if (d == 'Vehicle (not to include vehicle-borne explosives, i.e., car or truck bombs)') {
                d = 'Vehicle'; }
            return d;
        }
        
         var people_killed_group = weapon_dim.group().reduce(
            function (p, v) {
                p.count++;
                p.total += +v.nkill;
                p.average = p.total / p.count;
                return p;
            },
            function (p, v) {
                p.count--;
                if(p.count == 0) {
                    p.total = 0;
                    p.average = 0;
                } else {
                    p.total -= +v.nkill;
                    p.average = p.total / p.count;
                };
                return p;
            },
            function () {
                return {count: 0, total: 0, average: 0};
            }
        );
        
        var weapon_chart = dc.barChart("#weapons-display");

        weapon_chart
            .width(500)
            .height(300)
            .margins({top: 10, right: 50, bottom: 150, left: 65})
            .dimension(weapon_dim)
            .group(people_killed_group)
            .valueAccessor(function (p) {
                return p.value.average;
            })
            .transitionDuration(500)
            .x(d3.scale.ordinal())
            .xUnits(dc.units.ordinal)
            .elasticY(true)
            .xAxisLabel("Attack Type")
            .yAxis().ticks(4);
 
 
// --------------------------------------------------------------------------------------------------------------------------------------------------------------------        

        
        // Lethal - non lethal PieChart    
        
        var attack_type_dim = ndx.dimension(function(d) {
            if(d['nkill'] == 0)
                return 'Non-lethal';
            else
                return 'Lethal';
        });
        var attack_type = attack_type_dim.group();
        dc.pieChart('#second-chart')
            .height(330)
            .radius(2000)
            .transitionDuration(1500)
            .dimension(attack_type_dim)
            .group(attack_type);
        
// ---------------------------------------------------------------------------------------------------------------------------        
        // Group and number killed    
        
        var group_dim = ndx.dimension(dc.pluck('gname'));

        var group_group = group_dim.group().reduceSum(dc.pluck('nkill'));

        var group_chart = dc.rowChart("#third-chart");

        group_chart
            .width(600)
            .height(330)
            .dimension(group_dim)
            .cap(4)
            .group(group_group)
            .xAxis().ticks(4);

// ---------------------------------------------------------------------------------------------------------------------------        
        // Target and number killed    
        
        var target_dim = ndx.dimension(dc.pluck('targtype1_txt'));

        var target_group = target_dim.group().reduceSum(dc.pluck('nkill'));

        var target_chart = dc.rowChart("#target-chart");

        target_chart
            .width(600)
            .height(330)
            .dimension(target_dim)
            .cap(4)
            .group(target_group)
            .xAxis().ticks(4);


// ---------------------------------------------------------------------------------------------------------------------------
        //Composite Line Chart
        
        var ammountAttacks = yearDim.group()
        var ammountKilled = yearDim.group().reduceSum(dc.pluck('nkill'))

        
        var compositeChart = dc.compositeChart('#composite-chart');
        compositeChart
            .width(990)
            .height(200)
            .dimension(yearDim)
            .x(d3.scale.linear().domain([1970, 1976]))
            .yAxisLabel("The Y Axis")
            .legend(dc.legend().x(80).y(20).itemHeight(13).gap(5))
            .renderHorizontalGridLines(true)
            .compose([
                dc.lineChart(compositeChart)
                    .colors('red')
                    .group(ammountAttacks, 'Attacks'),
                dc.lineChart(compositeChart)
                    .colors('blue')
                    .group(ammountKilled, 'People Killed'),
            ])
            .brushOn(false)
            .render();
            
// ---------------------------------------------------------------------------------------------------------------------------        
        // World Map  
        
        
        var countryDim = ndx.dimension(dc.pluck('country_txt'));
        
        var country_group = countryDim.group();
        
        var worldMap = dc.geoChoroplethChart('#world-map-chart');
        
        var projection = d3.geo.mercator()
            .center([0, 5 ])
            .scale(100)
            .rotate([-50,0]);

        worldMap
            .width(1000)
            .height(420)
            .dimension(countryDim)
            .group(country_group)
            .colors(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#7C151D"])
            .colorDomain([0, 1])
            .overlayGeoJson(geoData["features"], "name", function (d) {
                return d.properties.name;
            })
            .projection(projection)
            .title(function(p){
                return "Country: " + p["Key"]
            })
        
        
        
        
// ---------------------------------------------------------------------------------------------------------------------------        
    
        dc.renderAll();
    }