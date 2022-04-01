// Load json file
let dataset = d3.json("../../data/samples.json");

// Select select menu
let selectMenu = d3.select("#individual-select");

// Populate id numbers in select menu
dataset.then(data => {
    for (let i = 0; i < data["names"].length; i++) {
        let currentName = data["names"][i];
        selectMenu
            .append("option")
            .text(currentName)
            .attr("value", currentName);
    }
    // Set first option in select menu as our active value
    // and populate info
    d3.select("option").property("selected", true);
    updatePlotly();
});

// Update when value of select menu changes
selectMenu.on("change", updatePlotly);


// Function that updates the participant information and plots
function updatePlotly() {
    // Get value of select menu
    let idNum = selectMenu.property("value");

    // Update participant information card with data
    dataset.then(data => {
        // Select participant information card
        let subjectCard = d3.select("#subject-info");

        // Remove any existing children in the information card
        subjectCard.selectAll("*").remove();

        // Pull in subject information that matches id number from select menu
        // Cast to int to match type of id in metadata
        let subjectInfo = data["metadata"].filter(item => (item["id"] === parseInt(idNum)))[0];

        // Write participant's information from the dataset onto the card
        for (const key in subjectInfo) {
            subjectCard
                .append("p")
                .text(`${key}: ${subjectInfo[key]}`);
        }

        // Select last p tag in subject-info div and remove margins
        subjectCard.select(`p:nth-child(${Object.keys(subjectInfo).length})`)
            .attr("class", "m-0");

        // Remove any existing children in the plot card
        d3.select("#bar-plot").selectAll("*").remove();
        d3.select("#bubble-plot").selectAll("*").remove();

        // Get data for plots
        let sampleData = data["samples"].filter(item => (item["id"] === idNum))[0];
        let otuIds = sampleData["otu_ids"];
        let values = sampleData["sample_values"];
        let otuLabels = sampleData["otu_labels"];

        // Get top ten for bar chart
        let otuIdsTen = otuIds.slice(0, 10).map(ids => `OTU ${String(ids)}`).reverse();
        let valuesTen = values.slice(0, 10).reverse();
        let otuLabelsTen = otuLabels.slice(0, 10).reverse();

        // Create colors for bar chart markers (only the largest value should be blue)
        let barColors = Array(otuIdsTen.length).fill("#d9e3f1");
        barColors[barColors.length-1] = "#378dfc";

        // Custom colorscale for bubble chart markers
        let colorscale = [
            ["0.0", "#e52527"],
            ["0.5", "#d63384"],
            ['1.0', '#6610f2']
        ];

        // Add responsiveness configuration for different screen widths
        let config = {
            responsive: true
        }

        // Draw bar chart
        let barTrace = {
            x: valuesTen,
            y: otuIdsTen,
            type: "bar",
            orientation: "h",
            marker: {
                color: barColors
            },
            hoverinfo: "x+y+text",
            hovertext: otuLabelsTen,
            hoverlabel: {
                font: {
                    family: "Nunito"
                }
            }
        };

        let barLayout = {
            title: `Top Ten OTUs in Subject #${idNum}`,
            xaxis: {
                title: "Sample Values"
            },
            font: {
                family: "Nunito",
                color: "#7b8ab8"
            }
        };

        Plotly.newPlot("bar-plot", [barTrace], barLayout, config);

        // Get top most ytick and change font and font color to match bar
        let barTickLength = d3.selectAll("#bar-plot .ytick")["_groups"][0].length;
        let bigTick = d3.select("#bar-plot").select(`.ytick:nth-child(${barTickLength})`);
        let bigTickText = bigTick.select("text");
        bigTickText.attr("style", "font-family: Nunito; font-size: 16px; fill: #378dfc");

        // Draw bubble chart
        let bubbleTrace = {
            x: otuIds,
            y: values,
            text: otuLabels,
            mode: "markers",
            marker: {
                size: values,
                sizeref: 2*Math.max(...values) / (90**2),
                sizemode: "area",
                color: otuIds,
                colorscale: colorscale
            },
            hoverlabel: {
                font: {
                    family: "Nunito"
                }
            }
        };

        let bubbleLayout = {
            title: `OTUs Present in Subject #${idNum}`,
            xaxis: {
                title: "OTU ID"
            },
            yaxis: {
                title: "Sample Values"
            },
            font: {
                family: "Nunito",
                color: "#7b8ab8"
            }
        };

        Plotly.newPlot("bubble-plot", [bubbleTrace], bubbleLayout, config);

        // BONUS

        // Draw gauge
        let gaugeTrace = {
            type: "indicator",
            mode: "gauge+number",
            value: subjectInfo["wfreq"],
            title: {
                text: "Belly Button<br>Washes per Week"
            },
            gauge: {
                bar: {
                    thickness: 0.33,
                    color: "#e52527"
                },
                axis: {
                    range: [null, 9],
                    tickvals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                    visible: true,
                    ticks: "inside"
                },
                steps: [
                    {"range": [0, 1], "color": "#bed1e6"},
                    {"range": [1, 2], "color": "#68cdbb"},
                    {"range": [2, 3], "color": "#20c997"},
                    {"range": [3, 4], "color": "#2ea6d3"},
                    {"range": [4, 5], "color": "#66a9ff"},
                    {"range": [5, 6], "color": "#adac6b"},
                    {"range": [6, 7], "color": "#ffc107"},
                    {"range": [7, 8], "color": "#fa9d6a"},
                    {"range": [8, 9], "color": "#f479cc"},
                ]
            }
        };

        let gaugeLayout = {
            margin: {
                l: 10,
                r: 10,
            },
            font: {
                family: "Nunito",
                color: "#7b8ab8"
            }
        }

        Plotly.newPlot("gauge-chart", [gaugeTrace], gaugeLayout, config)
    });
}
