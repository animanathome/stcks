var Positions = (function(){
	var getRanges = function(positions, weekdays, yr){
		// console.log('getPositionRangesNew')
		// console.log('positions:', positions)
		// console.log('weekdays:', weekdays)
		// console.log('y range:', yr)

		var wi = positions.dates.map(function(d, idx){
	    	// console.log(idx, d, weekdays.indexOf(d))
	    	return weekdays.indexOf(d)
	    })

	    var result = []
	    positions.entries.map(function(d, idx){
	    	// console.log('position', idx, d)

	    	// open position
	    	if(d){
	    		result.push({
		    		day: wi[idx],
		    		value: yr[1],
		    		defined: true
	    		})
	    	
	    	// close position
	    	}else{
	    		result.push({
		    		day: wi[idx],
		    		value: yr[1],
		    		defined: true
	    		})

	    		result.push({
		    		day: wi[idx]+1,
		    		value: yr[1],
		    		defined: false
	    		})
	    	}
	    })

	    // do we end with an open position?
	    if(result[result.length-1].defined){
	    	result.push({
	    		day: weekdays.length-1,
	    		value: yr[1],
	    		defined: true
			})
	    }
	    // console.log('result:', result)
	    return result
	}

	var getPositionRanges = function(positions, weekdays, yr){
		console.log('getPositionRangesNew')
		console.log('\tpositions:', positions)
		console.log('\tweekdays:', weekdays)
		console.log('\ty range:', yr)

		// yr = value range in y
		// weekdays = original date index
	    
	    // console.log('getPositionRanges', positions)
	    // var parseTime = d3.timeParse("%m-%d-%Y");
	    // var result;
	    var results = positions.entries.map(function(d, idx){
	    	// console.log(idx, d)

	    	// dates
	    	// console.log('dates:', d[0])
	    	var wi = d[0].map(function(d, idx){
		    	// console.log(idx, d, weekdays.indexOf(d))
		    	return weekdays.indexOf(d)
		    })

		    var result = []
		    d[1].map(function(d, idx){
		    	// console.log('position', idx, d)

		    	// open position
		    	if(d){
		    		result.push({
			    		day: wi[idx],
			    		value: yr[1],
			    		defined: true
		    		})
		    	
		    	// close position
		    	}else{
		    		result.push({
			    		day: wi[idx],
			    		value: yr[1],
			    		defined: true
		    		})

		    		result.push({
			    		day: wi[idx]+1,
			    		value: yr[1],
			    		defined: false
		    		})
		    	}
		    })

		    // do we end with an open position?
		    if(result[result.length-1].defined){
		    	result.push({
		    		day: weekdays.length-1,
		    		value: yr[1],
		    		defined: true
				})
		    }
		    return result
	    })
	    
	    // console.log('results', results)
	    return results
	}

	return {
		// getRanges: getPositionRanges
		getRanges: getRanges
	}
})()

export default Positions