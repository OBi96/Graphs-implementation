/*
	- d3 display implementation of a graph is based on the opendatastructes.org algorithms and Ross Kirsling's Directed Graph Editor implementation.
*/

// set up SVG for D3
var width  = 800,
    height = 450,
    colors = d3.scale.category10();

var svg = d3.select("#svg");

// set up list of nodes and links.
var nodes = [
  ],
  lastNodeId = -1,
  links = [
    
  ];

var sente = false;
// init D3 force layout
var force = d3.layout.force()
    .nodes(nodes)
    .links(links)
    .size([width, height])
    .linkDistance(150)
    .charge(-400)
    .on('tick', tick);

// init the arrow types
svg.append('svg:defs').append('svg:marker')
	.attr('id', 'end-arrow')
	.attr('viewBox', '0 -5 10 10')
	.attr('refX', 6)
	.attr('markerWidth', 3)
	.attr('markerHeight', 3)
	.attr('orient', 'auto')
  .append('svg:path')
	.attr('d', 'M0,-5L10,0L0,5')
	.attr('fill', '#000');

svg.append('svg:defs').append('svg:marker')
	.attr('id', 'start-arrow')
	.attr('viewBox', '0 -5 10 10')
	.attr('refX', 4)
	.attr('markerWidth', 3)
	.attr('markerHeight', 3)
	.attr('orient', 'auto')
  .append('svg:path')
	.attr('d', 'M10,-5L0,0L10,5')
	.attr('fill', '#000');
		
svg.append('svg:defs').append('svg:marker')
	.attr('id', 'end-arrowG')
	.attr('viewBox', '0 -5 10 10')
	.attr('refX', 6)
	.attr('markerWidth', 3)
	.attr('markerHeight', 3)
	.attr('orient', 'auto')
  .append('svg:path')
	.attr('d', 'M0,-5L10,0L0,5')
	.attr('fill', '#2ECC71');

svg.append('svg:defs').append('svg:marker')
	.attr('id', 'start-arrowG')
	.attr('viewBox', '0 -5 10 10')
	.attr('refX', 4)
	.attr('markerWidth', 3)
	.attr('markerHeight', 3)
	.attr('orient', 'auto')
  .append('svg:path')
	.attr('d', 'M10,-5L0,0L10,5')
	.attr('fill', '#2ECC71');

// paths are links and cicles are nodes
var path = svg.append('svg:g').selectAll('path'),
    circle = svg.append('svg:g').selectAll('g');


// force update function
function tick() {
  // sets the links form the nodes to each other
  path.attr('d', function(d) {
    var deltaX = d.target.x - d.source.x,
        deltaY = d.target.y - d.source.y,
        dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
        normX = deltaX / dist,
        normY = deltaY / dist,
        sourcePadding = d.left ? 17 : 12,
        targetPadding = d.right ? 17 : 12,
        sourceX = d.source.x + (sourcePadding * normX),
        sourceY = d.source.y + (sourcePadding * normY),
        targetX = d.target.x - (targetPadding * normX),
        targetY = d.target.y - (targetPadding * normY);
    return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
  });

  circle.attr('transform', function(d) {
    return 'translate(' + d.x + ',' + d.y + ')';
  });
}


// draws the graph
function restart() {
  // makes links into paths
  path = path.data(links);

  // updates existing links
  path.classed('touched', function(d) { return d.touchedL || d.touchedR ; })
    .style('marker-start', function(d) { return d.left ? (d.touchedL ? 'url(#start-arrowG)' :'url(#start-arrow)' ): ''; })
    .style('marker-end', function(d) { return d.right ? (d.touchedR ? 'url(#end-arrowG)' :'url(#end-arrow)' ): ''; });

  // adds the new links
  path.enter().append('svg:path')
    .attr('class', 'link')
    .classed('touched', function(d) { return d.touchedL || d.touchedR ; })
    .style('marker-start', function(d) { return d.left ? (d.touchedL ? 'url(#start-arrowG)' :'url(#start-arrow)' ) : ''; })
    .style('marker-end', function(d) { return d.right ? (d.touchedR ? 'url(#end-arrowG)' :'url(#end-arrow)' ) : ''; });
		
	  // removes the old links
  path.exit().remove();


  // nodes are made into circles
  circle = circle.data(nodes, function(d) { return d.id; });

  // checks node for colour and if marked
  circle.selectAll('circle')
    .style('fill', function(d) { return colors(d.col); })
    .classed('marked', function(d) { return d.marked; });

  // adds any new nodes
  var g = circle.enter().append('svg:g');

  g.append('svg:circle')
    .attr('class', 'node')
    .attr('r', 12)
    .style('fill', function(d) { return colors(d.col); })
    .style('stroke', function(d) { return d3.rgb(colors(d.col)).darker().toString(); })
    .classed('marked', function(d) { return d.marked; });
		
		
  // displays the node's id
  g.append('svg:text')
      .attr('x', 0)
      .attr('y', 4)
      .attr('class', 'id')
      .text(function(d) { return d.id; });

  // removes the old nodes
  circle.exit().remove();

  // sets the graph in motion
  force.start();
}

// allows the circles to be dragged
function mousedown(){
	if (sente){
		circle.call(force.drag)
		sente = false;
		console.clear()
	}
}

// function returns random value between min and max
function rnd(min, max){
    if(isNaN(min)) min = 0;
    if(isNaN(max)) max = 1;
    if(max > min){
        
        var tmp = min;
        min = max;
        max = tmp;
    }
    return Math.floor(Math.random()*(max-min+1)) + min;
}

// insert a new vertex
function insertVertex() {
  
  svg.classed('active', true);

  // insert new node at point
  var node = {id: ++lastNodeId, marked: false};
  node.x = rnd(0, width);
  node.y = rnd(0, height);
	node.col = rnd(0, 10);
  nodes.push(node);
	
  restart();
	sente =true;
};

// checks if a link exists between two nodes s and t
function findLink(s,t){
	var flag = false;
	links.forEach(function(link) {
    if(link.source == nodes[s] && link.target == nodes[t]){
			link.right = true;
			flag = true;
		}
    if(link.source == nodes[t] && link.target == nodes[s]){
			link.left = true;
			flag =  true;
		}
		
	});
	return flag;
}

// function which checks if a number is being used
function isNumber(x){ return !isNaN(x) }

// adds a link between two nodes from s to t
function insertLink(s, t){
	var textInsertS = d3.select("#textInsertS");
	var textInsertT = d3.select("#textInsertT");
	s = Number(textInsertS.property("value"));
	t = Number(textInsertT.property("value"));
	//console.log(s);
	//console.log(t);
	if (!(isNumber(s) && isNumber(t)) || s > lastNodeId || t > lastNodeId || (s == t)){return;}
	if(!findLink(s,t)){
		links.push({source: nodes[s], target: nodes[t], left: false, right: true , touchedL: false, touchedR: false});
	}
	restart();
};

// the main function for selecting the traverse
function traverseGraph(r){
	if (setBack()){
		var textInsertR = d3.select("#textInsertR");
		var rbBFS = d3.select("#rbBFS");
		var rbDFS = d3.select("#rbDFS");
		t = textInsertR.property("value")
    r = Number(textInsertR.property("value"));
		//console.log(r);
		//console.log(t == "");
		
    if((!isNumber(r)) || t=="" || r > lastNodeId ){	
			return;
		}
		else if(Boolean(rbBFS.property("checked"))){
		if(bfs(r)){
			restart();
			}
		}
		else if(Boolean(rbDFS.property("checked"))){
		if(dfs(r)){
			restart();
			}
		}else{
			if (setBack()){
				restart();
			}
			
		}
	}
};

// finds any in edges on n
function outEdges(n){
	var edges = [];
	links.forEach(function(link) {
		if(link.source == nodes[n] && link.right == true){
			edges.push(link.target);
		}
    if(link.left == true && link.target == nodes[n]){
			edges.push(link.source);
		}
		
	});
	return edges;
};

// colours the edges based on the links.
function colorEdges(i,j){
	var flag = false;
	links.forEach(function(link) {
    if(link.source == nodes[i] && link.target == nodes[j] && link.right == true){
			link.touchedR = true;
			flag = true;
		}
    if(link.source == nodes[j] && link.target == nodes[i] && link.left == true){
			link.touchedL = true;
			flag = true;
		}
	});
	return flag;
}

// sets all the nodes and links to untouched 
function setBack(){
	links.forEach(function(link) {
			link.touchedR = false;
			link.touchedL = false;
	});
	nodes.forEach(function(node) {
		node.marked = false;
	});
	return true;
}

// bfs traverse of the graph starting at node n.
function bfs(n){
	var queue = []; //push, shift
	queue.push(n);
	nodes[n].marked = true;
	function doAnimation(){
		if(queue.length != 0){
			var i = queue.shift();
			var edges = outEdges(i);
			for (j in edges){
				//console.log(j);
				if(!edges[j].marked){
					queue.push(edges[j].id);
					edges[j].marked = true;
					colorEdges(i,edges[j].id);
					restart();
				}
			}
			// used to slow down the algorithm
			setTimeout(doAnimation,500);
			restart();
		}
	}
	setTimeout(doAnimation,500);
	return true;
};

// dfs traverse of the graph starting at node n.
function dfs(n){
	var stack = []; //push, pop
	stack.push(n);
	var jp= [];
	var i = null;
	function doAnimation(){
		if (stack.length != 0){
			//(i ==null)? jp =[]: jp.push(i); 
			//console.log(i);
			i = stack.pop();
			//var edges = outEdges(i);
			if(!nodes[i].marked){
				nodes[i].marked = true;
				restart()
				var edges = outEdges(i);

				if(jp.length != 0){
					
					while(!colorEdges(jp[jp.length-1],i)){
						
						jp.pop();
					}
					
					}
				for(j in edges){
					jp.push(i);
					stack.push(edges[j].id)
				}
			}
			// used to slow down the algorithm
			setTimeout(doAnimation,500);
			restart()
		}
	}
	
	setTimeout(doAnimation,0);
	return true;
};

//allows mouse down for drag.
svg.on('mousedown',mousedown);
// starts the program.
restart();
