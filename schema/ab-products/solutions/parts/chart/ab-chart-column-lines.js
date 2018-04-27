
function drawPlotLines() {
    var chart = View.getControl('', 'chartCol_chart');
    
    // draw a horizontal line
	chart.addTargetLine(
			18000000, 						// Y
			0xFF0000, 						// color
			'Standard');					// title for legend

	chart.addTargetLine(
			14000000, 						// Y
			0x0000FF, 						// color
			'Average');						// title for legend
}
