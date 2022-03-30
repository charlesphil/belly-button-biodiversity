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
});

// TODO: Set first id number in select menu as our active value and populate info


// updatePlotly();

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
        d3.select("#plot").selectAll("*").remove();

        // Update plots with data
        let sampleData = data["samples"].filter(item => (item["id"] === idNum))[0];
        console.log(sampleData);
        let y = sampleData["otu_ids"].slice(0, 10).map(ids => `OTU ${String(ids)}`).reverse();
        console.log(y);
        let x = sampleData["sample_values"].slice(0, 10).reverse();
        console.log(x);
        let hovertext = sampleData["otu_labels"].slice(0, 10).reverse();
        console.log(hovertext);

        let barColors = Array(y.length).fill("#d9e3f1");
        barColors[barColors.length-1] = "#5b62f4";
        console.log(barColors);

        let trace = {
            x: x,
            y: y,
            text: hovertext,
            type: "bar",
            orientation: "h",
            marker: {
                color: barColors
            }
        };

        let layout = {
            title: `Top Ten OTUs Present in Participant #${idNum}`,
            xaxis: {
                title: "Sample Values"
            }
        };
        Plotly.newPlot("plot", [trace], layout);
    });
}
