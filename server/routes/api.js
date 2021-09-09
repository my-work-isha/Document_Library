const express = require('express');
const router = express.Router();
var cfenv = require("cfenv");
var ibmdb = require('ibm_db');
var https = require("https");
var multiparty = require('multiparty');
var fs = require('fs');

var bpc_cloudant;
var tsd_db2;
var sendmail;
var sendcc;
var _ = require('lodash');
var settings = require('../../settings.js');
		

//Use the VCAP_SERVICES environment variable for Bluemix environments
//Use the vcap.json file for local environment
try {
  vcapLocal = require('./vcap-local.json');
  console.log("Loaded VCAP", vcapLocal);
} catch (e) {
  console.log("The vcap.json could not be loaded")
}

const appEnvOpts = vcapLocal ? { vcap: vcapLocal } : {}
const appEnv = cfenv.getAppEnv(appEnvOpts);

//process.env.APP_ENV is undefined for local environment
console.log("Current environment = " + process.env.APP_ENV);

//console.log(process.env)    // returns the current environment variables

//Obtain Bluemail connection VCAP credentials
if (appEnv.services['bluemailservice']) {
  var appurl = appEnv.url
  var bluemail_username = appEnv.services['bluemailservice'][0].credentials.username
  var bluemail_password = appEnv.services['bluemailservice'][0].credentials.password
  var bluemail_emailUrl = appEnv.services['bluemailservice'][0].credentials.emailUrl
  var bluemail_auth = Buffer.from(bluemail_username + ":" + bluemail_password).toString('base64')
} else {
  console.log("Bluemail service is not connected to your app")
}

//Obtain Cloudant database connection VCAP credentials
if (appEnv.services['cloudantNoSQLDB']) {
  // Load the Cloudant library.
  var Cloudant = require('cloudant');

  // Initialize database with credentials
  var cloudant = Cloudant(appEnv.services['cloudantNoSQLDB'][0].credentials);

  var dbName = appEnv.services['cloudantNoSQLDB'][0].name;
  console.log("dbName = " + dbName);

  // Specify the database we are going to use (mydb)...
  bpc_cloudant = cloudant.db.use(dbName);
}

// //Obtain DB2 connection VCAP credentials
// if (appEnv.services['dashDB For Transactions']) {
//   var db2_connection = appEnv.services['dashDB For Transactions'][0].credentials.ssldsn;
// }

// var db2_connection = settings.publicdb2connectionURL;

if (process.env.APP_ENV != "dev" && process.env.APP_ENV != "test" && process.env.APP_ENV != "prod") {
  //Obtain DB2 connection VCAP credentials
  if (appEnv.services['dashDB For Transactions']) {
      var db2_connection = appEnv.services['dashDB For Transactions'][0].credentials.ssldsn;
      // console.log("we are in local loop");
  }
} else {
  var db2_connection = process.env.publicdb2connectionURL;
  console.log("db2 connection details:  ",db2_connection.split(";")[1]);
}

ibmdb.open(db2_connection, function (err, conn) {
  if (err) {
    //On error in connection, log the error message on console 
    console.error("error: ", err.message);
  } else {
		/*
    On successful connection issue the SQL query by calling the query() function on Database
    param 1: The SQL query to be issued
    param 2: The callback function to execute when the database server responds
		*/
    console.log("Connected to the BLUDB");
    tsd_db2 = conn;
    ibmdb.close(conn);    // close the DB2 connection after it is used
  }
});

/* GET api listing. */
router.get('/', (req, res) => {
  res.send('api works');
});

//save data
router.post("/insertmainform", (req, res) => {
  console.log(req.query.json);
  bpc_cloudant.insert(req.body, function (er, result) {
    //console.log(result);

    if (er) {
      throw er;
    }
    res.json(result);
  })
})

//Main form delete 
router.post("/deleteMain", (req, res) => {
  console.log(req.body);
  bpc_cloudant.insert(req.body, function (er, result) {
    console.log(result);
    if (er) {
      throw er;
    }
    res.json(result);
  })
})

//Main form delete 
router.post("/deleteChild", (req, res) => {
  console.log(req.body);
  bpc_cloudant.insert(req.body, function (er, result) {
    console.log(result);
    if (er) {
      throw er;
    }
    res.json(result);
  })
})

// To retrive data for Configuration-profile form :
router.get("/retrieveProfile", function (request, response) {
  bpc_cloudant.find(
    {
      "selector": {
        "Form": {
          "$eq": "fProfileRDL"
        }
      },
      "sort": [
        {
          "Form": "asc"
        }
      ]
    }, function (er, result) {
      if (er) {
        throw er;
      }
      var data = { "data": result.docs };
      response.json(data);
    })
});

//Profile CRUD operations
router.get("/insertprofileform", (req, res) => {
  console.log(req.query.json);
  bpc_cloudant.insert(JSON.parse(req.query.json), function (er, result) {
    //console.log(result);

    if (er) {
      throw er;
    }
    res.json(result);
  })
})

//getuser functionality
router.get('/getuser', function (req, res) {

  var user = req.user['_json'];
  console.log(req);
  //res.send('Hello '+ claims.given_name + ' ' + claims.family_name + ', your email is ' + claims.email + '<br /> <a href=\'/\'>home</a>');
  res.json(user);
});

// Query to list the view for "ByLogNumberUnLocked"
router.get("/ByLogNumberUnLocked", function (request, response) {
  var searchStr = request.query.searchStr;
  var searchFieldsStr = "Form~~~dtACRBDate~~~dtOrgDate~~~txtLogNo~~~txtCPN~~~txtChannel~~~txtLAName~~~txtAssistAnalyst~~~txtRvwType~~~txtRvwMethod~~~txtTransactionNum~~~txtEnduserTr~~~txTransactionNum~~~txEnduserTr~~~txtAttNameMisc~~~rtAttachPR";
  var searchFieldsArr = _.split(searchFieldsStr, "~~~");

  if (searchStr == "") {
    bpc_cloudant.find(
      {
        "selector": {
           "Form": {
              "$in": [
                 "frmMain",
                 "frmAllegation",
                 "frmCHW",
                 "TransDoc",
                 "frmITS",
                 "frmMiscDoc",
                 "frmPrReview",
                 "frmSW",
                 "frmCFMBGF"
              ]
           },
           "lock_status": {
              "$ne": "1"
           }
        },
        "fields": [
           "txtLogNo",
           "txtCPN",
           "txtChannel",
           "txtLAName",
           "txtAssistAnalyst",
           "txtRvwType",
           "txtRvwMethod",
           "dtOrgDate",
           "dtACRBDate",
           "lock_status:0",
           "Form",
           "txtTransactionNum",
           "txtEnduserTr",
           "txTransactionNum",
           "txEnduserTr",
           "txtAttNameMisc",
           "rtAttachPR",
           "_id",
           "_rev"
        ],
        "sort": [
           {
              "txtLogNo": "desc"
           },
           {
              "Form": "desc"
           }
        ]
     },
      function (er, result) {
        if (er) {
          throw er;
        }

        _.forEach(result.docs, function (value, key) {
          if (value.Form == 'frmMain') {
            value.Form = "Main";
          }
        })

        var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
        var data = { "data": resultdocs };
        response.json(data);
      }
    )
  } else {
    var fullsearch = "";
    for (var i = 0; i < searchFieldsArr.length; i++) {
      var n = searchFieldsArr[i].length;
      var k = searchFieldsArr[i].indexOf("|");
      var fieldName = searchFieldsArr[i].substr(k + 1, n);
      if (i != searchFieldsArr.length - 1) {
        fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}},';
      } else {
        fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}}';  // the last field search will not end with comma
      }
    }

    var strquery = '{"Form":{"$in":["frmMain", "frmAllegation", "frmCHW", "TransDoc", "frmITS", "frmMiscDoc", "frmPrReview", "frmSW", "frmCFMBGF"]},"lock_status": {"$ne": "1"},"$or":[' + fullsearch + ']}';
    var myquery = {};
    myquery = JSON.parse(strquery);

    bpc_cloudant.find({ selector: myquery }, function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        if (value.Form == 'frmMain') {
          value.Form = "Main";
        }
      })

      var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
      var data = { "data": resultdocs };
      response.json(data);
    }
    )
  }
});

// Query to list the view for "ByLogNumberUnLockedAM"
router.get("/ByLogNumberUnLockedAM", function (request, response) {
  var searchStr = request.query.searchStr;
  var searchFieldsStr = "Form~~~dtACRBDate~~~dtOrgDate~~~txtLogNo~~~txtCPN~~~txtChannel~~~txtLAName~~~txtAssistAnalyst~~~txtRvwType~~~txtRvwMethod~~~txtTransactionNum~~~txtEnduserTr~~~txTransactionNum~~~txEnduserTr~~~txtAttNameMisc~~~rtAttachPR";
  var searchFieldsArr = _.split(searchFieldsStr, "~~~");

  if (searchStr == "") {
    bpc_cloudant.find(
      {
        "selector": {
          "Form": {
            "$in": [
              "frmMain",
              "frmAllegation",
              "frmCHW",
              "TransDoc",
              "frmITS",
              "frmMiscDoc",
              "frmPrReview",
              "frmSW",
              "frmCFMBGF"
            ]
          },
          "txGeo": {
            "$eq": "AM"
          },
          "txMajorMarket": {
            "$ne": "LA IOT"
          },
          "lock_status": {
            "$ne": "1"
          }
        },
        "fields": [
          "txtLogNo",
          "txtCPN",
          "txtChannel",
          "txtLAName",
          "txtAssistAnalyst",
          "txtRvwType",
          "txtRvwMethod",
          "dtOrgDate",
          "dtACRBDate",
          "lock_status:0",
          "Form",
          "txtTransactionNum",
          "txtEnduserTr",
          "txTransactionNum",
          "txEnduserTr",
          "txtAttNameMisc",
          "rtAttachPR",
          "_id",
          "_rev"
        ],
        "sort": [
          {
            "txGeo": "desc"
         },
         {
            "Form": "desc"
         }
        ]
      },
      function (er, result) {
        if (er) {
          throw er;
        }

        _.forEach(result.docs, function (value, key) {
          if (value.Form == 'frmMain') {
            value.Form = "Main";
          }
        })

        var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
        var data = { "data": resultdocs };
        response.json(data);
      }
    )
  } else {
    var fullsearch = "";
    for (var i = 0; i < searchFieldsArr.length; i++) {
      var n = searchFieldsArr[i].length;
      var k = searchFieldsArr[i].indexOf("|");
      var fieldName = searchFieldsArr[i].substr(k + 1, n);
      if (i != searchFieldsArr.length - 1) {
        fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}},';
      } else {
        fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}}';  // the last field search will not end with comma
      }
    }

    var strquery = '{"Form":{"$in":["frmMain", "frmAllegation", "frmCHW", "TransDoc", "frmITS", "frmMiscDoc", "frmPrReview", "frmSW","frmCFMBGF"]},"lock_status": {"$ne": "1"},"txGeo": { "$eq": "AM" },"txMajorMarket": { "$ne": "LA IOT" }, "$or":[' + fullsearch + ']}';
    var myquery = {};
    myquery = JSON.parse(strquery);

    bpc_cloudant.find({ selector: myquery }, function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        if (value.Form == 'frmMain') {
          value.Form = "Main";
        }
      })

      var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
      var data = { "data": resultdocs };
      response.json(data);
    }
    )
  }
});

// Query to list the view for "ByLogNumberUnLockedAP"
router.get("/ByLogNumberUnLockedAP", function (request, response) {
  var searchStr = request.query.searchStr;
  var searchFieldsStr = "Form~~~dtACRBDate~~~dtOrgDate~~~txtLogNo~~~txtCPN~~~txtChannel~~~txtLAName~~~txtAssistAnalyst~~~txtRvwType~~~txtRvwMethod~~~txtTransactionNum~~~txtEnduserTr~~~txTransactionNum~~~txEnduserTr~~~txtAttNameMisc~~~rtAttachPR";
  var searchFieldsArr = _.split(searchFieldsStr, "~~~");

  if (searchStr == "") {
    bpc_cloudant.find(
      {
        "selector": {
          "Form": {
            "$in": [
              "frmMain",
              "frmAllegation",
              "frmCHW",
              "TransDoc",
              "frmITS",
              "frmMiscDoc",
              "frmPrReview",
              "frmSW",
              "frmCFMBGF"
            ]
          },
          "txGeo": {
            "$eq": "AP"
          },
          "txGrowthMarket": {
            "$nor": [
              {
                "$in": [
                  "Japan IMT",
                  "JPN IMT",
                  "GCG IOT"

                ]
              }
            ]
          },
          "lock_status": {
            "$ne": "1"
          }
        },
        "fields": [
          "txtLogNo",
          "txtCPN",
          "txtChannel",
          "txtLAName",
          "txtAssistAnalyst",
          "txtRvwType",
          "txtRvwMethod",
          "dtOrgDate",
          "dtACRBDate",
          "lock_status:0",
          "Form",
          "txtTransactionNum",
          "txtEnduserTr",
          "txTransactionNum",
          "txEnduserTr",
          "txtAttNameMisc",
          "rtAttachPR",
          "_id",
          "_rev"
        ],
        "sort": [
          {
            "txGeo": "desc"
         },
         {
            "Form": "desc"
         }
        ]
      },
      function (er, result) {
        if (er) {
          throw er;
        }

        _.forEach(result.docs, function (value, key) {
          if (value.Form == 'frmMain') {
            value.Form = "Main";
          }
        })

        var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
        var data = { "data": resultdocs };
        response.json(data);
      }
    )
  } else {
    var fullsearch = "";
    for (var i = 0; i < searchFieldsArr.length; i++) {
      var n = searchFieldsArr[i].length;
      var k = searchFieldsArr[i].indexOf("|");
      var fieldName = searchFieldsArr[i].substr(k + 1, n);
      if (i != searchFieldsArr.length - 1) {
        fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}},';
      } else {
        fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}}';  // the last field search will not end with comma
      }
    }

    var strquery = '{"Form":{"$in":["frmMain", "frmAllegation", "frmCHW", "TransDoc", "frmITS", "frmMiscDoc", "frmPrReview", "frmSW","frmCFMBGF"]},"lock_status": {"$ne": "1"},"txGeo": {"$eq": "AP"}, "txGrowthMarket": {"$nor": [{"$in": [ "Japan IMT","JPN IMT","GCG IOT" ] }]}, "$or":[' + fullsearch + ']}';
    var myquery = {};
    myquery = JSON.parse(strquery);

    bpc_cloudant.find({ selector: myquery }, function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        if (value.Form == 'frmMain') {
          value.Form = "Main";
        }
      })

      var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
      var data = { "data": resultdocs };
      response.json(data);
    }
    )
  }
});

// Query to list the view for "ByLogNumberUnLockedEMEA"
router.get("/ByLogNumberUnLockedEMEA", function (request, response) {
  var searchStr = request.query.searchStr;
  var searchFieldsStr = "Form~~~dtACRBDate~~~dtOrgDate~~~txtLogNo~~~txtCPN~~~txtChannel~~~txtLAName~~~txtAssistAnalyst~~~txtRvwType~~~txtRvwMethod~~~txtTransactionNum~~~txtEnduserTr~~~txTransactionNum~~~txEnduserTr~~~txtAttNameMisc~~~rtAttachPR";
  var searchFieldsArr = _.split(searchFieldsStr, "~~~");

  if (searchStr == "") {
    bpc_cloudant.find(
      {
        "selector": {
          "Form": {
            "$in": [
              "frmMain",
              "frmAllegation",
              "frmCHW",
              "TransDoc",
              "frmITS",
              "frmMiscDoc",
              "frmPrReview",
              "frmSW",
              "frmCFMBGF"
            ]
          },
          "txGeo": {
            "$eq": "EMEA"
          },
          "lock_status": {
            "$ne": "1"
          }
        },
        "fields": [
          "txtLogNo",
          "txtCPN",
          "txtChannel",
          "txtLAName",
          "txtAssistAnalyst",
          "txtRvwType",
          "txtRvwMethod",
          "dtOrgDate",
          "dtACRBDate",
          "lock_status:0",
          "Form",
          "txtTransactionNum",
          "txtEnduserTr",
          "txTransactionNum",
          "txEnduserTr",
          "txtAttNameMisc",
          "rtAttachPR",
          "_id",
          "_rev"
        ],
        "sort": [
          {
            "txGeo": "desc"
         },
         {
            "Form": "desc"
         }
        ]
      },
      function (er, result) {
        if (er) {
          throw er;
        }

        _.forEach(result.docs, function (value, key) {
          if (value.Form == 'frmMain') {
            value.Form = "Main";
          }
        })

        var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
        var data = { "data": resultdocs };
        response.json(data);
      }
    )
  } else {
    var fullsearch = "";
    for (var i = 0; i < searchFieldsArr.length; i++) {
      var n = searchFieldsArr[i].length;
      var k = searchFieldsArr[i].indexOf("|");
      var fieldName = searchFieldsArr[i].substr(k + 1, n);
      if (i != searchFieldsArr.length - 1) {
        fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}},';
      } else {
        fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}}';  // the last field search will not end with comma
      }
    }

    var strquery = '{"Form":{"$in":["frmMain", "frmAllegation", "frmCHW", "TransDoc", "frmITS", "frmMiscDoc", "frmPrReview", "frmSW","frmCFMBGF"]},"lock_status": {"$ne": "1"}, "txGeo": {"$eq": "EMEA"}, "$or":[' + fullsearch + ']}';
    var myquery = {};
    myquery = JSON.parse(strquery);

    bpc_cloudant.find({ selector: myquery }, function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        if (value.Form == 'frmMain') {
          value.Form = "Main";
        }
      })

      var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
      var data = { "data": resultdocs };
      response.json(data);
    }
    )
  }
});

// Query to list the view for "ByLogNumberUnLockedLA"
router.get("/ByLogNumberUnLockedLA", function (request, response) {
  var searchStr = request.query.searchStr;
  var searchFieldsStr = "Form~~~dtACRBDate~~~dtOrgDate~~~txtLogNo~~~txtCPN~~~txtChannel~~~txtLAName~~~txtAssistAnalyst~~~txtRvwType~~~txtRvwMethod~~~txtTransactionNum~~~txtEnduserTr~~~txTransactionNum~~~txEnduserTr~~~txtAttNameMisc~~~rtAttachPR";
  var searchFieldsArr = _.split(searchFieldsStr, "~~~");

  if (searchStr == "") {
    bpc_cloudant.find(
      {
        "selector": {
          "Form": {
            "$in": [
              "frmMain",
              "frmAllegation",
              "frmCHW",
              "TransDoc",
              "frmITS",
              "frmMiscDoc",
              "frmPrReview",
              "frmSW",
              "frmCFMBGF"
            ]
          },
          "txGeo": {
            "$eq": "AM"
          },
          "txMajorMarket": {
            "$eq": "LA IOT"
          },
          "lock_status": {
            "$ne": "1"
          }
        },
        "fields": [
          "txtLogNo",
          "txtCPN",
          "txtChannel",
          "txtLAName",
          "txtAssistAnalyst",
          "txtRvwType",
          "txtRvwMethod",
          "dtOrgDate",
          "dtACRBDate",
          "lock_status:0",
          "Form",
          "txtTransactionNum",
          "txtEnduserTr",
          "txTransactionNum",
          "txEnduserTr",
          "txtAttNameMisc",
          "rtAttachPR",
          "_id",
          "_rev"
        ],
        "sort": [
          {
            "txGeo": "desc"
         },
         {
            "Form": "desc"
         }
        ]
      },
      function (er, result) {
        if (er) {
          throw er;
        }

        _.forEach(result.docs, function (value, key) {
          if (value.Form == 'frmMain') {
            value.Form = "Main";
          }
        })

        var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
        var data = { "data": resultdocs };
        response.json(data);
      }
    )
  } else {
    var fullsearch = "";
    for (var i = 0; i < searchFieldsArr.length; i++) {
      var n = searchFieldsArr[i].length;
      var k = searchFieldsArr[i].indexOf("|");
      var fieldName = searchFieldsArr[i].substr(k + 1, n);
      if (i != searchFieldsArr.length - 1) {
        fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}},';
      } else {
        fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}}';  // the last field search will not end with comma
      }
    }

    var strquery = '{"Form":{"$in":["frmMain", "frmAllegation", "frmCHW", "TransDoc", "frmITS", "frmMiscDoc", "frmPrReview", "frmSW","frmCFMBGF"]},"lock_status": {"$ne": "1"}, "txGeo": {"$eq": "AM"}, "txMajorMarket": { "$eq": "LA IOT" }, "$or":[' + fullsearch + ']}';
    var myquery = {};
    myquery = JSON.parse(strquery);

    bpc_cloudant.find({ selector: myquery }, function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        if (value.Form == 'frmMain') {
          value.Form = "Main";
        }
      })

      var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
      var data = { "data": resultdocs };
      response.json(data);
    }
    )
  }
});

// Query to list the view for "ByLogNumberUnLockedJAPAN"
router.get("/ByLogNumberUnLockedJAPAN", function (request, response) {
  var searchStr = request.query.searchStr;
  var searchFieldsStr = "Form~~~dtACRBDate~~~dtOrgDate~~~txtLogNo~~~txtCPN~~~txtChannel~~~txtLAName~~~txtAssistAnalyst~~~txtRvwType~~~txtRvwMethod~~~txtTransactionNum~~~txtEnduserTr~~~txTransactionNum~~~txEnduserTr~~~txtAttNameMisc~~~rtAttachPR";
  var searchFieldsArr = _.split(searchFieldsStr, "~~~");

  if (searchStr == "") {
    bpc_cloudant.find(
      {
        "selector": {
          "Form": {
            "$in": [
              "frmMain",
              "frmAllegation",
              "frmCHW",
              "TransDoc",
              "frmITS",
              "frmMiscDoc",
              "frmPrReview",
              "frmSW",
              "frmCFMBGF"
            ]
          },
          "txGeo": {
            "$eq": "AP"
          },
          "txGrowthMarket": {
            "$or": [
              {
                "$in": [
                  "Japan IMT",
                  "JPN IMT"
                ]
              }
            ]
          },
          "lock_status": {
            "$ne": "1"
          }
        },
        "fields": [
          "txtLogNo",
          "txtCPN",
          "txtChannel",
          "txtLAName",
          "txtAssistAnalyst",
          "txtRvwType",
          "txtRvwMethod",
          "dtOrgDate",
          "dtACRBDate",
          "lock_status:0",
          "Form",
          "txtTransactionNum",
          "txtEnduserTr",
          "txTransactionNum",
          "txEnduserTr",
          "txtAttNameMisc",
          "rtAttachPR",
          "_id",
          "_rev"
        ],
        "sort": [
          {
            "txGeo": "desc"
         },
         {
            "Form": "desc"
         }
        ]
      },
      function (er, result) {
        if (er) {
          throw er;
        }

        _.forEach(result.docs, function (value, key) {
          if (value.Form == 'frmMain') {
            value.Form = "Main";
          }
        })

        var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
        var data = { "data": resultdocs };
        response.json(data);
      }
    )
  } else {
    var fullsearch = "";
    for (var i = 0; i < searchFieldsArr.length; i++) {
      var n = searchFieldsArr[i].length;
      var k = searchFieldsArr[i].indexOf("|");
      var fieldName = searchFieldsArr[i].substr(k + 1, n);
      if (i != searchFieldsArr.length - 1) {
        fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}},';
      } else {
        fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}}';  // the last field search will not end with comma
      }
    }

    var strquery = '{"Form":{"$in":["frmMain", "frmAllegation", "frmCHW", "TransDoc", "frmITS", "frmMiscDoc", "frmPrReview", "frmSW","frmCFMBGF"]},"lock_status": {"$ne": "1"},"txGeo": {"$eq": "AP"}, "txGrowthMarket": {"$or": [{"$in": [ "Japan IMT","JPN IMT" ] }]}, "$or":[' + fullsearch + ']}';
    var myquery = {};
    myquery = JSON.parse(strquery);

    bpc_cloudant.find({ selector: myquery }, function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        if (value.Form == 'frmMain') {
          value.Form = "Main";
        }
      })

      var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
      var data = { "data": resultdocs };
      response.json(data);
    }
    )
  }
});


// Query to list the view for "ByLogNumberUnLockedGCG"
router.get("/ByLogNumberUnLockedGCG", function (request, response) {
  var searchStr = request.query.searchStr;
  var searchFieldsStr = "Form~~~dtACRBDate~~~dtOrgDate~~~txtLogNo~~~txtCPN~~~txtChannel~~~txtLAName~~~txtAssistAnalyst~~~txtRvwType~~~txtRvwMethod~~~txtTransactionNum~~~txtEnduserTr~~~txTransactionNum~~~txEnduserTr~~~txtAttNameMisc~~~rtAttachPR";
  var searchFieldsArr = _.split(searchFieldsStr, "~~~");

  if (searchStr == "") {
    bpc_cloudant.find(
      {
        "selector": {
          "Form": {
            "$in": [
              "frmMain",
              "frmAllegation",
              "frmCHW",
              "TransDoc",
              "frmITS",
              "frmMiscDoc",
              "frmPrReview",
              "frmSW",
              "frmCFMBGF"
            ]
          },
          "txGeo": {
            "$eq": "AP"
          },
          "$or": [
            {
              "txGrowthMarket": "GCG IOT"
            },
            {
              "txMajorMarket": "GCG IOT"
            }
          ],
          "lock_status": {
            "$ne": "1"
          }
        },
        "fields": [
          "txtLogNo",
          "txtCPN",
          "txtChannel",
          "txtLAName",
          "txtAssistAnalyst",
          "txtRvwType",
          "txtRvwMethod",
          "dtOrgDate",
          "dtACRBDate",
          "lock_status:0",
          "Form",
          "txtTransactionNum",
          "txtEnduserTr",
          "txTransactionNum",
          "txEnduserTr",
          "txtAttNameMisc",
          "rtAttachPR",
          "txGrowthMarket",
          "_id",
          "_rev"
        ],
        "sort": [
          {
            "txGeo": "desc"
         },
         {
            "Form": "desc"
         }
        ]
      },
      function (er, result) {
        if (er) {
          throw er;
        }

        _.forEach(result.docs, function (value, key) {
          if (value.Form == 'frmMain') {
            value.Form = "Main";
          }
        })

        var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
        var data = { "data": resultdocs };
        response.json(data);
      }
    )
  } else {
    var fullsearch = "";
    for (var i = 0; i < searchFieldsArr.length; i++) {
      var n = searchFieldsArr[i].length;
      var k = searchFieldsArr[i].indexOf("|");
      var fieldName = searchFieldsArr[i].substr(k + 1, n);
      if (i != searchFieldsArr.length - 1) {
        fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}},';
      } else {
        fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}}';  // the last field search will not end with comma
      }
    }

    var strquery = '{"Form":{"$in":["frmMain", "frmAllegation", "frmCHW", "TransDoc", "frmITS", "frmMiscDoc", "frmPrReview", "frmSW","frmCFMBGF"]},"lock_status": {"$ne": "1"},"txGeo": {"$eq": "AP"}, "txGrowthMarket": {"$or": [{"$in": [ "GCG IOT" ] }]}, "$or":[' + fullsearch + ']}';
    var myquery = {};
    myquery = JSON.parse(strquery);

    bpc_cloudant.find({ selector: myquery }, function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        if (value.Form == 'frmMain') {
          value.Form = "Main";
        }
      })

      var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
      var data = { "data": resultdocs };
      response.json(data);
    }
    )
  }
});




router.get("/countrymaster", function (request, response) {
  bpc_cloudant.find(
    {
      "selector": {
        "Form": {
          "$eq": "fCountryMaster"
        }
      },
      "fields": [
        "txCountryKeywd",
        "txMajorKeywd",
        "txGrowthKeywd",
        "txGMRKeywd",
        "Form",
        "_id",
        "_rev"
      ],
      "sort": [
        {
          "txCountryKeywd": "asc"
        }
      ]
    }, function (er, result) {
      // console.log("result",result);

      if (er) {
        throw er;
      }
      var data = { "data": result.docs };
      response.json(data);
    })
});

// by log number needed for categorization
router.get("/ByLogNumberCategorization", function (request, response) {
  bpc_cloudant.find(
    {
      "selector": {
        "Form": {
          "$in": [
            "frmMain",
            "frmAllegation",
            "frmCHW",
            "TransDoc",
            "frmITS",
            "frmMiscDoc",
            "frmPrReview",
            "frmSW",
            "frmCFMBGF"]
        }
      },
      "fields": [
        "txtLogNo",
        "txtCPN",
        "txtChannel",
        "txtLAName",
        "txtAssistAnalyst",
        "txtRvwType",
        "txtRvwMethod",
        "dtOrgDate",
        "dtACRBDate",
        "lock_status:0",
        "Form",
        "_id",
        "_rev"
      ],
      "sort": [
        {
          "_id": "asc"
        }
      ]
    },
    function (er, result) {
      if (er) {
        throw er;
      }
      // var data ={"data":result.docs};
      response.json(result.docs);
    }
  )
});

//Fetch all children if LogNo is passed
router.post("/getAllChildren", function (request, response) {
  var mbp = request.body;
  bpc_cloudant.find(
    {
      "selector": {
        "\\$REF": mbp._id
      }
    },
    function (er, result) {
      if (er) {
        throw er;
      }
      var data = result.docs;
      response.json(data);
      
      for (let k = 0; k < data.length; k++) {
        data[k].lock_status = mbp.lock_status;
        data[k].txtStatus = mbp.txtStatus;
        data[k].signature = mbp.signature;
        data[k].sigtimestamp = mbp.sigtimestamp;
        data[k].txtCPN = mbp.txtCPN;
        data[k].dtACRBDate = mbp.dtACRBDate;
        data[k].txtAssistAnalyst = mbp.txtAssistAnalyst;
        data[k].txtLAName = mbp.txtLAName;
        data[k].dlgLogApprovers = mbp.dlgLogApprovers;
        data[k].txtChannel = mbp.txtChannel;
        data[k].txCountry = mbp.txCountry;
        data[k].txGrowthMarket = mbp.txGrowthMarket;
        data[k].txMajorMarket = mbp.txMajorMarket;
        data[k].txGeo = mbp.txGeo;
        data[k].dtmodified = mbp.dtmodified;
        bpc_cloudant.insert(data[k], function (er, result1) {
          if (er) {
            throw er;
          }
        })
      }
    }
  )
})

// Query to list the view for "By ByLogNumberLocked"
router.get("/ByLogNumberLocked", function (request, response) {
  var searchStr = request.query.searchStr;
  var searchFieldsStr = "Form~~~dtACRBDate~~~dtOrgDate~~~txtLogNo~~~txtCPN~~~txtChannel~~~txtLAName~~~txtAssistAnalyst~~~txtRvwType~~~txtRvwMethod~~~txtTransactionNum~~~txtEnduserTr~~~txTransactionNum~~~txEnduserTr~~~txtAttNameMisc~~~rtAttachPR";
  var searchFieldsArr = _.split(searchFieldsStr, "~~~");

  if (searchStr == "") {
    bpc_cloudant.find(
      {
        "selector": {
          "Form": {
            "$in": [
              "frmMain",
              "frmAllegation",
              "frmCHW",
              "TransDoc",
              "frmITS",
              "frmMiscDoc",
              "frmPrReview",
              "frmSW",
              "frmCFMBGF"
            ]
          },
          "lock_status": {
            "$eq": "1"
          }
        },
        "fields": [
          "txtLogNo",
          "txtCPN",
          "txtChannel",
          "txtLAName",
          "txtAssistAnalyst",
          "txtRvwType",
          "txtRvwMethod",
          "dtOrgDate",
          "dtACRBDate",
          "lock_status:0",
          "txtTransactionNum",
          "txtEnduserTr",
          "txTransactionNum",
          "txEnduserTr",
          "txtAttNameMisc",
          "rtAttachPR",
          "Form",
          "_id",
          "_rev"
        ],
        "sort": [
          {
            "txtLogNo": "desc"
          }
        ]
      },
      function (er, result) {
        if (er) {
          throw er;
        }

        _.forEach(result.docs, function (value, key) {
          if (value.Form == 'frmMain') {
            value.Form = "Main";
          }
        })

        var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
        var data = { "data": resultdocs };
        response.json(data);
      }
    )
  } else {
    var fullsearch = "";
    for (var i = 0; i < searchFieldsArr.length; i++) {
      var n = searchFieldsArr[i].length;
      var k = searchFieldsArr[i].indexOf("|");
      var fieldName = searchFieldsArr[i].substr(k + 1, n);
      if (i != searchFieldsArr.length - 1) {
        fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}},';
      } else {
        fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}}';  // the last field search will not end with comma
      }
    }

    var strquery = '{"Form":{"$in":["frmMain", "frmAllegation", "frmCHW", "TransDoc", "frmITS", "frmMiscDoc", "frmPrReview", "frmSW","frmCFMBGF"]},"lock_status": {"$eq": "1"},"$or":[' + fullsearch + ']}';
    var myquery = {};
    myquery = JSON.parse(strquery);

    bpc_cloudant.find({ selector: myquery }, function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        if (value.Form == 'frmMain') {
          value.Form = "Main";
        }
      })

      var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
      var data = { "data": resultdocs };
      response.json(data);
    }
    )
  }
});

// Query to list the view for "By ByLogNumberLockedAM"
router.get("/ByLogNumberLockedAM", function (request, response) {
  var searchStr = request.query.searchStr;
  var searchFieldsStr = "Form~~~dtACRBDate~~~dtOrgDate~~~txtLogNo~~~txtCPN~~~txtChannel~~~txtLAName~~~txtAssistAnalyst~~~txtRvwType~~~txtRvwMethod~~~txtTransactionNum~~~txtEnduserTr~~~txTransactionNum~~~txEnduserTr~~~txtAttNameMisc~~~rtAttachPR";
  var searchFieldsArr = _.split(searchFieldsStr, "~~~");

  if (searchStr == "") {
    bpc_cloudant.find(
      {
        "selector": {
          "Form": {
            "$in": [
              "frmMain",
              "frmAllegation",
              "frmCHW",
              "TransDoc",
              "frmITS",
              "frmMiscDoc",
              "frmPrReview",
              "frmSW",
              "frmCFMBGF"
            ]
          },
          "txGeo": {
            "$eq": "AM"
          },
          "txMajorMarket": {
            "$ne": "LA IOT"
          },
          "lock_status": {
            "$eq": "1"
          }
        },
        "fields": [
          "txtLogNo",
          "txtCPN",
          "txtChannel",
          "txtLAName",
          "txtAssistAnalyst",
          "txtRvwType",
          "txtRvwMethod",
          "dtOrgDate",
          "dtACRBDate",
          "lock_status:0",
          "txtTransactionNum",
          "txtEnduserTr",
          "txTransactionNum",
          "txEnduserTr",
          "txtAttNameMisc",
          "rtAttachPR",
          "Form",
          "_id",
          "_rev"
        ],
        "sort": [
          {
            "txGeo": "desc"
         },
         {
            "Form": "desc"
         }
        ]
      },
      function (er, result) {
        if (er) {
          throw er;
        }

        _.forEach(result.docs, function (value, key) {
          if (value.Form == 'frmMain') {
            value.Form = "Main";
          }
        })

        var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
        var data = { "data": resultdocs };
        response.json(data);
      }
    )
  } else {
    var fullsearch = "";
    for (var i = 0; i < searchFieldsArr.length; i++) {
      var n = searchFieldsArr[i].length;
      var k = searchFieldsArr[i].indexOf("|");
      var fieldName = searchFieldsArr[i].substr(k + 1, n);
      if (i != searchFieldsArr.length - 1) {
        fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}},';
      } else {
        fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}}';  // the last field search will not end with comma
      }
    }

    var strquery = '{"Form":{"$in":["frmMain", "frmAllegation", "frmCHW", "TransDoc", "frmITS", "frmMiscDoc", "frmPrReview", "frmSW","frmCFMBGF"]},"lock_status": {"$eq": "1"},"txGeo": { "$eq": "AM" },"txMajorMarket": { "$ne": "LA IOT" },"$or":[' + fullsearch + ']}';
    var myquery = {};
    myquery = JSON.parse(strquery);

    bpc_cloudant.find({ selector: myquery }, function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        if (value.Form == 'frmMain') {
          value.Form = "Main";
        }
      })

      var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
      var data = { "data": resultdocs };
      response.json(data);
    }
    )
  }
});

// Query to list the view for "By ByLogNumberLockedAP"
router.get("/ByLogNumberLockedAP", function (request, response) {
  var searchStr = request.query.searchStr;
  var searchFieldsStr = "Form~~~dtACRBDate~~~dtOrgDate~~~txtLogNo~~~txtCPN~~~txtChannel~~~txtLAName~~~txtAssistAnalyst~~~txtRvwType~~~txtRvwMethod~~~txtTransactionNum~~~txtEnduserTr~~~txTransactionNum~~~txEnduserTr~~~txtAttNameMisc~~~rtAttachPR";
  var searchFieldsArr = _.split(searchFieldsStr, "~~~");

  if (searchStr == "") {
    bpc_cloudant.find(
      {
        "selector": {
          "Form": {
            "$in": [
              "frmMain",
              "frmAllegation",
              "frmCHW",
              "TransDoc",
              "frmITS",
              "frmMiscDoc",
              "frmPrReview",
              "frmSW",
              "frmCFMBGF"
            ]
          },
          "txGeo": {
            "$eq": "AP"
          },
          "txGrowthMarket": {
            "$nor": [
              {
                "$in": [
                  "Japan IMT",
                  "JPN IMT",
                  "GCG IOT"
                ]
              }
            ]
          },
          "lock_status": {
            "$eq": "1"
          }
        },
        "fields": [
          "txtLogNo",
          "txtCPN",
          "txtChannel",
          "txtLAName",
          "txtAssistAnalyst",
          "txtRvwType",
          "txtRvwMethod",
          "dtOrgDate",
          "dtACRBDate",
          "lock_status:0",
          "txtTransactionNum",
          "txtEnduserTr",
          "txTransactionNum",
          "txEnduserTr",
          "txtAttNameMisc",
          "rtAttachPR",
          "Form",
          "_id",
          "_rev"
        ],
        "sort": [
          {
            "txGeo": "desc"
         },
         {
            "Form": "desc"
         }
        ]
      },
      function (er, result) {
        if (er) {
          throw er;
        }

        _.forEach(result.docs, function (value, key) {
          if (value.Form == 'frmMain') {
            value.Form = "Main";
          }
        })

        var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
        var data = { "data": resultdocs };
        response.json(data);
      }
    )
  } else {
    var fullsearch = "";
    for (var i = 0; i < searchFieldsArr.length; i++) {
      var n = searchFieldsArr[i].length;
      var k = searchFieldsArr[i].indexOf("|");
      var fieldName = searchFieldsArr[i].substr(k + 1, n);
      if (i != searchFieldsArr.length - 1) {
        fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}},';
      } else {
        fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}}';  // the last field search will not end with comma
      }
    }

    var strquery = '{"Form":{"$in":["frmMain", "frmAllegation", "frmCHW", "TransDoc", "frmITS", "frmMiscDoc", "frmPrReview", "frmSW","frmCFMBGF"]},"lock_status": {"$eq": "1"}, "txGeo": {"$eq": "AP"}, "txGrowthMarket": {"$nor": [{"$in": [ "Japan IMT","JPN IMT", "GCG IOT" ] }]},"$or":[' + fullsearch + ']}';
    var myquery = {};
    myquery = JSON.parse(strquery);

    bpc_cloudant.find({ selector: myquery }, function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        if (value.Form == 'frmMain') {
          value.Form = "Main";
        }
      })

      var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
      var data = { "data": resultdocs };
      response.json(data);
    }
    )
  }
});

// Query to list the view for "By ByLogNumberLockedEMEA"
router.get("/ByLogNumberLockedEMEA", function (request, response) {
  var searchStr = request.query.searchStr;
  var searchFieldsStr = "Form~~~dtACRBDate~~~dtOrgDate~~~txtLogNo~~~txtCPN~~~txtChannel~~~txtLAName~~~txtAssistAnalyst~~~txtRvwType~~~txtRvwMethod~~~txtTransactionNum~~~txtEnduserTr~~~txTransactionNum~~~txEnduserTr~~~txtAttNameMisc~~~rtAttachPR";
  var searchFieldsArr = _.split(searchFieldsStr, "~~~");

  if (searchStr == "") {
    bpc_cloudant.find(
      {
        "selector": {
          "Form": {
            "$in": [
              "frmMain",
              "frmAllegation",
              "frmCHW",
              "TransDoc",
              "frmITS",
              "frmMiscDoc",
              "frmPrReview",
              "frmSW",
              "frmCFMBGF"
            ]
          },
          "txGeo": {
            "$eq": "EMEA"
          },
          "lock_status": {
            "$eq": "1"
          }
        },
        "fields": [
          "txtLogNo",
          "txtCPN",
          "txtChannel",
          "txtLAName",
          "txtAssistAnalyst",
          "txtRvwType",
          "txtRvwMethod",
          "dtOrgDate",
          "dtACRBDate",
          "lock_status:0",
          "txtTransactionNum",
          "txtEnduserTr",
          "txTransactionNum",
          "txEnduserTr",
          "txtAttNameMisc",
          "rtAttachPR",
          "Form",
          "_id",
          "_rev"
        ],
        "sort": [
          {
            "txGeo": "desc"
         },
         {
            "Form": "desc"
         }
        ]
      },
      function (er, result) {
        if (er) {
          throw er;
        }

        _.forEach(result.docs, function (value, key) {
          if (value.Form == 'frmMain') {
            value.Form = "Main";
          }
        })

        var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
        var data = { "data": resultdocs };
        response.json(data);
      }
    )
  } else {
    var fullsearch = "";
    for (var i = 0; i < searchFieldsArr.length; i++) {
      var n = searchFieldsArr[i].length;
      var k = searchFieldsArr[i].indexOf("|");
      var fieldName = searchFieldsArr[i].substr(k + 1, n);
      if (i != searchFieldsArr.length - 1) {
        fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}},';
      } else {
        fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}}';  // the last field search will not end with comma
      }
    }

    var strquery = '{"Form":{"$in":["frmMain", "frmAllegation", "frmCHW", "TransDoc", "frmITS", "frmMiscDoc", "frmPrReview", "frmSW","frmCFMBGF"]},"lock_status": {"$eq": "1"}, "txGeo": {"$eq": "EMEA"},"$or":[' + fullsearch + ']}';
    var myquery = {};
    myquery = JSON.parse(strquery);

    bpc_cloudant.find({ selector: myquery }, function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        if (value.Form == 'frmMain') {
          value.Form = "Main";
        }
      })

      var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
      var data = { "data": resultdocs };
      response.json(data);
    }
    )
  }
});

// Query to list the view for "By ByLogNumberLockedLA"
router.get("/ByLogNumberLockedLA", function (request, response) {
  var searchStr = request.query.searchStr;
  var searchFieldsStr = "Form~~~dtACRBDate~~~dtOrgDate~~~txtLogNo~~~txtCPN~~~txtChannel~~~txtLAName~~~txtAssistAnalyst~~~txtRvwType~~~txtRvwMethod~~~txtTransactionNum~~~txtEnduserTr~~~txTransactionNum~~~txEnduserTr~~~txtAttNameMisc~~~rtAttachPR";
  var searchFieldsArr = _.split(searchFieldsStr, "~~~");

  if (searchStr == "") {
    bpc_cloudant.find(
      {
        "selector": {
          "Form": {
            "$in": [
              "frmMain",
              "frmAllegation",
              "frmCHW",
              "TransDoc",
              "frmITS",
              "frmMiscDoc",
              "frmPrReview",
              "frmSW",
              "frmCFMBGF"
            ]
          },
          "txGeo": {
            "$eq": "AM"
          },
          "txMajorMarket": {
            "$eq": "LA IOT"
          },
          "lock_status": {
            "$eq": "1"
          }
        },
        "fields": [
          "txtLogNo",
          "txtCPN",
          "txtChannel",
          "txtLAName",
          "txtAssistAnalyst",
          "txtRvwType",
          "txtRvwMethod",
          "dtOrgDate",
          "dtACRBDate",
          "lock_status:0",
          "txtTransactionNum",
          "txtEnduserTr",
          "txTransactionNum",
          "txEnduserTr",
          "txtAttNameMisc",
          "rtAttachPR",
          "Form",
          "_id",
          "_rev"
        ],
        "sort": [
          {
            "txGeo": "desc"
         },
         {
            "Form": "desc"
         }
        ]
      },
      function (er, result) {
        if (er) {
          throw er;
        }

        _.forEach(result.docs, function (value, key) {
          if (value.Form == 'frmMain') {
            value.Form = "Main";
          }
        })

        var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
        var data = { "data": resultdocs };
        response.json(data);
      }
    )
  } else {
    var fullsearch = "";
    for (var i = 0; i < searchFieldsArr.length; i++) {
      var n = searchFieldsArr[i].length;
      var k = searchFieldsArr[i].indexOf("|");
      var fieldName = searchFieldsArr[i].substr(k + 1, n);
      if (i != searchFieldsArr.length - 1) {
        fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}},';
      } else {
        fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}}';  // the last field search will not end with comma
      }
    }

    var strquery = '{"Form":{"$in":["frmMain", "frmAllegation", "frmCHW", "TransDoc", "frmITS", "frmMiscDoc", "frmPrReview", "frmSW","frmCFMBGF"]},"lock_status": {"$eq": "1"}, "txGeo": {"$eq": "AM"}, "txMajorMarket": { "$eq": "LA IOT" },"$or":[' + fullsearch + ']}';
    var myquery = {};
    myquery = JSON.parse(strquery);

    bpc_cloudant.find({ selector: myquery }, function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        if (value.Form == 'frmMain') {
          value.Form = "Main";
        }
      })

      var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
      var data = { "data": resultdocs };
      response.json(data);
    }
    )
  }
});

// Query to list the view for "By ByLogNumberLockedJAPAN"
router.get("/ByLogNumberLockedJAPAN", function (request, response) {
  var searchStr = request.query.searchStr;
  var searchFieldsStr = "Form~~~dtACRBDate~~~dtOrgDate~~~txtLogNo~~~txtCPN~~~txtChannel~~~txtLAName~~~txtAssistAnalyst~~~txtRvwType~~~txtRvwMethod~~~txtTransactionNum~~~txtEnduserTr~~~txTransactionNum~~~txEnduserTr~~~txtAttNameMisc~~~rtAttachPR";
  var searchFieldsArr = _.split(searchFieldsStr, "~~~");

  if (searchStr == "") {
    bpc_cloudant.find(
      {
        "selector": {
          "Form": {
            "$in": [
              "frmMain",
              "frmAllegation",
              "frmCHW",
              "TransDoc",
              "frmITS",
              "frmMiscDoc",
              "frmPrReview",
              "frmSW",
              "frmCFMBGF"
            ]
          },
          "txGeo": {
            "$eq": "AP"
          },
          "txGrowthMarket": {
            "$or": [
              {
                "$in": [
                  "Japan IMT",
                  "JPN IMT"
                ]
              }
            ]
          },
          "lock_status": {
            "$eq": "1"
          }
        },
        "fields": [
          "txtLogNo",
          "txtCPN",
          "txtChannel",
          "txtLAName",
          "txtAssistAnalyst",
          "txtRvwType",
          "txtRvwMethod",
          "dtOrgDate",
          "dtACRBDate",
          "lock_status:0",
          "txtTransactionNum",
          "txtEnduserTr",
          "txTransactionNum",
          "txEnduserTr",
          "txtAttNameMisc",
          "rtAttachPR",
          "Form",
          "_id",
          "_rev"
        ],
        "sort": [
          {
            "txGeo": "desc"
         },
         {
            "Form": "desc"
         }
        ]
      },
      function (er, result) {
        if (er) {
          throw er;
        }

        _.forEach(result.docs, function (value, key) {
          if (value.Form == 'frmMain') {
            value.Form = "Main";
          }
        })

        var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
        var data = { "data": resultdocs };
        response.json(data);
      }
    )
  } else {
    var fullsearch = "";
    for (var i = 0; i < searchFieldsArr.length; i++) {
      var n = searchFieldsArr[i].length;
      var k = searchFieldsArr[i].indexOf("|");
      var fieldName = searchFieldsArr[i].substr(k + 1, n);
      if (i != searchFieldsArr.length - 1) {
        fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}},';
      } else {
        fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}}';  // the last field search will not end with comma
      }
    }

    var strquery = '{"Form":{"$in":["frmMain", "frmAllegation", "frmCHW", "TransDoc", "frmITS", "frmMiscDoc", "frmPrReview", "frmSW","frmCFMBGF"]},"lock_status": {"$eq": "1"},"txGeo": {"$eq": "AP"}, "txGrowthMarket": {"$or": [{"$in": [ "Japan IMT","JPN IMT" ] }]},"$or":[' + fullsearch + ']}';
    var myquery = {};
    myquery = JSON.parse(strquery);

    bpc_cloudant.find({ selector: myquery }, function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        if (value.Form == 'frmMain') {
          value.Form = "Main";
        }
      })

      var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
      var data = { "data": resultdocs };
      response.json(data);
    }
    )
  }
});

// Query to list the view for "By ByLogNumberLockedGCG"
router.get("/ByLogNumberLockedGCG", function (request, response) {
  var searchStr = request.query.searchStr;
  var searchFieldsStr = "Form~~~dtACRBDate~~~dtOrgDate~~~txtLogNo~~~txtCPN~~~txtChannel~~~txtLAName~~~txtAssistAnalyst~~~txtRvwType~~~txtRvwMethod~~~txtTransactionNum~~~txtEnduserTr~~~txTransactionNum~~~txEnduserTr~~~txtAttNameMisc~~~rtAttachPR";
  var searchFieldsArr = _.split(searchFieldsStr, "~~~");

  if (searchStr == "") {
    bpc_cloudant.find(
      {
        "selector": {
          "Form": {
            "$in": [
              "frmMain",
              "frmAllegation",
              "frmCHW",
              "TransDoc",
              "frmITS",
              "frmMiscDoc",
              "frmPrReview",
              "frmSW",
              "frmCFMBGF"
            ]
          },
          "txGeo": {
            "$eq": "AP"
          },

          "$or": [
            {
              "txGrowthMarket": {
                "$eq": "GCG IOT"
              }
            },
            {
              "txMajorMarket": {
                "$eq": "GCG IOT"
              }
            }
          ],
          "lock_status": {
            "$eq": "1"
          }
        },
        "fields": [
          "txtLogNo",
          "txtCPN",
          "txtChannel",
          "txtLAName",
          "txtAssistAnalyst",
          "txtRvwType",
          "txtRvwMethod",
          "dtOrgDate",
          "dtACRBDate",
          "lock_status:0",
          "txtTransactionNum",
          "txtEnduserTr",
          "txTransactionNum",
          "txEnduserTr",
          "txtAttNameMisc",
          "rtAttachPR",
          "Form",
          "_id",
          "_rev"
        ],
        "sort": [
          {
            "txGeo": "desc"
         },
         {
            "Form": "desc"
         }
        ]
      },
      function (er, result) {
        if (er) {
          throw er;
        }

        _.forEach(result.docs, function (value, key) {
          if (value.Form == 'frmMain') {
            value.Form = "Main";
          }
        })

        var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
        var data = { "data": resultdocs };
        response.json(data);
      }
    )
  } else {
    var fullsearch = "";
    for (var i = 0; i < searchFieldsArr.length; i++) {
      var n = searchFieldsArr[i].length;
      var k = searchFieldsArr[i].indexOf("|");
      var fieldName = searchFieldsArr[i].substr(k + 1, n);
      if (i != searchFieldsArr.length - 1) {
        fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}},';
      } else {
        fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}}';  // the last field search will not end with comma
      }
    }

    var strquery = '{"Form":{"$in":["frmMain", "frmAllegation", "frmCHW", "TransDoc", "frmITS", "frmMiscDoc", "frmPrReview", "frmSW","frmCFMBGF"]},"lock_status": {"$eq": "1"},"txGeo": {"$eq": "AP"}, "txGrowthMarket": {"$eq":"GCG IOT"},"$or":[' + fullsearch + ']}';
    var myquery = {};
    myquery = JSON.parse(strquery);

    bpc_cloudant.find({ selector: myquery }, function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        if (value.Form == 'frmMain') {
          value.Form = "Main";
        }
      })

      var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
      var data = { "data": resultdocs };
      response.json(data);
    }
    )
  }
});

// Query to list the view for "ByLeadAnalystUnLocked"
router.get("/ByLeadAnalystUnLocked", function (request, response) {
  bpc_cloudant.find(
    {
      "selector": {
        "Form": {
          "$in": [
            "frmMain",
            "frmAllegation",
            "frmCHW",
            "TransDoc",
            "frmITS",
            "frmMiscDoc",
            "frmPrReview",
            "frmSW",
            "frmCFMBGF"
          ]
        },
        "lock_status": {
          "$ne": "1"
        }
      },
      "fields": [
        "txtLAName",
        "txtLogNo",
        "txtCPN",
        "txtChannel",
        "txtAssistAnalyst",
        "txtRvwType",
        "txtRvwMethod",
        "dtOrgDate",
        "dtACRBDate",
        "Form",
        "txtTransactionNum",
        "txtEnduserTr",
        "txTransactionNum",
        "txEnduserTr",
        "txtAttNameMisc",
        "rtAttachPR",
        "_id",
        "_rev"
      ],
      "sort": [
        {
          "txtLAName": "asc"
        }
      ]
    },
    function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        var tempTransNum = "";
        var tempEndUser = "";
        if (value.Form == "frmMain") {
          value.Form = "*Main";
        } else if (value.Form == "frmAllegation") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Allegation" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCHW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CHW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "TransDoc") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmITS") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "ITS/MTS/TSS Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmMiscDoc") {
          if (value.txtAttNameMisc && value.txtAttNameMisc != "" && value.txtAttNameMisc != "undefined") {
            tempTransNum = ": " + value.txtAttNameMisc;
          }
          value.Form = "Misc Doc" + tempTransNum;
        } else if (value.Form == "frmPrReview") {
          if (value.rtAttachPR && value.rtAttachPR != "" && value.rtAttachPR != "undefined") {
            tempTransNum = ": " + value.rtAttachPR;
          }
          value.Form = "Peer Review Results" + tempTransNum;
        } else if (value.Form == "frmSW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "SW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCFMBGF") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CFM BGF Transaction" + tempTransNum + tempEndUser;
        }
      })

      // sorting the view by default when the view loads
      var result = _.orderBy(result.docs, ['txtLAName', 'txtLogNo', doc => doc.Form.toLowerCase()], ['asc', 'desc', 'asc']);
      var data = { "data": result };
      response.json(data);
    })
});

// Query to list the view for "ByLeadAnalystUnLockedAM"
router.get("/ByLeadAnalystUnLockedAM", function (request, response) {
  bpc_cloudant.find(
    {
      "selector": {
        "Form": {
          "$in": [
            "frmMain",
            "frmAllegation",
            "frmCHW",
            "TransDoc",
            "frmITS",
            "frmMiscDoc",
            "frmPrReview",
            "frmSW",
            "frmCFMBGF"
          ]
        },
        "txGeo": {
          "$eq": "AM"
        },
        "txMajorMarket": {
          "$ne": "LA IOT"
        },
        "lock_status": {
          "$ne": "1"
        }
      },
      "fields": [
        "txtLAName",
        "txtLogNo",
        "txtCPN",
        "txtChannel",
        "txtAssistAnalyst",
        "txtRvwType",
        "txtRvwMethod",
        "dtOrgDate",
        "dtACRBDate",
        "Form",
        "txtTransactionNum",
        "txtEnduserTr",
        "txTransactionNum",
        "txEnduserTr",
        "txtAttNameMisc",
        "rtAttachPR",
        "_id",
        "_rev"
      ],
      "sort": [
        {
          "txtLAName": "asc"
       }
      ]
    },
    function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        var tempTransNum = "";
        var tempEndUser = "";
        if (value.Form == "frmMain") {
          value.Form = "*Main";
        } else if (value.Form == "frmAllegation") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Allegation" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCHW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CHW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "TransDoc") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmITS") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "ITS/MTS/TSS Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmMiscDoc") {
          if (value.txtAttNameMisc && value.txtAttNameMisc != "" && value.txtAttNameMisc != "undefined") {
            tempTransNum = ": " + value.txtAttNameMisc;
          }
          value.Form = "Misc Doc" + tempTransNum;
        } else if (value.Form == "frmPrReview") {
          if (value.rtAttachPR && value.rtAttachPR != "" && value.rtAttachPR != "undefined") {
            tempTransNum = ": " + value.rtAttachPR;
          }
          value.Form = "Peer Review Results" + tempTransNum;
        } else if (value.Form == "frmSW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "SW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCFMBGF") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CFM BGF Transaction" + tempTransNum + tempEndUser;
        }
      })

      // sorting the view by default when the view loads
      var result = _.orderBy(result.docs, ['txtLAName', 'txtLogNo', doc => doc.Form.toLowerCase()], ['asc', 'desc', 'asc']);
      var data = { "data": result };
      response.json(data);
    })
});

// Query to list the view for "ByLeadAnalystUnLockedAP"
router.get("/ByLeadAnalystUnLockedAP", function (request, response) {
  bpc_cloudant.find(
    {
      "selector": {
        "Form": {
          "$in": [
            "frmMain",
            "frmAllegation",
            "frmCHW",
            "TransDoc",
            "frmITS",
            "frmMiscDoc",
            "frmPrReview",
            "frmSW",
            "frmCFMBGF"
          ]
        },
        "txGeo": {
          "$eq": "AP"
        },
        "txGrowthMarket": {
          "$nor": [
            {
              "$in": [
                "Japan IMT",
                "JPN IMT",
                "GCG IOT"
              ]
            }
          ]
        },
        "lock_status": {
          "$ne": "1"
        }
      },
      "fields": [
        "txtLAName",
        "txtLogNo",
        "txtCPN",
        "txtChannel",
        "txtAssistAnalyst",
        "txtRvwType",
        "txtRvwMethod",
        "dtOrgDate",
        "dtACRBDate",
        "Form",
        "txtTransactionNum",
        "txtEnduserTr",
        "txTransactionNum",
        "txEnduserTr",
        "txtAttNameMisc",
        "rtAttachPR",
        "_id",
        "_rev"
      ],
      "sort": [
        {
          "txtLAName": "asc"
       }
      ]
    },
    function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        var tempTransNum = "";
        var tempEndUser = "";
        if (value.Form == "frmMain") {
          value.Form = "*Main";
        } else if (value.Form == "frmAllegation") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Allegation" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCHW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CHW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "TransDoc") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmITS") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "ITS/MTS/TSS Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmMiscDoc") {
          if (value.txtAttNameMisc && value.txtAttNameMisc != "" && value.txtAttNameMisc != "undefined") {
            tempTransNum = ": " + value.txtAttNameMisc;
          }
          value.Form = "Misc Doc" + tempTransNum;
        } else if (value.Form == "frmPrReview") {
          if (value.rtAttachPR && value.rtAttachPR != "" && value.rtAttachPR != "undefined") {
            tempTransNum = ": " + value.rtAttachPR;
          }
          value.Form = "Peer Review Results" + tempTransNum;
        } else if (value.Form == "frmSW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "SW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCFMBGF") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CFM BGF Transaction" + tempTransNum + tempEndUser;
        }
      })

      // sorting the view by default when the view loads
      var result = _.orderBy(result.docs, ['txtLAName', 'txtLogNo', doc => doc.Form.toLowerCase()], ['asc', 'desc', 'asc']);
      var data = { "data": result };
      response.json(data);
    })
});

// Query to list the view for "ByLeadAnalystUnLockedEMEA"
router.get("/ByLeadAnalystUnLockedEMEA", function (request, response) {
  bpc_cloudant.find(
    {
      "selector": {
        "Form": {
          "$in": [
            "frmMain",
            "frmAllegation",
            "frmCHW",
            "TransDoc",
            "frmITS",
            "frmMiscDoc",
            "frmPrReview",
            "frmSW",
            "frmCFMBGF"]
        },
        "txGeo": {
          "$eq": "EMEA"
        },
        "lock_status": {
          "$ne": "1"
        }
      },
      "fields": [
        "txtLAName",
        "txtLogNo",
        "txtCPN",
        "txtChannel",
        "txtAssistAnalyst",
        "txtRvwType",
        "txtRvwMethod",
        "dtOrgDate",
        "dtACRBDate",
        "Form",
        "txtTransactionNum",
        "txtEnduserTr",
        "txTransactionNum",
        "txEnduserTr",
        "txtAttNameMisc",
        "rtAttachPR",
        "_id",
        "_rev"
      ],
      "sort": [
        {
          "txtLAName": "asc"
       }
      ]
    },
    function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        var tempTransNum = "";
        var tempEndUser = "";
        if (value.Form == "frmMain") {
          value.Form = "*Main";
        } else if (value.Form == "frmAllegation") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Allegation" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCHW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CHW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "TransDoc") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmITS") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "ITS/MTS/TSS Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmMiscDoc") {
          if (value.txtAttNameMisc && value.txtAttNameMisc != "" && value.txtAttNameMisc != "undefined") {
            tempTransNum = ": " + value.txtAttNameMisc;
          }
          value.Form = "Misc Doc" + tempTransNum;
        } else if (value.Form == "frmPrReview") {
          if (value.rtAttachPR && value.rtAttachPR != "" && value.rtAttachPR != "undefined") {
            tempTransNum = ": " + value.rtAttachPR;
          }
          value.Form = "Peer Review Results" + tempTransNum;
        } else if (value.Form == "frmSW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "SW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCFMBGF") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CFM BGF Transaction" + tempTransNum + tempEndUser;
        }
      })

      // sorting the view by default when the view loads
      var result = _.orderBy(result.docs, ['txtLAName', 'txtLogNo', doc => doc.Form.toLowerCase()], ['asc', 'desc', 'asc']);
      var data = { "data": result };
      response.json(data);
    })
});

// Query to list the view for "ByLeadAnalystUnLockedLA"
router.get("/ByLeadAnalystUnLockedLA", function (request, response) {
  bpc_cloudant.find(
    {
      "selector": {
        "Form": {
          "$in": [
            "frmMain",
            "frmAllegation",
            "frmCHW",
            "TransDoc",
            "frmITS",
            "frmMiscDoc",
            "frmPrReview",
            "frmSW",
            "frmCFMBGF"]
        },
        "txGeo": {
          "$eq": "AM"
        },
        "txMajorMarket": {
          "$eq": "LA IOT"
        },
        "lock_status": {
          "$ne": "1"
        }
      },
      "fields": [
        "txtLAName",
        "txtLogNo",
        "txtCPN",
        "txtChannel",
        "txtAssistAnalyst",
        "txtRvwType",
        "txtRvwMethod",
        "dtOrgDate",
        "dtACRBDate",
        "Form",
        "txtTransactionNum",
        "txtEnduserTr",
        "txTransactionNum",
        "txEnduserTr",
        "txtAttNameMisc",
        "rtAttachPR",
        "_id",
        "_rev"
      ],
      "sort": [
        {
          "txtLAName": "asc"
       }
      ]
    },
    function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        var tempTransNum = "";
        var tempEndUser = "";
        if (value.Form == "frmMain") {
          value.Form = "*Main";
        } else if (value.Form == "frmAllegation") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Allegation" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCHW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CHW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "TransDoc") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmITS") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "ITS/MTS/TSS Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmMiscDoc") {
          if (value.txtAttNameMisc && value.txtAttNameMisc != "" && value.txtAttNameMisc != "undefined") {
            tempTransNum = ": " + value.txtAttNameMisc;
          }
          value.Form = "Misc Doc" + tempTransNum;
        } else if (value.Form == "frmPrReview") {
          if (value.rtAttachPR && value.rtAttachPR != "" && value.rtAttachPR != "undefined") {
            tempTransNum = ": " + value.rtAttachPR;
          }
          value.Form = "Peer Review Results" + tempTransNum;
        } else if (value.Form == "frmSW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "SW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCFMBGF") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CFM BGF Transaction" + tempTransNum + tempEndUser;
        }
      })

      // sorting the view by default when the view loads
      var result = _.orderBy(result.docs, ['txtLAName', 'txtLogNo', doc => doc.Form.toLowerCase()], ['asc', 'desc', 'asc']);
      var data = { "data": result };
      response.json(data);
    })
});

// Query to list the view for "ByLeadAnalystUnLockedJAPAN"
router.get("/ByLeadAnalystUnLockedJAPAN", function (request, response) {
  bpc_cloudant.find(
    {
      "selector": {
        "Form": {
          "$in": [
            "frmMain",
            "frmAllegation",
            "frmCHW",
            "TransDoc",
            "frmITS",
            "frmMiscDoc",
            "frmPrReview",
            "frmSW",
            "frmCFMBGF"]
        },
        "txGeo": {
          "$eq": "AP"
        },
        "txGrowthMarket": {
          "$or": [
            {
              "$in": [
                "Japan IMT",
                "JPN IMT"
              ]
            }
          ]
        },
        "lock_status": {
          "$ne": "1"
        }
      },
      "fields": [
        "txtLAName",
        "txtLogNo",
        "txtCPN",
        "txtChannel",
        "txtAssistAnalyst",
        "txtRvwType",
        "txtRvwMethod",
        "dtOrgDate",
        "dtACRBDate",
        "Form",
        "txtTransactionNum",
        "txtEnduserTr",
        "txTransactionNum",
        "txEnduserTr",
        "txtAttNameMisc",
        "rtAttachPR",
        "_id",
        "_rev"
      ],
      "sort": [
        {
          "txtLAName": "asc"
       }
      ]
    },
    function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        var tempTransNum = "";
        var tempEndUser = "";
        if (value.Form == "frmMain") {
          value.Form = "*Main";
        } else if (value.Form == "frmAllegation") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Allegation" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCHW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CHW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "TransDoc") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmITS") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "ITS/MTS/TSS Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmMiscDoc") {
          if (value.txtAttNameMisc && value.txtAttNameMisc != "" && value.txtAttNameMisc != "undefined") {
            tempTransNum = ": " + value.txtAttNameMisc;
          }
          value.Form = "Misc Doc" + tempTransNum;
        } else if (value.Form == "frmPrReview") {
          if (value.rtAttachPR && value.rtAttachPR != "" && value.rtAttachPR != "undefined") {
            tempTransNum = ": " + value.rtAttachPR;
          }
          value.Form = "Peer Review Results" + tempTransNum;
        } else if (value.Form == "frmSW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "SW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCFMBGF") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CFM BGF Transaction" + tempTransNum + tempEndUser;
        }
      })

      // sorting the view by default when the view loads
      var result = _.orderBy(result.docs, ['txtLAName', 'txtLogNo', doc => doc.Form.toLowerCase()], ['asc', 'desc', 'asc']);
      var data = { "data": result };
      response.json(data);
    })
});

// Query to list the view for "ByLeadAnalystUnLockedGCG"
router.get("/ByLeadAnalystUnLockedGCG", function (request, response) {
  bpc_cloudant.find(
    {
      "selector": {
        "Form": {
          "$in": [
            "frmMain",
            "frmAllegation",
            "frmCHW",
            "TransDoc",
            "frmITS",
            "frmMiscDoc",
            "frmPrReview",
            "frmSW",
            "frmCFMBGF"]
        },
        "txGeo": {
          "$eq": "AP"
        },
        "txGrowthMarket": {
          "$or": [
            {
              "$in": [
                "GCG IOT"
              ]
            }
          ]
        },
        "lock_status": {
          "$ne": "1"
        }
      },
      "fields": [
        "txtLAName",
        "txtLogNo",
        "txtCPN",
        "txtChannel",
        "txtAssistAnalyst",
        "txtRvwType",
        "txtRvwMethod",
        "dtOrgDate",
        "dtACRBDate",
        "Form",
        "txtTransactionNum",
        "txtEnduserTr",
        "txTransactionNum",
        "txEnduserTr",
        "txtAttNameMisc",
        "rtAttachPR",
        "_id",
        "_rev"
      ],
      "sort": [
        {
          "txtLAName": "asc"
       }
      ]
    },
    function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        var tempTransNum = "";
        var tempEndUser = "";
        if (value.Form == "frmMain") {
          value.Form = "*Main";
        } else if (value.Form == "frmAllegation") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Allegation" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCHW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CHW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "TransDoc") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmITS") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "ITS/MTS/TSS Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmMiscDoc") {
          if (value.txtAttNameMisc && value.txtAttNameMisc != "" && value.txtAttNameMisc != "undefined") {
            tempTransNum = ": " + value.txtAttNameMisc;
          }
          value.Form = "Misc Doc" + tempTransNum;
        } else if (value.Form == "frmPrReview") {
          if (value.rtAttachPR && value.rtAttachPR != "" && value.rtAttachPR != "undefined") {
            tempTransNum = ": " + value.rtAttachPR;
          }
          value.Form = "Peer Review Results" + tempTransNum;
        } else if (value.Form == "frmSW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "SW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCFMBGF") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CFM BGF Transaction" + tempTransNum + tempEndUser;
        }
      })

      // sorting the view by default when the view loads
      var result = _.orderBy(result.docs, ['txtLAName', 'txtLogNo', doc => doc.Form.toLowerCase()], ['asc', 'desc', 'asc']);
      var data = { "data": result };
      response.json(data);
    })
});

// Query to list the view for "ByLeadAnalystLocked"
router.get("/ByLeadAnalystLocked", function (request, response) {
  bpc_cloudant.find(
    {
      "selector": {
        "Form": {
          "$in": [
            "frmMain",
            "frmAllegation",
            "frmCHW",
            "TransDoc",
            "frmITS",
            "frmMiscDoc",
            "frmPrReview",
            "frmSW",
            "frmCFMBGF"]
        },
        "lock_status": {
          "$eq": "1"
        }
      },
      "fields": [
        "txtLAName",
        "txtLogNo",
        "txtCPN",
        "txtChannel",
        "txtAssistAnalyst",
        "txtRvwType",
        "txtRvwMethod",
        "dtOrgDate",
        "dtACRBDate",
        "txtTransactionNum",
        "txtEnduserTr",
        "txTransactionNum",
        "txEnduserTr",
        "txtAttNameMisc",
        "rtAttachPR",
        "Form",
        "_id",
        "_rev"
      ],
      "sort": [
        {
          "txtLAName": "asc"
        }
      ]
    },
    function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        var tempTransNum = "";
        var tempEndUser = "";
        if (value.Form == "frmMain") {
          value.Form = "*Main";
        } else if (value.Form == "frmAllegation") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Allegation" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCHW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CHW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "TransDoc") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmITS") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "ITS/MTS/TSS Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmMiscDoc") {
          if (value.txtAttNameMisc && value.txtAttNameMisc != "" && value.txtAttNameMisc != "undefined") {
            tempTransNum = ": " + value.txtAttNameMisc;
          }
          value.Form = "Misc Doc" + tempTransNum;
        } else if (value.Form == "frmPrReview") {
          if (value.rtAttachPR && value.rtAttachPR != "" && value.rtAttachPR != "undefined") {
            tempTransNum = ": " + value.rtAttachPR;
          }
          value.Form = "Peer Review Results" + tempTransNum;
        } else if (value.Form == "frmSW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "SW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCFMBGF") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CFM BGF Transaction" + tempTransNum + tempEndUser;
        }
      })

      // sorting the view by default when the view loads
      var result = _.orderBy(result.docs, ['txtLAName', 'txtLogNo', doc => doc.Form.toLowerCase()], ['asc', 'desc', 'asc']);
      var data = { "data": result };
      response.json(data);
    })
});

// Query to list the view for "ByLeadAnalystLockedAM"
router.get("/ByLeadAnalystLockedAM", function (request, response) {
  bpc_cloudant.find(
    {
      "selector": {
        "Form": {
          "$in": [
            "frmMain",
            "frmAllegation",
            "frmCHW",
            "TransDoc",
            "frmITS",
            "frmMiscDoc",
            "frmPrReview",
            "frmSW",
            "frmCFMBGF"]
        },
        "txGeo": {
          "$eq": "AM"
        },
        "txMajorMarket": {
          "$ne": "LA IOT"
        },
        "lock_status": {
          "$eq": "1"
        }
      },
      "fields": [
        "txtLAName",
        "txtLogNo",
        "txtCPN",
        "txtChannel",
        "txtAssistAnalyst",
        "txtRvwType",
        "txtRvwMethod",
        "dtOrgDate",
        "dtACRBDate",
        "txtTransactionNum",
        "txtEnduserTr",
        "txTransactionNum",
        "txEnduserTr",
        "txtAttNameMisc",
        "rtAttachPR",
        "Form",
        "_id",
        "_rev"
      ],
      "sort": [
        {
          "txtLAName": "asc"
       }
      ]
    },
    function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        var tempTransNum = "";
        var tempEndUser = "";
        if (value.Form == "frmMain") {
          value.Form = "*Main";
        } else if (value.Form == "frmAllegation") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Allegation" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCHW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CHW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "TransDoc") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmITS") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "ITS/MTS/TSS Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmMiscDoc") {
          if (value.txtAttNameMisc && value.txtAttNameMisc != "" && value.txtAttNameMisc != "undefined") {
            tempTransNum = ": " + value.txtAttNameMisc;
          }
          value.Form = "Misc Doc" + tempTransNum;
        } else if (value.Form == "frmPrReview") {
          if (value.rtAttachPR && value.rtAttachPR != "" && value.rtAttachPR != "undefined") {
            tempTransNum = ": " + value.rtAttachPR;
          }
          value.Form = "Peer Review Results" + tempTransNum;
        } else if (value.Form == "frmSW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "SW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCFMBGF") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CFM BGF Transaction" + tempTransNum + tempEndUser;
        }
      })

      // sorting the view by default when the view loads
      var result = _.orderBy(result.docs, ['txtLAName', 'txtLogNo', doc => doc.Form.toLowerCase()], ['asc', 'desc', 'asc']);
      var data = { "data": result };
      response.json(data);
    })
});

// Query to list the view for "ByLeadAnalystLockedAP"
router.get("/ByLeadAnalystLockedAP", function (request, response) {
  bpc_cloudant.find(
    {
      "selector": {
        "Form": {
          "$in": [
            "frmMain",
            "frmAllegation",
            "frmCHW",
            "TransDoc",
            "frmITS",
            "frmMiscDoc",
            "frmPrReview",
            "frmSW",
            "frmCFMBGF"]
        },
        "txGeo": {
          "$eq": "AP"
        },
        "txGrowthMarket": {
          "$nor": [
            {
              "$in": [
                "Japan IMT",
                "JPN IMT",
                "GCG IOT"
              ]
            }
          ]
        },
        "lock_status": {
          "$eq": "1"
        }
      },
      "fields": [
        "txtLAName",
        "txtLogNo",
        "txtCPN",
        "txtChannel",
        "txtAssistAnalyst",
        "txtRvwType",
        "txtRvwMethod",
        "dtOrgDate",
        "dtACRBDate",
        "txtTransactionNum",
        "txtEnduserTr",
        "txTransactionNum",
        "txEnduserTr",
        "txtAttNameMisc",
        "rtAttachPR",
        "Form",
        "_id",
        "_rev"
      ],
      "sort": [
        {
          "txtLAName": "asc"
       }
      ]
    },
    function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        var tempTransNum = "";
        var tempEndUser = "";
        if (value.Form == "frmMain") {
          value.Form = "*Main";
        } else if (value.Form == "frmAllegation") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Allegation" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCHW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CHW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "TransDoc") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmITS") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "ITS/MTS/TSS Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmMiscDoc") {
          if (value.txtAttNameMisc && value.txtAttNameMisc != "" && value.txtAttNameMisc != "undefined") {
            tempTransNum = ": " + value.txtAttNameMisc;
          }
          value.Form = "Misc Doc" + tempTransNum;
        } else if (value.Form == "frmPrReview") {
          if (value.rtAttachPR && value.rtAttachPR != "" && value.rtAttachPR != "undefined") {
            tempTransNum = ": " + value.rtAttachPR;
          }
          value.Form = "Peer Review Results" + tempTransNum;
        } else if (value.Form == "frmSW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "SW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCFMBGF") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CFM BGF Transaction" + tempTransNum + tempEndUser;
        }
      })

      // sorting the view by default when the view loads
      var result = _.orderBy(result.docs, ['txtLAName', 'txtLogNo', doc => doc.Form.toLowerCase()], ['asc', 'desc', 'asc']);
      var data = { "data": result };
      response.json(data);
    })
});

// Query to list the view for "ByLeadAnalystLockedEMEA"
router.get("/ByLeadAnalystLockedEMEA", function (request, response) {
  bpc_cloudant.find(
    {
      "selector": {
        "Form": {
          "$in": [
            "frmMain",
            "frmAllegation",
            "frmCHW",
            "TransDoc",
            "frmITS",
            "frmMiscDoc",
            "frmPrReview",
            "frmSW",
            "frmCFMBGF"]
        },
        "txGeo": {
          "$eq": "EMEA"
        },
        "lock_status": {
          "$eq": "1"
        }
      },
      "fields": [
        "txtLAName",
        "txtLogNo",
        "txtCPN",
        "txtChannel",
        "txtAssistAnalyst",
        "txtRvwType",
        "txtRvwMethod",
        "dtOrgDate",
        "dtACRBDate",
        "txtTransactionNum",
        "txtEnduserTr",
        "txTransactionNum",
        "txEnduserTr",
        "txtAttNameMisc",
        "rtAttachPR",
        "Form",
        "_id",
        "_rev"
      ],
      "sort": [
        {
          "txtLAName": "asc"
       }
      ]
    },
    function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        var tempTransNum = "";
        var tempEndUser = "";
        if (value.Form == "frmMain") {
          value.Form = "*Main";
        } else if (value.Form == "frmAllegation") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Allegation" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCHW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CHW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "TransDoc") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmITS") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "ITS/MTS/TSS Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmMiscDoc") {
          if (value.txtAttNameMisc && value.txtAttNameMisc != "" && value.txtAttNameMisc != "undefined") {
            tempTransNum = ": " + value.txtAttNameMisc;
          }
          value.Form = "Misc Doc" + tempTransNum;
        } else if (value.Form == "frmPrReview") {
          if (value.rtAttachPR && value.rtAttachPR != "" && value.rtAttachPR != "undefined") {
            tempTransNum = ": " + value.rtAttachPR;
          }
          value.Form = "Peer Review Results" + tempTransNum;
        } else if (value.Form == "frmSW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "SW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCFMBGF") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CFM BGF Transaction" + tempTransNum + tempEndUser;
        }
      })

      // sorting the view by default when the view loads
      var result = _.orderBy(result.docs, ['txtLAName', 'txtLogNo', doc => doc.Form.toLowerCase()], ['asc', 'desc', 'asc']);
      var data = { "data": result };
      response.json(data);
    })
});

// Query to list the view for "ByLeadAnalystLockedLA"
router.get("/ByLeadAnalystLockedLA", function (request, response) {
  bpc_cloudant.find(
    {
      "selector": {
        "Form": {
          "$in": [
            "frmMain",
            "frmAllegation",
            "frmCHW",
            "TransDoc",
            "frmITS",
            "frmMiscDoc",
            "frmPrReview",
            "frmSW",
            "frmCFMBGF"]
        },
        "txGeo": {
          "$eq": "AM"
        },
        "txMajorMarket": {
          "$eq": "LA IOT"
        },
        "lock_status": {
          "$eq": "1"
        }
      },
      "fields": [
        "txtLAName",
        "txtLogNo",
        "txtCPN",
        "txtChannel",
        "txtAssistAnalyst",
        "txtRvwType",
        "txtRvwMethod",
        "dtOrgDate",
        "dtACRBDate",
        "txtTransactionNum",
        "txtEnduserTr",
        "txTransactionNum",
        "txEnduserTr",
        "txtAttNameMisc",
        "rtAttachPR",
        "Form",
        "_id",
        "_rev"
      ],
      "sort": [
        {
          "txtLAName": "asc"
       }
      ]
    },
    function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        var tempTransNum = "";
        var tempEndUser = "";
        if (value.Form == "frmMain") {
          value.Form = "*Main";
        } else if (value.Form == "frmAllegation") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Allegation" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCHW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CHW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "TransDoc") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmITS") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "ITS/MTS/TSS Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmMiscDoc") {
          if (value.txtAttNameMisc && value.txtAttNameMisc != "" && value.txtAttNameMisc != "undefined") {
            tempTransNum = ": " + value.txtAttNameMisc;
          }
          value.Form = "Misc Doc" + tempTransNum;
        } else if (value.Form == "frmPrReview") {
          if (value.rtAttachPR && value.rtAttachPR != "" && value.rtAttachPR != "undefined") {
            tempTransNum = ": " + value.rtAttachPR;
          }
          value.Form = "Peer Review Results" + tempTransNum;
        } else if (value.Form == "frmSW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "SW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCFMBGF") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CFM BGF Transaction" + tempTransNum + tempEndUser;
        }
      })

      // sorting the view by default when the view loads
      var result = _.orderBy(result.docs, ['txtLAName', 'txtLogNo', doc => doc.Form.toLowerCase()], ['asc', 'desc', 'asc']);
      var data = { "data": result };
      response.json(data);
    })
});

// Query to list the view for "ByLeadAnalystLockedJAPAN"
router.get("/ByLeadAnalystLockedJAPAN", function (request, response) {
  bpc_cloudant.find(
    {
      "selector": {
        "Form": {
          "$in": [
            "frmMain",
            "frmAllegation",
            "frmCHW",
            "TransDoc",
            "frmITS",
            "frmMiscDoc",
            "frmPrReview",
            "frmSW",
            "frmCFMBGF"]
        },
        "txGeo": {
          "$eq": "AP"
        },
        "txGrowthMarket": {
          "$or": [
            {
              "$in": [
                "Japan IMT",
                "JPN IMT"
              ]
            }
          ]
        },
        "lock_status": {
          "$eq": "1"
        }
      },
      "fields": [
        "txtLAName",
        "txtLogNo",
        "txtCPN",
        "txtChannel",
        "txtAssistAnalyst",
        "txtRvwType",
        "txtRvwMethod",
        "dtOrgDate",
        "dtACRBDate",
        "txtTransactionNum",
        "txtEnduserTr",
        "txTransactionNum",
        "txEnduserTr",
        "txtAttNameMisc",
        "rtAttachPR",
        "Form",
        "_id",
        "_rev"
      ],
      "sort": [
        {
          "txtLAName": "asc"
       }
      ]
    },
    function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        var tempTransNum = "";
        var tempEndUser = "";
        if (value.Form == "frmMain") {
          value.Form = "*Main";
        } else if (value.Form == "frmAllegation") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Allegation" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCHW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CHW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "TransDoc") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmITS") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "ITS/MTS/TSS Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmMiscDoc") {
          if (value.txtAttNameMisc && value.txtAttNameMisc != "" && value.txtAttNameMisc != "undefined") {
            tempTransNum = ": " + value.txtAttNameMisc;
          }
          value.Form = "Misc Doc" + tempTransNum;
        } else if (value.Form == "frmPrReview") {
          if (value.rtAttachPR && value.rtAttachPR != "" && value.rtAttachPR != "undefined") {
            tempTransNum = ": " + value.rtAttachPR;
          }
          value.Form = "Peer Review Results" + tempTransNum;
        } else if (value.Form == "frmSW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "SW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCFMBGF") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CFM BGF Transaction" + tempTransNum + tempEndUser;
        }
      })

      // sorting the view by default when the view loads
      var result = _.orderBy(result.docs, ['txtLAName', 'txtLogNo', doc => doc.Form.toLowerCase()], ['asc', 'desc', 'asc']);
      var data = { "data": result };
      response.json(data);
    })
});


// Query to list the view for "ByLeadAnalystLockedGCG"
router.get("/ByLeadAnalystLockedGCG", function (request, response) {
  bpc_cloudant.find(
    {
      "selector": {
        "Form": {
          "$in": [
            "frmMain",
            "frmAllegation",
            "frmCHW",
            "TransDoc",
            "frmITS",
            "frmMiscDoc",
            "frmPrReview",
            "frmSW",
            "frmCFMBGF"]
        },
        "txGeo": {
          "$eq": "AP"
        },
        "txGrowthMarket": {
          "$or": [
            {
              "$in": [
                "GCG IOT"
              ]
            }
          ]
        },
        "lock_status": {
          "$eq": "1"
        }
      },
      "fields": [
        "txtLAName",
        "txtLogNo",
        "txtCPN",
        "txtChannel",
        "txtAssistAnalyst",
        "txtRvwType",
        "txtRvwMethod",
        "dtOrgDate",
        "dtACRBDate",
        "txtTransactionNum",
        "txtEnduserTr",
        "txTransactionNum",
        "txEnduserTr",
        "txtAttNameMisc",
        "rtAttachPR",
        "Form",
        "_id",
        "_rev"
      ],
      "sort": [
        {
          "txtLAName": "asc"
       }
      ]
    },
    function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        var tempTransNum = "";
        var tempEndUser = "";
        if (value.Form == "frmMain") {
          value.Form = "*Main";
        } else if (value.Form == "frmAllegation") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Allegation" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCHW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CHW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "TransDoc") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmITS") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "ITS/MTS/TSS Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmMiscDoc") {
          if (value.txtAttNameMisc && value.txtAttNameMisc != "" && value.txtAttNameMisc != "undefined") {
            tempTransNum = ": " + value.txtAttNameMisc;
          }
          value.Form = "Misc Doc" + tempTransNum;
        } else if (value.Form == "frmPrReview") {
          if (value.rtAttachPR && value.rtAttachPR != "" && value.rtAttachPR != "undefined") {
            tempTransNum = ": " + value.rtAttachPR;
          }
          value.Form = "Peer Review Results" + tempTransNum;
        } else if (value.Form == "frmSW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "SW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCFMBGF") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CFM BGF Transaction" + tempTransNum + tempEndUser;
        }
      })

      // sorting the view by default when the view loads
      var result = _.orderBy(result.docs, ['txtLAName', 'txtLogNo', doc => doc.Form.toLowerCase()], ['asc', 'desc', 'asc']);
      var data = { "data": result };
      response.json(data);
    })
});



// Query to list the view for "ByAssistAnalyst"
router.get("/ByAssistAnalyst", function (request, response) {
  bpc_cloudant.find(
    {
      "selector": {
        "$and": [
          {
            "Form": {
              "$in": [
                "frmMain",
                "frmAllegation",
                "frmCHW",
                "TransDoc",
                "frmITS",
                "frmMiscDoc",
                "frmPrReview",
                "frmSW",
                "frmCFMBGF"
              ]
            }
          }
        ]
      },
      "fields": [
        "txtAssistAnalyst",
        "txtLogNo",
        "txtCPN",
        "txtChannel",
        "txtLAName",
        "txtRvwType",
        "txtRvwMethod",
        "dtOrgDate",
        "dtACRBDate",
        "txtTransactionNum",
        "txtEnduserTr",
        "txTransactionNum",
        "txEnduserTr",
        "txtAttNameMisc",
        "rtAttachPR",
        "Form",
        "_id",
        "_rev"
      ],
      "sort": [
        {
          "txtAssistAnalyst": "asc"
        }
      ]
    },
    function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        var tempTransNum = "";
        var tempEndUser = "";
        if (value.Form == "frmMain") {
          value.Form = "*Main";
        } else if (value.Form == "frmAllegation") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Allegation" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCHW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CHW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "TransDoc") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmITS") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "ITS/MTS/TSS Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmMiscDoc") {
          if (value.txtAttNameMisc && value.txtAttNameMisc != "" && value.txtAttNameMisc != "undefined") {
            tempTransNum = ": " + value.txtAttNameMisc;
          }
          value.Form = "Misc Doc" + tempTransNum;
        } else if (value.Form == "frmPrReview") {
          if (value.rtAttachPR && value.rtAttachPR != "" && value.rtAttachPR != "undefined") {
            tempTransNum = ": " + value.rtAttachPR;
          }
          value.Form = "Peer Review Results" + tempTransNum;
        } else if (value.Form == "frmSW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "SW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCFMBGF") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CFM BGF Transaction" + tempTransNum + tempEndUser;
        }
      })

      // sorting the view by default when the view loads
      var result = _.orderBy(result.docs, ['txtAssistAnalyst', 'txtLogNo', doc => doc.Form.toLowerCase()], ['asc', 'desc', 'asc']);
      var data = { "data": result };
      response.json(data);
    })
});

// Query to list the view for "ByBusinessPartner"
router.get("/ByBusinessPartner", function (request, response) {
  bpc_cloudant.find(
    {
      "selector": {
         "$and": [
            {
               "Form": {
                  "$in": [
                     "frmMain",
                     "frmAllegation",
                     "frmCHW",
                     "TransDoc",
                     "frmITS",
                     "frmMiscDoc",
                     "frmPrReview",
                     "frmSW",
                     "frmCFMBGF"
                  ]
               }
            }
         ]
      },
      "fields": [
         "txtLogNo",
         "txtCPN",
         "txtChannel",
         "txtLAName",
         "txtAssistAnalyst",
         "txtRvwType",
         "txtRvwMethod",
         "dtOrgDate",
         "dtACRBDate",
         "txtTransactionNum",
         "txtEnduserTr",
         "txTransactionNum",
         "txEnduserTr",
         "txtAttNameMisc",
         "rtAttachPR",
         "Form",
         "_id",
         "_rev"
      ],
      "sort": [
         {
            "txtCPN": "asc"
         }
      ]
   },
    function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        var tempTransNum = "";
        var tempEndUser = "";
        if (value.Form == "frmMain") {
          value.Form = "*Main";
        } else if (value.Form == "frmAllegation") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Allegation" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCHW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CHW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "TransDoc") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmITS") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "ITS/MTS/TSS Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmMiscDoc") {
          if (value.txtAttNameMisc && value.txtAttNameMisc != "" && value.txtAttNameMisc != "undefined") {
            tempTransNum = ": " + value.txtAttNameMisc;
          }
          value.Form = "Misc Doc" + tempTransNum;
        } else if (value.Form == "frmPrReview") {
          if (value.rtAttachPR && value.rtAttachPR != "" && value.rtAttachPR != "undefined") {
            tempTransNum = ": " + value.rtAttachPR;
          }
          value.Form = "Peer Review Results" + tempTransNum;
        } else if (value.Form == "frmSW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "SW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCFMBGF") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CFM BGF Transaction" + tempTransNum + tempEndUser;
        }
      })

      // sorting the view by default when the view loads
      var result = _.orderBy(result.docs, ['txtCPN', 'txtLogNo', doc => doc.Form.toLowerCase()], ['asc', 'desc', 'asc']);
      var data = { "data": result };
      response.json(data);
    }
  )
});

// Query to list the view for "ByBusinessPartnerAM"
router.get("/ByBusinessPartnerAM", function (request, response) {
  bpc_cloudant.find(
    {
      "selector": {
        "$and": [
          {
            "Form": {
              "$in": [
                "frmMain",
                "frmAllegation",
                "frmCHW",
                "TransDoc",
                "frmITS",
                "frmMiscDoc",
                "frmPrReview",
                "frmSW",
                "frmCFMBGF"]
            },
            "txGeo": {
              "$eq": "AM"
            },
            "txMajorMarket": {
              "$ne": "LA IOT"
            }
          }
        ]
      },
      "fields": [
        "txtLogNo",
        "txtCPN",
        "txtChannel",
        "txtLAName",
        "txtAssistAnalyst",
        "txtRvwType",
        "txtRvwMethod",
        "dtOrgDate",
        "dtACRBDate",
        "txtTransactionNum",
        "txtEnduserTr",
        "txTransactionNum",
        "txEnduserTr",
        "txtAttNameMisc",
        "rtAttachPR",
        "Form",
        "_id",
        "_rev"
      ],
      "sort": [
        {
          "txtLAName": "asc"
       }
      ]
    },
    function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        var tempTransNum = "";
        var tempEndUser = "";
        if (value.Form == "frmMain") {
          value.Form = "*Main";
        } else if (value.Form == "frmAllegation") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Allegation" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCHW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CHW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "TransDoc") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmITS") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "ITS/MTS/TSS Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmMiscDoc") {
          if (value.txtAttNameMisc && value.txtAttNameMisc != "" && value.txtAttNameMisc != "undefined") {
            tempTransNum = ": " + value.txtAttNameMisc;
          }
          value.Form = "Misc Doc" + tempTransNum;
        } else if (value.Form == "frmPrReview") {
          if (value.rtAttachPR && value.rtAttachPR != "" && value.rtAttachPR != "undefined") {
            tempTransNum = ": " + value.rtAttachPR;
          }
          value.Form = "Peer Review Results" + tempTransNum;
        } else if (value.Form == "frmSW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "SW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCFMBGF") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CFM BGF Transaction" + tempTransNum + tempEndUser;
        }
      })

      // sorting the view by default when the view loads
      var result = _.orderBy(result.docs, ['txtCPN', 'txtLogNo', doc => doc.Form.toLowerCase()], ['asc', 'desc', 'asc']);
      var data = { "data": result };
      response.json(data);
    }
  )
});

// Query to list the view for "ByBusinessPartnerAP"
router.get("/ByBusinessPartnerAP", function (request, response) {
  bpc_cloudant.find(
    {
      "selector": {
        "$and": [
          {
            "Form": {
              "$in": [
                "frmMain",
                "frmAllegation",
                "frmCHW",
                "TransDoc",
                "frmITS",
                "frmMiscDoc",
                "frmPrReview",
                "frmSW",
                "frmCFMBGF"]
            },
            "txGeo": {
              "$eq": "AP"
            },
            "txGrowthMarket": {
              "$nor": [
                {
                  "$in": [
                    "Japan IMT",
                    "JPN IMT",
                    "GCG IOT"
                  ]
                }
              ]
            }
          }
        ]
      },
      "fields": [
        "txtLogNo",
        "txtCPN",
        "txtChannel",
        "txtLAName",
        "txtAssistAnalyst",
        "txtRvwType",
        "txtRvwMethod",
        "dtOrgDate",
        "dtACRBDate",
        "txtTransactionNum",
        "txtEnduserTr",
        "txTransactionNum",
        "txEnduserTr",
        "txtAttNameMisc",
        "rtAttachPR",
        "Form",
        "_id",
        "_rev"
      ],
      "sort": [
        {
          "txtLAName": "asc"
       }
      ]
    },
    function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        var tempTransNum = "";
        var tempEndUser = "";
        if (value.Form == "frmMain") {
          value.Form = "*Main";
        } else if (value.Form == "frmAllegation") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Allegation" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCHW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CHW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "TransDoc") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmITS") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "ITS/MTS/TSS Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmMiscDoc") {
          if (value.txtAttNameMisc && value.txtAttNameMisc != "" && value.txtAttNameMisc != "undefined") {
            tempTransNum = ": " + value.txtAttNameMisc;
          }
          value.Form = "Misc Doc" + tempTransNum;
        } else if (value.Form == "frmPrReview") {
          if (value.rtAttachPR && value.rtAttachPR != "" && value.rtAttachPR != "undefined") {
            tempTransNum = ": " + value.rtAttachPR;
          }
          value.Form = "Peer Review Results" + tempTransNum;
        } else if (value.Form == "frmSW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "SW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCFMBGF") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CFM BGF Transaction" + tempTransNum + tempEndUser;
        }
      })

      // sorting the view by default when the view loads
      var result = _.orderBy(result.docs, ['txtCPN', 'txtLogNo', doc => doc.Form.toLowerCase()], ['asc', 'desc', 'asc']);
      var data = { "data": result };
      response.json(data);
    }
  )
});

// Query to list the view for "ByBusinessPartnerEMEA"
router.get("/ByBusinessPartnerEMEA", function (request, response) {
  bpc_cloudant.find(
    {
      "selector": {
        "$and": [
          {
            "Form": {
              "$in": [
                "frmMain",
                "frmAllegation",
                "frmCHW",
                "TransDoc",
                "frmITS",
                "frmMiscDoc",
                "frmPrReview",
                "frmSW",
                "frmCFMBGF"]
            },
            "txGeo": {
              "$eq": "EMEA"
            }
          }
        ]
      },
      "fields": [
        "txtLogNo",
        "txtCPN",
        "txtChannel",
        "txtLAName",
        "txtAssistAnalyst",
        "txtRvwType",
        "txtRvwMethod",
        "dtOrgDate",
        "dtACRBDate",
        "txtTransactionNum",
        "txtEnduserTr",
        "txTransactionNum",
        "txEnduserTr",
        "txtAttNameMisc",
        "rtAttachPR",
        "Form",
        "_id",
        "_rev"
      ],
      "sort": [
        {
          "txtLAName": "asc"
       }
      ]
    },
    function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        var tempTransNum = "";
        var tempEndUser = "";
        if (value.Form == "frmMain") {
          value.Form = "*Main";
        } else if (value.Form == "frmAllegation") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Allegation" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCHW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CHW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "TransDoc") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmITS") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "ITS/MTS/TSS Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmMiscDoc") {
          if (value.txtAttNameMisc && value.txtAttNameMisc != "" && value.txtAttNameMisc != "undefined") {
            tempTransNum = ": " + value.txtAttNameMisc;
          }
          value.Form = "Misc Doc" + tempTransNum;
        } else if (value.Form == "frmPrReview") {
          if (value.rtAttachPR && value.rtAttachPR != "" && value.rtAttachPR != "undefined") {
            tempTransNum = ": " + value.rtAttachPR;
          }
          value.Form = "Peer Review Results" + tempTransNum;
        } else if (value.Form == "frmSW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "SW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCFMBGF") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CFM BGF Transaction" + tempTransNum + tempEndUser;
        }
      })

      // sorting the view by default when the view loads
      var result = _.orderBy(result.docs, ['txtCPN', 'txtLogNo', doc => doc.Form.toLowerCase()], ['asc', 'desc', 'asc']);
      var data = { "data": result };
      response.json(data);
    }
  )
});

// Query to list the view for "ByBusinessPartnerLA"
router.get("/ByBusinessPartnerLA", function (request, response) {
  bpc_cloudant.find(
    {
      "selector": {
        "$and": [
          {
            "Form": {
              "$in": [
                "frmMain",
                "frmAllegation",
                "frmCHW",
                "TransDoc",
                "frmITS",
                "frmMiscDoc",
                "frmPrReview",
                "frmSW",
                "frmCFMBGF"]
            },
            "txGeo": {
              "$eq": "AM"
            },
            "txMajorMarket": {
              "$eq": "LA IOT"
            }
          }
        ]
      },
      "fields": [
        "txtLogNo",
        "txtCPN",
        "txtChannel",
        "txtLAName",
        "txtAssistAnalyst",
        "txtRvwType",
        "txtRvwMethod",
        "dtOrgDate",
        "dtACRBDate",
        "txtTransactionNum",
        "txtEnduserTr",
        "txTransactionNum",
        "txEnduserTr",
        "txtAttNameMisc",
        "rtAttachPR",
        "Form",
        "_id",
        "_rev"
      ],
      "sort": [
        {
          "txtLAName": "asc"
       }
      ]
    },
    function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        var tempTransNum = "";
        var tempEndUser = "";
        if (value.Form == "frmMain") {
          value.Form = "*Main";
        } else if (value.Form == "frmAllegation") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Allegation" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCHW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CHW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "TransDoc") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmITS") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "ITS/MTS/TSS Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmMiscDoc") {
          if (value.txtAttNameMisc && value.txtAttNameMisc != "" && value.txtAttNameMisc != "undefined") {
            tempTransNum = ": " + value.txtAttNameMisc;
          }
          value.Form = "Misc Doc" + tempTransNum;
        } else if (value.Form == "frmPrReview") {
          if (value.rtAttachPR && value.rtAttachPR != "" && value.rtAttachPR != "undefined") {
            tempTransNum = ": " + value.rtAttachPR;
          }
          value.Form = "Peer Review Results" + tempTransNum;
        } else if (value.Form == "frmSW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "SW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCFMBGF") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CFM BGF Transaction" + tempTransNum + tempEndUser;
        }
      })

      // sorting the view by default when the view loads
      var result = _.orderBy(result.docs, ['txtCPN', 'txtLogNo', doc => doc.Form.toLowerCase()], ['asc', 'desc', 'asc']);
      var data = { "data": result };
      response.json(data);
    }
  )
});

// Query to list the view for "ByBusinessPartnerJAPAN"
router.get("/ByBusinessPartnerJAPAN", function (request, response) {
  bpc_cloudant.find(
    {
      "selector": {
        "$and": [
          {
            "Form": {
              "$in": [
                "frmMain",
                "frmAllegation",
                "frmCHW",
                "TransDoc",
                "frmITS",
                "frmMiscDoc",
                "frmPrReview",
                "frmSW",
                "frmCFMBGF"]
            },
            "txGeo": {
              "$eq": "AP"
            },
            "txGrowthMarket": {
              "$or": [
                {
                  "$in": [
                    "Japan IMT",
                    "JPN IMT"
                  ]
                }
              ]
            }
          }
        ]
      },
      "fields": [
        "txtLogNo",
        "txtCPN",
        "txtChannel",
        "txtLAName",
        "txtAssistAnalyst",
        "txtRvwType",
        "txtRvwMethod",
        "dtOrgDate",
        "dtACRBDate",
        "txtTransactionNum",
        "txtEnduserTr",
        "txTransactionNum",
        "txEnduserTr",
        "txtAttNameMisc",
        "rtAttachPR",
        "Form",
        "_id",
        "_rev"
      ],
      "sort": [
        {
          "txtLAName": "asc"
        }
      ]
    },
    function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        var tempTransNum = "";
        var tempEndUser = "";
        if (value.Form == "frmMain") {
          value.Form = "*Main";
        } else if (value.Form == "frmAllegation") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Allegation" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCHW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CHW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "TransDoc") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmITS") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "ITS/MTS/TSS Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmMiscDoc") {
          if (value.txtAttNameMisc && value.txtAttNameMisc != "" && value.txtAttNameMisc != "undefined") {
            tempTransNum = ": " + value.txtAttNameMisc;
          }
          value.Form = "Misc Doc" + tempTransNum;
        } else if (value.Form == "frmPrReview") {
          if (value.rtAttachPR && value.rtAttachPR != "" && value.rtAttachPR != "undefined") {
            tempTransNum = ": " + value.rtAttachPR;
          }
          value.Form = "Peer Review Results" + tempTransNum;
        } else if (value.Form == "frmSW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "SW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCFMBGF") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CFM BGF Transaction" + tempTransNum + tempEndUser;
        }
      })

      // sorting the view by default when the view loads
      var result = _.orderBy(result.docs, ['txtCPN', 'txtLogNo', doc => doc.Form.toLowerCase()], ['asc', 'desc', 'asc']);
      var data = { "data": result };
      response.json(data);
    }
  )
});

// Query to list the view for "ByBusinessPartnerGCG"
router.get("/ByBusinessPartnerGCG", function (request, response) {
  bpc_cloudant.find(
    {
      "selector": {
        "$and": [
          {
            "Form": {
              "$in": [
                "frmMain",
                "frmAllegation",
                "frmCHW",
                "TransDoc",
                "frmITS",
                "frmMiscDoc",
                "frmPrReview",
                "frmSW",
                "frmCFMBGF"]
            },
            "txGeo": {
              "$eq": "AP"
            },
            "txGrowthMarket": {
              "$or": [
                {
                  "$in": [
                    "GCG IOT"
                  ]
                }
              ]
            }
          }
        ]
      },
      "fields": [
        "txtLogNo",
        "txtCPN",
        "txtChannel",
        "txtLAName",
        "txtAssistAnalyst",
        "txtRvwType",
        "txtRvwMethod",
        "dtOrgDate",
        "dtACRBDate",
        "txtTransactionNum",
        "txtEnduserTr",
        "txTransactionNum",
        "txEnduserTr",
        "txtAttNameMisc",
        "rtAttachPR",
        "Form",
        "_id",
        "_rev"
      ],
      "sort": [
        {
          "txtLAName": "asc"
       }
      ]
    },
    function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        var tempTransNum = "";
        var tempEndUser = "";
        if (value.Form == "frmMain") {
          value.Form = "*Main";
        } else if (value.Form == "frmAllegation") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Allegation" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCHW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CHW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "TransDoc") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmITS") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "ITS/MTS/TSS Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmMiscDoc") {
          if (value.txtAttNameMisc && value.txtAttNameMisc != "" && value.txtAttNameMisc != "undefined") {
            tempTransNum = ": " + value.txtAttNameMisc;
          }
          value.Form = "Misc Doc" + tempTransNum;
        } else if (value.Form == "frmPrReview") {
          if (value.rtAttachPR && value.rtAttachPR != "" && value.rtAttachPR != "undefined") {
            tempTransNum = ": " + value.rtAttachPR;
          }
          value.Form = "Peer Review Results" + tempTransNum;
        } else if (value.Form == "frmSW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "SW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCFMBGF") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CFM BGF Transaction" + tempTransNum + tempEndUser;
        }
      })

      // sorting the view by default when the view loads
      var result = _.orderBy(result.docs, ['txtCPN', 'txtLogNo', doc => doc.Form.toLowerCase()], ['asc', 'desc', 'asc']);
      var data = { "data": result };
      response.json(data);
    }
  )
});



// Query to list the view for "ByAuthor"
router.get("/ByAuthor", function (request, response) {
  bpc_cloudant.find(
    {
      "selector": {
        "$and": [
          {
            "Form": {
              "$in": [
                "frmMain",
                "frmAllegation",
                "frmCHW",
                "TransDoc",
                "frmITS",
                "frmMiscDoc",
                "frmPrReview",
                "frmSW",
                "frmCFMBGF"]
            }
          }
        ]
      },
      "fields": [
        "DocCreator",
        "txtLogNo",
        "txtCPN",
        "txtChannel",
        "txtLAName",
        "txtAssistAnalyst",
        "txtRvwType",
        "txtRvwMethod",
        "dtOrgDate",
        "dtACRBDate",
        "txtTransactionNum",
        "txtEnduserTr",
        "txTransactionNum",
        "txEnduserTr",
        "txtAttNameMisc",
        "rtAttachPR",
        "Form",
        "_id",
        "_rev"
      ],
      "sort": [
        {
          "DocCreator": "asc"
        }
      ]
    },
    function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        var tempTransNum = "";
        var tempEndUser = "";
        if (value.Form == "frmMain") {
          value.Form = "*Main";
        } else if (value.Form == "frmAllegation") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Allegation" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCHW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CHW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "TransDoc") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmITS") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "ITS/MTS/TSS Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmMiscDoc") {
          if (value.txtAttNameMisc && value.txtAttNameMisc != "" && value.txtAttNameMisc != "undefined") {
            tempTransNum = ": " + value.txtAttNameMisc;
          }
          value.Form = "Misc Doc" + tempTransNum;
        } else if (value.Form == "frmPrReview") {
          if (value.rtAttachPR && value.rtAttachPR != "" && value.rtAttachPR != "undefined") {
            tempTransNum = ": " + value.rtAttachPR;
          }
          value.Form = "Peer Review Results" + tempTransNum;
        } else if (value.Form == "frmSW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "SW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCFMBGF") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CFM BGF Transaction" + tempTransNum + tempEndUser;
        }
      })

      // sorting the view by default when the view loads
      var result = _.orderBy(result.docs, ['DocCreator', 'txtLogNo', doc => doc.Form.toLowerCase()], ['asc', 'desc', 'asc']);
      var data = { "data": result };
      response.json(data);
    })
});

// Query to list the view for "ByStatus"
router.get("/ByStatus", function (request, response) {
  bpc_cloudant.find(
    {
      "selector": {
        "$and": [
          {
            "Form": {
              "$in": [
                "frmMain",
                "frmAllegation",
                "frmCHW",
                "TransDoc",
                "frmITS",
                "frmMiscDoc",
                "frmPrReview",
                "frmSW",
                "frmCFMBGF"]
            }
          }
        ]
      },
      "fields": [
        "txtStatus",
        "txtLogNo",
        "txtCPN",
        "txtChannel",
        "txtLAName",
        "txtAssistAnalyst",
        "txtRvwType",
        "txtRvwMethod",
        "dtOrgDate",
        "dtACRBDate",
        "txtTransactionNum",
        "txtEnduserTr",
        "txTransactionNum",
        "txEnduserTr",
        "txtAttNameMisc",
        "rtAttachPR",
        "Form",
        "_id",
        "_rev"
      ],
      "sort": [
        {
          "txtStatus": "asc"
        }
      ]
    },
    function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        var tempTransNum = "";
        var tempEndUser = "";
        if (value.Form == "frmMain") {
          value.Form = "*Main";
        } else if (value.Form == "frmAllegation") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Allegation" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCHW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CHW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "TransDoc") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmITS") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "ITS/MTS/TSS Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmMiscDoc") {
          if (value.txtAttNameMisc && value.txtAttNameMisc != "" && value.txtAttNameMisc != "undefined") {
            tempTransNum = ": " + value.txtAttNameMisc;
          }
          value.Form = "Misc Doc" + tempTransNum;
        } else if (value.Form == "frmPrReview") {
          if (value.rtAttachPR && value.rtAttachPR != "" && value.rtAttachPR != "undefined") {
            tempTransNum = ": " + value.rtAttachPR;
          }
          value.Form = "Peer Review Results" + tempTransNum;
        } else if (value.Form == "frmSW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "SW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCFMBGF") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CFM BGF Transaction" + tempTransNum + tempEndUser;
        }
      })

      // sorting the view by default when the view loads
      var result = _.orderBy(result.docs, ['txtStatus', 'txtLogNo', doc => doc.Form.toLowerCase()], ['asc', 'desc', 'asc']);
      var data = { "data": result };
      response.json(data);
    })
});

// Query to list the view for "ByBPCRPDate"
router.get("/ByBPCRPDate", function (request, response) {
  bpc_cloudant.find(
    {
      "selector": {
        "$and": [
          {
            "Form": {
              "$in": [
                "frmMain",
                "frmAllegation",
                "frmCHW",
                "TransDoc",
                "frmITS",
                "frmMiscDoc",
                "frmPrReview",
                "frmSW",
                "frmCFMBGF"]
            }
          }
        ]
      },
      "fields": [
        "dtACRBDate",
        "txtLogNo",
        "txtCPN",
        "txtChannel",
        "txtLAName",
        "txtAssistAnalyst",
        "txtRvwType",
        "txtRvwMethod",
        "dtOrgDate",
        "txtTransactionNum",
        "txtEnduserTr",
        "txTransactionNum",
        "txEnduserTr",
        "txtAttNameMisc",
        "rtAttachPR",
        "Form",
        "_id",
        "_rev"
      ],
      "sort": [
        {
          "dtACRBDate": "desc"
        }
      ]
    },
    function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        var tempTransNum = "";
        var tempEndUser = "";
        if (value.Form == "frmMain") {
          value.Form = "*Main";
        } else if (value.Form == "frmAllegation") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Allegation" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCHW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CHW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "TransDoc") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmITS") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "ITS/MTS/TSS Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmMiscDoc") {
          if (value.txtAttNameMisc && value.txtAttNameMisc != "" && value.txtAttNameMisc != "undefined") {
            tempTransNum = ": " + value.txtAttNameMisc;
          }
          value.Form = "Misc Doc" + tempTransNum;
        } else if (value.Form == "frmPrReview") {
          if (value.rtAttachPR && value.rtAttachPR != "" && value.rtAttachPR != "undefined") {
            tempTransNum = ": " + value.rtAttachPR;
          }
          value.Form = "Peer Review Results" + tempTransNum;
        } else if (value.Form == "frmSW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "SW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCFMBGF") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CFM BGF Transaction" + tempTransNum + tempEndUser;
        }
      })

      // sorting the view by default when the view loads
      var result = _.orderBy(result.docs, ['dtACRBDate', 'txtLogNo', doc => doc.Form.toLowerCase()], ['desc', 'desc', 'asc']);
      var data = { "data": result };
      response.json(data);
    })
});

// Query to list the view for "ByChannel"
router.get("/ByChannel", function (request, response) {
  bpc_cloudant.find(
    {
      "selector": {
         "$and": [
            {
               "Form": {
                  "$in": [
                     "frmMain",
                     "frmAllegation",
                     "frmCHW",
                     "TransDoc",
                     "frmITS",
                     "frmMiscDoc",
                     "frmPrReview",
                     "frmSW",
                     "frmCFMBGF"
                  ]
               }
            }
         ]
      },
      "fields": [
         "txtChannel",
         "txtLogNo",
         "txtCPN",
         "txtLAName",
         "txtAssistAnalyst",
         "txtRvwType",
         "txtRvwMethod",
         "dtOrgDate",
         "dtACRBDate",
         "txtTransactionNum",
         "txtEnduserTr",
         "txTransactionNum",
         "txEnduserTr",
         "txtAttNameMisc",
         "rtAttachPR",
         "Form",
         "_id",
         "_rev"
      ],
      "sort": [
         {
            "Form": "asc"
         },
         {
            "txtChannel": "asc"
         }
      ]
   },
    function (er, result) {
      if (er) {
        throw er;
      }

      _.forEach(result.docs, function (value, key) {
        var tempTransNum = "";
        var tempEndUser = "";
        if (value.Form == "frmMain") {
          value.Form = "*Main";
        } else if (value.Form == "frmAllegation") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Allegation" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCHW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CHW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "TransDoc") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmITS") {
          if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
            tempTransNum = ": " + value.txtTransactionNum;
          }
          if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
            tempEndUser = " - " + value.txtEnduserTr;
          }
          value.Form = "ITS/MTS/TSS Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmMiscDoc") {
          if (value.txtAttNameMisc && value.txtAttNameMisc != "" && value.txtAttNameMisc != "undefined") {
            tempTransNum = ": " + value.txtAttNameMisc;
          }
          value.Form = "Misc Doc" + tempTransNum;
        } else if (value.Form == "frmPrReview") {
          if (value.rtAttachPR && value.rtAttachPR != "" && value.rtAttachPR != "undefined") {
            tempTransNum = ": " + value.rtAttachPR;
          }
          value.Form = "Peer Review Results" + tempTransNum;
        } else if (value.Form == "frmSW") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "SW Transaction" + tempTransNum + tempEndUser;
        } else if (value.Form == "frmCFMBGF") {
          if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
            tempTransNum = ": " + value.txTransactionNum;
          }
          if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
            tempEndUser = " - " + value.txEnduserTr;
          }
          value.Form = "CFM BGF Transaction" + tempTransNum + tempEndUser;
        }
      });
        // sorting the view by default when the view loads
        var result = _.orderBy(result.docs, ['txtChannel', 'txtLogNo', doc => doc.Form.toLowerCase()], ['asc', 'desc', 'asc']);
        var data = { "data": result };
        response.json(data);
      // })
    });
  });

  // Query to list the view for "ByReviewer"
  router.get("/ByReviewer", function (request, response) {
    bpc_cloudant.find(
      {
        "selector": {
          "$and": [
            {
              "Form": {
                "$in": [
                  "frmMain",
                  "frmAllegation",
                  "frmCHW",
                  "TransDoc",
                  "frmITS",
                  "frmMiscDoc",
                  "frmPrReview",
                  "frmSW",
                  "frmCFMBGF"]
              }
            }
          ]
        },
        "fields": [
          "dlgLogApprovers",
          "txtLogNo",
          "txtCPN",
          "txtChannel",
          "txtLAName",
          "txtAssistAnalyst",
          "txtRvwType",
          "txtRvwMethod",
          "dtOrgDate",
          "dtACRBDate",
          "txtTransactionNum",
          "txtEnduserTr",
          "txTransactionNum",
          "txEnduserTr",
          "txtAttNameMisc",
          "rtAttachPR",
          "Form",
          "_id",
          "_rev"
        ],
        "sort": [
          {
            "dlgLogApprovers": "asc"
          }
        ]
      },
      function (er, result) {
        if (er) {
          throw er;
        }

        _.forEach(result.docs, function (value, key) {
          var tempTransNum = "";
          var tempEndUser = "";
          if (value.Form == "frmMain") {
            value.Form = "*Main";
          } else if (value.Form == "frmAllegation") {
            if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
              tempTransNum = ": " + value.txtTransactionNum;
            }
            if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
              tempEndUser = " - " + value.txtEnduserTr;
            }
            value.Form = "Allegation" + tempTransNum + tempEndUser;
          } else if (value.Form == "frmCHW") {
            if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
              tempTransNum = ": " + value.txTransactionNum;
            }
            if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
              tempEndUser = " - " + value.txEnduserTr;
            }
            value.Form = "CHW Transaction" + tempTransNum + tempEndUser;
          } else if (value.Form == "TransDoc") {
            if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
              tempTransNum = ": " + value.txtTransactionNum;
            }
            if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
              tempEndUser = " - " + value.txtEnduserTr;
            }
            value.Form = "Transaction" + tempTransNum + tempEndUser;
          } else if (value.Form == "frmITS") {
            if (value.txtTransactionNum && value.txtTransactionNum != "" && value.txtTransactionNum != "undefined") {
              tempTransNum = ": " + value.txtTransactionNum;
            }
            if (value.txtEnduserTr && value.txtEnduserTr != "" && value.txtEnduserTr != "undefined") {
              tempEndUser = " - " + value.txtEnduserTr;
            }
            value.Form = "ITS/MTS/TSS Transaction" + tempTransNum + tempEndUser;
          } else if (value.Form == "frmMiscDoc") {
            if (value.txtAttNameMisc && value.txtAttNameMisc != "" && value.txtAttNameMisc != "undefined") {
              tempTransNum = ": " + value.txtAttNameMisc;
            }
            value.Form = "Misc Doc" + tempTransNum;
          } else if (value.Form == "frmPrReview") {
            if (value.rtAttachPR && value.rtAttachPR != "" && value.rtAttachPR != "undefined") {
              tempTransNum = ": " + value.rtAttachPR;
            }
            value.Form = "Peer Review Results" + tempTransNum;
          } else if (value.Form == "frmSW") {
            if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
              tempTransNum = ": " + value.txTransactionNum;
            }
            if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
              tempEndUser = " - " + value.txEnduserTr;
            }
            value.Form = "SW Transaction" + tempTransNum;
          } else if (value.Form == "frmCFMBGF") {
            if (value.txTransactionNum && value.txTransactionNum != "" && value.txTransactionNum != "undefined") {
              tempTransNum = ": " + value.txTransactionNum;
            }
            if (value.txEnduserTr && value.txEnduserTr != "" && value.txEnduserTr != "undefined") {
              tempEndUser = " - " + value.txEnduserTr;
            }
            value.Form = "CFM BGF Transaction" + tempTransNum + tempEndUser;
          }
        });
          // sorting the view by default when the view loads
          var result = _.orderBy(result.docs, ['dlgLogApprovers', 'txtLogNo', doc => doc.Form.toLowerCase()], ['asc', 'desc', 'asc']);
          var data = { "data": result };
          response.json(data);
        
      });
    });

    // Query to list the view for "PeerReviewResults"
    router.get("/PeerReviewResults", function (request, response) {
      bpc_cloudant.find(
        {
          "selector": {
            "Form": {
              "$eq": "frmPrReview"
            }
          },
          "fields": [
            "txtPeerReviewer",
            "txtLogNo",
            "txtChannel",
            "DocCreator",
            "txtLAName",
            "txBP",
            "txPRStatus",
            "dtPRPerformed",
            "sigtimestamp",
            "rtAttachPR",
            "Form",
            "_id",
            "_rev"
          ],
          "sort": [
            {
              "Form": "asc"
            }
          ]
        },
        function (er, result) {
          if (er) {
            throw er;
          }

          _.forEach(result.docs, function (value, key) {
            var tempTransNum = "";
            if (value.Form == "frmPrReview") {
              if (value.rtAttachPR && value.rtAttachPR != "" && value.rtAttachPR != "undefined") {
                tempTransNum = ": " + value.rtAttachPR + tempTransNum;
              }
              value.Form = "Peer Review Results" + tempTransNum;
            }
          })

          var data = { "data": result.docs };
          response.json(data);
        })
    });

    // To fetch log num
    router.get("/log_results", function (request, response) {
      // var logno = request.params.logno;
      var logno = request.query.logno;
      bpc_cloudant.find(
        {
          "selector": {
            "Form": {
              "$in": [
                "fInfo",
                "fInfoAP",
                "fInfoEMEA"
              ]
            },
            "txLogNo": {
              "$eq": logno
            }
          }
        },
        function (err, log_results, moreResultSets) {

          var data = log_results.docs[0];
          //console.log(data);
          response.json(data);
        })
    });

    // Check Unique Log no from Main form
    router.get("/uniquelog", function (request, response) {
      // var logno = request.params.logno;
      var logno = request.query.logno;
      bpc_cloudant.find(
        {
          "selector": {
            "Form": {
              "$eq": "frmMain"
            },
            "txtLogNo": {
              "$eq": logno
            }
          }
        },
        function (err, result) {

          var data = result.docs;
          //console.log(data);
          response.json(data);
        })
    });

    //Fetch the doc by ID
    router.get("/getdocbyId", function (request, response) {
      var id = request.query.id;
      bpc_cloudant.find(
        {
          "selector": {
            "_id": id
          }
        }, function (er, result) {
          if (er) {
            throw er;
          }
          var data = result.docs[0];
          response.json(data);
        })
    });

    //fetch fixed keywords
    router.get("/fixedkeywords", function (request, response) {
      bpc_cloudant.find(
        {
          "selector": {
            "Form": {
              "$eq": "fFXKeywordRDL"
            }
          },
          "fields": [
            "txFXKeyword",
            "txFXKeyList",
            "txFXKeyListAP",
            "txFXKeyListEMEA",
            "txFXKeyListLA",
            "txFXKeyListJP",
            "txFXKeyListGCG",
            "txFXKeyComment",
            "txFXAudit",
            "Form",
            "_id",
            "_rev"
          ],
          "sort": [
            {
              "Form": "asc"
            }
          ]
        }, function (er, result) {
          //console.log(result);

          if (er) {
            throw er;
          }
          var data = { "data": result.docs };
          response.json(data);
        })
    });

    //FixedKeyword Crud Operation
    router.get("/insertfixedkeywords", (req, res) => {
      console.log(JSON.stringify(req.query.json))
      bpc_cloudant.insert(JSON.parse(req.query.json), function (er, result) {
        if (er) {
          throw er;
        }
        res.json(result);
      })
    })

    //trash documents cloudant query
    router.get("/trashDocuments", function (request, response) {
      bpc_cloudant.find(
        {
          "selector": {
            "Form": {
              "$eq": "fDeletedDocumentRDL"
            }
          },
          "sort": [
            {
              "Form": "asc"
            }
          ]
        }, function (er, result) {
          //console.log(result);

          if (er) {
            throw er;
          }
          var data = { "data": result.docs };
          response.json(data);
        })
    });

    // Trash Restore operations
    router.post("/inserttrashdocuments", (req, res) => {
      //console.log(req.body);
      bpc_cloudant.insert(req.body, function (er, result) {
        //console.log(result);		
        if (er) {
          console.log("Recording with REV number already exists", err);
        }
        res.json(result);
      })
    })

    router.get("/getAttachedFileList", (req, res) => {
      console.log(req.query);
      bpc_cloudant.find({
        "selector": {
          "parent_id": req.query.id
        }
      }, function (err, result) {
        res.json(result);
      });

    })

    // download the file attached in the record
    router.get("/getAttachedFile/:docid/:attname", (req, res) => {
      let docName = req.params.docid;
      let attName = encodeURIComponent(req.params.attname);

      if (docName && attName) {
        bpc_cloudant.attachment.get(docName, attName, function (err, body) {
          if (!err) {
            res.setHeader('Content-disposition', 'attachment; filename=' + attName);
            res.end(body);
          }
        });
      } else {
        res.json({ "result": "No file" });
      }
    })

    //get revId by docId
    router.get("/getrevIDbydocID", function (request, response) {
      let id = request.query.docid;
      bpc_cloudant.find(
        {
          "selector": {
            "_id": id
          }
        },
        function (er, result) {
          console.log(result);
          if (er) {
            throw er;
          }
          var data = result.docs[0];
          response.json(data);
        }
      )
    })

    //Attachment delete
    router.post("/deleteAttachedFile", (req, res) => {
      let docName = req.body.docid;
      let attName = req.body.attName;
      let revid = req.body.revid;

      if (docName && attName) {
        bpc_cloudant.attachment.destroy(docName, encodeURIComponent(attName), { rev: revid }, function (err, body) {
          if (!err) {
            res.json({ "status": attName + " file deleted successfully", "file": attName.replace(/[)(]\s+/g, '') });
          } else {
            console.log("error" + err);
            res.json({ "status": attName + " file didn't get deleted" });
          }
        });
      } else {
        console.log(docName, attName);
        res.json({ "status": "No file detected" });
      }
    })

    router.post("/attachFiles", (req, res) => {
      var form = new multiparty.Form();
      form.parse(req, function (err, fields, files) {
        var uploadedFiles = [];
        if (files.uploadFile) {
          for (var i = 0; i < files.uploadFile.length; i++) {
            var file = files.uploadFile[i];
            var data = fs.readFileSync(file.path);
            var docName = fields.id[0] + file.originalFilename;
            var fileInfo = { name: file.originalFilename, data: data, content_type: file.headers['content-type'] };
            uploadedFiles.push(fileInfo);
          }
          bpc_cloudant.find(
            {
              "selector": {
                "parent_id": fields.id[0]
              }
            },
            function (err, body) {
              if (!err) {
                bpc_cloudant.multipart.insert({ "parent_id": fields.id[0] }, uploadedFiles, fields.id[0] + "-files-" + body.docs.length, function (err, sbody) {
                  if (!err) {
                    res.json({ "result": sbody });
                  } else {
                    res.json({ "error": err });
                  }
                });
              }
            }
          );
        }


      });

    })

    function base64Encode(file) {
      var body = fs.readFileSync(file);
      return body.toString('base64');
    }

    // Allgation form save data:
    router.post("/insertallegationform", (req, res) => {
      bpc_cloudant.insert(req.body, function (er, result) {
        if (er) {
          throw er;
        }
        res.json(result);
      })
    })

    // CHW form save data:
    router.post("/insertchwform", (req, res) => {
      bpc_cloudant.insert(req.body, function (er, result) {
        if (er) {
          throw er;
        }
        res.json(result);
      })
    })

    // Peer Review Results form save data:
    router.post("/insertpeerreviewresults", (req, res) => {
      bpc_cloudant.insert(req.body, function (er, result) {
        if (er) {
          throw er;
        }
        res.json(result);
      })
    })

    // SW Transaction form insert data
    router.post("/insertswtransaction", (req, res) => {
      bpc_cloudant.insert(req.body, function (er, result) {
        if (er) {
          throw er;
        }
        res.json(result);
      })
    })

    //Save Misc Doc form data
    router.post("/insertmiscform", (req, res) => {
      bpc_cloudant.insert(req.body, function (er, result) {
        if (er) {
          throw er;
        }
        res.json(result);
      })
    })

    // ITS MTS form save data
    router.post("/insertitsform", (req, res) => {
      bpc_cloudant.insert(req.body, function (er, result) {
        if (er) {
          throw er;
        }
        res.json(result);
      })
    })

    // CHW SWG form save data
    router.post("/insertchwswgform", (req, res) => {
      bpc_cloudant.insert(req.body, function (er, result) {
        if (er) {
          throw er;
        }
        res.json(result);
      })
    })

    // CHW form save data:
    router.post("/insertcfmbgfform", (req, res) => {
      bpc_cloudant.insert(req.body, function (er, result) {
        if (er) {
          throw er;
        }
        res.json(result);
      })
    })

    // Bluemail to send approval email
    router.post("/sendmail", function (request, response) {
      var review = request.body;
      var options = {
        hostname: 'bluemail.w3ibm.mybluemix.net',
        port: 443,
        path: '/rest/v2/emails',
        method: 'POST',
        headers: {
          'username': bluemail_username,
          'password': bluemail_password,
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + bluemail_auth
        }
      };

      var mailStatus = null;
      var req = https.request(options, function (res) {
        console.log('Status: ' + res.statusCode);
        //console.log('Headers: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (body) {
          //console.log('Body: ' + body);
          response.json(body);
        });
      });

      var asanat = review.txtAssistAnalyst;
      var Prinicipal = review.principalname;
      var ccstr = "";
      var newccstr = "";
      var tomail = review.DocCreator;
      var ccmail = review.txtLAName;
      var ccmail1 = [];
      var analyst = [];
      if (asanat == "") {
        analyst.push(ccmail);
      } else {
        analyst = asanat.split(",");
        analyst.push(ccmail);
      }

      for (i = 0; i < analyst.length; i++) {
        ccmail1[i] = "{\"recipient\":" + "\"" + analyst[i] + "\"" + "}";
      }
      ccstr = ccmail1.join();
      newccstr = "[" + ccstr + "]";
      req.on('error', function (e) {
        console.log('Problem with sendmail request: ' + e.message);
      });

      //write data to request body
      var emailHead = {
        "contact": Prinicipal,
        "recipients": [{ "recipient": tomail }],
        "cc": JSON.parse(newccstr),
        "subject": "The content has been approved for Log #" + review.txtLogNo + " of business partner " + review.txtCPN,
        "message": "Link to the record : " + "<a href=" + review.Appurl + "mainform/" + review._id + ">" + review.txtLogNo + "</a>" + "<br>" + "Review content has been approved for Log #" + review.txtLogNo
      };
      req.write(JSON.stringify(emailHead));
      req.end();
    })

    // Bluemail to send rejection email
    router.post("/rejectmail", function (request, response) {
      var review = request.body;
      var options = {
        hostname: 'bluemail.w3ibm.mybluemix.net',
        port: 443,
        path: '/rest/v2/emails',
        method: 'POST',
        headers: {
          'username': bluemail_username,
          'password': bluemail_password,
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + bluemail_auth
        }
      };

      var mailStatus = null;
      var req = https.request(options, function (res) {
        console.log('Status: ' + res.statusCode);
        //console.log('Headers: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (body) {
          //console.log('Body: ' + body);
          response.json(body);
        });
      });

      var asanat = review.txtAssistAnalyst;
      var Prinicipal = review.principalname;
      var ccstr = "";
      var newccstr = "";
      var tomail = review.DocCreator;
      var ccmail = review.txtLAName;
      var ccmail1 = [];
      var analyst = [];
      if (asanat == "") {
        analyst.push(ccmail);
      } else {
        analyst = asanat.split(",");
        analyst.push(ccmail);
      }

      for (i = 0; i < analyst.length; i++) {
        ccmail1[i] = "{\"recipient\":" + "\"" + analyst[i] + "\"" + "}";
      }
      ccstr = ccmail1.join();
      newccstr = "[" + ccstr + "]";
      req.on('error', function (e) {
        console.log('Problem with rejectmail request: ' + e.message);
      });

      //write data to request body
      var emailHead = {
        "contact": Prinicipal,
        "recipients": [{ "recipient": tomail }],
        "cc": JSON.parse(newccstr),
        "subject": "The content has been rejected for Log #" + review.txtLogNo + " of business partner " + review.txtCPN,
        "message": "Link to the record : " + "<a href=" + review.Appurl + "mainform/" + review._id + ">" + review.txtLogNo + "</a>" + "<br>" + "Rejection Comments: " + "</b><br>" + review.txtComments
      };
      req.write(JSON.stringify(emailHead));
      req.end();
    })

    // Bluemail to send 'submit for review' email
    router.post("/subrevmail", function (request, response) {
      var review = request.body;
      var options = {
        hostname: 'bluemail.w3ibm.mybluemix.net',
        port: 443,
        path: '/rest/v2/emails',
        method: 'POST',
        headers: {
          'username': bluemail_username,
          'password': bluemail_password,
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + bluemail_auth
        }
      };

      var mailStatus = null;
      var req = https.request(options, function (res) {
        console.log('Status: ' + res.statusCode);
        //console.log('Headers: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (body) {
          //console.log('Body: ' + body);
          response.json(body);
        });
      });

      var asanat = review.txtAssistAnalyst;
      var Prinicipal = review.principalname;
      var ccstr = "";
      var newccstr = "";
      var tomail = review.dlgLogApprovers;
      var ccmail = review.txtLAName;
      var ccmail1 = [];
      var ccmail2 = review.DocCreator;
      var analyst = [];
      if (asanat == "") {
        analyst.push(ccmail, ccmail2);
      } else {
        analyst = asanat.split(",");
        analyst.push(ccmail, ccmail2);
      }

      for (i = 0; i < analyst.length; i++) {
        ccmail1[i] = "{\"recipient\":" + "\"" + analyst[i] + "\"" + "}";
      }
      ccstr = ccmail1.join();
      newccstr = "[" + ccstr + "]";

      req.on('error', function (e) {
        console.log('problem with subrevmail request: ' + e.message);
      });

      //write data to request body
      var emailHead = {
        "contact": Prinicipal,
        "recipients": [{ "recipient": tomail }],
        "cc": JSON.parse(newccstr),
        "subject": "The content has been " + review.txtStatus + " for Log #" + review.txtLogNo + " of business partner " + review.txtCPN,
        "message": "Link to the record : " + "<a href=" + review.Appurl + "mainform/" + review._id + ">" + review.txtLogNo + "</a>" + "<br>" + "The content has been " + review.txtStatus + " for Log #" + review.txtLogNo
      };
      req.write(JSON.stringify(emailHead));
      req.end();
    })

    // Bluemail to send 're-review' email
    router.post("/rerevmail", function (request, response) {
      var review = request.body;
      var options = {
        hostname: 'bluemail.w3ibm.mybluemix.net',
        port: 443,
        path: '/rest/v2/emails',
        method: 'POST',
        headers: {
          'username': bluemail_username,
          'password': bluemail_password,
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + bluemail_auth
        }
      };

      var mailStatus = null;
      var req = https.request(options, function (res) {
        console.log('Status: ' + res.statusCode);
        res.setEncoding('utf8');
        res.on('data', function (body) {

          response.json(body);
        });
      });


      var asanat = review.txtAssistAnalyst;
      var Prinicipal = review.principalname;
      var ccstr = "";
      var newccstr = "";
      var tomail = review.DocCreator;
      var ccmail = review.txtLAName;
      var ccmail1 = [];
      var analyst = [];
      if (asanat == "") {
        analyst.push(ccmail);
      } else {
        analyst = asanat.split(",");
        analyst.push(ccmail);
      }

      for (i = 0; i < analyst.length; i++) {
        ccmail1[i] = "{\"recipient\":" + "\"" + analyst[i] + "\"" + "}";
      }
      ccstr = ccmail1.join();
      newccstr = "[" + ccstr + "]";
      req.on('error', function (e) {
        console.log('Problem with rereview request: ' + e.message);
      });

      //write data to request body
      var emailHead = {
        "contact": Prinicipal,
        "recipients": [{ "recipient": tomail }],
        "cc": JSON.parse(newccstr),
        "subject": "The content has been sent for updates for Log #" + review.txtLogNo + " of business partner " + review.txtCPN,
        "message": "Link to the record : " + "<a href=" + review.Appurl + "mainform/" + review._id + ">" + review.txtLogNo + "</a>" + "<br>" + "The content has been sent for updates for Log #" + review.txtLogNo
      };
      req.write(JSON.stringify(emailHead));
      req.end();
    })

    //adhoc report
    router.get("/adhoc", function (request, response) {
      bpc_cloudant.find(
        {
          "selector": {
            "Form": {
              "$in": [
                "frmMain"
              ]
            },
            "txtLogNo": {
              "$ne": ""
            }
          },
          "fields": [
            'txtLogNo',
            'txtStatus',
            'signature',
            'sigtimestamp',
            'txtCPN',
            'txtChannel',
            'txtLAName',
            'txtAssistAnalyst',
            'txtRvwType',
            'txtRvwMethod',
            'dtOrgDate',
            'dtACRBDate',
            'dlgLogApprovers',
            'txtSrcAllegation',
            'rdwbook',
            'lbThirdPartyName',
            'txtComments',
            'rbEuroUnionFlag',
            'txtReviewNotif',
            'rtReviewNotif',
            'txtUniverse',
            'rtUniverse',
            'txtKickoff',
            'rtKickoff',
            'txtCloseout',
            'rtCloseout',
            'txtInitialFindings',
            'rtInitialFindings',
            'txtFinalFindings',
            'rtFinalFindings',
            'txtFSheet',
            'rtFSheet',
            'txtBPCRB',
            'rtBPCRB',
            'txtEscalationLetter',
            'rtEscalationLetter',
            'txtRecovery',
            'rtRecovery',
            'txtSalesReview',
            'rtSalesReview',
            'txtFailure2Respond',
            'rtFailure2Respond',
            'txtMisc',
            'rtMisc',
            'txtTerminationEmails',
            'rtTerminationEmails',
            '_id',
            '_rev'
          ]
        }, function (er, result) {
          if (er) {
            throw er;
          }
          var data = { "data": result.docs };
          response.json(data);
        })
    });

    //Fetch all children if LogNo is passed
    router.get("/getAllChildrenForSubmitReviewCheck", function (request, response) {
      var mbp = request.query.id;
      //var isValidFromQuery=request.query.isvalid;
      bpc_cloudant.find(
        {
          "selector": {
            "$or": [
              {
                "$and": [
                  {
                    "\\$REF": {
                      "$eq": mbp
                    }
                  }, {
                    "Form": {
                      "$ne": "frmPrReview"
                    }
                  }, {
                    "Form": {
                      "$ne": "frmMiscDoc"
                    }
                  }, {
                    "Form": {
                      "$ne": "TransDoc"
                    }
                  }
                ]
              },
              {
                "_id": mbp
              }
            ]
          },
          "sort": [
            {
              "_id": "asc"
            }
          ],
          "fields": [
            "_id",
            "isvalid",
            "Form",
            "txtTransactionNum",
            "txTransactionNum"
          ]
        },
        function (er, result) {
          if (er) {
            throw er;
          }

          var display = "";
          let validationStr = "Please make sure to put a comment regarding the attachment field(s) that are left blank in the following document(s):"

          var rdata = _.filter(result.docs, ['isvalid', 'N']);
          var rdataMain = _.filter(result.docs, ['Form', 'frmMain']);
          if (rdataMain[0].isvalid == "Y" && request.query.isvalid == "N") {
            rdata.push(rdataMain[0]);
          }

          _.forEach(rdata, function (value, key) {
            if (value.Form == "frmMain" && request.query.isvalid == "N") {
              display = display + "Main document" + "\n";
            } else if (value.Form == "frmAllegation" && value.txtTransactionNum == "") {
              display = display + "Allegation" + "\n";
            } else if (value.Form == "frmAllegation" && value.txtTransactionNum != "") {
              display = display + "Allegation - " + value.txtTransactionNum + "\n";
            } else if (value.Form == "frmCHW" && value.txTransactionNum != "") {
              display = display + "CHW Transaction - " + value.txTransactionNum + "\n";
            } else if (value.Form == "frmCHW" && value.txTransactionNum == "") {
              display = display + "CHW Transaction " + "\n";
            } else if (value.Form == "frmITS" && value.txtTransactionNum != "") {
              display = display + "ITS/MTS/TSS Transaction - " + value.txtTransactionNum + "\n";
            } else if (value.Form == "frmITS" && value.txtTransactionNum == "") {
              display = display + "ITS/MTS/TSS Transaction " + "\n";
            } else if (value.Form == "frmSW" && value.txTransactionNum != "") {
              display = display + "SW Transaction - " + value.txTransactionNum + "\n";
            } else if (value.Form == "frmSW" && value.txTransactionNum == "") {
              display = display + "SW Transaction " + "\n";
            } else if (value.Form == "frmCFMBGF" && value.txTransactionNum != "") {
              display = display + "CFMBGF Transaction - " + value.txTransactionNum + "\n";
            } else if (value.Form == "frmCFMBGF" && value.txTransactionNum == "") {
              display = display + "CFMBGF Transaction " + "\n";
            }
          })
          response.json(validationStr + "\n\n" + display);
        }
      )
    })

    // get the list of attachments for a particular inquiry from DB2
    router.get("/getAttachedFileListFromDB2", (req, res) => {
      var parent_id = req.query.id;
      var sqlquery = "";
      var tableName = "BPC.ATTACHMENTS_RDL_" + _.toUpper(req.query.form);   // the appropriate DB2 table name based on the form in which the file is attached
      if (_.startsWith(req.query.form, "frmMain"))
        sqlquery = "select FILENAME, FILE_ID from BPC.ATTACHMENTS_RDL_FRMMAIN where PARENT_ID = '" + parent_id + "' and FILE_DELETE = 'No' UNION select FILENAME, FILE_ID from BPC.ATTACHMENTS_RDL_FRMMAIN_OTHER where PARENT_ID = '" + parent_id + "' and FILE_DELETE = 'No'"
      else
        sqlquery = "select FILENAME, FILE_ID from " + tableName + " where PARENT_ID = '" + parent_id + "' and FILE_DELETE = 'No'";

      ibmdb.open(db2_connection, function (error, conn) {
        if (error) {
          console.log("DB2 connection error: ", error.message);
        } else {
          conn.query(sqlquery).then(
            rows => {
              _.forEach(rows, function (value, key) {
                return { value }
              })
              ibmdb.close(conn);    // close the DB2 connection after it is used
              res.json(rows);
            },
            err => console.log("DB2 query failed: ", err.message)
          )
        }
      })
    })

    // upload attachments to the table in the DB2
    router.post("/attachFilesToDB2", (req, res) => {
      var form = new multiparty.Form();
      var rowCount = 0;
      form.parse(req, function (err, fields, files) {

        var tableName = "BPC.ATTACHMENTS_RDL_" + _.toUpper(fields.form[0]);   // the appropriate DB2 table name based on the form in which the file is attached

        if (files.uploadFile) {

          ibmdb.open(db2_connection, function (error, conn) {
            if (error) {
              console.log("DB2 connection error: ", error.message);
            } else {
              conn.query("select FILE_ID from " + tableName + " where PARENT_ID = '" + fields.id[0] + "'", function (err, rows) {
                if (err) {
                  console.log("DB2 query failed: ", err.message);
                } else {
                  rowCount = rows.length;
                  conn.prepare("insert into " + tableName + "(FILE_ID,FILE,FILENAME,PARENT_ID,FILE_DELETE) VALUES (?, ?, ?, ?, ?)", function (err, stmt) {
                    if (err) {
                      console.log(err);
                      return conn.closeSync();
                    }

                    for (var i = 0; i < files.uploadFile.length; i++) {
                      var file = files.uploadFile[i];
                      var data = fs.readFileSync(file.path, 'binary');
                      var fileInfo = { CType: "BLOB", DataType: "BLOB", Data: data };
                      var file_id = fields.id[0] + "-files-" + _.toString(rowCount + i);

                      stmt.execute([file_id, fileInfo, file.originalFilename, fields.id[0], 'No']).then(
                        result => res.end(),
                        reject => console.error(reject)
                      )
                    }
                  })
                }
              })
            }
          })
        }
      });
    })

    router.post("/attachOtherFilesToDB2", (req, res) => {
      var form = new multiparty.Form();
      var rowCount = 0;
      form.parse(req, function (err, fields, files) {
        var tableName = "BPC.ATTACHMENTS_RDL_" + _.toUpper(fields.form[0]);   // the appropriate DB2 table name based on the form in which the file is attached
        if (files.uploadFile) {
          ibmdb.open(db2_connection, function (error, conn) {
            if (error) {
              console.log("DB2 connection error: ", error.message);
            } else {
              conn.query("select FILE_ID from " + tableName + " where PARENT_ID = '" + fields.id[0] + "'", function (err, rows) {
                if (err) {
                  console.log("DB2 query failed: ", err.message);
                } else {
                  rowCount = rows.length;
                  conn.prepare("insert into " + tableName + "(FILE_ID,FILE,FILENAME,PARENT_ID,FILE_DELETE) VALUES (?, ?, ?, ?, ?)", function (err, stmt) {
                    if (err) {
                      console.log(err);
                      return conn.closeSync();
                    }

                    for (var i = 0; i < files.uploadFile.length; i++) {
                      var file = files.uploadFile[i];
                      var data = fs.readFileSync(file.path, 'binary');
                      var fileInfo = { CType: "BLOB", DataType: "BLOB", Data: data };
                      var file_id = fields.id[0] + "-files-" + _.toString(rowCount + i);
                      stmt.execute([file_id, fileInfo, file.originalFilename, fields.id[0], 'No']).then(
                        result => {
                          res.end()
                        },
                        reject => console.error(reject)
                      )
                    }
                  })
                }
              })
            }
          })
        }
      });
    })

    //Delete attachment from DB2
    router.post("/deleteFileFromDB2", (req, res) => {
      let fileID = req.body.docid;
      let tableName = "BPC.ATTACHMENTS_RDL_" + _.toUpper(req.body.form);   // the appropriate DB2 table name based on the form in which the file is attached
      ibmdb.open(db2_connection, function (error, conn) {
        if (error) {
          console.log("DB2 connection error: ", error.message);
        } else {
          conn.query("update " + tableName + " set FILE_DELETE='Yes' where FILE_ID = '" + fileID + "'", function (err, result) {
            if (!err) {
              ibmdb.close(conn);    // close the DB2 connection after it is used
              res.json({ "status": " File has been deleted successfully!!!" });
            } else {
              console.error("error = " + err);
              res.json({ "status": " File did not get deleted!!!" });
            }
          })
        }
      })
    })

    // Get the attachment from DB2
    router.get("/getFileFromDB2/:form/:docid/:filename", (req, res) => {
      let tableName = "BPC.ATTACHMENTS_RDL_" + _.toUpper(req.params.form);   // the appropriate DB2 table name based on the form in which the file is attached
      let fileID = req.params.docid;
      let filename = req.params.filename;
      ibmdb.open(db2_connection, function (error, conn) {
        if (error) {
          console.log("DB2 connection error: ", error.message);
        } else {
          conn.query("select FILE from " + tableName + " where FILE_ID = '" + fileID + "'").then(
            function (body) {
              const row = body[0];
              const data = row.FILE;
              const buf = Buffer.from(data, "binary");

              ibmdb.close(conn);    // close the DB2 connection after it is used

              res.attachment(filename);
              res.send(buf);
            }
          )
        }
      })
    })

    //my reviews
    router.get("/Myreviews", function (request, response) {
      var user = request.user['_json'];
      var searchStr = request.query.searchStr;
      var searchFieldsStr = "Form~~~dtACRBDate~~~dtOrgDate~~~txtLogNo~~~txtCPN~~~txtChannel~~~txtLAName~~~txtAssistAnalyst~~~txtRvwType~~~txtRvwMethod~~~txtTransactionNum~~~txtEnduserTr~~~txTransactionNum~~~txEnduserTr~~~txtAttNameMisc~~~rtAttachPR~~~dlgLogApprovers~~~txtStatus";
      var searchFieldsArr = _.split(searchFieldsStr, "~~~");

      if (searchStr == "") {
        bpc_cloudant.find(
          {
            "selector": {
              "Form": {
                "$in": [
                  "frmMain",
                  "frmAllegation",
                  "frmCHW",
                  "TransDoc",
                  "frmITS",
                  "frmMiscDoc",
                  "frmPrReview",
                  "frmSW",
                  "frmCFMBGF"
                ]
              },
              "txtStatus": {
                "$nor": [{
                  "$in": [
                    "Approved",
                    "Closed"
                  ]
                }]
              },
              "$or": [
                { "txtLAName": user.emailAddress },
                { "dlgLogApprovers": user.emailAddress },
                { "txtAssistAnalyst": { "$elemMatch": { "$eq": user.emailAddress } } },
                { "txtAssistAnalyst": { "$regex": user.emailAddress } }
              ]
            },
            "fields": [
              "txtLogNo",
              "txtCPN",
              "txtChannel",
              "txtLAName",
              "txtAssistAnalyst",
              "txtRvwType",
              "txtRvwMethod",
              "dtOrgDate",
              "dtACRBDate",
              "lock_status:0",
              "Form",
              "txtTransactionNum",
              "txtEnduserTr",
              "txTransactionNum",
              "txEnduserTr",
              "txtAttNameMisc",
              "rtAttachPR",
              "txtStatus",
              "_id",
              "_rev",
              "dlgLogApprovers"
            ],
            "sort": [
              {
                "txtLogNo": "desc"
              }
            ]
          },
          function (er, result) {
            if (er) {
              throw er;
            }


            _.forEach(result.docs, function (value, key) {
              if (value.txtLAName == user.emailAddress) {
                value.catName = "Lead Analyst";
              } else if (_.isArray(value.txtAssistAnalyst) && _.indexOf(value.txtAssistAnalyst, user.emailAddress) != -1) {
                value.catName = "Back-up Analyst";
              }
              else if (_.includes(value.txtAssistAnalyst, user.emailAddress)) {
                value.catName = "Back-up Analyst";
              } else if (value.dlgLogApprovers == user.emailAddress) {
                value.catName = "Reviewer";
              }
            })

            _.forEach(result.docs, function (value, key) {
              if (value.Form == 'frmMain') {
                value.Form = "*Main";
              }
            })

            var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
            var data = { "data": resultdocs };
            response.json(data);
          }
        )
      } else {
        var fullsearch = "";
        for (var i = 0; i < searchFieldsArr.length; i++) {
          var n = searchFieldsArr[i].length;
          var k = searchFieldsArr[i].indexOf("|");
          var fieldName = searchFieldsArr[i].substr(k + 1, n);
          if (i != searchFieldsArr.length - 1) {
            fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}},';
          } else {
            fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}}';  // the last field search will not end with comma
          }
        }

        var strquery = '{"$and": [{"$or":[' + fullsearch + ']},{"Form": {"$in":["frmMain","frmAllegation","frmCHW","TransDoc","frmITS","frmMiscDoc","frmPrReview", "frmSW","frmCFMBGF"]}},{"txtStatus": { "$nor": [{ "$in": ["Approved","Closed"] }]}},{"$or": [{ "txtLAName":"' + user.emailAddress + '"},{ "dlgLogApprovers":"' + user.emailAddress + '"},{ "txtAssistAnalyst": {"$elemMatch": {"$eq":"' + user.emailAddress + '"}}},{ "txtAssistAnalyst": {"$regex":"' + user.emailAddress + '"}}]}]}';
        var myquery = {};
        myquery = JSON.parse(strquery);

        bpc_cloudant.find({ selector: myquery }, function (er, result) {
          if (er) {
            throw er;
          }

          _.forEach(result.docs, function (value, key) {
            if (value.txtLAName == user.emailAddress) {
              value.catName = "Lead Analyst";
            } else if (_.isArray(value.txtAssistAnalyst) && _.indexOf(value.txtAssistAnalyst, user.emailAddress) != -1) {
              value.catName = "Back-up Analyst";
            }
            else if (_.includes(value.txtAssistAnalyst, user.emailAddress)) {
              value.catName = "Back-up Analyst";
            } else if (value.dlgLogApprovers == user.emailAddress) {
              value.catName = "Reviewer";
            }
          })

          _.forEach(result.docs, function (value, key) {
            if (value.Form == 'frmMain') {
              value.Form = "*Main";
            }
          })

          var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
          var data = { "data": resultdocs };
          response.json(data);
        }
        )
      }
    });

    //my reviewsAM
    router.get("/MyreviewsAM", function (request, response) {
      var user = request.user['_json'];
      var searchStr = request.query.searchStr;
      var searchFieldsStr = "Form~~~dtACRBDate~~~dtOrgDate~~~txtLogNo~~~txtCPN~~~txtChannel~~~txtLAName~~~txtAssistAnalyst~~~txtRvwType~~~txtRvwMethod~~~txtTransactionNum~~~txtEnduserTr~~~txTransactionNum~~~txEnduserTr~~~txtAttNameMisc~~~rtAttachPR~~~dlgLogApprovers~~~txtStatus";
      var searchFieldsArr = _.split(searchFieldsStr, "~~~");

      if (searchStr == "") {
        bpc_cloudant.find(
          {
            "selector": {
              "Form": {
                "$in": [
                  "frmMain",
                  "frmAllegation",
                  "frmCHW",
                  "TransDoc",
                  "frmITS",
                  "frmMiscDoc",
                  "frmPrReview",
                  "frmSW",
                  "frmCFMBGF"
                ]
              },
              "txGeo": {
                "$eq": "AM"
              },
              "txMajorMarket": {
                "$ne": "LA IOT"
              },
              "txtStatus": {
                "$nor": [{
                  "$in": [
                    "Approved",
                    "Closed"
                  ]
                }]
              },
              "$or": [
                { "txtLAName": user.emailAddress },
                { "dlgLogApprovers": user.emailAddress },
                { "txtAssistAnalyst": { "$elemMatch": { "$eq": user.emailAddress } } },
                { "txtAssistAnalyst": { "$regex": user.emailAddress } }
              ]
            },
            "fields": [
              "txtLogNo",
              "txtCPN",
              "txtChannel",
              "txtLAName",
              "txtAssistAnalyst",
              "txtRvwType",
              "txtRvwMethod",
              "dtOrgDate",
              "dtACRBDate",
              "lock_status:0",
              "Form",
              "txtTransactionNum",
              "txtEnduserTr",
              "txTransactionNum",
              "txEnduserTr",
              "txtAttNameMisc",
              "rtAttachPR",
              "txtStatus",
              "_id",
              "_rev",
              "dlgLogApprovers"
            ],
            "sort": [
              {
                "txtLogNo": "desc"
              }
            ]
          },
          function (er, result) {
            if (er) {
              throw er;
            }


            _.forEach(result.docs, function (value, key) {
              if (value.txtLAName == user.emailAddress) {
                value.catName = "Lead Analyst";
              } else if (_.isArray(value.txtAssistAnalyst) && _.indexOf(value.txtAssistAnalyst, user.emailAddress) != -1) {
                value.catName = "Back-up Analyst";
              }
              else if (_.includes(value.txtAssistAnalyst, user.emailAddress)) {
                value.catName = "Back-up Analyst";
              } else if (value.dlgLogApprovers == user.emailAddress) {
                value.catName = "Reviewer";
              }
            })

            _.forEach(result.docs, function (value, key) {
              if (value.Form == 'frmMain') {
                value.Form = "*Main";
              }
            })

            var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
            var data = { "data": resultdocs };
            response.json(data);
          }
        )
      } else {
        var fullsearch = "";
        for (var i = 0; i < searchFieldsArr.length; i++) {
          var n = searchFieldsArr[i].length;
          var k = searchFieldsArr[i].indexOf("|");
          var fieldName = searchFieldsArr[i].substr(k + 1, n);
          if (i != searchFieldsArr.length - 1) {
            fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}},';
          } else {
            fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}}';  // the last field search will not end with comma
          }
        }

        var strquery = '{"$and": [{"$or":[' + fullsearch + ']},{"Form": {"$in":["frmMain","frmAllegation","frmCHW","TransDoc","frmITS","frmMiscDoc","frmPrReview", "frmSW","frmCFMBGF"]}},{"txGeo": { "$eq": "AM" }},{"txMajorMarket": { "$ne": "LA IOT" }},{"txtStatus": { "$nor": [{ "$in": ["Approved","Closed"] }]}},{"$or": [{ "txtLAName":"' + user.emailAddress + '"},{ "dlgLogApprovers":"' + user.emailAddress + '"},{ "txtAssistAnalyst": {"$elemMatch": {"$eq":"' + user.emailAddress + '"}}},{ "txtAssistAnalyst": {"$regex":"' + user.emailAddress + '"}}]}]}';
        var myquery = {};
        myquery = JSON.parse(strquery);

        bpc_cloudant.find({ selector: myquery }, function (er, result) {
          if (er) {
            throw er;
          }

          _.forEach(result.docs, function (value, key) {
            if (value.txtLAName == user.emailAddress) {
              value.catName = "Lead Analyst";
            } else if (_.isArray(value.txtAssistAnalyst) && _.indexOf(value.txtAssistAnalyst, user.emailAddress) != -1) {
              value.catName = "Back-up Analyst";
            }
            else if (_.includes(value.txtAssistAnalyst, user.emailAddress)) {
              value.catName = "Back-up Analyst";
            } else if (value.dlgLogApprovers == user.emailAddress) {
              value.catName = "Reviewer";
            }
          })

          _.forEach(result.docs, function (value, key) {
            if (value.Form == 'frmMain') {
              value.Form = "*Main";
            }
          })

          var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
          var data = { "data": resultdocs };
          response.json(data);
        }
        )
      }
    });

    //my reviewsAP
    router.get("/MyreviewsAP", function (request, response) {
      var user = request.user['_json'];
      var searchStr = request.query.searchStr;
      var searchFieldsStr = "Form~~~dtACRBDate~~~dtOrgDate~~~txtLogNo~~~txtCPN~~~txtChannel~~~txtLAName~~~txtAssistAnalyst~~~txtRvwType~~~txtRvwMethod~~~txtTransactionNum~~~txtEnduserTr~~~txTransactionNum~~~txEnduserTr~~~txtAttNameMisc~~~rtAttachPR~~~dlgLogApprovers~~~txtStatus";
      var searchFieldsArr = _.split(searchFieldsStr, "~~~");

      if (searchStr == "") {
        bpc_cloudant.find(
          {
            "selector": {
              "Form": {
                "$in": [
                  "frmMain",
                  "frmAllegation",
                  "frmCHW",
                  "TransDoc",
                  "frmITS",
                  "frmMiscDoc",
                  "frmPrReview",
                  "frmSW",
                  "frmCFMBGF"
                ]
              },
              "txGeo": {
                "$eq": "AP"
              },
              "txGrowthMarket": {
                "$nor": [
                  {
                    "$in": [
                      "Japan IMT",
                      "JPN IMT",
                      "GCG IOT"
                    ]
                  }
                ]
              },
              "txtStatus": {
                "$nor": [{
                  "$in": [
                    "Approved",
                    "Closed"
                  ]
                }]
              },
              "$or": [
                { "txtLAName": user.emailAddress },
                { "dlgLogApprovers": user.emailAddress },
                { "txtAssistAnalyst": { "$elemMatch": { "$eq": user.emailAddress } } },
                { "txtAssistAnalyst": { "$regex": user.emailAddress } }
              ]
            },
            "fields": [
              "txtLogNo",
              "txtCPN",
              "txtChannel",
              "txtLAName",
              "txtAssistAnalyst",
              "txtRvwType",
              "txtRvwMethod",
              "dtOrgDate",
              "dtACRBDate",
              "lock_status:0",
              "Form",
              "txtTransactionNum",
              "txtEnduserTr",
              "txTransactionNum",
              "txEnduserTr",
              "txtAttNameMisc",
              "rtAttachPR",
              "txtStatus",
              "_id",
              "_rev",
              "dlgLogApprovers"
            ],
            "sort": [
              {
                "txtLogNo": "desc"
              }
            ]
          },
          function (er, result) {
            if (er) {
              throw er;
            }


            _.forEach(result.docs, function (value, key) {
              if (value.txtLAName == user.emailAddress) {
                value.catName = "Lead Analyst";
              } else if (_.isArray(value.txtAssistAnalyst) && _.indexOf(value.txtAssistAnalyst, user.emailAddress) != -1) {
                value.catName = "Back-up Analyst";
              }
              else if (_.includes(value.txtAssistAnalyst, user.emailAddress)) {
                value.catName = "Back-up Analyst";
              } else if (value.dlgLogApprovers == user.emailAddress) {
                value.catName = "Reviewer";
              }
            })

            _.forEach(result.docs, function (value, key) {
              if (value.Form == 'frmMain') {
                value.Form = "*Main";
              }
            })

            var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
            var data = { "data": resultdocs };
            response.json(data);
          }
        )
      } else {
        var fullsearch = "";
        for (var i = 0; i < searchFieldsArr.length; i++) {
          var n = searchFieldsArr[i].length;
          var k = searchFieldsArr[i].indexOf("|");
          var fieldName = searchFieldsArr[i].substr(k + 1, n);
          if (i != searchFieldsArr.length - 1) {
            fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}},';
          } else {
            fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}}';  // the last field search will not end with comma
          }
        }

        var strquery = '{"$and": [{"$or":[' + fullsearch + ']},{"Form": {"$in":["frmMain","frmAllegation","frmCHW","TransDoc","frmITS","frmMiscDoc","frmPrReview", "frmSW","frmCFMBGF"]}},{"txGeo": {"$eq": "AP"} },{"txGrowthMarket": {"$nor": [{"$in": [ "Japan IMT","JPN IMT","GCG IOT" ] }]}},{"txtStatus": { "$nor": [{ "$in": ["Approved","Closed"] }]}},{"$or": [{ "txtLAName":"' + user.emailAddress + '"},{ "dlgLogApprovers":"' + user.emailAddress + '"},{ "txtAssistAnalyst": {"$elemMatch": {"$eq":"' + user.emailAddress + '"}}},{ "txtAssistAnalyst": {"$regex":"' + user.emailAddress + '"}}]}]}';
        var myquery = {};
        myquery = JSON.parse(strquery);

        bpc_cloudant.find({ selector: myquery }, function (er, result) {
          if (er) {
            throw er;
          }

          _.forEach(result.docs, function (value, key) {
            if (value.txtLAName == user.emailAddress) {
              value.catName = "Lead Analyst";
            } else if (_.isArray(value.txtAssistAnalyst) && _.indexOf(value.txtAssistAnalyst, user.emailAddress) != -1) {
              value.catName = "Back-up Analyst";
            }
            else if (_.includes(value.txtAssistAnalyst, user.emailAddress)) {
              value.catName = "Back-up Analyst";
            } else if (value.dlgLogApprovers == user.emailAddress) {
              value.catName = "Reviewer";
            }
          })

          _.forEach(result.docs, function (value, key) {
            if (value.Form == 'frmMain') {
              value.Form = "*Main";
            }
          })

          var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
          var data = { "data": resultdocs };
          response.json(data);
        }
        )
      }
    });

    //my reviewsEMEA
    router.get("/MyreviewsEMEA", function (request, response) {
      var user = request.user['_json'];
      var searchStr = request.query.searchStr;
      var searchFieldsStr = "Form~~~dtACRBDate~~~dtOrgDate~~~txtLogNo~~~txtCPN~~~txtChannel~~~txtLAName~~~txtAssistAnalyst~~~txtRvwType~~~txtRvwMethod~~~txtTransactionNum~~~txtEnduserTr~~~txTransactionNum~~~txEnduserTr~~~txtAttNameMisc~~~rtAttachPR~~~dlgLogApprovers~~~txtStatus";
      var searchFieldsArr = _.split(searchFieldsStr, "~~~");

      if (searchStr == "") {
        bpc_cloudant.find(
          {
            "selector": {
              "Form": {
                "$in": [
                  "frmMain",
                  "frmAllegation",
                  "frmCHW",
                  "TransDoc",
                  "frmITS",
                  "frmMiscDoc",
                  "frmPrReview",
                  "frmSW",
                  "frmCFMBGF"
                ]
              },
              "txGeo": {
                "$eq": "EMEA"
              },
              "txtStatus": {
                "$nor": [{
                  "$in": [
                    "Approved",
                    "Closed"
                  ]
                }]
              },
              "$or": [
                { "txtLAName": user.emailAddress },
                { "dlgLogApprovers": user.emailAddress },
                { "txtAssistAnalyst": { "$elemMatch": { "$eq": user.emailAddress } } },
                { "txtAssistAnalyst": { "$regex": user.emailAddress } }
              ]
            },
            "fields": [
              "txtLogNo",
              "txtCPN",
              "txtChannel",
              "txtLAName",
              "txtAssistAnalyst",
              "txtRvwType",
              "txtRvwMethod",
              "dtOrgDate",
              "dtACRBDate",
              "lock_status:0",
              "Form",
              "txtTransactionNum",
              "txtEnduserTr",
              "txTransactionNum",
              "txEnduserTr",
              "txtAttNameMisc",
              "rtAttachPR",
              "txtStatus",
              "_id",
              "_rev",
              "dlgLogApprovers"
            ],
            "sort": [
              {
                "txtLogNo": "desc"
              }
            ]
          },
          function (er, result) {
            if (er) {
              throw er;
            }


            _.forEach(result.docs, function (value, key) {
              if (value.txtLAName == user.emailAddress) {
                value.catName = "Lead Analyst";
              } else if (_.isArray(value.txtAssistAnalyst) && _.indexOf(value.txtAssistAnalyst, user.emailAddress) != -1) {
                value.catName = "Back-up Analyst";
              }
              else if (_.includes(value.txtAssistAnalyst, user.emailAddress)) {
                value.catName = "Back-up Analyst";
              } else if (value.dlgLogApprovers == user.emailAddress) {
                value.catName = "Reviewer";
              }
            })

            _.forEach(result.docs, function (value, key) {
              if (value.Form == 'frmMain') {
                value.Form = "*Main";
              }
            })

            var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
            var data = { "data": resultdocs };
            response.json(data);
          }
        )
      } else {
        var fullsearch = "";
        for (var i = 0; i < searchFieldsArr.length; i++) {
          var n = searchFieldsArr[i].length;
          var k = searchFieldsArr[i].indexOf("|");
          var fieldName = searchFieldsArr[i].substr(k + 1, n);
          if (i != searchFieldsArr.length - 1) {
            fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}},';
          } else {
            fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}}';  // the last field search will not end with comma
          }
        }

        var strquery = '{"$and": [{"$or":[' + fullsearch + ']},{"Form": {"$in":["frmMain","frmAllegation","frmCHW","TransDoc","frmITS","frmMiscDoc","frmPrReview", "frmSW","frmCFMBGF"]}},{ "txGeo": {"$eq": "EMEA"}},{"txtStatus": { "$nor": [{ "$in": ["Approved","Closed"] }]}},{"$or": [{ "txtLAName":"' + user.emailAddress + '"},{ "dlgLogApprovers":"' + user.emailAddress + '"},{ "txtAssistAnalyst": {"$elemMatch": {"$eq":"' + user.emailAddress + '"}}},{ "txtAssistAnalyst": {"$regex":"' + user.emailAddress + '"}}]}]}';
        var myquery = {};
        myquery = JSON.parse(strquery);

        bpc_cloudant.find({ selector: myquery }, function (er, result) {
          if (er) {
            throw er;
          }

          _.forEach(result.docs, function (value, key) {
            if (value.txtLAName == user.emailAddress) {
              value.catName = "Lead Analyst";
            } else if (_.isArray(value.txtAssistAnalyst) && _.indexOf(value.txtAssistAnalyst, user.emailAddress) != -1) {
              value.catName = "Back-up Analyst";
            }
            else if (_.includes(value.txtAssistAnalyst, user.emailAddress)) {
              value.catName = "Back-up Analyst";
            } else if (value.dlgLogApprovers == user.emailAddress) {
              value.catName = "Reviewer";
            }
          })

          _.forEach(result.docs, function (value, key) {
            if (value.Form == 'frmMain') {
              value.Form = "*Main";
            }
          })

          var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
          var data = { "data": resultdocs };
          response.json(data);
        }
        )
      }
    });

    //my reviewsLA
    router.get("/MyreviewsLA", function (request, response) {
      var user = request.user['_json'];
      var searchStr = request.query.searchStr;
      var searchFieldsStr = "Form~~~dtACRBDate~~~dtOrgDate~~~txtLogNo~~~txtCPN~~~txtChannel~~~txtLAName~~~txtAssistAnalyst~~~txtRvwType~~~txtRvwMethod~~~txtTransactionNum~~~txtEnduserTr~~~txTransactionNum~~~txEnduserTr~~~txtAttNameMisc~~~rtAttachPR~~~dlgLogApprovers~~~txtStatus";
      var searchFieldsArr = _.split(searchFieldsStr, "~~~");

      if (searchStr == "") {
        bpc_cloudant.find(
          {
            "selector": {
              "Form": {
                "$in": [
                  "frmMain",
                  "frmAllegation",
                  "frmCHW",
                  "TransDoc",
                  "frmITS",
                  "frmMiscDoc",
                  "frmPrReview",
                  "frmSW",
                  "frmCFMBGF"
                ]
              },
              "txGeo": {
                "$eq": "AM"
              },
              "txMajorMarket": {
                "$eq": "LA IOT"
              },
              "txtStatus": {
                "$nor": [{
                  "$in": [
                    "Approved",
                    "Closed"
                  ]
                }]
              },
              "$or": [
                { "txtLAName": user.emailAddress },
                { "dlgLogApprovers": user.emailAddress },
                { "txtAssistAnalyst": { "$elemMatch": { "$eq": user.emailAddress } } },
                { "txtAssistAnalyst": { "$regex": user.emailAddress } }
              ]
            },
            "fields": [
              "txtLogNo",
              "txtCPN",
              "txtChannel",
              "txtLAName",
              "txtAssistAnalyst",
              "txtRvwType",
              "txtRvwMethod",
              "dtOrgDate",
              "dtACRBDate",
              "lock_status:0",
              "Form",
              "txtTransactionNum",
              "txtEnduserTr",
              "txTransactionNum",
              "txEnduserTr",
              "txtAttNameMisc",
              "rtAttachPR",
              "txtStatus",
              "_id",
              "_rev",
              "dlgLogApprovers"
            ],
            "sort": [
              {
                "txtLogNo": "desc"
              }
            ]
          },
          function (er, result) {
            if (er) {
              throw er;
            }


            _.forEach(result.docs, function (value, key) {
              if (value.txtLAName == user.emailAddress) {
                value.catName = "Lead Analyst";
              } else if (_.isArray(value.txtAssistAnalyst) && _.indexOf(value.txtAssistAnalyst, user.emailAddress) != -1) {
                value.catName = "Back-up Analyst";
              }
              else if (_.includes(value.txtAssistAnalyst, user.emailAddress)) {
                value.catName = "Back-up Analyst";
              } else if (value.dlgLogApprovers == user.emailAddress) {
                value.catName = "Reviewer";
              }
            })

            _.forEach(result.docs, function (value, key) {
              if (value.Form == 'frmMain') {
                value.Form = "*Main";
              }
            })

            var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
            var data = { "data": resultdocs };
            response.json(data);
          }
        )
      } else {
        var fullsearch = "";
        for (var i = 0; i < searchFieldsArr.length; i++) {
          var n = searchFieldsArr[i].length;
          var k = searchFieldsArr[i].indexOf("|");
          var fieldName = searchFieldsArr[i].substr(k + 1, n);
          if (i != searchFieldsArr.length - 1) {
            fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}},';
          } else {
            fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}}';  // the last field search will not end with comma
          }
        }

        var strquery = '{"$and": [{"$or":[' + fullsearch + ']},{"Form": {"$in":["frmMain","frmAllegation","frmCHW","TransDoc","frmITS","frmMiscDoc","frmPrReview", "frmSW","frmCFMBGF"]}},{ "txGeo": {"$eq": "AM"}},{"txMajorMarket": { "$eq": "LA IOT" }},{"txtStatus": { "$nor": [{ "$in": ["Approved","Closed"] }]}},{"$or": [{ "txtLAName":"' + user.emailAddress + '"},{ "dlgLogApprovers":"' + user.emailAddress + '"},{ "txtAssistAnalyst": {"$elemMatch": {"$eq":"' + user.emailAddress + '"}}},{ "txtAssistAnalyst": {"$regex":"' + user.emailAddress + '"}}]}]}';
        var myquery = {};
        myquery = JSON.parse(strquery);

        bpc_cloudant.find({ selector: myquery }, function (er, result) {
          if (er) {
            throw er;
          }

          _.forEach(result.docs, function (value, key) {
            if (value.txtLAName == user.emailAddress) {
              value.catName = "Lead Analyst";
            } else if (_.isArray(value.txtAssistAnalyst) && _.indexOf(value.txtAssistAnalyst, user.emailAddress) != -1) {
              value.catName = "Back-up Analyst";
            }
            else if (_.includes(value.txtAssistAnalyst, user.emailAddress)) {
              value.catName = "Back-up Analyst";
            } else if (value.dlgLogApprovers == user.emailAddress) {
              value.catName = "Reviewer";
            }
          })

          _.forEach(result.docs, function (value, key) {
            if (value.Form == 'frmMain') {
              value.Form = "*Main";
            }
          })

          var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
          var data = { "data": resultdocs };
          response.json(data);
        }
        )
      }
    });

    //my reviewsJAPAN
    router.get("/MyreviewsJAPAN", function (request, response) {
      var user = request.user['_json'];
      var searchStr = request.query.searchStr;
      var searchFieldsStr = "Form~~~dtACRBDate~~~dtOrgDate~~~txtLogNo~~~txtCPN~~~txtChannel~~~txtLAName~~~txtAssistAnalyst~~~txtRvwType~~~txtRvwMethod~~~txtTransactionNum~~~txtEnduserTr~~~txTransactionNum~~~txEnduserTr~~~txtAttNameMisc~~~rtAttachPR~~~dlgLogApprovers~~~txtStatus";
      var searchFieldsArr = _.split(searchFieldsStr, "~~~");

      if (searchStr == "") {
        bpc_cloudant.find(
          {
            "selector": {
              "Form": {
                "$in": [
                  "frmMain",
                  "frmAllegation",
                  "frmCHW",
                  "TransDoc",
                  "frmITS",
                  "frmMiscDoc",
                  "frmPrReview",
                  "frmSW",
                  "frmCFMBGF"
                ]
              },
              "txGeo": {
                "$eq": "AP"
              },
              "txGrowthMarket": {
                "$or": [
                  {
                    "$in": [
                      "Japan IMT",
                      "JPN IMT"
                    ]
                  }
                ]
              },
              "txtStatus": {
                "$nor": [{
                  "$in": [
                    "Approved",
                    "Closed"
                  ]
                }]
              },
              "$or": [
                { "txtLAName": user.emailAddress },
                { "dlgLogApprovers": user.emailAddress },
                { "txtAssistAnalyst": { "$elemMatch": { "$eq": user.emailAddress } } },
                { "txtAssistAnalyst": { "$regex": user.emailAddress } }
              ]
            },
            "fields": [
              "txtLogNo",
              "txtCPN",
              "txtChannel",
              "txtLAName",
              "txtAssistAnalyst",
              "txtRvwType",
              "txtRvwMethod",
              "dtOrgDate",
              "dtACRBDate",
              "lock_status:0",
              "Form",
              "txtTransactionNum",
              "txtEnduserTr",
              "txTransactionNum",
              "txEnduserTr",
              "txtAttNameMisc",
              "rtAttachPR",
              "txtStatus",
              "_id",
              "_rev",
              "dlgLogApprovers"
            ],
            "sort": [
              {
                "txtLogNo": "desc"
              }
            ]
          },
          function (er, result) {
            if (er) {
              throw er;
            }


            _.forEach(result.docs, function (value, key) {
              if (value.txtLAName == user.emailAddress) {
                value.catName = "Lead Analyst";
              } else if (_.isArray(value.txtAssistAnalyst) && _.indexOf(value.txtAssistAnalyst, user.emailAddress) != -1) {
                value.catName = "Back-up Analyst";
              }
              else if (_.includes(value.txtAssistAnalyst, user.emailAddress)) {
                value.catName = "Back-up Analyst";
              } else if (value.dlgLogApprovers == user.emailAddress) {
                value.catName = "Reviewer";
              }
            })

            _.forEach(result.docs, function (value, key) {
              if (value.Form == 'frmMain') {
                value.Form = "*Main";
              }
            })

            var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
            var data = { "data": resultdocs };
            response.json(data);
          }
        )
      } else {
        var fullsearch = "";
        for (var i = 0; i < searchFieldsArr.length; i++) {
          var n = searchFieldsArr[i].length;
          var k = searchFieldsArr[i].indexOf("|");
          var fieldName = searchFieldsArr[i].substr(k + 1, n);
          if (i != searchFieldsArr.length - 1) {
            fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}},';
          } else {
            fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}}';  // the last field search will not end with comma
          }
        }

        var strquery = '{"$and": [{"$or":[' + fullsearch + ']},{"Form": {"$in":["frmMain","frmAllegation","frmCHW","TransDoc","frmITS","frmMiscDoc","frmPrReview", "frmSW","frmCFMBGF"]}},{"txGeo": {"$eq": "AP"}},{"txGrowthMarket": {"$or": [{"$in": [ "Japan IMT","JPN IMT" ] }]}},{"txtStatus": { "$nor": [{ "$in": ["Approved","Closed"] }]}},{"$or": [{ "txtLAName":"' + user.emailAddress + '"},{ "dlgLogApprovers":"' + user.emailAddress + '"},{ "txtAssistAnalyst": {"$elemMatch": {"$eq":"' + user.emailAddress + '"}}},{ "txtAssistAnalyst": {"$regex":"' + user.emailAddress + '"}}]}]}';
        var myquery = {};
        myquery = JSON.parse(strquery);

        bpc_cloudant.find({ selector: myquery }, function (er, result) {
          if (er) {
            throw er;
          }

          _.forEach(result.docs, function (value, key) {
            if (value.txtLAName == user.emailAddress) {
              value.catName = "Lead Analyst";
            } else if (_.isArray(value.txtAssistAnalyst) && _.indexOf(value.txtAssistAnalyst, user.emailAddress) != -1) {
              value.catName = "Back-up Analyst";
            }
            else if (_.includes(value.txtAssistAnalyst, user.emailAddress)) {
              value.catName = "Back-up Analyst";
            } else if (value.dlgLogApprovers == user.emailAddress) {
              value.catName = "Reviewer";
            }
          })

          _.forEach(result.docs, function (value, key) {
            if (value.Form == 'frmMain') {
              value.Form = "*Main";
            }
          })

          var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
          var data = { "data": resultdocs };
          response.json(data);
        }
        )
      }
    });

    //my reviewsGCG
    router.get("/MyreviewsGCG", function (request, response) {
      var user = request.user['_json'];
      var searchStr = request.query.searchStr;
      var searchFieldsStr = "Form~~~dtACRBDate~~~dtOrgDate~~~txtLogNo~~~txtCPN~~~txtChannel~~~txtLAName~~~txtAssistAnalyst~~~txtRvwType~~~txtRvwMethod~~~txtTransactionNum~~~txtEnduserTr~~~txTransactionNum~~~txEnduserTr~~~txtAttNameMisc~~~rtAttachPR~~~dlgLogApprovers~~~txtStatus";
      var searchFieldsArr = _.split(searchFieldsStr, "~~~");
      console.log("entering in to myreviews GCG")
      if (searchStr == "") {
        bpc_cloudant.find(
          {
            "selector": {
              "Form": {
                "$in": [
                  "frmMain",
                  "frmAllegation",
                  "frmCHW",
                  "TransDoc",
                  "frmITS",
                  "frmMiscDoc",
                  "frmPrReview",
                  "frmSW",
                  "frmCFMBGF"
                ]
              },
              "txGeo": {
                "$eq": "AP"
              },
              "txGrowthMarket": {
                "$eq": "GCG IOT"
              },

              "txtStatus": {
                "$nor": [{
                  "$in": [
                    "Approved",
                    "Closed"
                  ]
                }]
              },
              "$or": [
                { "txtLAName": user.emailAddress },
                { "dlgLogApprovers": user.emailAddress },
                { "txtAssistAnalyst": { "$elemMatch": { "$eq": user.emailAddress } } },
                { "txtAssistAnalyst": { "$regex": user.emailAddress } }
              ]
            },
            "fields": [
              "txtLogNo",
              "txtCPN",
              "txtChannel",
              "txtLAName",
              "txtAssistAnalyst",
              "txtRvwType",
              "txtRvwMethod",
              "dtOrgDate",
              "dtACRBDate",
              "lock_status:0",
              "Form",
              "txtTransactionNum",
              "txtEnduserTr",
              "txTransactionNum",
              "txEnduserTr",
              "txtAttNameMisc",
              "rtAttachPR",
              "txtStatus",
              "_id",
              "_rev",
              "dlgLogApprovers"
            ],
            "sort": [
              {
                "txtLogNo": "desc"
              }
            ]
          },
          function (er, result) {
            if (er) {
              throw er;
            }


            _.forEach(result.docs, function (value, key) {
              if (value.txtLAName == user.emailAddress) {
                value.catName = "Lead Analyst";
              } else if (_.isArray(value.txtAssistAnalyst) && _.indexOf(value.txtAssistAnalyst, user.emailAddress) != -1) {
                value.catName = "Back-up Analyst";
              }
              else if (_.includes(value.txtAssistAnalyst, user.emailAddress)) {
                value.catName = "Back-up Analyst";
              } else if (value.dlgLogApprovers == user.emailAddress) {
                value.catName = "Reviewer";
              }
            })

            _.forEach(result.docs, function (value, key) {
              if (value.Form == 'frmMain') {
                value.Form = "*Main";
              }
            })

            var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
            var data = { "data": resultdocs };
            response.json(data);
          }
        )
      } else {
        var fullsearch = "";
        for (var i = 0; i < searchFieldsArr.length; i++) {
          var n = searchFieldsArr[i].length;
          var k = searchFieldsArr[i].indexOf("|");
          var fieldName = searchFieldsArr[i].substr(k + 1, n);
          if (i != searchFieldsArr.length - 1) {
            fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}},';
          } else {
            fullsearch = fullsearch + '{"' + fieldName + '":{"$regex":"^(?i).*?' + searchStr + '"}}';  // the last field search will not end with comma
          }
        }

        var strquery = '{"$and": [{"$or":[' + fullsearch + ']},{"Form": {"$in":["frmMain","frmAllegation","frmCHW","TransDoc","frmITS","frmMiscDoc","frmPrReview", "frmSW","frmCFMBGF"]}},{"txGeo": {"$eq": "AP"}},{"txGrowthMarket": {"$or": [{"$in": [ "GCG IOT" ] }]}},{"txtStatus": { "$nor": [{ "$in": ["Approved","Closed"] }]}},{"$or": [{ "txtLAName":"' + user.emailAddress + '"},{ "dlgLogApprovers":"' + user.emailAddress + '"},{ "txtAssistAnalyst": {"$elemMatch": {"$eq":"' + user.emailAddress + '"}}},{ "txtAssistAnalyst": {"$regex":"' + user.emailAddress + '"}}]}]}';
        var myquery = {};
        myquery = JSON.parse(strquery);

        bpc_cloudant.find({ selector: myquery }, function (er, result) {
          if (er) {
            throw er;
          }

          _.forEach(result.docs, function (value, key) {
            if (value.txtLAName == user.emailAddress) {
              value.catName = "Lead Analyst";
            } else if (_.isArray(value.txtAssistAnalyst) && _.indexOf(value.txtAssistAnalyst, user.emailAddress) != -1) {
              value.catName = "Back-up Analyst";
            }
            else if (_.includes(value.txtAssistAnalyst, user.emailAddress)) {
              value.catName = "Back-up Analyst";
            } else if (value.dlgLogApprovers == user.emailAddress) {
              value.catName = "Reviewer";
            }
          })

          _.forEach(result.docs, function (value, key) {
            if (value.Form == 'frmMain') {
              value.Form = "*Main";
            }
          })

          var resultdocs = _.orderBy(result.docs, ["txtLogNo", doc => doc.Form.toLowerCase()], ["desc"]['asc']);
          var data = { "data": resultdocs };
          response.json(data);
        }
        )
      }
    });


    // restore Multiple records

    router.post("/restoreMultiple", (req, res) => {
      var recIds_Array = [];
      sign = req.body.sign;
      curdt_enc = req.body.curdt;
      curdt = decodeURIComponent(curdt_enc);
      curdtest_enc=req.body.curdtest;
      curdtest=decodeURIComponent(curdtest_enc);
      recordIds = req.body.recIds;
      recIds_Array = recordIds.split(",");
      var reviewdocs = [];
      bpc_cloudant.find({
        "selector": {
          "_id": {
            "$in":
              recIds_Array
          }
        }
      }, function (er, revresult) {
        if (er) {
          throw er;

        }

        reviewdocs = revresult.docs;


        _.forEach(reviewdocs, (doc, index) => {

          doc.Form = doc.OldForm;
          doc.dtmodified = curdtest;
          if (typeof (doc.txtMainAudit) === "undefined") {
            doc.txtMainAudit = "\n" + curdt + " :" + sign + ", Restored the record " + "\n";
          } else if (doc.OldForm == "frmMain") {
            doc.txtMainAudit = curdt + " :" + sign + ", Restored the record " + doc.txtMainAudit;
            console.log("after if", doc.txtMainAudit);
            reviewdocs[index] = doc;
          }

          if (typeof (doc.txtSWAudit) === "undefined") {
            doc.txtSWAudit = "\n" + curdt + " :" + sign + ", Restored the record " + "\n";
          } else if (doc.OldForm == "frmAllegation") {
            doc.txtSWAudit = curdt + " :" + sign + ", Restored the record " + doc.txtSWAudit;
            console.log("Allegation", doc.txtSWAudit);
            reviewdocs[index] = doc;
          } else if (doc.OldForm == "frmSW") {
            doc.txtSWAudit = curdt + " :" + sign + ", Restored the record " + doc.txtSWAudit;
            console.log("SW transaction", doc.txtSWAudit);
            reviewdocs[index] = doc;
          } else if (doc.OldForm == "frmPrReview") {
            doc.txtSWAudit = curdt + " :" + sign + ", Restored the record " + doc.txtSWAudit;
            console.log("Peer review", doc.txtSWAudit);
            reviewdocs[index] = doc;
          }

          if (typeof (doc.txtCHWAudit) === "undefined") {
            doc.txtCHWAudit = "\n" + curdt + " :" + sign + ", Restored the record " + "\n";
          } else if (doc.OldForm == "frmCHW") {
            doc.txtCHWAudit = curdt + " :" + sign + ", Restored the record " + doc.txtCHWAudit;
            console.log("txtCHWAudit", doc.txtCHWAudit);
            reviewdocs[index] = doc;
          }

          if (typeof (doc.txtITSAudit) === "undefined") {
            doc.txtITSAudit = "\n" + curdt + " :" + sign + ", Restored the record " + "\n";
          } else if (doc.OldForm == "frmITS") {
            doc.txtITSAudit = curdt + " :" + sign + ", Restored the record " + doc.txtITSAudit;
            console.log("txtITSAudit", doc.txtITSAudit);
            reviewdocs[index] = doc;
          }

          if (typeof (doc.txtPRAudit) === "undefined") {
            doc.txtPRAudit = "\n" + curdt + " :" + sign + ", Restored the record " + "\n";
          } else if (doc.OldForm == "frmMiscDoc") {
            doc.txtPRAudit = curdt + " :" + sign + ", Restored the record " + doc.txtPRAudit;
            console.log("txtPRAudit", doc.txtPRAudit);
            reviewdocs[index] = doc;
          }

          if (typeof (doc.txtTransAudit) === "undefined") {
            doc.txtTransAudit = "\n" + curdt + " :" + sign + ", Restored the record " + "\n";
          } else if (doc.OldForm == "TransDoc") {
            doc.txtTransAudit = curdt + " :" + sign + ", Restored the record " + doc.txtTransAudit;
            console.log("txtTransAudit", doc.txtTransAudit);
            reviewdocs[index] = doc;
          }

          if (typeof (doc.txtCFMBGFAudit) === "undefined") {
            doc.txtCFMBGFAudit = "\n" + curdt + " :" + sign + ", Restored the record " + "\n";
          } else if (doc.OldForm == "frmCFMBGF") {
            doc.txtCFMBGFAudit = curdt + " :" + sign + ", Restored the record " + doc.txtCFMBGFAudit;
            console.log("txtCFMBGFAudit", doc.txtCFMBGFAudit);
            reviewdocs[index] = doc;
          }
        })
        bpc_cloudant.bulk({ docs: reviewdocs }, function (er, result) {
          if (er) {
            errLog = errLog + "\n " + er;
            console.log("error while inserting errlog" + errLog);
          }
          console.log("selected records are restored Successfully");
          if (result) {
            res.json("Success");
          }

        })
      })
    })

    // Query to list the view for "maintenance view"
    router.get("/maintenanceview", function (request, response) {
      bpc_cloudant.find(
        {
          "selector": {
            "Form": {
              "$in": [
                "frmMain",
                "frmAllegation",
                "frmCHW",
                "TransDoc",
                "frmITS",
                "frmMiscDoc",
                "frmPrReview",
                "frmSW",
                "frmCFMBGF"]
            },
            "txtLogNo": {
              "$ne": ""
            }
          },
          "fields": [
            "txtStatus",
            "txtLogNo",
            "txtCPN",
            "lock_status",
            "$REF",
            "txtChannel",
            "txtLAName",
            "txtAssistAnalyst",
            "txtRvwType",
            "txtRvwMethod",
            "dtOrgDate",
            "dtACRBDate",
            "txtTransactionNum",
            "txtEnduserTr",
            "txTransactionNum",
            "txEnduserTr",
            "txtAttNameMisc",
            "rtAttachPR",
            "Form",
            "_id",
            "_rev"
          ],
          "sort": [
            {
              "txtLogNo": "desc"
            }
          ]
        },
        function (er, result) {
          if (er) {
            throw er;
          }

          //console.log("results",result.docs);
          // console.log("result length",result.docs.length);
          var display = "";
          var finalResult = [];
          console.log("Initial Result", result.docs.length);
          // let validationStr = "Please find the below main and child relation breaks"
          var Maindocs = _.filter(result.docs, ['Form', 'frmMain']);
          var maindocsWithLogs = Maindocs.forEach((note) => {
            return note.txtLogNo != "";
          })
          console.log("Maindocs length", Maindocs.length);
          //console.log("Maindocs with logs length",maindocsWithLogs.length);
          var childdocs = result.docs.filter((item) => {
            return item.Form != "frmMain"
          })
          console.log("childdocs length", childdocs.length);
          _.forEach(Maindocs, function (mainitem, key) {
            var currentChildSet = _.filter(childdocs, ['txtLogNo', mainitem.txtLogNo]);
            console.log("currentChildSet", currentChildSet.length);
            //console.log("currentChildSet:", _.filter(childdocs,['txtLogNo',mainitem.txtLogNo]))
            _.forEach(currentChildSet, function (value, key) {
              if (value.$REF != mainitem._id) {
                //result.docs = currentChildSet
                finalResult.push(value);
              }
            })
          })

          console.log("final result length", finalResult.length);
          //console.log("final result",finalResult);
          // sorting the view by default when the view loads
          var result = _.orderBy(finalResult, ['txtStatus', 'txtLogNo', doc => doc.Form.toLowerCase()], ['asc', 'desc', 'asc']);
          var data = { "data": result };
          response.json(data);
        })
    });

    //get the parent doc
    router.get("/getParentDoc", function (request, response) {
      var id = request.query.id;
      //.console.log("docbyid",request);
      bpc_cloudant.find({
        "selector": {
          "$and": [{
            "txtLogNo": {
              "$eq": id
            }
          },
          {
            "Form": {
              "$eq": "frmMain"
            }
          },
          ]
        }
      }, function (er, result) {
        // console.log(result);

        if (er) {
          throw er;
          return;
        }
        var data = {
          "data": result.docs
        };
        response.json(data);
      })
    })
  
    module.exports = router;
