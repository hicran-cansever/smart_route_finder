// --- 1. Init Map ---
var map = L.map('map').setView([37.2015, 28.3530], 16);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);

// Variables
var globalNodes = [];
var globalEdges = [];
var selectedPoints = [];
var isEditMode = false;
var polylineLayer = null;

// --- 2. Load Data ---
fetch('graph-data.json').then(res => res.json()).then(data => {
    globalNodes = data.nodes;
    globalEdges = data.edges;
    drawAllNodes();
});

// --- 3. Draw Nodes (Blue for Buildings, Gray for Roads) ---
function drawAllNodes() {
    globalNodes.forEach(node => {
        let isRoad = node.name.includes("Road") || node.name.includes("Side");
        
        let marker = L.circleMarker([node.lat, node.lng], {
            color: isRoad ? 'gray' : 'blue',
            radius: isRoad ? 4 : 8,
            fillOpacity: 0.8
        }).addTo(map);
        
        marker.bindTooltip(node.name);
        
        // Handle Clicks
        marker.on('click', () => handleNodeClick(node));
    });
}

// --- 4. Interactions ---
function handleNodeClick(node) {
    if (isEditMode) {
        // Edit Mode: Connect two nodes
        selectedPoints.push(node);
        if (selectedPoints.length === 2) {
            let n1 = selectedPoints[0];
            let n2 = selectedPoints[1];
            // Add new edge dynamically
            globalEdges.push({ from: n1.id, to: n2.id, weight: 3 }); 
            globalEdges.push({ from: n2.id, to: n1.id, weight: 3 });
            alert(`New road connected: ${n1.name} <-> ${n2.name}`);
            selectedPoints = []; // Reset
        }
    } else {
        // Normal Mode: Select Start/End
        if (selectedPoints.length >= 2) return;
        selectedPoints.push(node);
        document.getElementById("route-info").innerHTML += `<br>Selected: <b>${node.name}</b>`;
        
        if (selectedPoints.length === 2) {
            compareAlgorithms();
        }
    }
}

// --- 5. Edit Mode: Add New Points ---
map.on('click', function(e) {
    if (isEditMode) {
        let newId = "User" + Math.floor(Math.random() * 1000);
        let newNode = { 
            id: newId, 
            name: "User Point", 
            lat: e.latlng.lat, 
            lng: e.latlng.lng 
        };
        globalNodes.push(newNode);
        
        // Draw the new node immediately
        let marker = L.circleMarker([newNode.lat, newNode.lng], { color: 'orange', radius: 8 }).addTo(map);
        marker.bindTooltip("User Point").on('click', () => handleNodeClick(newNode));
            
        document.getElementById("route-info").innerHTML = "New point added! Click another point to connect.";
    }
});

function toggleEditMode() {
    isEditMode = !isEditMode;
    let btn = document.getElementById("editBtn");
    if (isEditMode) {
        btn.innerText = "Disable Edit Mode";
        btn.classList.add("edit-mode");
        document.getElementById("route-info").innerHTML = "<b>EDIT MODE:</b> Click map to add points. Click two points to connect roads.";
    } else {
        btn.innerText = "Enable Edit Mode";
        btn.classList.remove("edit-mode");
        document.getElementById("route-info").innerHTML = "Edit mode disabled.";
        selectedPoints = [];
    }
}

// --- 6. Compare Algorithms (Dijkstra vs A*) ---
function compareAlgorithms() {
    let start = selectedPoints[0].id;
    let end = selectedPoints[1].id;

    // Measure Dijkstra
    let t0 = performance.now();
    let resDijkstra = runDijkstra(globalNodes, globalEdges, start, end);
    let t1 = performance.now();

    // Measure A*
    let t2 = performance.now();
    let resAStar = runAStar(globalNodes, globalEdges, start, end);
    let t3 = performance.now();

    if (resDijkstra && resDijkstra.path) {
        drawPath(resDijkstra.path);
        
        document.getElementById("route-info").innerHTML = `
            <h3>Performance Report</h3>
            <b>Path:</b> ${resDijkstra.path.join(" ➝ ")} <br>
            <b>Distance:</b> ${resDijkstra.distance} units <br><hr>
            <b>Dijkstra Time:</b> ${(t1 - t0).toFixed(4)} ms <br>
            <b>A* (A-Star) Time:</b> ${(t3 - t2).toFixed(4)} ms <br>
            <i>(A* is optimized for speed!)</i>
        `;
    } else {
        alert("No path found!");
    }
}

function drawPath(pathIds) {
    if (polylineLayer) map.removeLayer(polylineLayer);
    
    let coords = pathIds.map(id => {
        let n = globalNodes.find(x => x.id === id);
        return [n.lat, n.lng];
    });
    
    polylineLayer = L.polyline(coords, { color: 'red', weight: 5 }).addTo(map);
}

function clearMap() {
    location.reload();
}