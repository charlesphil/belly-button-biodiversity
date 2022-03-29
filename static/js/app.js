let samples = d3.json("../../data/samples.json").then(function(data){
    return {"sample_values": data.samples[0].sample_values}
});

console.log(samples);