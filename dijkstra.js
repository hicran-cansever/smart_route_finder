// Main function to find the shortest path and distance
function calculateShortestPath(graphNodes, graphEdges, startId, endId) {
    
    // 1. Setup variables
    let distances = {}; // Stores the shortest distance to each node
    let previous = {};  // Keeps track of the path
    let queue = [];     // List of nodes to visit

    // Set initial values (Infinity for all, 0 for start)
    graphNodes.forEach(node => {
        distances[node.id] = Infinity;
        previous[node.id] = null;
        queue.push(node.id);
    });

    distances[startId] = 0;

    // 2. Main Loop: Visit nodes
    while (queue.length > 0) {
        // Sort queue to find the closest node
        queue.sort((a, b) => distances[a] - distances[b]);
        let currentNode = queue.shift(); // Remove the closest one

        // If we reached the target, stop!
        if (currentNode === endId) break;

        // 3. Check neighbors
        let neighbors = graphEdges.filter(edge => edge.from === currentNode);
        
        neighbors.forEach(edge => {
            let neighborNode = edge.to;
            let newDistance = distances[currentNode] + edge.weight;

            // If a shorter path is found, update it
            if (newDistance < distances[neighborNode]) {
                distances[neighborNode] = newDistance;
                previous[neighborNode] = currentNode;
            }
        });
    }

    // 4. Reconstruct the path backwards
    let path = [];
    let current = endId;
    
    while (current !== null) {
        path.unshift(current);
        current = previous[current];
    }

    // If no path found (disconnected), return null
    if (path.length === 1 && path[0] !== startId) return null;
    
    // *** RETURN BOTH PATH AND TOTAL DISTANCE ***
    return { 
        path: path, 
        totalDistance: distances[endId] 
    };
}