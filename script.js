// --- 1. Setup Map ---
// Focus on the coordinates
var map = L.map('map').setView([37.202, 28.355], 16);

// Add OpenStreetMap layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// --- 2. Global Variables ---
var globalNodes = [];
var globalEdges = [];
var selectedNodes = []; // User's start and end selection

// --- 3. Load Data ---
fetch('graph-data.json')
    .then(response => response.json())
    .then(data => {
        globalNodes = data.nodes;
        globalEdges = data.edges;

        // Create a marker for each node
        globalNodes.forEach(node => {
            createMarker(node);
        });
    })
    .catch(error => {
        alert("Error loading data: " + error);
    });

// --- 4. Create Marker Function ---
function createMarker(node) {
    var marker = L.circleMarker([node.lat, node.lng], {
        color: 'blue',
        fillColor: '#30a5ff',
        fillOpacity: 0.8,
        radius: 10
    }).addTo(map);

    marker.bindTooltip(node.name);

    // Add Click Event
    marker.on('click', function() {
        handleNodeSelection(node, marker);
    });
}

// --- 5. Handle User Selection ---
function handleNodeSelection(node, marker) {
    // If 2 points are already selected, warn the user
    if (selectedNodes.length >= 2) {
        alert("Please click 'Reset Map' to start over.");
        return;
    }

    selectedNodes.push(node);

    // Change color to RED to show selection
    marker.setStyle({ color: 'red', fillColor: 'red' });

    // Update info box
    var infoBox = document.getElementById("route-info");
    if (selectedNodes.length === 1) {
        infoBox.innerHTML = "Start Point: <b>" + node.name + "</b>";
    } else {
        // We have 2 points, calculate the route!
        runDijkstraAlgorithm();
    }
}

// --- 6. Run Algorithm & Show Results ---
function runDijkstraAlgorithm() {
    var startNode = selectedNodes[0];
    var endNode = selectedNodes[1];

    if (typeof calculateShortestPath === "function") {
        
        // Get result (path + distance) from dijkstra.js
        var result = calculateShortestPath(globalNodes, globalEdges, startNode.id, endNode.id);

        if (result && result.path.length > 0) {
            
            // A. Draw the Red Line
            var pathCoordinates = [];
            for (var i = 0; i < result.path.length; i++) {
                var id = result.path[i];
                var foundNode = globalNodes.find(n => n.id === id);
                pathCoordinates.push([foundNode.lat, foundNode.lng]);
            }
            L.polyline(pathCoordinates, { color: 'red', weight: 5 }).addTo(map);

            // B. Calculate Details
            var distance = result.totalDistance;
            var time = distance * 2; // Simple math: 1 unit = 2 mins
            var stepNames = []; 

            // Convert IDs (A, B) to Names (Gate, Library) for display
            result.path.forEach(id => {
                var n = globalNodes.find(node => node.id === id);
                stepNames.push(n.name);
            });

            // C. Show Info on Screen (Distance, Time, Steps)
            var infoBox = document.getElementById("route-info");
            infoBox.innerHTML = `
                <b>Path:</b> ${stepNames.join(" ➝ ")} <br>
                <b>Total Distance:</b> ${distance} units <br>
                <b>Est. Time:</b> ${time} mins
            `;

        } else {
            alert("No path found between these points.");
        }
    } else {
        alert("Error: dijkstra.js file is missing.");
    }
}

// Reload page function for the button
function reloadPage() {
    location.reload();
}