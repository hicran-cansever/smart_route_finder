// --- 1. Dijkstra Algorithm ---
function runDijkstra(nodes, edges, startId, endId) {
    let distances = {};
    let previous = {};
    let queue = [];

    // Başlangıç değerleri
    nodes.forEach(node => {
        distances[node.id] = Infinity;
        previous[node.id] = null;
        queue.push(node.id);
    });

    distances[startId] = 0;

    while (queue.length > 0) {
        // En kısa mesafeli düğümü bul
        queue.sort((a, b) => distances[a] - distances[b]);
        let currentNode = queue.shift();

        if (currentNode === endId) break;

        let myEdges = edges.filter(e => e.from === currentNode);
        
        myEdges.forEach(edge => {
            let neighbor = edge.to;
            let newDist = distances[currentNode] + edge.weight;
            if (newDist < distances[neighbor]) {
                distances[neighbor] = newDist;
                previous[neighbor] = currentNode;
            }
        });
    }
    return reconstructPath(previous, endId, distances[endId]);
}

// --- 2. A* (A-Star) Algorithm ---
function runAStar(nodes, edges, startId, endId) {
    // Heuristic: Kuş uçuşu mesafe (Euclidean)
    function getHeuristic(idA, idB) {
        let nA = nodes.find(n => n.id === idA);
        let nB = nodes.find(n => n.id === idB);
        // Basit pisagor (Mesafe tahmini için)
        return Math.sqrt(Math.pow(nA.lat - nB.lat, 2) + Math.pow(nA.lng - nB.lng, 2)) * 1000;
    }

    let openSet = [startId];
    let cameFrom = {};
    let gScore = {}; 
    let fScore = {}; 

    nodes.forEach(n => { gScore[n.id] = Infinity; fScore[n.id] = Infinity; });
    gScore[startId] = 0;
    fScore[startId] = getHeuristic(startId, endId);

    while (openSet.length > 0) {
        // En düşük fScore (Maliyet + Tahmin) olanı seç
        openSet.sort((a, b) => fScore[a] - fScore[b]);
        let current = openSet.shift();

        if (current === endId) {
            return reconstructPath(cameFrom, endId, gScore[endId]);
        }

        let myEdges = edges.filter(e => e.from === current);

        myEdges.forEach(edge => {
            let neighbor = edge.to;
            let tentative_gScore = gScore[current] + edge.weight;

            if (tentative_gScore < gScore[neighbor]) {
                cameFrom[neighbor] = current;
                gScore[neighbor] = tentative_gScore;
                fScore[neighbor] = gScore[neighbor] + getHeuristic(neighbor, endId);
                
                if (!openSet.includes(neighbor)) openSet.push(neighbor);
            }
        });
    }
    return null;
}

// Ortak Yol Çizme Fonksiyonu
function reconstructPath(previous, current, totalDist) {
    let path = [current];
    while (previous[current]) {
        current = previous[current];
        path.unshift(current);
    }
    return { path: path, distance: totalDist };
}