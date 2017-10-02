function load() {
	
	let fees = [
	  {
		"order_item_type": "Real Property Recording",
		"fees": [
		  {
			"name": "Recording (first page)",
			"amount": "26.00",
			"type": "flat"
		  },
		  {
			"name": "Recording (additional pages)",
			"amount": "1.00",
			"type": "per-page"
		  }
		],
		"distributions": [
		  {
			"name": "Recording Fee",
			"amount": "5.00"
		  },
		  {
			"name": "Records Management and Preservation Fee",
			"amount": "10.00"
		  },
		  {
			"name": "Records Archive Fee",
			"amount": "10.00"
		  },
		  {
			"name": "Courthouse Security",
			"amount": "1.00"
		  }
		]
	  },
	  {
		"order_item_type": "Birth Certificate",
		"fees": [
		  {
			"name": "Birth Certificate Fees",
			"amount": "23.00",
			"type": "flat"
		  }
		],
		"distributions": [
		  {
			"name": "County Clerk Fee",
			"amount": "20.00"
		  },
		  {
			"name": "Vital Statistics Fee",
			"amount": "1.00"
		  },
		  {
			"name": "Vital Statistics Preservation Fee",
			"amount": "1.00"
		  }
		]
	  }
	];

	let orders = [
	  {
		"order_date": "1/11/2015",
		"order_number": "20150111000001",
		"order_items": [
		  {
			"order_item_id": 1,
			"type": "Real Property Recording",
			"pages": 3
		  },
		  {
			"order_item_id": 2,
			"type": "Real Property Recording",
			"pages": 1
		  }
		]
	  },
	  {
		"order_date": "1/17/2015",
		"order_number": "20150117000001",
		"order_items": [
		  {
			"order_item_id": 3,
			"type": "Real Property Recording",
			"pages": 2
		  },
		  {
			"order_item_id": 4,
			"type": "Real Property Recording",
			"pages": 20
		  }
		]
	  },
	  {
		"order_date": "1/18/2015",
		"order_number": "20150118000001",
		"order_items": [
		  {
			"order_item_id": 5,
			"type": "Real Property Recording",
			"pages": 5
		  },
		  {
			"order_item_id": 6,
			"type": "Birth Certificate",
			"pages": 1
		  }
		]
	  },
	  {
		"order_date": "1/23/2015",
		"order_number": "20150123000001",
		"order_items": [
		  {
			"order_item_id": 7,
			"type": "Birth Certificate",
			"pages": 1
		  },
		  {
			"order_item_id": 8,
			"type": "Birth Certificate",
			"pages": 1
		  }
		]
	  }
	];	
	
	const CENTS_IN_ONE_DOLLAR = 100.00;		
	
	DisplayPrices();	
	DisplayDistributions();
	
	function DisplayPrices() {
		orders.forEach(order => {	
			let totalPriceInCents = 0;	
			
			console.log("Order ID: " + order.order_number);
			
			let orderItemPrices = GetOrderItemPrices(order);	
			
			orderItemPrices.forEach(orderItemPrice => {
				totalPriceInCents += orderItemPrice.amount * CENTS_IN_ONE_DOLLAR;
				console.log("\tOrder item " + orderItemPrice.type + ": $" + orderItemPrice.amount);	
			});	

			console.log("\tOrder total: $" + totalPriceInCents/CENTS_IN_ONE_DOLLAR);		
		});			
	}
	
	function DisplayDistributions() {	
		let totalDistributions = [];
	
		orders.forEach(order => {			
			console.log("Order ID: " + order.order_number);	
			
			let distributions = GetDistributionsForOrder(order);		
			
			distributions.forEach(totalDistribution => {		
				totalDistributions.push(totalDistribution);
				console.log("\tFund - " + totalDistribution.name + " : $" + totalDistribution.amount);				
			});		
		});	
		
		console.log("Total distributions:");		
		
		let totalDistributionsSum = SumSimilarDistributions(totalDistributions);
		
		totalDistributionsSum.forEach(totalDistribution => {
			console.log("\tFund - " + totalDistribution.name + " : $" + totalDistribution.amount);
		});
	}	
	
	function GetOrderItemPrices(order) {					
		
		let totalPriceInCents = 0;	
		
		let orderItemprices = order.order_items.map(orderItem => {			
						
			let orderItemFeesOrDefault = fees.filter(fee => fee.order_item_type === orderItem.type)[0] || null;			
			
			let priceInCents  = CalculateTotalOrderItemPriceInCents(orderItemFeesOrDefault, orderItem.pages);				
			
			return {type: orderItem.type, amount: (priceInCents/CENTS_IN_ONE_DOLLAR).toFixed(2)};			
		});
		
		return orderItemprices;		
	}	
	
	function GetDistributionsForOrder(order) {				
		
		let distributions = order.order_items.map(orderItem => {
			let arr = [];
			let orderItemFeesOrDefault = fees.filter((fee) => fee.order_item_type === orderItem.type)[0] || null;
			
			let orderItemPriceInCents  = CalculateTotalOrderItemPriceInCents(orderItemFeesOrDefault, orderItem.pages);			
			
			let sum = orderItemFeesOrDefault.distributions.reduce((item1, item2) => {				
				return {name: "", amount: parseInt(item1.amount) + parseInt(item2.amount)};
			}).amount * CENTS_IN_ONE_DOLLAR;
			
			arr = orderItemFeesOrDefault.distributions.slice();
			
			orderItemPriceInCents -= sum;
			
			if(orderItemPriceInCents > 0){						
				arr.push({name: "Other", amount: (orderItemPriceInCents/CENTS_IN_ONE_DOLLAR).toFixed(2)});
			}	
			
			return arr;
		}).reduce((a,b) => a.concat(b));

		return SumSimilarDistributions(distributions);				
	}	
	
	function SumSimilarDistributions(distributions){		
		
		let counts = distributions.reduce((prev, curr) => {
		  let count = prev.get(curr.name) || 0;
		  prev.set(curr.name, parseInt(curr.amount) + count);
		  return prev;
		}, new Map());
		
		let distributionsSum = [...counts].map(([name, amount]) => {
		  return {name, amount}
		})
		
		return distributionsSum;
	}

	function CalculateTotalOrderItemPriceInCents(orderItemFees, orderItemPages) {		
		let priceInCents = 0;	
		
		let flatFees = orderItemFees.fees.filter((order_item_fee) => order_item_fee.type === "flat");	
		flatFees.forEach((flatFee) => priceInCents += flatFee.amount * CENTS_IN_ONE_DOLLAR);	

		let perPageFees = orderItemFees.fees.filter((order_item_fee) => order_item_fee.type === "per-page");	
		perPageFees.forEach((perPageFee) => priceInCents += (perPageFee.amount * (orderItemPages - 1)) * CENTS_IN_ONE_DOLLAR);
		
		return priceInCents;
	}	
}