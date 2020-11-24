const AWS = require("../share/connect");
const docClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-2" });

module.exports.getRomChat = async (req, res) => {
  const { id } = req.body;

  try {
    const ls = await getRomChatF(id);
    res.json(ls);
  } catch (error) {
    res.send(error);
  }
};
module.exports.getMessageFromRoom = (req, res) => {
  const { roomid, type } = req.body;
  var params = {
    TableName: "chat",
    KeyConditionExpression: "#pk = :romid and begins_with( #sk,:chat)",
    ScanIndexForward: false,
    ExpressionAttributeNames: {
      "#pk": "PK",
      "#sk": "SK",
    },
    ExpressionAttributeValues: {
      ":romid": roomid,
      ":chat": type,
    },
  };
  docClient.query(params, function (err, data) {
    if (err) {
      res.send(err);
    } else {
      console.log(data.Items);
      res.json(data);
    }
  });
};

let getMessageF = (romid) => {};
function getRomChatF(id) {
  return new Promise((resolve, reject) => {
    var params = {
      TableName: "chat",
      IndexName: "GSI1",
      KeyConditionExpression: "#userid = :id",
      ExpressionAttributeNames: {
        "#userid": "GSI1",
      },
      ExpressionAttributeValues: {
        ":id": id,
      },
    };
    docClient.query(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        let arr = [];
        data.Items.forEach((element) => arr.push(element.PK));
        console.log(arr);
        resolve(data);
      }
    });
  });
}
