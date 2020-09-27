const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  let body = JSON.parse(event.body);

  let productId = body["id"];

  // delete values from product table
  let productParams = {
    Key: {
      id: productId,
    },
    TableName: "product",
  };

  await dynamoDB.delete(productParams).promise();

  // delete values from ingredient table
  let scanProductParams = {
    TableName: "ingredient",
    FilterExpression: "contains(product_id, :pid)",
    ExpressionAttributeValues: {
      ":pid": productId,
    },
  };

  let results = await dynamoDB.scan(scanProductParams).promise();
  results = results.Items;

  for (let index in results) {
    let ingredientParams = {
      Key: {
        id: results[index].id,
      },
      TableName: "ingredient",
    };

    await dynamoDB.delete(ingredientParams).promise();
  }

  const response = {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
    },
    body: JSON.stringify({ result: "success" }),
  };

  return response;
};
