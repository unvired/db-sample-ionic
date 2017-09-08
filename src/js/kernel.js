/** kernel-mobiweb
 *  Unvired hybrid sdk for building app for mobile and web
 *  @author Tarak Kar
 *  Dependendency for Mobile - cordova.js  & for Web - loki.js
 */
var ump;
(function (ump) {
    /**
     *  REST Apis endpoints
     */
    var restApis = {
        defaultApi: '/UMP/API/v2/applications/',
        activate: '/activate/',
        authenticate: '/authenticate',
        session: '/UMP/API/v2/session/',
        execute: '/execute/',
        users: '/UMP/API/v2/users/'
    };
    /**
     * Parameters required for login and other default configuration parameters
     * App should set all required parameters before any login api call
     */
    var loginParameters = {
        appName: "",
        company: "",
        username: "",
        password: "",
        url: "",
        domain: "",
        loginType: "UNVIRED_ID",
        feUserId: "",
        //Default metadata path is root where index.html is
        metadataPath: ""
    };
    /**
     * Register for login callback passing callback in ump.login.login();
     * Gives callback with any of these listenerType and app take action based on listenerType.
     *
     * For web app only auth_activation_success and auth_activation_error are relevant.
     * For mobile app all enum propeties are valid.
     */
    var loginListenerType;
    (function (loginListenerType) {
        loginListenerType[loginListenerType["auth_activation_required"] = 0] = "auth_activation_required";
        loginListenerType[loginListenerType["app_requires_login"] = 1] = "app_requires_login";
        loginListenerType[loginListenerType["auth_activation_success"] = 2] = "auth_activation_success";
        loginListenerType[loginListenerType["auth_activation_error"] = 3] = "auth_activation_error";
        loginListenerType[loginListenerType["login_success"] = 4] = "login_success";
        loginListenerType[loginListenerType["login_error"] = 5] = "login_error"; // Mobile app login failure
    })(loginListenerType = ump.loginListenerType || (ump.loginListenerType = {}));
    /**
     * Login module to use for authentication. Unvired supports UNVIRED,SAP,ADS and CUSTOM modules to authenticate.
     * Default module is UNVIRED
     */
    ump.loginType = {
        unvired: "UNVIRED_ID",
        ads: "ADS",
        sap: "SAP",
        custom: "CUSTOM"
    };
    /**
     *  loginMode is used to check for specific parameters for different mode
     */
    var loginMode;
    (function (loginMode) {
        loginMode[loginMode["authActivate"] = 0] = "authActivate";
        loginMode[loginMode["authLocal"] = 1] = "authLocal";
        loginMode[loginMode["forgotPassword"] = 2] = "forgotPassword";
    })(loginMode || (loginMode = {}));
    /**
     * result type in returned callbackResult
     */
    var resultType;
    (function (resultType) {
        resultType[resultType["success"] = 0] = "success";
        resultType[resultType["error"] = 1] = "error";
    })(resultType = ump.resultType || (ump.resultType = {}));
    /**
     * Decide application data add /modify / delete based on the request type.
     * 0. RQST - Response for client initiated request. Act based on the 'action' flag.
     * 1. PULL - Server initiated push. The data on the client should be replaced with this data.
     * 2. PUSH - Backend application initiated push of data. Act on this based on the 'action' flag.
     * 3. QUERY - Data query requests from client to server.
     * 4. REQ - Data submit only requests from client to server.
     */
    var requestType;
    (function (requestType) {
        requestType[requestType["RQST"] = 0] = "RQST";
        requestType[requestType["PULL"] = 1] = "PULL";
        requestType[requestType["PUSH"] = 2] = "PUSH";
        requestType[requestType["QUERY"] = 3] = "QUERY";
        requestType[requestType["REQ"] = 4] = "REQ";
    })(requestType = ump.requestType || (ump.requestType = {}));
    /**
     * Different types of notificatin events passed to app in notification lister callback
     */
    var notifListenerType = {
        dataSend: 0,
        dataChanged: 1,
        dataReceived: 2,
        appReset: 3 //Notify application data reset.
    };
    var conflictRule;
    (function (conflictRule) {
        conflictRule[conflictRule["SERVER_WINS"] = 0] = "SERVER_WINS";
        conflictRule[conflictRule["CLIENT_WINS"] = 1] = "CLIENT_WINS";
    })(conflictRule || (conflictRule = {}));
    /**
     * Parse metadata.json and hold it in metadata in localstorage
     */
    var metadata = {
        "sMeta": [],
        "fMeta": [],
        "bMeta": []
    };
    /**
     * flag to check for running environment mobile or web
     */
    ump.isMobile = (function () {
        /* if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
             return true;
         return false;*/
        var fromBrowser = document.URL.match(/^https?:/);
        if (fromBrowser)
            return false;
        return true;
    })();
    /**
     * login module provide all login related apis and account related apis
     */
    var login = (function () {
        function login() {
        }
        /**
         * login - Set required Login Parameters for current Login Module and call login. Framework gives all login related callbacks in passed callback parameter.
         *
         * Example - ump.login.parameters.appName = "SAP_ERP_SO_TEMPLATE";
         *           ump.login.parameters.username ="TARAK";
         *           ump.login.parameters.url = "http://demo.unvired.io/UMP";
         *           ump.login.parameters.company = "UNVIRED";
         *
         *           umo.login.login(callback(res){ });
         *
         *  in Login listener callback check   if(res.type === ump.login.listenerType.show_login_screen){  //show login screen  }
         *
         *  @param {function} callback - (Optional) user supplied async callback / error handler
         *
         */
        login.login = function (callback) {
            if (helper.isEmpty(login.parameters.appName)) {
                helper.sendError("Please provide valid app name!", callback);
                return;
            }
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "LoginPlugin", "login", [this.parameters]);
            }
            else {
                helper.clearLokiDbs();
                metadataParser.initialize();
                if (callback) {
                    login._loginListener = callback;
                    var cbResult = {};
                    cbResult.type = 0;
                    callback(cbResult);
                }
            }
        };
        /**
         * logout() - Close all database and shut down all thread
         */
        login.logout = function () {
            if (ump.isMobile) {
                cordova.exec(null, null, "LoginPlugin", "logout", []);
            }
            else {
                helper.clearLokiDbs();
            }
        };
        /**
         * getListOfFrontEndUsers - Get list of frontendUsers for given Master user..
         * Returns response object with Type (success/failure) and message
         *
         * Example - ump.login.parameters.appName = "SAP_ERP_SO_TEMPLATE";
         *           ump.login.parameters.username ="TARAK";
         *           ump.login.parameters.url = "http://demo.unvired.io/UMP";
         *           ump.login.parameters.company = "UNVIRED";
         *
         *           ump.login.getListOfFrontEndUsers(callback(res){ });
         *
         *  in Login listener callback check   if(res.type === ump.login.listenerType.auth_success){  //result.data contains array of frontendUsers  }
         *
         *  @param {function} callback - (Optional) user supplied async callback / error handler
         */
        login.getListOfFrontEndUsers = function (callback) {
            if (!helper.validateLoignParameters(loginMode.authActivate, callback))
                return;
            if (ump.isMobile) {
                alert("Api not supported on Web!");
            }
            else {
                restUtil.appMeta = {};
                restUtil.appMeta.appName = loginParameters.appName;
                restUtil.appMeta.url = loginParameters.url;
                restUtil.appMeta.authorization = 'Basic ' + window.btoa(loginParameters.company + "\\" + loginParameters.username + ":" + loginParameters.password);
                var endpoint = restUtil.appMeta.url + restApis.users + loginParameters.username;
                restUtil.performRequest(endpoint, "", function (result) {
                    callback(result);
                }, restUtil.httpType.get);
            }
        };
        /**
         * authenticateAndActivate - authenticate and activate application against ump. Framework gives callback to registered LoginListener
         * Returns response object with Type (success/failure) and message
         *
         * Example - ump.login.parameters.appName = "SAP_ERP_SO_TEMPLATE";
         *           ump.login.parameters.username ="TARAK";
         *           ump.login.parameters.url = "http://demo.unvired.io/UMP";
         *           ump.login.parameters.company = "UNVIRED";
         *
         *           ump.login.authenticateAndActivate(callback(res){ });
         *
         *  in Login listener callback check   if(res.type === ump.login.listenerType.auth_success){  //Navigate to Application Home  }
         *
         *  @param {function} callback - (Optional) user supplied async callback / error handler
         */
        login.authenticateAndActivate = function (callback) {
            if (!helper.validateLoignParameters(loginMode.authActivate, callback))
                return;
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "LoginPlugin", "authenticateAndActivate", [this.parameters]);
            }
            else {
                //For Web sdk choose fronend type as Web and it is auto activate while deployed   
                restUtil.appMeta = {};
                restUtil.appMeta.frontEnd = loginParameters.feUserId;
                restUtil.appMeta.appName = loginParameters.appName;
                restUtil.appMeta.url = loginParameters.url;
                restUtil.appMeta.userName = loginParameters.username;
                var endpoint;
                switch (ump.login.parameters.loginType) {
                    case ump.loginType.unvired:
                        restUtil.appMeta.authorization = 'Basic ' + window.btoa(loginParameters.company + "\\" + loginParameters.username + ":" + loginParameters.password);
                        endpoint = restUtil.appMeta.url + restApis.session;
                        break;
                    case ump.loginType.sap:
                        restUtil.appMeta.authorization = 'Basic ' + window.btoa(loginParameters.company + "\\" + loginParameters.username);
                        endpoint = restUtil.appMeta.url + restApis.session + 'applications/' + restUtil.appMeta.appName;
                        restUtil.appMeta.credentials = JSON.stringify([{ "port": ump.login.parameters.domain, "user": ump.login.parameters.username, "password": ump.login.parameters.password }]);
                        break;
                }
                /**
                 * Session call. Use authKey for successive calls.
                 * Check users for any frontentd of type web to continue else return frontend not found
                 */
                restUtil.performRequest(endpoint, "", function (result) {
                    if (result.type == resultType.success) {
                        var users = result.data.users;
                        var isFound = false;
                        for (var _i = 0, users_1 = users; _i < users_1.length; _i++) {
                            var u = users_1[_i];
                            if (u["frontendType"] === "BROWSER") {
                                var apps = u.applications;
                                if (!helper.isEmpty(apps)) {
                                    for (var _a = 0, apps_1 = apps; _a < apps_1.length; _a++) {
                                        var app = apps_1[_a];
                                        if (app.name === restUtil.appMeta.appName) {
                                            isFound = true;
                                            restUtil.appMeta.frontEnd = u["name"];
                                        }
                                    }
                                }
                            }
                        }
                        if (!isFound) {
                            helper.sendError('No Deployed application for frontend type of BROWSER found', callback);
                            return;
                        }
                        restUtil.appMeta.authorization = 'Basic ' + window.btoa(loginParameters.company + "\\" + loginParameters.username + ":" + result.data.authKey);
                        //Invalidate session
                        endpoint = restUtil.appMeta.url + restApis.session + result.data.sessionId;
                        restUtil.performRequest(endpoint, "", function (sessionInvalidateResult) { }, restUtil.httpType.del);
                        restUtil.appMeta.credentials = "";
                        //On activation success save app meta for further calls.    
                        webDb.initialize();
                        webDb.saveAppMeta(restUtil.appMeta);
                        callback(result);
                    }
                    else {
                        var errText = "";
                        if (!helper.isEmpty(result)) {
                            errText = helper.isEmpty(result.error) ? "No error description returned from server" : JSON.parse(result.error).error;
                        }
                        helper.sendError(errText, callback);
                    }
                }, restUtil.httpType.post);
            }
        };
        /**
         * authenticateLocal - Authenticate with userName,password saved in database
         *
         * Example - ump.login.parameters.username ="TARAK";
         *           ump.login.parameters.password = "MS123*";
         *
         *           ump.login.authenticateLocal(callback(res){ });
         *
         *  in Login listener callback check   if(res.type === ump.login.listenerType.login_success){  //Handle login success  }
         *
         *  @param {function} callback - (Optional) user supplied async callback / error handler
         *
         *  Mobile Only api
         */
        login.authenticateLocal = function (callback) {
            if (!helper.validateLoignParameters(loginMode.authLocal, callback))
                return;
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "LoginPlugin", "authenticateLocal", [this.parameters]);
            }
            else {
                alert("Api not supported on Web!");
            }
        };
        /**
         * getAllAccount - Get all existing Account
         *
         *  @param {function} callback - (Optional) user supplied async callback / error handler
         *
         *  Mobile Only api
         */
        login.getAllAccounts = function (callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "LoginPlugin", "getAllAccount", []);
            }
            else {
                alert("Api not supported on Web!");
            }
        };
        /**
         * switchAccount - Switch to given Account.
         *
         *  @param {object} account - Account to switch
         *  @param {function} callback - (Optional) user supplied async callback / error handler
         *
         *  Mobile Only api
         */
        login.switchAccount = function (account, callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "LoginPlugin", "switchAccount", [account]);
            }
            else {
                alert("Api not supported on Web!");
            }
        };
        /**
         * deleteAccount - Delete given Account
         *
         *  @param {object} account - Account to switch
         *  @param {function} callback - (Optional) user supplied async callback / error handler
         *
         * Mobile Only api
         */
        login.deleteAccount = function (account, callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "LoginPlugin", "deleteAccount", [account]);
            }
            else {
                alert("Api not supported on Web!");
            }
        };
        login.parameters = loginParameters;
        login.listenerType = loginListenerType;
        login._loginMode = loginMode;
        login._loginListener = null;
        return login;
    }());
    ump.login = login;
    /**
     * sync - Exchange data with ump server in sync and async mode.
     *        Request for async submitted data on ready state on ump.
     */
    var sync = (function () {
        function sync() {
        }
        /**
         * submitInSync - submit data to ump server in sync mode
         *
         * Example - ump.sync.submitInSync(CUSTOMER_INPUT_HEADER,"","UNVIRED_CUSTOMER_SEARCH_ECC_PA_GET_CUSTOMERS", true, callback);
         *
         * @param {requestType} reqype - Message request type(RQST/PULL/PUSH/QUERY/REQ) to be sent to the server.
         * @param {object} header - Header Datastructure  {"Header name": {field name : field value,...}}
         * @param {string} customData - custome data as string
         * @param {string} paFunction - Name of the process agent that is required to be called in the server.
         * @param {boolean} autoSave - flag to decide whether framework should save the data in databse or not.
         * @param {function} callback - (Optional) user supplied async callback / error handler
         *
         */
        sync.submitInSync = function (reqype, header, customData, paFunction, autoSave, callback) {
            if (ump.isMobile) {
                var query = {
                    "requestType": requestType[reqype],
                    "header": header == null ? "" : header,
                    "customData": customData == null ? "" : customData,
                    "autoSave": autoSave,
                    "paFunction": paFunction
                };
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "SyncEnginePlugin", "submitInSync", [query]);
            }
            else {
                webDb.appDb.loadDatabase({});
                if (!restUtil.appMeta.url || restUtil.appMeta.url === "") {
                    restUtil.appMeta = webDb.getAppMeta();
                }
                var endpoint = restUtil.appMeta.url + restApis.defaultApi + restUtil.appMeta.appName + restApis.execute + paFunction;
                var postMessage = "";
                if (header === null || header === "")
                    postMessage = customData;
                // else
                //     postMessage = getBusinessEntityFromHeader(header);
                restUtil.performRequest(endpoint, postMessage, function (result) {
                    if (result.type == resultType.success) {
                        if (autoSave) {
                            result = parser.parseServerResponse(JSON.parse(result.data), reqype);
                            return callback(result);
                        }
                    }
                    return callback(result);
                }, restUtil.httpType.post);
            }
        };
        /*
         * submitDataInASync - submit data to ump server in async mode. Application will be notified through register NotificationListener callback.
         *
         * Example - ump.sync.submitInAsync(requestType.RQST,CUSTOMER_HEADER,"","UNVIRED_CUSTOMER_SEARCH_ECC_PA_GET_CUSTOMERS","CUSTOMER",CUSTOMER_HEADER.Lid, true, callback);
         *
         * @param {requestType} reqType - Message request type (RQST/PULL/PUSH/QUERY) to be sent to the server.
         * @param {object} header - Header Datastructure object  {"Header name": {field name : field value,...}}
         * @param {string} customData -  custom data
         * @param {string} paFunction - Name of the process agent that is required to be called in the server.
         * @param {string} beName - Name of the BusinessEntity
         * @param {string} beLid - Lid of Header
         * @param {boolean} bypassAttachment - boolean whether to ignore attachment while sending data to server
         * @param {function} callback - (Optional) user supplied async callback / error handler
         */
        sync.submitInAsync = function (requestType, header, customData, paFunction, beName, belid, bypassAttachment, callback) {
            if (ump.isMobile) {
                var query = {
                    "requestType": requestType,
                    "header": header == null ? "" : header,
                    "customData": customData == null ? "" : customData,
                    "paFunction": paFunction,
                    "beName": beName,
                    "belid": belid,
                    "bypassAttachment": bypassAttachment
                };
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "SyncEnginePlugin", "submitInASync", [query]);
            }
            else {
                /**
                 * In Web Async call works same as in Sync. Receives response data in callback instead of NotificationListener callback in Mobile.
                 * App has to handle async response differently for both
                 */
                webDb.appDb.loadDatabase({});
                if (!restUtil.appMeta.url || restUtil.appMeta.url === "") {
                    restUtil.appMeta = webDb.getAppMeta();
                }
                var endpoint = restUtil.appMeta.url + restApis.defaultApi + restUtil.appMeta.appName + restApis.execute + paFunction;
                var postMessage = "";
                if (header === null || header === "")
                    postMessage = customData;
                restUtil.performRequest(endpoint, postMessage, function (result) {
                    return callback(result);
                }, restUtil.httpType.post);
            }
        };
        /**
         * getMessages - Request for downloading messages in ready state from server and will be notified through Notification Listener
         *
         *  @param {function} callback - (Optional) user supplied async callback / error handler
         *
         * Mobile Only api
         */
        sync.getMessages = function (callback) {
            if (ump.isMobile) {
                cordova.exec(function () {
                    callback;
                }, function (e) {
                    console.log(e);
                }, "SyncEnginePlugin", "getMessages", []);
            }
            else {
                alert("Api not supported on Web!");
            }
        };
        /**
         * registerNotificationListener - Register for callback on GetMessage status
         *
         * @param {function} callback - (Optional) user supplied async callback / error handler
         *
         * Mobile Only api
         */
        sync.registerNotifListener = function (callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "SyncEnginePlugin", "registerNotifListener", []);
            }
            else {
                alert("Api not supported on Web!");
            }
        };
        /**
         * unRegisterNotificationListener - UnRegister for callback on GetMessage status
         *
         *  @param {function} callback - (Optional) user supplied async callback / error handler
         *
         * Mobile Only api
         */
        sync.unregisterNotifListener = function (callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "SyncEnginePlugin", "unRegisterNotifListener", []);
            }
            else {
                alert("Api not supported on Web!");
            }
        };
        /**
         * geterateUBJson - Generate Unvired BusinessEntity json from header and items
         * @param {string} headerName - header structure name
         * @param {object} header - Header Datastructure object  {"Header name": {field name : field value,...}}
         * @param {string} itemName -  item structure name
         * @param {Array} items - arrays of item structures
         *  @param {function} callback
         */
        sync.geterateUBJson = function (headerName, header, itemName, items, callBack) {
            var beName = helper.getBeName(headerName);
            var temp = {};
            var be = {};
            be[headerName] = header;
            be[itemName] = items;
            temp[beName] = [be];
            helper.sendSuccess("", callBack, temp);
        };
        /**
         * parseRawUBJson - Parse unvired response json.
         * Application can use to prase data while handling sync response setting autoSvae false.
         *
         * @param {string} json - response json string
         *
         * returns {infoMessage:[],be:[{header: {..},items: [..] },..]}
         */
        sync.parseRawUBJson = function (json) {
            var data = JSON.parse(json);
            var response = {
                infoMessage: [],
                be: []
            };
            var bes = [];
            for (var property in data) {
                if (data.hasOwnProperty(property)) {
                    if (property === "InfoMessage") {
                        var infoArr = data[property];
                        response.infoMessage = infoArr;
                    }
                    else {
                        var beArr = data[property];
                        beArr.forEach(function (beElement) {
                            var be = {
                                header: "",
                                items: []
                            };
                            for (var property in beElement) {
                                if (beElement.hasOwnProperty(property)) {
                                    var value = beElement[property];
                                    if (value.constructor === Array) {
                                        value.forEach(function (item) {
                                            be.items.push(item);
                                        });
                                    }
                                    else if (value.constructor === Object) {
                                        be.header = value;
                                    }
                                }
                            }
                            bes.push(be);
                        });
                    }
                }
            }
            response.be = bes;
            return response;
        };
        sync.requestType = requestType;
        return sync;
    }());
    ump.sync = sync;
    /**
     * db - Perform CRUD database operation on application and framework databases
     */
    var db = (function () {
        function db() {
        }
        /**
         * select - select records from table
         *
         * Example - ump.db.select("CUSTOMERS_RESULTS_HEADER",{'F_NAME':'TARAK','EMP_NO':'0039'},function(result){});
         *
         * @param {string} tableName table name
         * @param {object} whereClause Json object contains field name-value
         * @param {function} callback - (Optional) user supplied async callback / error handler
         *
         * e.g.
         */
        //TODO Handle != clause
        db.select = function (tableName, whereClause, callback) {
            if (ump.isMobile) {
                var query = {
                    "tableName": tableName,
                    "whereClause": null
                };
                if (whereClause && whereClause !== null && whereClause !== "") {
                    query.whereClause = whereClause;
                }
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "DatabasePlugin", "select", [query]);
            }
            else {
                webDb.appDb.loadDatabase({});
                var headerInCollection = webDb.appDb.getCollection(tableName);
                if (headerInCollection === null)
                    return helper.sendSuccess("", callback, []);
                if (helper.isEmpty(whereClause))
                    return helper.sendSuccess("", callback, headerInCollection.data);
                var resultSet = headerInCollection.findObjects(whereClause);
                return helper.sendSuccess("", callback, resultSet);
            }
        };
        /**
         * insert - insert record into table
         *
         * Example - ump.db.insert("CUSTOMER_HEADER",{"NAME":"TARAK","NO":"0039"....},true/false,callback);
         *
         * @param {string} tableName table name
         * @param {Object} structureObject - Json object contains field name-value
         * @param {boolean} isHeader - is dataStructure a header or item?
         * @param {function} callback - (Optional) user supplied async callback / error handler
         *
         */
        db.insert = function (tableName, structureObject, isHeader, callback) {
            if (ump.isMobile) {
                var query = {
                    "tableName": tableName,
                    "isHeader": isHeader,
                    "fields": structureObject
                };
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "DatabasePlugin", "insert", [query]);
            }
            else {
                if (!isHeader) {
                    if (helper.isEmpty(structureObject["Fid"])) {
                        helper.sendError("Invalid Fid", callback);
                    }
                }
                webDb.insert(tableName, structureObject, false);
            }
        };
        /**
         * deleteRecord - delete record entry from table
         *
         * Example - ump.db.deleteRecord("CUSTOMER_HEADER",{'EMP_NO':'0039'},callback);
         *
         * @param {string} tableName - table name
         * @param {object} whereClause - (Optional)Json object contains field name-value
         * @param {function} callback - (Optional) user supplied async callback / error handler
         */
        db.deleteRecord = function (tableName, whereClause, callback) {
            if (ump.isMobile) {
                var query = {};
                if (whereClause == "" || whereClause == null || whereClause == undefined) {
                    query = {
                        "tableName": tableName,
                        "whereClause": ""
                    };
                }
                else {
                    query = {
                        "tableName": tableName,
                        "whereClause": whereClause
                    };
                }
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "DatabasePlugin", "deleteRecord", [query]);
            }
            else {
                var headerInCollection = webDb.appDb.getCollection(tableName);
                if (headerInCollection === null) {
                    helper.sendError("Table" + tableName + " not found!", callback);
                    return;
                }
                if (helper.isEmpty(whereClause))
                    headerInCollection.removeWhere(function (obj) {
                        return true;
                    });
                else
                    headerInCollection.removeWhere(whereClause);
                webDb.appDb.saveDatabase();
                helper.sendSuccess("Record deleted successfully", callback);
            }
        };
        /**
         * update - update existing record entry in table
         *
         * Example - ump.db.update("CUSTOMER_HEADER",{'SSN':'0097658'},{'EMP_NO':'0039'},callback);
         *
         * @param {string} tableName - table name
         * @param {object} updatedObject - Json object contains only updated field name-value
         * @param {object} whereClause - Json object contains field name-value
         * @param {function} callback - (Optional) user supplied async callback / error handler
         *
         */
        db.update = function (tableName, updatedObject, whereClause, callback) {
            if (ump.isMobile) {
                var query = {
                    "tableName": tableName,
                    "fields": updatedObject,
                    "whereClause": whereClause
                };
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "DatabasePlugin", "update", [query]);
            }
            else {
                var headerInCollection = webDb.appDb.getCollection(tableName);
                if (headerInCollection === null) {
                    helper.sendError("Table" + tableName + " not found!", callback);
                    return;
                }
                var resultSet = headerInCollection.find({
                    '$and': [whereClause]
                });
                if (resultSet === null) {
                    helper.sendSuccess("No records found", callback);
                    return;
                }
                resultSet.forEach(function (col) {
                    Object.keys(updatedObject).forEach(function (key, index) {
                        var val = updatedObject[key];
                        col[key] = val;
                        headerInCollection.update(col);
                    });
                });
                webDb.appDb.saveDatabase();
                helper.sendSuccess(resultSet.length + " Record updated", callback);
            }
        };
        /**
         * executeStatement - execure raw query
         *
         * Example - ump.db.executeStatement("SELECT name,COUNT(*) as COUNT FROM CUSTOMERS_RESULTS_HEADER",function(result){// check result.data});
         *
         * @parem {string} query - complete sql query to be executed
         * @param {function} callback - (Optional) user supplied async callback / error handler
         *
         * Mobile Only api
         */
        db.executeStatement = function (query, callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "DatabasePlugin", "executeQuery", [query]);
            }
            else {
                alert("Api not supported on web!. Use select api instead.");
            }
        };
        /**
         * createSavePoint - create a save point for db transaction
         */
        db.createSavePoint = function (savePoint, callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "DatabasePlugin", "createSavePoint", [{ 'SAVE_POINT': savePoint }]);
            }
            else {
                alert("Api not supported on web!.");
            }
        };
        /**
         * releaseSavePoint - release a save point for db transaction
         */
        db.releaseSavePoint = function (savePoint, callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "DatabasePlugin", "releaseSavePoint", [{ 'SAVE_POINT': savePoint }]);
            }
            else {
                alert("Api not supported on web!.");
            }
        };
        /**
         * rollbackSavePoint - rollback a save point for db transaction
         */
        db.rollbackSavePoint = function (savePoint, callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "DatabasePlugin", "rollbackSavePoint", [{ 'SAVE_POINT': savePoint }]);
            }
            else {
                alert("Api not supported on web!.");
            }
        };
        /**
         * reloadWebDb - reinitialize web db. Use this api to initialize db from persisted local storage db
         */
        db.reloadWebDb = function (callback) {
            if (ump.isMobile) {
                alert("Api not supported on mobile!.");
            }
            else {
                webDb.reload();
                if (!restUtil.appMeta.url || restUtil.appMeta.url === "") {
                    restUtil.appMeta = webDb.getAppMeta();
                }
                metadataParser.initialize();
            }
        };
        return db;
    }());
    ump.db = db;
    ;
    /**
     * settings - framework related apis
     *
     * Mobile Only module
     */
    var settings = (function () {
        function settings() {
        }
        /**
         * showSettings - Invoke native Settings screen. Api only available for Mobile.
         */
        settings.showSettings = function () {
            if (ump.isMobile) {
                cordova.exec(null, null, "SettingsPlugin", "startSettingActivity", []);
            }
            else {
                alert("Api not supported on Web!");
            }
        };
        /**
         * userSettings - Get current User information
         * @param {function} callback
         */
        settings.userSettings = function (callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "SettingsPlugin", "userSettings", []);
            }
            else {
                alert("Api not supported on Web!");
            }
        };
        /**
         * updateSystemCredentials - Save System Credentials
         */
        settings.updateSystemCredentials = function (credentials, callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "SettingsPlugin", "updateSystemCredentials", credentials);
            }
            else {
                alert("Api not supported on web!.");
            }
        };
        /**
         * getSystemCredentials - Get all System Credentials
         */
        settings.getSystemCredentials = function (callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "SettingsPlugin", "getSystemCredentials", []);
            }
            else {
                alert("Api not supported on web!.");
            }
        };
        /**
        *  Get Version Infrmation
        */
        settings.getVersionNumbers = function (callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "SettingsPlugin", "getVersionNumbers", []);
            }
            else {
                alert("Api not supported on web!.");
            }
        };
        /**
         * clearData - clear application databases and files
         */
        settings.clearData = function (callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "SettingsPlugin", "clearData", []);
            }
            else {
                helper.clearLokiDbs();
            }
        };
        /**
         * pullDb - pull database file to "temp" folder for development purpose only
         *
         * @param {function} callback - (Optional) user supplied async callback / error handler
         */
        settings.pullDb = function (callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "DatabasePlugin", "pullDb", []);
            }
            else {
                alert("Api not supported on Web!");
            }
        };
        /**
         * pushDB - push updated database file from "temp" folder to application directory for development purpose only
         *
         * @param {function} callback - (Optional) user supplied async callback / error handler
         */
        settings.pushDB = function (callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "DatabasePlugin", "pushDb", []);
            }
            else {
                alert("Api not supported on Web!");
            }
        };
        /**
         * encrypt - Get encrypted string
         * @param {function} callback
         */
        settings.encrypt = function (input, callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "SettingsPlugin", "encrypt", [input]);
            }
            else {
                alert("Api not supported on Web!");
            }
        };
        settings.getAppMeta = function () {
            return webDb.getAppMeta();
        };
        return settings;
    }());
    ump.settings = settings;
    ;
    /**
     * log - log messages and send log to server
     *
     * Mobile Only api
     */
    var log = (function () {
        function log() {
        }
        /**
         * e - Print log with Level Error
         *
         * @param {string} sourceClass - source class name
         * @param {string} method - source method name
         * @param {string} message - message need to be logged.
         */
        log.e = function (sourceClass, method, message) {
            if (ump.isMobile) {
                cordova.exec(null, null, "LoggerPlugin", "logError", [{
                        "srcClass": sourceClass,
                        "srcMethod": method,
                        "message": message
                    }]);
            }
            else {
                alert("Api not supported on Web!");
            }
        };
        /**
         * d - Print log with Level Debug
         *
         * @param {string} sourceClass - source class name
         * @param {string} method - source method name
         * @param {string} message - message need to be logged.
         */
        log.d = function (sourceClass, method, message) {
            if (ump.isMobile) {
                cordova.exec(null, null, "LoggerPlugin", "logDebug", [{
                        "srcClass": sourceClass,
                        "srcMethod": method,
                        "message": message
                    }]);
            }
            else {
                alert("Api not supported on Web!");
            }
        };
        /**
         * i - Print log with Level Important
         *
         * @param {string} sourceClass - source class name
         * @param {string} method - source method name
         * @param {string} message - message need to be logged.
         */
        log.i = function (sourceClass, method, message) {
            if (ump.isMobile) {
                cordova.exec(null, null, "LoggerPlugin", "logImportant", [{
                        "srcClass": sourceClass,
                        "srcMethod": method,
                        "message": message
                    }]);
            }
            else {
                alert("Api not supported on Web!");
            }
        };
        /**
         * getLogs - Get already logged messages
         *
         * @param {function} callBack
         */
        log.getLogs = function (callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "LoggerPlugin", "getLogs", []);
            }
            else {
                alert("Api not supported on Web!");
            }
        };
        /**
         * deleteLogs - Delete already logged messages
         */
        log.deleteLogs = function () {
            if (ump.isMobile) {
                cordova.exec(null, null, "LoggerPlugin", "deleteLogs", []);
            }
            else {
                alert("Api not supported on Web!");
            }
        };
        /**
         * sendLogToServer - upload log to server as attachment
         *
         * @param {function} callback - (Optional) user supplied async callback / error handler
         */
        log.sendLogToServer = function (callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "LoggerPlugin", "sendViaServer", []);
            }
            else {
                alert("Api not supported on Web!");
            }
        };
        /**
         * sendLogViaEmail - Send log via email attachment
         *
         * @param {function} callback - (Optional) user supplied async callback / error handler
         */
        log.sendLogViaEmail = function (callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "LoggerPlugin", "sendViaEmail", []);
            }
            else {
                alert("Api not supported in Web!");
            }
        };
        return log;
    }());
    ump.log = log;
    ;
    /**
     *  Internal use only module
     */
    var helper = (function () {
        function helper() {
        }
        helper.getBeName = function (name) {
            var sMetas = metadata.sMeta.filter(function (e) {
                return e.name === name;
            });
            return sMetas[0].beName;
        };
        helper.saveInfoMessage = function (infoMessage, beName, beLid) {
            var infoMessageInCollection = webDb.appDb.getCollection("InfoMessage");
            if (infoMessageInCollection === null) {
                infoMessageInCollection = webDb.appDb.addCollection("InfoMessage");
            }
            infoMessage.beName = beName;
            infoMessage.beLid = beLid;
            infoMessageInCollection.insert(infoMessage);
            webDb.appDb.saveDatabase();
        };
        helper.isEmpty = function (value) {
            if (value == undefined || value === null || value === "")
                return true;
            return false;
        };
        helper.copyProperty = function (src, dest) {
            for (var k in src)
                dest[k] = src[k];
            return dest;
        };
        helper.validateLoignParameters = function (mode, callback) {
            if (!ump.isMobile) {
                if (helper.isEmpty(loginParameters.appName)) {
                    helper.sendError("Please provide Application Name!", callback);
                    return false;
                }
            }
            if (helper.isEmpty(loginParameters.loginType)) {
                helper.sendError("Incorrect Login Type!", callback);
                return false;
            }
            if (loginParameters.loginType === ump.loginType.sap || loginParameters.loginType === ump.loginType.ads) {
                if (!loginParameters.domain) {
                    helper.sendError("Please provide Domain!", callback);
                    return false;
                }
            }
            if (helper.isEmpty(mode)) {
                helper.sendError("Please set Login Mode!", callback);
                return false;
            }
            var err = undefined;
            switch (mode) {
                case loginMode.authActivate:
                    if (helper.isEmpty(loginParameters.url))
                        err = "Please provide Url!";
                    else if (helper.isEmpty(loginParameters.company))
                        err = "Please provide Company Name!";
                    else if (helper.isEmpty(loginParameters.username))
                        err = "Please provide User Id!";
                    else if (helper.isEmpty(loginParameters.password))
                        err = "Please provide Password!";
                    if (err) {
                        helper.sendError(err, callback);
                        return false;
                    }
                    break;
                case loginMode.authLocal:
                    if (helper.isEmpty(loginParameters.username))
                        err = "Please provide User Id!";
                    else if (helper.isEmpty(loginParameters.password))
                        err = "Please provide Password!";
                    if (err) {
                        helper.sendError(err, callback);
                        return false;
                    }
                    break;
                case loginMode.forgotPassword:
                    break;
            }
            return true;
        };
        helper.guid = function () {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1).toUpperCase();
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        };
        /**
         * Clear loki databases
         */
        helper.clearLokiDbs = function () {
            localStorage.removeItem("APP_LOKI_DB");
            localStorage.removeItem("FW_LOKI_DB");
            localStorage.removeItem(login.parameters.appName);
            webDb.appDb = null;
            webDb.fwDb = null;
        };
        helper.sendError = function (msg, callback) {
            var cbResult = {};
            cbResult.type = resultType.error;
            cbResult.error = msg;
            callback(cbResult);
        };
        helper.sendSuccess = function (msg, callback, data) {
            var cbResult = {};
            cbResult.type = resultType.success;
            cbResult.error = msg;
            cbResult.data = data;
            callback(cbResult);
        };
        return helper;
    }());
    ;
    /**
     * restUtil - Provides apis to make rest api call.
     *
     * Internal use only module
     */
    var restUtil = (function () {
        function restUtil() {
        }
        /**
         * Rest Api call
         * TODO : Remove JQuery dependency for ajax call
         */
        restUtil.performRequest = function (endpoint, msg, callback, httpType) {
            var headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': restUtil.appMeta.authorization
            };
            var postData = {
                frontendUser: restUtil.appMeta.frontEnd,
                messageFormat: 'standard',
                inputMessage: JSON.stringify(msg),
                /**
                 * Parameters require for sending SAP port name/ password in initial auth call
                 * Clear this on success callback. Henceforth use authkey for subcsequent calls
                 */
                credentials: restUtil.appMeta.credentials
            };
            var methodType = httpType ? httpType : "POST";
            $.ajax({
                type: methodType,
                url: endpoint,
                data: postData,
                success: function (res) {
                    restUtil.hanldeRestApiCallback(true, res, callback);
                },
                error: function (res) {
                    restUtil.hanldeRestApiCallback(false, res, callback);
                },
                headers: headers,
                dataType: 'json'
            });
        };
        restUtil.hanldeRestApiCallback = function (isSuccess, result, callback) {
            var cbResult = {};
            if (isSuccess) {
                cbResult.type = resultType.success;
                cbResult.message = (result && result.message) ? result.message : "";
                cbResult.data = result;
            }
            else {
                cbResult.type = resultType.error;
                cbResult.error = (result && result.responseText) ? result.responseText : "";
                cbResult.message = (result && result.message) ? result.message : "";
            }
            callback(cbResult);
        };
        restUtil.appMeta = {};
        restUtil.httpType = {
            get: "GET",
            post: "POST",
            del: "DELETE"
        };
        return restUtil;
    }());
    ;
    /**
     * loki - inmemory js librabry required for persisting data on web
     * appDb - host application data
     * fwDb - host framework data
     * webDb - Internal use only module
     */
    var webDb = (function () {
        function webDb() {
        }
        webDb.initialize = function () {
            var appDbName = helper.isEmpty(login.parameters.appName) ? "APP_LOKI_DB" : login.parameters.appName;
            if (webDb.appDb == null) {
                webDb.appDb = new loki(appDbName);
                webDb.appDb.loadDatabase({});
                webDb.appDb.saveDatabase();
            }
            if (webDb.fwDb == null) {
                webDb.fwDb = new loki('FW_LOKI_DB');
                webDb.fwDb.loadDatabase({});
                webDb.fwDb.saveDatabase();
            }
        };
        webDb.reload = function () {
            var appDbName = helper.isEmpty(login.parameters.appName) ? "APP_LOKI_DB" : login.parameters.appName;
            if (webDb.appDb == null) {
                webDb.appDb = new loki(appDbName);
                webDb.appDb.loadDatabase(JSON.parse(localStorage[appDbName]));
                webDb.appDb.saveDatabase();
            }
            if (webDb.fwDb == null) {
                webDb.fwDb = new loki('FW_LOKI_DB');
                webDb.fwDb.loadDatabase(JSON.parse(localStorage['FW_LOKI_DB']));
                webDb.fwDb.saveDatabase();
            }
        };
        /**
         *  insert or update based on gids
         */
        webDb.insert = function (name, structure, isFw) {
            var db = (isFw) ? webDb.fwDb : webDb.appDb;
            var headerInCollection = db.getCollection(name);
            if (headerInCollection == null) {
                headerInCollection = db.addCollection(name);
            }
            var structureInDB = null;
            if (!isFw) {
                structureInDB = webDb.getBasedOnGid(name, structure);
            }
            if (structureInDB == null) {
                //Create Lid field if missing
                if (helper.isEmpty(structure["Lid"])) {
                    structure["Lid"] = helper.guid();
                }
                headerInCollection.insert(structure);
            }
            else {
                structure = helper.copyProperty(structure, structureInDB);
                headerInCollection.update(structure);
            }
            db.saveDatabase();
        };
        webDb.select = function (name, whereClause, isFw) {
            var db = (isFw) ? webDb.fwDb : webDb.appDb;
            var headerInCollection = db.getCollection(name);
            if (headerInCollection === null)
                return null;
            if (!helper.isEmpty(whereClause))
                return headerInCollection.data;
            return headerInCollection.findObjects(whereClause);
        };
        webDb.saveAppMeta = function (appMeta) {
            webDb.insert("appMeta", appMeta, true);
        };
        webDb.getAppMeta = function () {
            var appMeta = webDb.select("appMeta", "", true);
            if (appMeta != null && appMeta.length > 0)
                return appMeta[0];
            return null;
        };
        /**
         * Considering structure name is unique.(Not handling same structure across multiple BusinessEntity)
         */
        webDb.getBasedOnGid = function (name, structure) {
            if (helper.isEmpty(name))
                return null;
            var gids = metadata.fMeta.filter(function (e) {
                return e.sName === name && e.isGid === true;
            });
            if (gids == null || gids.length <= 0)
                return null;
            var qry = {};
            gids.forEach(function (g) {
                qry[g.name] = structure[g.name];
            });
            var headerInCollection = webDb.appDb.getCollection(name);
            if (headerInCollection === null)
                return null;
            return headerInCollection.findObject(qry);
        };
        webDb.appDb = null;
        webDb.fwDb = null;
        return webDb;
    }());
    ;
    /**
     * Parse and save data
     *
     * Internal use only module
     */
    var parser = (function () {
        function parser() {
        }
        parser.parseServerResponse = function (data, reqype) {
            var cbResult = {};
            cbResult.type = resultType.success;
            cbResult.data = data;
            cbResult.message = "";
            for (var property in data) {
                if (data.hasOwnProperty(property)) {
                    //InfoMessage
                    if (property === "InfoMessage") {
                        var infoArr = data[property];
                        infoArr.forEach(function (element) {
                            helper.saveInfoMessage(element);
                            cbResult.message = cbResult.message + " " + element.message;
                            if (element.category === "FAILURE") {
                                cbResult.type = resultType.error;
                            }
                        });
                        //BE Array    
                    }
                    else {
                        var beArr = data[property];
                        beArr.forEach(function (element) {
                            parser.handleEachBE(element, reqype);
                        });
                    }
                }
            }
            return cbResult;
        };
        parser.handleEachBE = function (be, reqype) {
            var headerLid = "";
            for (var property in be) {
                if (be.hasOwnProperty(property)) {
                    var value = be[property];
                    //Item
                    if (value.constructor === Array) {
                        value.forEach(function (item) {
                            item["Fid"] = headerLid;
                            //webDb.insert(property, item);
                            var structureInDB = webDb.getBasedOnGid(property, item);
                            var itemInCollection = webDb.appDb.getCollection(property);
                            if (itemInCollection === null) {
                                itemInCollection = webDb.appDb.addCollection(property);
                            }
                            if (structureInDB == null) {
                                item.Fid = headerLid;
                                itemInCollection.insert(item);
                            }
                            else {
                                item = helper.copyProperty(item, structureInDB);
                                itemInCollection.update(item);
                            }
                            webDb.appDb.saveDatabase();
                        });
                        //Header    
                    }
                    else if (value.constructor === Object) {
                        value["Lid"] = helper.guid();
                        headerLid = value.Lid;
                        // webDb.insert(property, value);
                        var structureInDB = webDb.getBasedOnGid(property, value);
                        var headerInCollection = webDb.appDb.getCollection(property);
                        if (headerInCollection === null) {
                            headerInCollection = webDb.appDb.addCollection(property);
                        }
                        if (structureInDB == null) {
                            value.Lid = helper.guid();
                            headerInCollection.insert(value);
                        }
                        else {
                            value = helper.copyProperty(value, structureInDB);
                            headerInCollection.update(value);
                        }
                        headerLid = value.Lid;
                        webDb.appDb.saveDatabase();
                        //TODO: Handle Action  
                    }
                    else {
                    }
                }
            }
        };
        return parser;
    }());
    /**
     * metadataParser - parse metadata.json, create BusinessEntityMeta, StructureMeta and FieldMeta and save.
     *
     * Intenal use only module
     */
    var metadataParser = (function () {
        function metadataParser() {
        }
        metadataParser.initialize = function () {
            //TODO :  Check file existance
            metadataParser.loadJSON(metadataParser.parse);
        };
        /**
         * Load metadata.json from same directory where kernel-mobiweb.js
         */
        metadataParser.loadJSON = function (callback) {
            var xobj = new XMLHttpRequest();
            xobj.overrideMimeType("application/json");
            var metadataPath = helper.isEmpty(ump.login.parameters.metadataPath) ? "metadata.json" : ump.login.parameters.metadataPath;
            xobj.open('GET', metadataPath, true);
            xobj.onreadystatechange = function () {
                if (xobj.readyState == 4 && xobj.status == 200) {
                    callback(xobj.responseText);
                }
            };
            xobj.send(null);
        };
        metadataParser.parse = function (json) {
            if (helper.isEmpty(json))
                return;
            var data = JSON.parse(json);
            for (var property in data) {
                if (data.hasOwnProperty(property)) {
                    var value = data[property];
                    if (value.constructor === Object) {
                        metadataParser.parseEachBE(value, property);
                    }
                }
            }
        };
        metadataParser.parseEachBE = function (be, name) {
            var beMeta = {};
            beMeta.attachment = helper.isEmpty(be.attachments) ? false : be.attachments;
            beMeta.onConflict = helper.isEmpty(be.onConflict) ? conflictRule.SERVER_WINS : be.onConflict;
            beMeta.save = helper.isEmpty(be.save) ? true : be.save;
            beMeta.name = name;
            metadata.bMeta.push(beMeta);
            for (var property in be) {
                if (be.hasOwnProperty(property)) {
                    var value = be[property];
                    if (value.constructor === Object) {
                        var sMeta = {};
                        sMeta.beName = beMeta.name;
                        sMeta.isheader = (property.indexOf("_HEADER") > -1) ? true : false;
                        sMeta.name = property;
                        metadata.sMeta.push(sMeta);
                        var fields = value.field;
                        if (fields != null && fields.length > 0) {
                            fields.forEach(function (f) {
                                var fMeta = {};
                                fMeta.beName = beMeta.name;
                                fMeta.sName = sMeta.name;
                                fMeta.name = f.name;
                                fMeta.isGid = f.isGid;
                                fMeta.isMandatory = f.mandatory;
                                fMeta.sqlType = f.sqlType;
                                metadata.fMeta.push(fMeta);
                            });
                        }
                    }
                }
            }
        };
        return metadataParser;
    }());
})(ump || (ump = {}));
;
//# sourceMappingURL=html5kernel.js.map