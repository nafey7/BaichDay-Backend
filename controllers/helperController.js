exports.CalculateRating = (arr) => {

    // This function calculates the rating of the seller/bidder
    let sum=0;
    for (let i=0;i<arr.length;i++){
        sum = sum+arr[i];
    }
    let rating = (sum)/(arr.length);

    return rating;
}


exports.EvaluateParticularBid = (viewProducts, req) => {
    let finalData = [];

        let userBidArray, mockData;
        if (viewProducts.length > 0){
            let bidArray, bidArrayLength;
            for (let i=0;i<viewProducts.length;i++){

                userBidArray =[];
                mockData = {};

                mockData._id = viewProducts[i]._id;
                mockData.name = viewProducts[i].name;
                mockData.cost = viewProducts[i].cost;
                mockData.description = viewProducts[i].description;
                mockData.sold = viewProducts[i].sold;
                
                bidArray = viewProducts[i].bid
                bidArrayLength = bidArray.length;

                for (let j=0;j<bidArrayLength;j++){
                    if (bidArray[j].userID == req.body.userID){
                        userBidArray.push(bidArray[j].bidCost)
                    }
                }

                mockData.userBidArray = userBidArray;
                mockData.maxBid = Math.max.apply(Math, userBidArray);

                finalData.push (mockData);
            }
        }

        return finalData;
}
