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
                .text(`${key}: ${subjectInfo[key]}`)
                .attr("class", "card-text");
        }

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
            text: otuLabelsTen,
            type: "bar",
            orientation: "h",
            marker: {
                color: barColors
            }
        };

        let barLayout = {
            title: `Top Ten OTUs Present in Participant #${idNum}`,
            xaxis: {
                title: "Sample Values"
            }
        };

        Plotly.newPlot("bar-plot", [barTrace], barLayout, config);

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
            }
        };

        let bubbleLayout = {
            title: `OTUs Present in Participant #${idNum}`,
            xaxis: {
                title: "OTU ID"
            },
            yaxis: {
                title: "Sample Values"
            }
        };

        Plotly.newPlot("bubble-plot", [bubbleTrace], bubbleLayout, config);

        // Draw gauge chart
        let gaugeTrace = {
            domain: {
                x: [0,1],
                y: [0,1]
            },
            value: subjectInfo["wfreq"],
            title: {
                text: "Scrubs per Week"
            },
            type: "indicator",
            mode: "gauge"
        }

        let gaugeLayout = {
            responsive: true,
            margin: {
                l: 0,
                r: 0,
            }
        }

        Plotly.newPlot("gauge-chart", [gaugeTrace], gaugeLayout, gaugeLayout)
    });
}
