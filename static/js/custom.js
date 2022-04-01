let setText;
// Custom function that reformats the largest tick on bar chart on window resize
// 101 is used since 100 ties the responsive speed from plotly's responsive config
window.onresize = function() {
    clearTimeout(setText);
    setText = setTimeout(function(){
        let barTickLength = d3.selectAll("#bar-plot .ytick")["_groups"][0].length;
        let bigTick = d3.select("#bar-plot").select(`.ytick:nth-child(${barTickLength})`);
        let bigTickText = bigTick.select("text");
        bigTickText.attr("style", "font-family: Nunito; font-size: 16px; fill: #378dfc");
    }, 101);
};
