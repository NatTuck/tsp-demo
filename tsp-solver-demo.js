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
  
    if (path[0] != path[path.length - 1]) {
        path = deepCopy(path);
        path.push(path[0]);
    }

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

    $('#path-len').text(Math.round(pathCost(path)));
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

function permutations(perm, arr, cb) {
    if (arr.length < 1) {
        cb(perm);
    }

    for (var ii = 0; ii < arr.length; ++ii) {
        var rest = arr.slice(0);
        var item = rest.splice(ii, 1);

        var p1 = perm.slice(0);
        p1.push(item);

        permutations(p1, rest, cb);
    }
}

function solveNaive() {
    startCount();

    var bestp = [];
    var bestc = Number.POSITIVE_INFINITY;

    permutations([], _.range(cities.length), function(path) {
        var cost = pathCost(path);
        if (cost < bestc) {
            bestc = cost;
            bestp = path;
        }
    });

    bestp.push(bestp[0]);
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

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function swap(xs, ii, jj) {
    var tmp = xs[ii];
    xs[ii] = xs[jj];
    xs[jj] = tmp;
}

function solveTwos() {
    startCount();

    var path = _.range(cities.length);
   
    for (var kk = 0; kk < path.length; ++kk) {
        for (var ii = 0; ii < path.length; ++ii) {
            for (var jj = 0; jj < path.length; ++jj) {
                // Try swapping pair.
                var pp1 = deepCopy(path);
                swap(pp1, ii, jj);
                
                if (pathCost(pp1) < pathCost(path)) {
                    path = pp1;
                }
            }
        }
    }
    
    path.push(path[0]);

    drawPath(path);

    endCount();
}

function solveThrees() {
    startCount();

    var path = _.range(cities.length);
   
    for (var oo = 0; oo < path.length; ++oo) {
        for (var ii = 0; ii < path.length; ++ii) {
            for (var jj = 0; jj < path.length; ++jj) {
                // Try swapping pair.
                var pp1 = deepCopy(path);
                swap(pp1, ii, jj);
                
                if (pathCost(pp1) < pathCost(path)) {
                    path = pp1;
                }
                
                for (var kk = 0; kk < path.length; ++kk) {
                    var pp2 = deepCopy(path);
                    swap(pp2, ii, jj);
                    swap(pp2, jj, kk);

                    if (pathCost(pp2) < pathCost(path)) {
                        path = pp2;
                    }

                    var pp3 = deepCopy(path);
                    swap(pp3, ii, kk);
                    swap(pp3, jj, kk);
                    
                    if (pathCost(pp2) < pathCost(path)) {
                        path = pp2;
                    }
                }
            }
        }
    }
    
    path.push(path[0]);

    drawPath(path);

    endCount();
}

function solveRandom() {
    startCount();

    var path = _.range(cities.length);

    for (var ii = 0; ii < cities.length * cities.length; ++ii) {
        var pp1 = _.shuffle(deepCopy(path));
       
        if (pathCost(pp1) < pathCost(path)) {
            path = pp1;
        }
    }

    path.push(path[0]);

    drawPath(path);

    endCount();
}

function solveSA() {
    startCount();

    var heat = 10;
    var path = _.range(cities.length);

    while (heat > 1.001) {
        for (var ii = 0; ii < 10 * path.length * path.length; ++ii) {
            var pp1 = deepCopy(path);

            for (var jj = 0; jj < 3; ++jj) {
                var xx = Math.floor(path.length * Math.random());
                var yy = Math.floor(path.length * Math.random());
               
                swap(pp1, xx, yy);
            }
        
            if (pathCost(pp1) < heat * pathCost(path)) {
                path = pp1;
            }
        }

        heat = Math.sqrt(heat);
    }
    
    path.push(path[0]);

    drawPath(path);

    endCount();
}

function solveBB() {
    startCount();

    // Length of the two cheapest edges from city ii.
    var cheapest2 = [];

    for (var ii = 0; ii < cities.length; ++ii) {
        // Find cheapest edge.
        var e1 = Number.POSITIVE_INFINITY;
        var c1 = 0;
        for (var jj = 0; jj < cities.length; ++jj) {
            var dd = distance(ii, jj);
            if (dd < e1) {
                e1 = dd;
                c1 = jj;
            }
        }

        // Find second cheapest edge.
        var e2 = Number.POSITIVE_INFINITY;
        for (var jj = 0; jj < cities.length; ++jj) {
            var dd = distance(ii, jj);
            if (jj != c1 && dd < e2) {
                e2 = dd;
            }
        }

        cheapest2[ii] = e1 + e2;
    }

    var best_cost = Number.POSITIVE_INFINITY;
    var best_path = _.range(cities.length);

    var searchBB = function (guess, rest) {
        var guess_cost = pathCost(guess);

        if (guess.length == cities.length) {
            if (guess_cost < best_cost) {
                best_cost = guess_cost;
                best_path = guess;
            }

            return;
        }

        var rest_bound = 0;
        for (var ii = 0; ii < rest.length; ++ii) {
            rest_bound += cheapest2[ii] / 2.0;
        }

        if (guess_cost + rest_bound > best_cost) {
            return;
        }

        for (var ii = 0; ii < rest.length; ++ii) {
            var r1 = deepCopy(rest);
            var cc = r1.splice(ii, 1);

            var g1 = deepCopy(guess);
            g1.push(cc);

            searchBB(g1, r1);
        }
    };

    searchBB([], _.range(cities.length));
    
    best_path.push(best_path[0]);
    drawPath(best_path);

    endCount();
}
