// Function to calculate shortest path and total distance
function calculateShortestPath(nodes, edges, startId, endId) {
    
    // 1. Setup variables
    let distances = {}; 
    let previous = {};  
    let queue = [];     

    // Initialize values
    nodes.forEach(node => {
        distances[node.id] = Infinity;
        previous[node.id] = null;
        queue.push(node.id);
    });

    // Start point distance is 0
    distances[startId] = 0;

    // 2. Main Algorithm Loop
    while (queue.length > 0) {
        // Find node with smallest distance
        queue.sort((a, b) => distances[a] - distances[b]);
        let currentNode = queue.shift(); 

        if (currentNode === endId) break; // Reached destination

        // Find neighbors
        let myEdges = edges.filter(edge => edge.from === currentNode);
        
        myEdges.forEach(edge => {
            let neighbor = edge.to;
            let newDist = distances[currentNode] + edge.weight;

            if (newDist < distances[neighbor]) {
                distances[neighbor] = newDist;
                previous[neighbor] = currentNode;
            }
        });
    }

    // 3. Reconstruct the Path
    let path = [];
    let current = endId;
    
    while (current !== null) {
        path.unshift(current);
        current = previous[current];
    }

    // Check if path is valid
    if (path.length === 1 && path[0] !== startId) return null;
    
    // Return both path list and total distance
    return { 
        path: path, 
        totalDistance: distances[endId] 
    };
}