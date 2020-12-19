const AWS = require("../share/connect");

const docClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-2" });

module.exports.getUser = (req, res) => {
  id = req.params.userid;
  console.log(id);
  var params = {
    TableName: "user-zalo",
    Key: {
      userid: id,
    },
  };
  docClient.get(params, function (err, data) {
    if (err) {
      res.status(200).send(err);
    } else {
      res.json(data);
    }
  });
};
module.exports.updateInfo = (req, res) => {
  const { id, password, birthday, gender, username } = req.body;
  console.log(req.body);
  const params = {
    TableName: "user-zalo",
    Key: {
      userid: id,
    },
    UpdateExpression: "set birthday = :b, gender=:g, username=:u",
    ExpressionAttributeValues: {
      ":b": birthday,
      ":g": gender,
      ":u": username,
      ":ps": password,
    },
    ConditionExpression: "password = :ps",
    ReturnValues: "ALL_NEW",
  };

  docClient.update(params, function (err, data) {
    if (err) {
      res.status(200).send(err);
    } else {
      res.json(data);
    }
  });
};
module.exports.register = (req, res) => {
  const { id, password, birthday, gender, username } = req.body;
  const promise = new Promise(function (resolve, reject) {
    var params1 = {
      TableName: "user-zalo",
      Key: {
        userid: id,
      },
    };
    docClient.get(params1, function (err, data) {
      if (err) {
        reject(res.status(200).send(err));
      } else {
        console.log(data);
        if (isEmpty(data)) {
          resolve("id đăng ký hợp lệ");
        } else {
          reject(res.status(200).json({ err: "Tài khoản đã tồn tại" }));
        }
      }
    });
  });
  promise
    .then(function (status) {
      var params2 = {
        TableName: "user-zalo",
        Item: {
          userid: id,
          password: password,
          birthday: birthday,
          gender: gender,
          username: username,
          imgurl: "https://material.angular.io/assets/img/examples/shiba2.jpg",
        },
      };
      docClient.put(params2, function (err, data) {
        if (err) {
          res.status(200).send(err);
        } else {
          res.json({
            Item: {
              id: id,
              password: password,
              birthday: birthday,
              gender: gender,
              username: username,
            },
          });
        }
      });
    })
    .catch((err) => res.status(200).send(err));
};

const isEmpty = (v) => {
  return Object.keys(v).length === 0;
};

module.exports.getUserById = (req, res) => {
  id = req.params.id;
  console.log(id);
  var params = {
    TableName: "user-zalo",
    FilterExpression: "userid = :id",
    ExpressionAttributeValues: { ":id": id },
  };

  var documentClient = new AWS.DynamoDB.DocumentClient();

  documentClient.scan(params, function (err, data) {
    if (err) res.send(err);
    else res.json(data);
  });
};
