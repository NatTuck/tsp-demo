"use strict";

var WW = 800;
var HH = 600;

var nn = 5;
var cities;

var ops = 0;
var counting = false;

var stage;

function randomCity() {
    var x = 20 + Math.floor(Math.random() * (WW - 40));
    var y = 20 + Math.floor(Math.random() * (HH - 40));
    return [x, y];
}

function randomize() {
    cities = [];
    for (var ii = 0; ii < nn; ++ii) {
        cities.push(randomCity());
    }
}

function drawCities() {
    stage.removeAllChildren();
    stage.clear();
    
    for (var ii = 0; ii < nn; ++ii) {
        var cc  = cities[ii];
        var dot = new createjs.Shape();
        dot.graphics.beginFill("blue").drawCircle(0, 0, 10);
        dot.x = cc[0];
        dot.y = cc[1];
        stage.addChild(dot);
    }

    stage.update();
}

function reset() {
    nn = parseInt($('#city-count').val());
    randomize();
    drawCities();
}

function setup() {
    stage = new createjs.Stage("tsp-canvas");
    reset();
}

function startCount() {
    ops = 0;
    counting = true;
}

function countOp() {
    if (counting) {
        ops++;
    }
}

function endCount() {
    counting = false;
    $('#op-count').text(ops);
}

function distance(ii, jj) {
    countOp();

    var aa = cities[ii];
    var bb = cities[jj];
    var dx = aa[0] - bb[0];
    var dy = aa[1] - bb[1];
    var di = Math.sqrt(dx * dx + dy * dy);
    return di;
}

function pathCost(path) {
    var cost = 0;
   
    for (var ii = 0; ii < (path.length - 1); ++ii) {
        cost += distance(path[ii], path[ii + 1]);
    }
    return cost;
}

function drawEdge(xx, yy) {
    var aa = cities[xx];
    var bb = cities[yy];
    
    var line = new createjs.Shape();
    line.graphics.setStrokeStyle(3).beginStroke("black");
    line.graphics.moveTo(aa[0], aa[1]);
    line.graphics.lineTo(bb[0], bb[1]);
    line.graphics.endStroke();
    stage.addChild(line);
}

function drawPath(path) {
    drawCities();

    for (var ii = 0; ii < (path.length - 1); ++ii) {
        drawEdge(path[ii], path[ii+1]);
   } 

    stage.update();
}

function drawEdges(edges) {
    drawCities();

    for (var ii = 0; ii < edges.length; ++ii) {
        var xx = edges[ii][0];
        var yy = edges[ii][1];
        drawEdge(xx, yy);
    }
    
    stage.update();
}

function permutations(arr) {
    if (arr.length <= 1) {
        return [arr];
    }

    var perms = [];

    for (var ii = 0; ii < arr.length; ++ii) {
        var rest = arr.slice(0);
        var item = rest.splice(ii, 1);

        var subs = permutations(rest);
        for (var jj = 0; jj < subs.length; ++jj) {
            perms.push(item.concat(subs[jj]));
        }
    }

    return perms;
}

function solveNaive() {
    startCount();

    var perms = permutations(_.range(cities.length));
    var bestp = [];
    var bestc = Number.POSITIVE_INFINITY;

    for (var ii = 0; ii < perms.length; ++ii) {
        var path = perms[ii];
        path.push(path[0]);

        var cost = pathCost(path);
        if (cost < bestc) {
            bestc = cost;
            bestp = path;
        }
    }

    drawPath(bestp);

    endCount();
}

function hasCycle(edges) {
    var gg = graph();
    gg.add_edges(edges);
    return gg.has_cycle();
}

function calcMST() {
    var edges = [];

    for (var ii = 0; ii < cities.length; ++ii) {
        for (var jj = 0; jj < cities.length; ++jj) {
            if (ii == jj) {
                continue;
            }

            edges.push([ii, jj]);
        }
    }

    edges = edges.sort(function (aa, bb) {
        var da = distance(aa[0], aa[1]);
        var db = distance(bb[0], bb[1]);
        return da - db;
    });

    var gg = graph();

    for (var ii = 0; ii < edges.length; ++ii) {
        var xx = edges[ii][0];
        var yy = edges[ii][1];

        gg.add_edge(xx, yy);

        countOp();

        if (gg.has_cycle()) {
            gg.remove_edge(xx, yy);
        }
    }

    return gg.edges();
}

function showMST() {
    startCount();
    var mst = calcMST();
    drawEdges(mst);
    endCount();
}

function solveMST() {
    startCount();

    var mst_edges = calcMST();
    var gg = graph();
    gg.add_edges(mst_edges);

    var seen = [];
    var path = [];

    var first;

    gg.dfs(function(vv) {
        countOp();

        if (!first) {
            first = vv;
        }

        if (!seen[vv]) {
            path.push(vv);
        }

        seen[vv] = true; 
    });

    path.push(first);

    drawPath(path);

    endCount();
}

function edgesLength(edges) {
    var len = 0;

    for (var ii = 0; ii < edges.length; ++ii) {
        var aa = edges[ii][0];
        var bb = edges[ii][1];
        len += distance(aa, bb);
    } 

    return len;
}

function swapEdgeStart(es, ii, jj) {
    var s0 = es[ii][0];
    var s1 = es[jj][0];

    if (s0 == es[jj][1] || s1 == es[ii][1]) {
        return;
    }

    es[ii][0] = s1;
    es[jj][0] = s0;
}

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function isRudrata(es) {
    var gg = graph();
    gg.add_edges(es);

    var count = 0;

    gg.dfs_simple(function(vv) {
        console.log(vv);
        count++;
    });

    return count == gg.vertex_count();
}

function solveTwos() {
    startCount();

    var path = _.range(cities.length);
    
    var edges = [];

    for (var ii = 0; ii < path.length - 1; ++ii) {
        edges.push([path[ii], path[ii + 1]]);
    }

    edges.push([path[path.length - 1], 0]);

    console.log("good? ", isRudrata(edges));

    for (var ii = 0; ii < edges.length; ++ii) {
        for (var jj = 0; jj < edges.length; ++jj) {
            // Try swapping pair.
            var es1  = deepCopy(edges);
            swapEdgeStart(es1, ii, jj);

            console.log(ii, jj, isRudrata(es1), JSON.stringify(edges));

            if (isRudrata(es1) && edgesLength(es1) < edgesLength(edges)) {
                edges = es1;
            }
        }
    }

    console.log(JSON.stringify(edges));

    drawEdges(edges);

    endCount();
}

function solveThrees() {
    startCount();

    var path = _.range(cities.length);
    
    var edges = [];

    for (var ii = 0; ii < path.length - 1; ++ii) {
        edges.push([path[ii], path[ii + 1]]);
    }

    edges.push([path[path.length - 1], 0]);

    for (var ii = 0; ii < edges.length; ++ii) {
        for (var jj = 0; jj < edges.length; ++jj) {
            // Swap ii <-> jj
            var es1  = edges.slice(0);
            swapEdgeStart(es1, ii, jj);

            if (edgesLength(es1) < edgesLength(edges)) {
                edges = es1;
            }

            for (var kk = 0; kk < edges.length; ++kk) {
                var es1 = edges.slice(0);
                var es2 = edges.slice(0);

                // Swap ii -> jj -> kk -> ii
                swapEdgeStart(es1, ii, jj);
                swapEdgeStart(es1, ii, kk);
                
                if (edgesLength(es1) < edgesLength(edges)) {
                    edges = es1;
                }

                // Swap ii -> kk -> jj -> ii
                swapEdgeStart(es2, ii, kk);
                swapEdgeStart(es2, ii, jj);
                
                if (edgesLength(es2) < edgesLength(edges)) {
                    edges = es2;
                }
            }
        }
    }

    drawEdges(edges);

    endCount();
}
