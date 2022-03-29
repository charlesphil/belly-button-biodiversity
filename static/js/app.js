// Load json file
let dataset = d3.json("../../data/samples.json");

// Populate id numbers in select menu
dataset.then(data => {
    for (let i = 0; i < data["names"].length; i++) {
        let currentName = data["names"][i];
        d3.select("#individual-select")
            .append("option")
            .text(currentName)
            .attr("value", currentName);
    }
});

// Update when value of select menu changes
d3.select("#individual-select").on("change", updatePlotly);

function updatePlotly() {
    // Select select menu
    let selectMenu = d3.select("#individual-select");

    // Get value of select menu
    let idNum = selectMenu.property("value");

    // Update participant information card
    dataset.then(data => {
        // Select participant information card
        let subjectCard = d3.select("#subject-info");

        // Remove any existing children in the information card
        subjectCard.selectAll("*").remove();

        // Pull in subject information that matches id number from select menu
        // Cast to int to match type of id in metadata
        let subjectInfo = data.metadata.filter(item => (item["id"] === parseInt(idNum)))[0];

        // Write participant's information from the dataset onto the card
        for (const key in subjectInfo) {
            subjectCard
                .append("p")
                .text(`${key}: ${subjectInfo[key]}`)
                .attr("class", "card-text");
        }
    });


}
