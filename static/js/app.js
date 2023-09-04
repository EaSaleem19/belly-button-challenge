// url to fetch data from
const url = "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json"
// variable set so that api data can be accessed from any where in the javascript
var api_data = {}

// function for setting the options in the drop down.
const setSelectOptions = (options) => {

    // html element selector
    var selectElement = document.querySelector("#selDataset")

    console.log("options", options)
    // loop over all the options to be displayed in the drop down.
    for (var i = 0; i < options.length; i++) {
        // create option html element
        var option = document.createElement("option");
        // set option value 
        option.value = options[i];
        // set option text
        option.text = options[i];
        // append the option in the drop down.
        selectElement.appendChild(option);
    }
}


// a generic function to filter out data based on the selected value in drop down
const getSampleFiltered = (samples) => {
    // select drop down 
    let dropdownMenu = d3.select("#selDataset");
    let dataset = dropdownMenu.property("value");

    console.log("samples before filter", samples)
    // filter the samples based on the selected value
    let samplesFilter = samples.filter(sample => sample.id == dataset)
    // return if sample found else return empty object
    if (samplesFilter.length > 0) {
        return samplesFilter[0]
    }
    return {}

}

// function for displaying top 100 uts chart
const top10OTUs = (sample) => {
    // select top 10 ids from the sample filtered and reverse it.
    let y = sample.otu_ids.slice(0, 10).map(id => `OTU ${id}`).reverse();
    // select top 10 values and reverse it.
    let x = sample.sample_values.slice(0, 10).reverse();
    // select top 10 values and reverse it.
    let labels = sample.otu_labels.slice(0, 10).reverse();

    console.log("data after slice and reverse", y, x, labels)
    // make the chart json data.
    let data = {
        trace: {
            x: x,
            y: y,
            text: labels,
            type: "bar",
            orientation: "h"
        },
        layout: {
            title: "Top 10 OTUs"
        }
    }

    Plotly.newPlot("bar", [data.trace], data.layout)

}

const bacteriaChart = (sample) => {
    console.log("selected sample", sample)
    // make the chart json data it only needs the sample ids as x axis and sample values as y axis
    let data = {
        trace: {
            x: sample.otu_ids,
            y: sample.sample_values,
            text: sample.otu_labels,
            mode: "markers",
            // marker is the json used to display when hovered on the bubble
            marker: {
                size: sample.sample_values,
                color: sample.otu_ids,
                colorscale: "Earth"
            }
        },
        layout: {
            title: "Bacteria per Sample",
            hovermode: "closest",
            xaxis: { title: "OTU ID" },
        }
    }
    // create a new graph and pass the data to it.
    Plotly.newPlot("bubble", [data.trace], data.layout)
}
// function to dispaly the meta data in the demographic  info box 
const displayMetaData = () => {
    // call the filter function that we created above .
    var metadata = getSampleFiltered(api_data.metadata)
    console.log("meta data after filter", metadata)
    // set the values in the demo graphic info box to empty
    d3.select("#sample-metadata").html("");
    var sampleDataDiv = d3.select("#sample-metadata")
    // loop over all the meta data and add it to the demo graphic info box 
    for (const key in metadata) {
        console.log("key , value", key, metadata[key])
        sampleDataDiv.append("h5").text(`${key}: ${metadata[key]}`);
    }


}

// function to calculate guage chart data 
const calculateGuage = () => {
    // call the filter function that we created above to filter the data based on selected value.
    var metadata = getSampleFiltered(api_data.metadata)
    console.log('meta deta filter in guage',metadata)
    console.log('meta deta frequency ',metadata.wfreq)

    var data = {
        trace: {
            // current value of the guage chart
            value: metadata.wfreq,
            // set the min max value of the designated area for the chart
            domain: { x: [0, 1], y: [0, 1] },
            title: {
                // set the title
                text: "<b>Belly Button Washing Frequency</b><br>Scrubs per Week",
                font: { color: "black", size: 16 }
            },
            // set the type of chart
            type: "indicator",
            // set the mode of the chart
            mode: "gauge+number",
            gauge: {
                // set the properties of the chart
                axis: { range: [0, 10], tickmode: "linear", tick0: 2, dtick: 2, showexponent: "all" },
                // set the color of the bar that displays the value on the guage
                bar: { color: "black" },
                // set the colors of the range 
                steps: [
                    { range: [0, 1], color: "rgba(255, 255, 255, 0)" },
                    { range: [1, 2], color: "rgba(232, 226, 202, .5)" },
                    { range: [2, 3], color: "rgba(210, 206, 145, .5)" },
                    { range: [3, 4], color: "rgba(202, 209, 95, .5)" },
                    { range: [4, 5], color: "rgba(184, 205, 68, .5)" },
                    { range: [5, 6], color: "rgba(170, 202, 42, .5)" },
                    { range: [6, 7], color: "rgba(142, 178, 35 , .5)" },
                    { range: [7, 8], color: "rgba(110, 154, 22, .5)" },
                    { range: [8, 9], color: "rgba(50, 143, 10, 0.5)" },
                    { range: [9, 10], color: "rgba(14, 127, 0, .5)" },
                ]
            }
        },
        layout: {
            width: 400,
            margin: { t: 0, b: 0 },
        
        }
    }

    // set the graph data in html

    Plotly.newPlot("gauge", [data.trace], data.layout)

}


// function used to call all the charts data and display them
const displayDashboard = () => {
    // call the filter function that we created above to filter the sample data based on the selected value
    var sample = getSampleFiltered(api_data.samples)

    console.log("sample after filter", sample)

    // call the top 100 function to dispaly chart
    top10OTUs(sample)
    // call bacteria chart to display bubble chart
    bacteriaChart(sample)
    // call display meta data function
    displayMetaData()
    // call the calculate guage function created above for gugage chart
    calculateGuage()
}

// function called when the drop down changes.
const optionChanged = () => {
    // this function is called every time the drop down changes and tirggers change to all charts
    displayDashboard()
}
// make api call to the url to get data
d3.json(url).then(function (data) {
    // set data to api_data variable .
    api_data = data
    console.log("data after api call", api_data)
    // call function to dispaly the options 
    setSelectOptions(api_data.names)
    // call display dashboard to initialize the dashboard for first time 
    displayDashboard()
});

