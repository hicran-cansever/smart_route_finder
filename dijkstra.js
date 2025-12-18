// Main function to find the shortest path
function calculateShortestPath(graphNodes, graphEdges, startId, endId) {
    
    // 1. Setup variables
    let distances = {}; // Stores shortest distance to each node
    let previous = {};  // To track the path back
    let queue = [];     // Nodes to visit

    // Init all distances to Infinity
    graphNodes.forEach(node => {
        distances[node.id] = Infinity;
        previous[node.id] = null;
        queue.push(node.id);
    });

    // Start node distance is always 0
    distances[startId] = 0;

    // 2. Main Loop: Process the queue
    while (queue.length > 0) {
        
        // Sort to find the closest node (simple priority queue logic)
        queue.sort((a, b) => distances[a] - distances[b]);
        let currentNode = queue.shift(); // Remove the closest node

        // Stop if we reached the target
        if (currentNode === endId) break;

        // Check neighbors
        let neighbors = graphEdges.filter(edge => edge.from === currentNode);
        
        neighbors.forEach(edge => {
            let neighborNode = edge.to;
            let newDistance = distances[currentNode] + edge.weight;

            // If we found a shorter path, update it
            if (newDistance < distances[neighborNode]) {
                distances[neighborNode] = newDistance;
                previous[neighborNode] = currentNode;
            }
        });
    }

    // 3. Reconstruct path (backwards from end to start)
    let path = [];
    let current = endId;
    
    while (current !== null) {
        path.unshift(current); // Add to front of array
        current = previous[current];
    }

    // Return empty if no valid path found
    if (path.length === 1 && path[0] !== startId) return [];
    
    return path;
}