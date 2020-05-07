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
        port: "",
        //Default metadata path is root where index.html is
        metadataPath: "",
        //Setting this flag will populate TAG1 field with attachment base64 string
        isRequiredAttachmentBase64: false,
        //Set time to run Outbox in interval of given minutes. Timer will start/stop only when there are items in Outbox. 
        autoSendTime: "0",
        //Set time to run SentItem in interval of given minutes. Timer will start/stop only when there are items in SentItem. 
        autoSyncTime: "0"
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
        loginListenerType[loginListenerType["login_error"] = 5] = "login_error";
        loginListenerType[loginListenerType["app_requires_current_account"] = 6] = "app_requires_current_account"; // Multiple account found hence app has to set current active account
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
        appReset: 3,
        attachmentDownloadSuccess: 4,
        attachmentDownloadError: 5,
        incomingDataProcessingFinished: 6,
        attachmentDownloadWaiting: 7,
        infoMessage: 8,
        serverError: 9 //Notify application with Server errors
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
     * Attachment status
     */
    var AttachmentItemStatus;
    (function (AttachmentItemStatus) {
        AttachmentItemStatus[AttachmentItemStatus["DEFAULT"] = 0] = "DEFAULT";
        AttachmentItemStatus[AttachmentItemStatus["QUEUED_FOR_DOWNLOAD"] = 1] = "QUEUED_FOR_DOWNLOAD";
        AttachmentItemStatus[AttachmentItemStatus["DOWNLOADED"] = 2] = "DOWNLOADED";
        AttachmentItemStatus[AttachmentItemStatus["ERROR_IN_DOWNLOAD"] = 3] = "ERROR_IN_DOWNLOAD";
        AttachmentItemStatus[AttachmentItemStatus["SAVED_FOR_UPLOAD"] = 4] = "SAVED_FOR_UPLOAD";
        AttachmentItemStatus[AttachmentItemStatus["UPLOADED"] = 5] = "UPLOADED";
        AttachmentItemStatus[AttachmentItemStatus["ERROR_IN_UPLOAD"] = 6] = "ERROR_IN_UPLOAD";
        AttachmentItemStatus[AttachmentItemStatus["MARKED_FOR_DELETE"] = 7] = "MARKED_FOR_DELETE";
        AttachmentItemStatus[AttachmentItemStatus["EXTERNAL"] = 8] = "EXTERNAL";
    })(AttachmentItemStatus || (AttachmentItemStatus = {}));
    /**
     * flag to check for running environment mobile or web
     */
    ump.isMobile = (function () {
        return (window.cordova || window.PhoneGap || window.phonegap);
    })();
    /**
     * login module provide all login related apis and account related apis
     */
    var login = /** @class */ (function () {
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
                function cb(result) {
                    callback(result);
                }
                if (ump.isMobile) {
                    cordova.exec(cb, function (e) {
                        console.log(e);
                    }, "LoginPlugin", "login", [this.parameters, cb]);
                }
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
        /**;
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
                restUtil.appMeta.username = loginParameters.username;
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
                    case ump.loginType.ads:
                        restUtil.appMeta.authorization = 'Basic ' + window.btoa(loginParameters.company + "\\" + loginParameters.username);
                        endpoint = restUtil.appMeta.url + restApis.session + 'applications/' + restUtil.appMeta.appName;
                        restUtil.appMeta.credentials = JSON.stringify([{ "port": ump.login.parameters.port, "user": ump.login.parameters.domain + "\\" + ump.login.parameters.username, "password": ump.login.parameters.password }]);
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
                            var error = 'No Deployed application for frontend type of BROWSER found';
                            if (login._loginListener) {
                                var cbResult = {};
                                cbResult.type = 3; //ump.loginListenerType.auth_activation_error;
                                cbResult.error = error;
                                login._loginListener(cbResult);
                            }
                            helper.sendError(error, callback);
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
                        //Loginlistener callback
                        if (login._loginListener) {
                            var cbResult_1 = {};
                            cbResult_1.type = 2; //ump.loginListenerType.auth_activation_success;
                            cbResult_1.data = result;
                            login._loginListener(cbResult_1);
                        }
                        callback(result);
                    }
                    else {
                        var errText = "";
                        if (!helper.isEmpty(result)) {
                            errText = helper.isEmpty(result.error) ? "No error description returned from server" : JSON.parse(result.error).error;
                        }
                        helper.sendError(errText, callback);
                        //Loginlistener callback
                        if (login._loginListener) {
                            var cbResult_2 = {};
                            cbResult_2.type = 3; //ump.loginListenerType.auth_activation_error;
                            cbResult_2.error = errText;
                            login._loginListener(cbResult_2);
                        }
                    }
                }, restUtil.httpType.post);
            }
        };
        /**
         * authenticateLocal - Authenticate with username,password saved in database
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
    var sync = /** @class */ (function () {
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
                postMessage = restUtil.removeLokiMeta(postMessage);
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
         * Example - ump.sync.submitInAsync(requestType.RQST,CUSTOMER_HEADER,"","UNVIRED_CUSTOMER_SEARCH_ECC_PA_GET_CUSTOMERS","CUSTOMER",CUSTOMER_HEADER.LID, true, callback);
         *
         * @param {requestType} reqType - Message request type (RQST/PULL/PUSH/QUERY) to be sent to the server.
         * @param {object} header - Header Datastructure object  {"Header name": {field name : field value,...}}
         * @param {string} customData -  custom data
         * @param {string} paFunction - Name of the process agent that is required to be called in the server.
         * @param {string} beName - Name of the BusinessEntity
         * @param {string} beLid - LID of Header
         * @param {boolean} bypassAttachment - boolean whether to ignore attachment while sending data to server
         * @param {function} callback - (Optional) user supplied async callback / error handler
         */
        sync.submitInAsync = function (reqype, header, customData, paFunction, beName, belid, bypassAttachment, callback) {
            if (ump.isMobile) {
                var query = {
                    "requestType": requestType[reqype],
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
                postMessage = restUtil.removeLokiMeta(postMessage);
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
                function cb(result) {
                    callback(result);
                }
                cordova.exec(cb, function (e) {
                    console.log(e);
                }, "SyncEnginePlugin", "registerNotifListener", [cb]);
            }
            else {
                console.log("'registerNotifListener' - Api not supported on Web! Web supports only sync call");
            }
        };
        /**
         * unRegisterNotificationListener - UnRegister for callback on GetMessage status
         *
         *  @param {function} callback - (Optional) user supplied async callback / error handler
         *
         * Mobile Only api
         */
        sync.unRegisterNotifListener = function (callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "SyncEnginePlugin", "unRegisterNotifListener", []);
            }
            else {
                alert("'unRegisterNotifListener' - Api not supported on Web! Web supports only sync call");
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
        /**
         * isInOutbox - Check whether BE is already in OutBox or not.
         *
         * @param {string} beLid - LID of BE Header
         *
         * returns true/false
         */
        sync.isInOutBox = function (beLid, callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "SyncEnginePlugin", "isInOutBox", [beLid]);
            }
            else {
                console.log("Api - isInOutBox is not supported on browser!");
            }
        };
        /**
         * outBoxItemCount - Get count of items in OutBox
         *
         * returns count
         */
        sync.outBoxItemCount = function (callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "SyncEnginePlugin", "outBoxItemCount", "");
            }
            else {
                console.log("Api - outBoxItemCount is not supported on browser!");
            }
        };
        /**
         * isInSentItem - Check whether BE is already in SentItem or not.
         *
         * @param {string} beLid - LID of BE Header
         *
         * returns true/false
         */
        sync.isInSentItem = function (beLid, callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "SyncEnginePlugin", "isInSentItem", [beLid]);
            }
            else {
                console.log("Api - isInSentItem is not supported on browser!");
            }
        };
        /**
        * sentItemCount - Get count of items in Sentitem
        *
        * returns count
        */
        sync.sentItemCount = function (callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "SyncEnginePlugin", "sentItemCount", "");
            }
            else {
                console.log("Api - sentItemCount is not supported on browser!");
            }
        };
        /**
        * deleteOutBoxEntry - Delete BE from OutBox.
        *
        * @param {string} beLid - LID of BE Header
        *
        * returns true/false
        */
        sync.deleteOutBoxEntry = function (beLid, callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "SyncEnginePlugin", "deleteOutBoxEntry", beLid);
            }
            else {
                console.log("Api - deleteOutBoxEntry is not supported on browser!");
            }
        };
        /**
        * resetApplicationSyncData - Reset application Sync related data(OutObject,SentItemObject,InObject,AttachmentOutObject,AttachmentQObject,Attachment folder).
        */
        sync.resetApplicationSyncData = function (callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "SyncEnginePlugin", "resetApplicationSyncData", []);
            }
            else {
                console.log("Api - resetApplicationSyncData is not supported on browser!");
            }
        };
        sync.requestType = requestType;
        return sync;
    }());
    ump.sync = sync;
    /**
     * db - Perform CRUD database operation on application and framework databases
     */
    var db = /** @class */ (function () {
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
                // var headerInCollection = webDb.appDb.getCollection(tableName);
                // if (headerInCollection === null) return helper.sendSuccess("", callback, []);
                // if (helper.isEmpty(whereClause))
                //     return helper.sendSuccess("", callback, headerInCollection.data);
                // var resultSet = headerInCollection.findObjects(whereClause);
                var resultSet = webDb.select(tableName, whereClause);
                return helper.sendSuccess("", callback, resultSet);
            }
        };
        /**
         * insert - insert record into table
         * In borwser insert always insert or update based on gid
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
                    if (helper.isEmpty(structureObject["FID"])) {
                        helper.sendError("Invalid FID", callback);
                    }
                }
                webDb.insert(tableName, structureObject, false);
                return helper.sendSuccess("", callback, "");
            }
        };
        /**
         * insertOrUpdate - insert record or update record if exists into table
         *
         * Example - ump.db.insert("CUSTOMER_HEADER",{"NAME":"TARAK","NO":"0039"....},true/false,callback);
         *
         * @param {string} tableName table name
         * @param {Object} structureObject - Json object contains field name-value
         * @param {boolean} isHeader - is dataStructure a header or item?
         * @param {function} callback - (Optional) user supplied async callback / error handler
         *
         */
        db.insertOrUpdate = function (tableName, structureObject, isHeader, callback) {
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
                }, "DatabasePlugin", "insertOrUpdate", [query]);
            }
            else {
                if (!isHeader) {
                    if (helper.isEmpty(structureObject["FID"])) {
                        helper.sendError("Invalid FID", callback);
                    }
                }
                webDb.insert(tableName, structureObject, false);
                return helper.sendSuccess("", callback, "");
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
                var tableCollection = webDb.select(tableName, whereClause);
                if (tableCollection != null && tableCollection.length > 0) {
                    tableCollection.forEach(function (element) {
                        webDb.deleteCascade(tableName, element);
                    });
                }
                // webDb.appDb.saveDatabase();
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
        db.executeStatement = function (query, callback, tableName) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "DatabasePlugin", "executeQuery", [query, tableName]);
            }
            else {
                alert("Api not supported on web!. Use select api instead.");
            }
        };
        db.getCollection = function (tableName) {
            return webDb.appDb.getCollection(tableName);
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
                }, "DatabasePlugin", "createSavePoint", [savePoint]);
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
                }, "DatabasePlugin", "releaseSavePoint", [savePoint]);
            }
            else {
                alert("Api not supported on web!.");
            }
        };
        /**
         * rollbackSavePoint - rollback a save point for db transaction
         */
        db.rollbackToSavePoint = function (savePoint, callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "DatabasePlugin", "rollbackToSavePoint", [savePoint]);
            }
            else {
                alert("Api not supported on web!.");
            }
        };
        /**
         * beginTransaction - Begin a db transaction
         */
        db.beginTransaction = function (callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "DatabasePlugin", "beginTransaction", []);
            }
            else {
                alert("Api not supported on web!.");
            }
        };
        /**
         * endTransaction - End a db transaction
         */
        db.endTransaction = function (callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "DatabasePlugin", "endTransaction", []);
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
     * Attachment - Attachment related apis
     */
    var attachment = /** @class */ (function () {
        function attachment() {
        }
        /**
         * getAttachmentFolderPath - Get attachment directory path
         * Required to get complete attachment file path in iOS. cancatenate this path with file name to get complete file path
         */
        attachment.getAttachmentFolderPath = function (callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "AttachmentPlugin", "getAttachmentFolderPath", []);
            }
            else {
                console.log("ump.attachment.getAttachmentFolderPath - Api not supported in browser!");
            }
        };
        /**
         * createAttachmentItem - Copy attachment file to application folder and insert attachment itme to databade with updated local path
         * @param {string} tableName attachment item table name
         * @param {Object} structureObject - Attachment Item Json object contains field name-value
         * @param {function} callback - (Optional) user supplied async callback / error handler
         *
         */
        attachment.createAttachmentItem = function (tableName, structureObject, callback) {
            if (ump.isMobile) {
                var query = {
                    "tableName": tableName,
                    "fields": structureObject
                };
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "AttachmentPlugin", "createAttachmentItem", [query]);
            }
            else {
                console.log("ump.attachment.createAttachmentItem - Api not supported in browser!");
            }
        };
        /**
         * uploadAttachment - Upload attachment
         * @param {string} tableName attachment item table name
         * @param {Object} structureObject - Attachment Item Json object contains field name-value
         * @param {boolean} isAsync - Upload attachment in Async or Sync. Default to Async
         * @param {function} callback - (Optional) user supplied async callback / error handler
         *
         */
        attachment.uploadAttachment = function (tableName, structureObject, isAsync, callback) {
            if (isAsync === void 0) { isAsync = true; }
            if (ump.isMobile) {
                var param = {
                    "tableName": tableName,
                    "fields": structureObject,
                    "isAsync": isAsync
                };
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "AttachmentPlugin", "uploadAttachment", [param]);
            }
            else {
                console.log("ump.attachment.createAttachmentItem - Api not supported yet in browser!");
            }
        };
        /**
         * downloadAttachment - Download attachment
         * @param {string} tableName attachment item table name
         * @param {Object} structureObject - Attachment Item Json object contains field name-value
         * @param {function} callback - (Optional) user supplied async callback / error handler
         *
         */
        attachment.downloadAttachment = function (tableName, structureObject, callback) {
            if (ump.isMobile) {
                var param = {
                    "tableName": tableName,
                    "fields": structureObject
                };
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "AttachmentPlugin", "downloadAttachment", [param]);
            }
            else {
                console.log("ump.attachment.downloadAttachment - Api not supported yet in browser!");
            }
        };
        return attachment;
    }());
    ump.attachment = attachment;
    /**
     * settings - framework related apis
     *
     * Mobile Only module
     */
    var settings = /** @class */ (function () {
        function settings() {
        }
        /**
         * getInfoMessages - Get list of InfoMessages
         */
        settings.getInfoMessages = function (headerName, lid, callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "SettingsPlugin", "getInfoMessages", [{ 'headerName': headerName, 'LID': lid }]);
            }
            else {
                var InfoMessages = helper.getInfoMessages(lid);
                helper.sendSuccess("", callback, InfoMessages);
            }
        };
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
                var appMeta = settings.getAppMeta();
                appMeta['USER_ID'] = appMeta.username;
                return helper.sendSuccess("", callback, settings.getAppMeta());
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
        * reCreateAppDB - Recreate application database.
        * Helps in updating application database without reauthenticating with server which requires to drop both app and framework database.
        */
        settings.reCreateAppDB = function (callback) {
            if (ump.isMobile) {
            }
            else {
                webDb.reCreateAppDb();
                helper.sendSuccess("", callback, true);
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
        /**
         * Guid
         */
        settings.guid = function () {
            return helper.guid();
        };
        /**
         * Check for Internet connection
         */
        settings.hasInternet = function (callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "SettingsPlugin", "hasInternet", []);
            }
            else {
                helper.sendSuccess("", callback, true);
            }
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
    var log = /** @class */ (function () {
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
                console.log("Error | ", sourceClass, " | " + method + " | " + message + " | ");
            }
            else {
                console.log("Api not supported on Web!");
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
                console.log("Debug | ", sourceClass, " | " + method + " | " + message + " | ");
            }
            else {
                console.log("Api not supported on Web!");
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
                console.log("Important | ", sourceClass, " | " + method + " | " + message + " | ");
            }
            else {
                console.log("Api not supported on Web!");
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
                console.log("Api not supported on Web!");
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
                console.log("Api not supported on Web!");
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
                console.log("Api not supported on Web!");
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
                console.log("Api not supported in Web!");
            }
        };
        return log;
    }());
    ump.log = log;
    ;
    /**
     * Proxy plugin for missing apis in windows
     */
    var proxy = /** @class */ (function () {
        function proxy() {
        }
        /**
         * launchFile - Luanch file in deafult system application
         * @param filePath File complete path
         * @param callback (Optional) user supplied async callback / error handler
         */
        proxy.launchFile = function (filePath, callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "ProxyPlugin", "launchFile", [filePath]);
            }
            else {
                console.log("Api not supported in Web!");
            }
        };
        /**
         * launchBase64 - Save Base64 string in a file and luanch the file in deafult system application
         * @param {string} base64 File content as base64 string
         * @param {string} fileName (Optional) file name to be saves as. Default name is "Temp"
         * @param {string} extension (Optional) file extension to be saves as. Default extension is ".pdf"
         * @param callback (Optional) user supplied async callback / error handler
         */
        proxy.launchBase64 = function (base64String, fileName, extension, callback) {
            if (ump.isMobile) {
                fileName = helper.isEmpty(fileName) ? "Temp" : fileName;
                extension = helper.isEmpty(extension) ? ".pdf" : extension;
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "ProxyPlugin", "launchBase64", [{ 'base64': base64String, 'fileName': fileName, 'extension': extension }]);
            }
            else {
                console.log("Api not supported in Web!");
            }
        };
        /**
         * unzip - Unzip source file to destination path
         * @param srcPath Source file complete path
         * @param destPath Destination path
         * @param callback (Optional) user supplied async callback / error handler
         */
        proxy.unzip = function (srcPath, destPath, callback) {
            if (ump.isMobile) {
                cordova.exec(function (result) {
                    callback(result);
                }, function (e) {
                    console.log(e);
                }, "ProxyPlugin", "unzip", [{ 'srcPath': srcPath, 'destPath': destPath }]);
            }
            else {
                console.log("Api not supported in Web!");
            }
        };
        return proxy;
    }());
    ump.proxy = proxy;
    ;
    /**
     *  Internal use only module
     */
    var helper = /** @class */ (function () {
        function helper() {
        }
        helper.getBeName = function (name) {
            var sMetas = metadata.sMeta.filter(function (e) {
                return e.name === name;
            });
            return sMetas[0].beName;
        };
        helper.getBeHeaderName = function (beName) {
            var headerName = "";
            metadata.sMeta.forEach(function (e) {
                if (e.beName === beName && e.isheader === true) {
                    headerName = e.name;
                }
            });
            return headerName;
        };
        helper.getBeChildrenNames = function (structureName) {
            var sMetas = metadata.sMeta.filter(function (e) {
                return e.name === structureName;
            });
            sMetas = metadata.sMeta.filter(function (e) {
                return (e.beName === sMetas[0].beName && e.isheader === false);
            });
            return sMetas;
        };
        helper.getBeTableNames = function (beName) {
            var sMetas = metadata.sMeta.filter(function (e) {
                return e.beName === beName;
            });
            return sMetas;
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
        helper.getInfoMessages = function (lid) {
            var infoMessageInCollection = webDb.appDb.getCollection("InfoMessage");
            if (infoMessageInCollection == null)
                return [];
            var infoMessages = webDb.select("InfoMessage", JSON.stringify({ beLid: lid }), true);
            if (infoMessages == null)
                return [];
            return infoMessages;
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
    var restUtil = /** @class */ (function () {
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
        restUtil.removeLokiMeta = function (postMessage) {
            function traverse(o) {
                for (var i in o) {
                    if (!!o[i] && typeof (o[i]) == "object") {
                        // console.log(i, o[i])
                        delete o["$loki"];
                        delete o["meta"];
                        //if(i === "$loki" || i === "meta") delete o[i];
                        traverse(o[i]);
                    }
                }
            }
            if (postMessage != "") {
                postMessage = JSON.parse(JSON.stringify(postMessage));
            }
            traverse(postMessage);
            return postMessage;
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
    var webDb = /** @class */ (function () {
        function webDb() {
        }
        webDb.initialize = function () {
            var appDbName = helper.isEmpty(login.parameters.appName) ? "APP_LOKI_DB" : login.parameters.appName;
            if (webDb.appDb == null) {
                var idbAdapter = new LokiIndexedAdapter();
                webDb.appDb = new loki(appDbName, { adapter: idbAdapter, autoload: true });
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
                //Create LID field if missing
                if (helper.isEmpty(structure["LID"])) {
                    structure["LID"] = helper.guid();
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
                return [];
            if (!helper.isEmpty(whereClause)) {
                return headerInCollection.findObjects(whereClause);
            }
            return headerInCollection.data;
        };
        //Cascade delete
        webDb.deleteCascade = function (tableName, structure, isFw) {
            var db = (isFw) ? webDb.fwDb : webDb.appDb;
            var structureInDB = webDb.getBasedOnGid(tableName, structure);
            if (structureInDB && (structureInDB != null)) {
                var children = helper.getBeChildrenNames(tableName);
                if ((children != null) && (children.length > 0)) {
                    for (var i = 0; i < children.length; i++) {
                        var childrenCollection = db.getCollection(children[i]["name"]);
                        if (childrenCollection != null) {
                            childrenCollection.removeWhere({ 'FID': structureInDB.LID });
                        }
                    }
                }
                var parentCollection = db.getCollection(tableName);
                if (parentCollection != null) {
                    parentCollection.removeWhere({ 'LID': structureInDB.LID });
                }
            }
            db.saveDatabase();
        };
        webDb.getCollection = function (tableName) {
            return webDb.appDb.getCollection(name);
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
        webDb.reCreateAppDb = function () {
            var appDbName = helper.isEmpty(login.parameters.appName) ? "APP_LOKI_DB" : login.parameters.appName;
            localStorage.removeItem("APP_LOKI_DB");
            localStorage.removeItem(login.parameters.appName);
            var idbAdapter = new LokiIndexedAdapter();
            webDb.appDb = new loki(appDbName, { adapter: idbAdapter, autoload: true });
            webDb.appDb.loadDatabase({});
            webDb.appDb.saveDatabase();
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
    var parser = /** @class */ (function () {
        function parser() {
        }
        parser.parseServerResponse = function (data, reqype) {
            var cbResult = {};
            cbResult.type = resultType.success;
            cbResult.data = data;
            cbResult.message = "";
            //Get InfoMessage
            if (data.hasOwnProperty("InfoMessage")) {
                var infoArr = data["InfoMessage"];
                infoArr.forEach(function (element) {
                    helper.saveInfoMessage(element);
                    cbResult.message = cbResult.message + " " + element.message;
                    if (element.category === "FAILURE") {
                        cbResult.type = resultType.error;
                    }
                });
            }
            for (var property in data) {
                if (property === "InfoMessage") {
                    continue;
                }
                else {
                    var beArr = data[property];
                    //Clear BE for PULL request.
                    if (reqype == ump.requestType.PULL) {
                        var children = helper.getBeTableNames(property);
                        if ((children != null) && (children.length > 0)) {
                            for (var i = 0; i < children.length; i++) {
                                var childrenCollection = webDb.appDb.getCollection(children[i]["name"]);
                                if (childrenCollection != null) {
                                    childrenCollection.clear();
                                }
                            }
                            // webDb.appDb.saveDatabase();
                        }
                    }
                    beArr.forEach(function (element) {
                        parser.handleEachBE(element, reqype, property);
                    });
                }
            }
            webDb.appDb.saveDatabase();
            return cbResult;
        };
        parser.handleEachBE = function (be, reqType, beName) {
            var headerLid = "";
            var isActionDelete = false;
            for (var property in be) {
                if (be.hasOwnProperty(property)) {
                    var value = be[property];
                    //Item
                    if (value.constructor === Array) {
                        value.forEach(function (item) {
                            item["FID"] = headerLid;
                            var structureInDB = (reqType === ump.requestType.PULL) ? null : webDb.getBasedOnGid(property, item);
                            var itemInCollection = webDb.appDb.getCollection(property);
                            if (itemInCollection === null) {
                                itemInCollection = webDb.appDb.addCollection(property);
                            }
                            if (structureInDB == null) {
                                item.FID = headerLid;
                                itemInCollection.insert(item);
                            }
                            else {
                                item = helper.copyProperty(item, structureInDB);
                                itemInCollection.update(item);
                            }
                        });
                        //Header    
                    }
                    else if (value.constructor === Object) {
                        value["LID"] = helper.guid();
                        headerLid = value.LID;
                        //Handle action delete
                        if (isActionDelete) {
                            webDb.deleteCascade(property, value);
                            continue;
                        }
                        var structureInDB = (reqType === ump.requestType.PULL) ? null : webDb.getBasedOnGid(property, value);
                        //In browser delete all items if header exists.
                        if (reqType === ump.requestType.RQST) {
                            if (structureInDB && (structureInDB != null)) {
                                var children = helper.getBeChildrenNames(property);
                                if ((children != null) && (children.length > 0)) {
                                    for (var i = 0; i < children.length; i++) {
                                        var childCollection = webDb.appDb.getCollection(children[i]["name"]);
                                        if (childCollection != null) {
                                            childCollection.removeWhere({ 'FID': structureInDB.LID });
                                        }
                                    }
                                }
                            }
                        }
                        var headerInCollection = webDb.appDb.getCollection(property);
                        if (headerInCollection === null) {
                            headerInCollection = webDb.appDb.addCollection(property);
                        }
                        if (structureInDB == null) {
                            value.LID = helper.guid();
                            headerInCollection.insert(value);
                        }
                        else {
                            value = helper.copyProperty(value, structureInDB);
                            headerInCollection.update(value);
                        }
                        headerLid = value.LID;
                        //Handle Action D - Delete Header and children
                    }
                    else {
                        isActionDelete = "D" == value;
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
    var metadataParser = /** @class */ (function () {
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
                        sMeta.isheader = ((property.indexOf("_HEADER") > -1) || (property.indexOf("_HDR") > -1)) ? true : false;
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
