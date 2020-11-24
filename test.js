var AWS = require("aws-sdk");
const express = require("express");
const app = express();
require("dotenv").config();

AWS.config.update({
  region: "us-east-2",
  endpoint: "https://dynamodb.us-east-2.amazonaws.com",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

var docClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-2" });

// const params = {
//   TableName: "user-zalo",
//   ScanFilter: {
//     userid: {
//       ComparisonOperator: "IN",
//       AttributeValueList: ["0973048541"],
//     },
//   },
// };

var params = {
  TableName: "user-zalo",
  ExpressionAttributeNames: { "#id1": "userid" },
  ExpressionAttributeValues: { ":id": 0973048541 },
  FilterExpression: "#id1 = :id",
  //  ProjectionExpression: "listfriends",
};
docClient.scan(params, function (err, data) {
  console.log(data);
  if (err) console.log(err);
  // an error occurred
  else console.log(data); // successful response
});
