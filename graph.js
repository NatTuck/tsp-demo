
function graph_add_edge(aa, bb) {
    if (!this.adj[aa]) {
        this.adj[aa] = [];
    }

    this.adj[aa][bb] = true;

    if (!this.adj[bb]) {
        this.adj[bb] = [];
    }
    
    this.adj[bb][aa] = true;
}

function graph_remove_edge(aa, bb) {
    if (!this.adj[aa]) {
        this.adj[aa] = [];
    }
   
    if (this.adj[aa][bb]) {
        delete this.adj[aa][bb];
    }

    if (!this.adj[bb]) {
        this.adj[bb] = [];
    }
   
    if (this.adj[bb][aa]) {
        delete this.adj[bb][aa];
    }
}

function graph_add_edges(es) {
    for (var ii = 0; ii < es.length; ++ii) {
        this.add_edge(es[ii][0], es[ii][1]);
    }
}

function graph_edges() {
    var edges = [];

    for (var ii in this.adj) {
        for (var jj in this.adj[ii]) {
            edges.push([parseInt(ii), parseInt(jj)]);
        }
    }

    return edges;
}

function graph_vertices() {
    var verts = [];

    for (var ii in this.adj) {
        verts.push(ii);
    }

    return verts;
}

function graph_vertex_count() {
    var verts = this.vertices();
    return verts.length;
}

function graph_neighbors(vv) {
    if (!this.adj[vv]) {
        console.log(this);
        console.log("Bad vertex");
        console.log("Vertex:", vv);
        debugger;
    }

    var ns = [];

    for (var ii in this.adj[vv]) {
        ns.push(parseInt(ii));
    }

    return ns;
}

function graph_has_cycle_helper(graph, seen, pv, cv) {
    seen[cv] = true;

    var neibs = graph.neighbors(cv);

    for (var ii = 0; ii < neibs.length; ++ii) {
        var vv = neibs[ii];

        if (vv != pv) {
            if (seen[vv]) {
                return true;
            }

            var rec = graph_has_cycle_helper(graph, seen, cv, vv);
            if (rec) {
                return true;
            }
        }
    }

    return false;
}

function graph_has_cycle() {
    var vs = this.vertices();

    if (vs.length < 1) {
        return;
    }

    for (var ii = 0; ii < vs.length; ++ii) {
        var seen = {};
        var cycl = graph_has_cycle_helper(this, seen, vs[ii], vs[ii]);
        if (cycl) {
            return true;
        }
    }

    return false;
}

function graph_dfs_helper(graph, seen, pv, cv, cb) {
    cb(cv);
    seen[cv] = true;

    var neibs = graph.neighbors(cv);

    for (var ii = 0; ii < neibs.length; ++ii) {
        var vv = neibs[ii];

        if (!seen[vv]) {
            graph_dfs_helper(graph, seen, cv, vv, cb);
        }
    }
}

function graph_dfs(cb) {
    var vs = this.vertices();

    if (vs.length < 1) {
        return;
    }

    var seen = {};

    for (var ii = 0; ii < vs.length; ++ii) {
        if (!seen[vs[ii]]) {
            graph_dfs_helper(this, seen, vs[ii], vs[ii], cb);
        }
    }
}

function graph_dfs_simple(cb) {
    var vs = this.vertices();

    if (vs.length < 1) {
        return;
    }

    var seen = {};
    graph_dfs_helper(this, seen, vs[0], vs[0], cb);
}

function graph() {
    var proto = {
        add_edge:  graph_add_edge,
        add_edges: graph_add_edges,
        edges:     graph_edges,
        vertices:  graph_vertices,
        has_cycle: graph_has_cycle,
        neighbors: graph_neighbors,
        remove_edge: graph_remove_edge,
        dfs:       graph_dfs,
        dfs_simple: graph_dfs_simple,
        vertex_count: graph_vertex_count,
    };

    var gg = Object.create(proto);
    gg.adj = [];
    return gg;
}

