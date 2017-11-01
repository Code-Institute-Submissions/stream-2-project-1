 queue()
        .defer(d3.csv, "data/gtd.csv")
        .await(makeGraphs);
    function makeGraphs(error, countryData) {
        var ndx = crossfilter(countryData);
        // var parseDate = d3.time.format("%m/%d/%Y").parse;
        // countryData.forEach(function(d){
        //     d.iyear = parseDate(d.iyear);
        // });
        var yearDim = ndx.dimension(function(d){
            return d.iyear;
        });
        
        var minDate = yearDim.bottom(1)[0].iyear;
        var maxDate = yearDim.top(1)[0].iyear;
        
       
// ---------------------------------------------------------------------------------------------------------------------------        

        // Number Display
        var allKilled = ndx.groupAll().reduceSum(dc.pluck('nkill'))
        var numberKilled = dc.numberDisplay("#number-display");
            numberKilled
                .formatNumber(d3.format("nkill"))
                .valueAccessor(function (d) {
                      return d;
                  })
                .group(allKilled);
        
        
// ---------------------------------------------------------------------------------------------------------------------------                
        
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
        // attackers number killed    
        
        var dim = ndx.dimension(dc.pluck('gname'));

        var group = dim.group().reduceSum(dc.pluck('nkill'));

        var chart = dc.rowChart("#third-chart");

        chart
            .width(600)
            .height(330)
            .dimension(dim)
            .cap(4)
            .group(group)
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
            .x(d3.time.scale().domain([minDate, maxDate]))
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

        
// --------------------------------------------------------------------------------------------------------------------------------------------------------------------        
        //Average killed by way Killed
        
        var weapon_dim = ndx.dimension(dc.pluck('weaptype1_txt'))
    
         var people_killed_group = weapon_dim.group().reduce(
            function (p, v) {
                ++p.count;
                p.total += v.nkill;
                p.average = p.total / p.count;
                return p;
            },
            function (p, v) {
                --p.count;
                if(p.count == 0) {
                    p.total = 0;
                    p.average = 0;
                } else {
                    p.total -= v.nkill;
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
            .margins({top: 10, right: 50, bottom: 30, left: 50})
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

    
        dc.renderAll();
    }