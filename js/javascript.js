 queue()
        .defer(d3.csv, "data/gtd1970_1975.csv")
        .await(makeGraphs);
    function makeGraphs(error, countryData) {
        
        // Barchart
        var ndx = crossfilter(countryData);
        var country_dim = ndx.dimension(dc.pluck('region_txt'));
        var total_terrorist_acts = country_dim.group();
        dc.barChart("#first-chart")
            .width(2000)
            .height(500)
            .margins({top: 10, right: 50, bottom: 30, left: 50})
            .dimension(country_dim)
            .group(total_terrorist_acts)
            .transitionDuration(500)
            .x(d3.scale.ordinal())
            .xUnits(dc.units.ordinal)
            .xAxisLabel("Country")
            .yAxis().ticks(4);
            
            
        // PieChart    
        
        var attack_type_dim = ndx.dimension(dc.pluck('attacktype1_txt'));
        var attack_type = attack_type_dim.group();
        dc.pieChart('#second-chart')
            .height(330)
            .radius(2000)
            .transitionDuration(1500)
            .dimension(attack_type_dim)
            .group(attack_type);
        
        
        // PieChart    
        
        var attack_type_dim = ndx.dimension(dc.pluck('gname'));
        var attack_type = attack_type_dim.group();
        dc.pieChart('#third-chart')
            .height(330)
            .radius(2000)
            .transitionDuration(1500)
            .dimension(attack_type_dim)
            .group(attack_type);
        
        
        
        
        
        
        
        // // CompositeLine Chart
        
        // function makeGraphs(error, countryData) {
        // var ndx = crossfilter(countryData);
        // var parseDate = d3.time.format("%d/%m/%Y").parse;
        // countryData.forEach(function(d){
        //     d.date = parseDate(d.date);
        // });
        // var date_dim = ndx.dimension(dc.pluck('date'));
        // var minDate = date_dim.bottom(1)[0].date;
        // var maxDate = date_dim.top(1)[0].date;
        
        // var tomSpendByMonth = spendByMonth('Tom');
        // var bobSpendByMonth = spendByMonth('Bob');
        // var aliceSpendByMonth = spendByMonth('Alice');
        
        // function spendByMonth(name) {
        //     return date_dim.group().reduceSum(function (d) {
        //         if (d.name === name) {
        //             return +d.spend;
        //         } else {
        //             return 0;
        //         }
        //     });
        // }; 
        
        // var compositeChart = dc.compositeChart('#chart-here');
        // compositeChart
        //     .width(990)
        //     .height(200)
        //     .dimension(date_dim)
        //     .x(d3.time.scale().domain([minDate, maxDate]))
        //     .yAxisLabel("Spend")
        //     .legend(dc.legend().x(80).y(20).itemHeight(13).gap(5))
        //     .renderHorizontalGridLines(true)
        //     .compose([
        //         dc.lineChart(compositeChart)
        //             .colors('green')
        //             .group(tomSpendByMonth, 'Tom'),
        //         dc.lineChart(compositeChart)
        //             .colors('red')
        //             .group(bobSpendByMonth, 'Bob'),
        //         dc.lineChart(compositeChart)
        //             .colors('blue')
        //             .group(aliceSpendByMonth, 'Alice')
        //     ])
        //     .brushOn(false)
        // }  
    
        dc.renderAll();
    }