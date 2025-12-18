// --- 1. Setup the Map ---
// Focus on the specific coordinates (Mugla area)
var map = L.map('map').setView([37.202, 28.355], 16);

// Add the visual layer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// --- 2. Global Variables ---
var globalNodes = [];
var globalEdges = [];
var selectedNodes = []; // List to keep selected start/end points

// --- 3. Load Data from JSON ---
fetch('graph-data.json')
    .then(response => response.json())
    .then(data => {
        // Save data to global variables
        globalNodes = data.nodes;
        globalEdges = data.edges;

        // Create markers for each node
        globalNodes.forEach(node => {
            createMarker(node);
        });
    })
    .catch(error => {
        alert("Error loading data: " + error);
    });

// --- 4. Function to Create a Marker ---
function createMarker(node) {
    // Create a blue circle marker
    var marker = L.circleMarker([node.lat, node.lng], {
        color: 'blue',
        fillColor: '#30a5ff',
        fillOpacity: 0.8,
        radius: 10
    }).addTo(map);

    // Add a simple name label (tooltip)
    marker.bindTooltip(node.name);

    
    marker.on('click', function() {
        handleNodeSelection(node, marker);
    });
}

// --- 5. Handle Selection Logic ---
function handleNodeSelection(node, marker) {
    // If we already have 2 points, do nothing (or reset)
    if (selectedNodes.length >= 2) {
        alert("You already selected 2 points! Click 'Reset' to start over.");
        return;
    }

    // Add node to our list
    selectedNodes.push(node);

    // Visual feedback: Change color to RED
    marker.setStyle({ color: 'red', fillColor: 'red' });

    // Update the info box on the screen
    var infoBox = document.getElementById("route-info");
    if (selectedNodes.length === 1) {
        infoBox.innerText = "Start Point: " + node.name;
    } else {
        infoBox.innerText = "End Point: " + node.name;
        // We have 2 points, let's find the path!
        runDijkstraAlgorithm();
    }
}

// --- 6. Run Dijkstra and Draw Path ---
function runDijkstraAlgorithm() {
    var startNode = selectedNodes[0];
    var endNode = selectedNodes[1];

    // Check if the algorithm function exists (from dijkstra.js)
    if (typeof calculateShortestPath === "function") {
        
        // Call the algorithm
        var pathIds = calculateShortestPath(globalNodes, globalEdges, startNode.id, endNode.id);

        if (pathIds.length > 0) {
            // Convert IDs (e.g., "A", "B") to coordinates (e.g., [37.2, 28.3])
            var pathCoordinates = [];
            
            // Loop through path IDs to find matching node objects
            for (var i = 0; i < pathIds.length; i++) {
                var id = pathIds[i];
                // Find the node object with this ID
                var foundNode = globalNodes.find(n => n.id === id);
                pathCoordinates.push([foundNode.lat, foundNode.lng]);
            }

            // Draw the red line (Polyline)
            L.polyline(pathCoordinates, { color: 'red', weight: 5 }).addTo(map);
            
            document.getElementById("route-info").innerText = "Route found! Distance calculated.";
        } else {
            alert("No path found between these two points.");
        }
    } else {
        alert("Error: dijkstra.js file is missing or not linked.");
    }
}

// Simple reload function for the Reset button
function resetPage() {
    location.reload();
}55