const AWS = require("../share/connect");
const io = require("../share/socket");
const docClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-2" });

//lấy danh sách bạn bè
module.exports.getListFriends = async (req, res) => {
  const { id } = req.body;
  try {
    //const listFriends = await getStringSetFriend(id);
    const ls = await getStringSet(id, "listfriends");

    const params = {
      TableName: "user-zalo",
      AttributesToGet: ["userid", "username", "imgurl", "birthday", "gender"],
      ScanFilter: {
        userid: {
          ComparisonOperator: "IN",
          AttributeValueList: ls,
        },
      },
    };
    docClient.scan(params, function (err, data) {
      if (err) res.send({ err: err });
      else res.json(data);
    });
  } catch (error) {
    res.send(error);
  }
};

//lấy danh sách lơi mời kết bạn
module.exports.getListFriendsInvitations = async (req, res) => {
  const { id } = req.body;
  try {
    const listFriendsInvitations = await getStringSetInvitations(id);
    const params = {
      TableName: "user-zalo",
      AttributesToGet: ["userid", "username", "imgurl", "birthday", "gender"],
      ScanFilter: {
        userid: {
          ComparisonOperator: "IN",
          AttributeValueList: listFriendsInvitations,
        },
      },
    };
    docClient.scan(params, function (err, data) {
      if (err) res.send({ err: err });
      // an error occurred
      else res.json(data); // successful response
    });
  } catch (error) {
    res.send(error);
  }
};

//thêm bạn bè
module.exports.acceptFriendRequest = async (req, res) => {
  const { idYeuCauKetBan, idDongYKetBan } = req.body;
  try {
    const result = await addItemToStringSet(
      idYeuCauKetBan,
      idDongYKetBan,
      "listfriends"
    );
    const result1 = await addItemToStringSet(
      idDongYKetBan,
      idYeuCauKetBan,
      "listfriends"
    );
    const result3 = await deleteItemInStringSet(
      idDongYKetBan,
      idYeuCauKetBan,
      "listfriendinvitations"
    );
    res.status(200).json({ message: "Đã là bạn bè" });
  } catch (error) {
    res.send(error);
  }
};

module.exports.deleteFriend = async (req, res) => {
  const { id, idIsDeleted } = req.body;

  try {
    let result = await deleteItemInStringSet(id, idIsDeleted, "listfriends");
    let result1 = await deleteItemInStringSet(idIsDeleted, id, "listfriends");
    res.status(200).json({ message: "Xoa ban thanh cong" });
  } catch (error) {
    res.json({ err: error });
  }
};

// idsender sẽ được lưu trong listfriendinvitations của idreceiver
module.exports.sendFriendInvitatios = async (req, res) => {
  const { idsender, idreceiver } = req.body;

  io.emit(idreceiver, { message: "Bạn có lời mời kết bạn" });

  try {
    let result = await addItemToStringSet(
      idsender,
      idreceiver,
      "listfriendinvitations"
    );
    res.json(result);
  } catch (error) {
    res.json(error);
  }
};

module.exports.denyFriendRequest = async (req, res) => {
  const { idYeuCauKetBan, idDongYKetBan } = req.body;
  try {
    let result = await deleteItemInStringSet(
      idDongYKetBan,
      idYeuCauKetBan,
      "listfriendinvitations"
    );
    res.status(200).json({ message: "Từ chối lời mời kết bạn" });
  } catch (error) {
    res.json({ err: error });
  }
};

module.exports.findUser = async (req, res) => {
  const { id, idfind } = req.body;
  try {
    const listFriends = await getStringSetFriend(id);
    const params = {
      TableName: "user-zalo",
      AttributesToGet: ["userid", "username", "imgurl", "birthday", "gender"],
      KeyConditions: {
        userid: {
          ComparisonOperator: "EQ",
          AttributeValueList: [idfind],
        },
      },
    };
    docClient.query(params, function (err, data) {
      if (err) res.send(err);
      else {
        if (isFriend(idfind, listFriends)) {
          data.isfriend = true;

          res.status(200).json(data);
        } else {
          res.json(data);
        }
      }
    });
  } catch (error) {
    res.json({ err: error });
  }
};

// láya danh sách bạn bè
let getStringSetFriend = (id) => {
  return new Promise((resolve, reject) => {
    var params = {
      TableName: "user-zalo",
      Key: {
        userid: id,
      },
    };
    docClient.get(params, function (err, data) {
      if (err) {
        reject(err);
      } else if (!data.Item.listfriends) {
        resolve({ message: "Chưa có bạn bè" });
      } else {
        let arr = JSON.stringify(data.Item.listfriends);
        resolve(JSON.parse(arr));
      }
    });
  });
};
//lay danh sach loi moi ket ban
let getStringSetInvitations = (id) => {
  return new Promise((resolve, reject) => {
    var params = {
      TableName: "user-zalo",
      Key: {
        userid: id,
      },
    };
    docClient.get(params, function (err, data) {
      if (err) {
        reject(err);
      } else if (!data.Item.listfriendinvitations) {
        resolve({ message: "Khong có lời mời kết bạn" });
      } else {
        let arr = JSON.stringify(data.Item.listfriendinvitations);
        resolve(JSON.parse(arr));
      }
    });
  });
};

/**********************************************************************/
let deleteItemInStringSet = (id, idIsDeleted, StringSetAtt) => {
  return new Promise((resolve, reject) => {
    let params = {
      TableName: "user-zalo",
      Key: {
        userid: id,
      },
      ExpressionAttributeValues: {
        ":idToDelete": docClient.createSet([idIsDeleted]),
      },
      ExpressionAttributeNames: {
        "#AtrToDelete": StringSetAtt,
      },
      UpdateExpression: "DELETE #AtrToDelete :idToDelete",
    };
    docClient.update(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve({ message: "Xoa thanh cong" });
      }
    });
  });
};
/*****************************************/
let addItemToStringSet = (sender, receiver, StringSetAtt) => {
  return new Promise((resolve, reject) => {
    let params = {
      TableName: "user-zalo",
      Key: {
        userid: receiver,
      },
      ExpressionAttributeValues: {
        ":idIsAdded": docClient.createSet([sender]),
      },
      ExpressionAttributeNames: {
        "#Atr": StringSetAtt,
      },
      UpdateExpression: "ADD #Atr :idIsAdded",
    };
    docClient.update(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve({ message: "gửi lời mời kết bạn thành công" });
      }
    });
  });
};

let isFriend = (id, arrid) => {
  if (Array.isArray(arrid)) {
    const kp = arrid.findIndex((e) => e === id);
    if (kp >= 0) return true;
  }
  return false;
};

let getStringSet = async (id, attr) => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: "user-zalo",
      AttributesToGet: [attr],
      KeyConditions: {
        userid: {
          ComparisonOperator: "EQ",
          AttributeValueList: [id],
        },
      },
    };
    docClient.query(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        let arr = JSON.parse(JSON.stringify(data.Items));

        resolve(arr[0].listfriends);
      }
    });
  });
};
