/** kernel-mobiweb
 *  Unvired hybrid sdk for building app for mobile and web
 *  @author Tarak Kar
 *  Dependendency for Mobile - cordova.js  & for Web - loki.js
 */
declare let cordova: any;
declare let loki: any;
declare module ump {
    /**
     * Register for login callback passing callback in ump.login.login();
     * Gives callback with any of these listenerType and app take action based on listenerType.
     *
     * For web app only auth_activation_success and auth_activation_error are relevant.
     * For mobile app all enum propeties are valid.
     */
    enum loginListenerType {
        auth_activation_required = 0,
        app_requires_login = 1,
        auth_activation_success = 2,
        auth_activation_error = 3,
        login_success = 4,
        login_error = 5,
    }
    /**
     * Login module to use for authentication. Unvired supports UNVIRED,SAP,ADS and CUSTOM modules to authenticate.
     * Default module is UNVIRED
     */
    var loginType: {
        unvired: string;
        ads: string;
        sap: string;
        custom: string;
    };
    /**
     * result type in returned callbackResult
     */
    enum resultType {
        success = 0,
        error = 1,
    }
    /**
     * Decide application data add /modify / delete based on the request type.
     * 0. RQST - Response for client initiated request. Act based on the 'action' flag.
     * 1. PULL - Server initiated push. The data on the client should be replaced with this data.
     * 2. PUSH - Backend application initiated push of data. Act on this based on the 'action' flag.
     * 3. QUERY - Data query requests from client to server.
     * 4. REQ - Data submit only requests from client to server.
     */
    enum requestType {
        RQST = 0,
        PULL = 1,
        PUSH = 2,
        QUERY = 3,
        REQ = 4,
    }
    /**
     * Returned object in all callback
     * type - result type (success or error)
     * data - result data(string,json array or json object).App should check for expected data type.
     * message - InfoMessage
     * error - error message
     * error- technical detail message of error
     */
    interface callbackResult {
        type: resultType;
        data?: any;
        message?: string;
        error?: string;
        errorDetail: string;
    }
    /**
     * Unvired Account for each user that logged in
     */
    interface unviredAccount {
        username: string;
        company: string;
        url: string;
    }
    /**
     * flag to check for running environment mobile or web
     */
    var isMobile: boolean;
    /**
     * login module provide all login related apis and account related apis
     */
    class login {
        static parameters: {
            appName: string;
            company: string;
            username: string;
            password: string;
            url: string;
            domain: string;
            loginType: string;
            feUserId: string;
            metadataPath: string;
        };
        static listenerType: typeof loginListenerType;
        private static _loginMode;
        private static _loginListener;
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
        static login(callback?: (result) => void): void;
        /**
         * logout() - Close all database and shut down all thread
         */
        static logout(): void;
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
        static getListOfFrontEndUsers(callback?: (result) => void): void;
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
        static authenticateAndActivate(callback?: (result) => void): void;
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
        static authenticateLocal(callback?: (result) => void): void;
        /**
         * getAllAccount - Get all existing Account
         *
         *  @param {function} callback - (Optional) user supplied async callback / error handler
         *
         *  Mobile Only api
         */
        static getAllAccounts(callback?: (result: callbackResult) => void): void;
        /**
         * switchAccount - Switch to given Account.
         *
         *  @param {object} account - Account to switch
         *  @param {function} callback - (Optional) user supplied async callback / error handler
         *
         *  Mobile Only api
         */
        static switchAccount(account: unviredAccount, callback?: (result) => void): void;
        /**
         * deleteAccount - Delete given Account
         *
         *  @param {object} account - Account to switch
         *  @param {function} callback - (Optional) user supplied async callback / error handler
         *
         * Mobile Only api
         */
        static deleteAccount(account: unviredAccount, callback?: (result) => void): void;
    }
    /**
     * sync - Exchange data with ump server in sync and async mode.
     *        Request for async submitted data on ready state on ump.
     */
    class sync {
        static requestType: typeof requestType;
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
        static submitInSync(reqype: requestType, header: any, customData: any, paFunction: string, autoSave: boolean, callback?: (result: callbackResult) => void): void;
        static submitInAsync(requestType: requestType, header: Object, customData: any, paFunction: string, beName: string, belid: string, bypassAttachment: boolean, callback?: (result: callbackResult) => void): void;
        /**
         * getMessages - Request for downloading messages in ready state from server and will be notified through Notification Listener
         *
         *  @param {function} callback - (Optional) user supplied async callback / error handler
         *
         * Mobile Only api
         */
        static getMessages(callback?: (result: callbackResult) => void): void;
        /**
         * registerNotificationListener - Register for callback on GetMessage status
         *
         * @param {function} callback - (Optional) user supplied async callback / error handler
         *
         * Mobile Only api
         */
        static registerNotifListener(callback?: (result: callbackResult) => void): void;
        /**
         * unRegisterNotificationListener - UnRegister for callback on GetMessage status
         *
         *  @param {function} callback - (Optional) user supplied async callback / error handler
         *
         * Mobile Only api
         */
        static unregisterNotifListener(callback?: (result: callbackResult) => void): void;
        /**
         * geterateUBJson - Generate Unvired BusinessEntity json from header and items
         * @param {string} headerName - header structure name
         * @param {object} header - Header Datastructure object  {"Header name": {field name : field value,...}}
         * @param {string} itemName -  item structure name
         * @param {Array} items - arrays of item structures
         *  @param {function} callback
         */
        static geterateUBJson(headerName: string, header: Object, itemName: string, items?: Array<Object>, callBack?: any): void;
        /**
         * parseRawUBJson - Parse unvired response json.
         * Application can use to prase data while handling sync response setting autoSvae false.
         *
         * @param {string} json - response json string
         *
         * returns {infoMessage:[],be:[{header: {..},items: [..] },..]}
         */
        static parseRawUBJson(json: string): any;
    }
    /**
     * db - Perform CRUD database operation on application and framework databases
     */
    class db {
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
        static select(tableName: string, whereClause?: Object, callback?: (result: any) => void): void;
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
        static insert(tableName: string, structureObject: Object, isHeader: boolean, callback: (result: callbackResult) => void): void;
        /**
         * deleteRecord - delete record entry from table
         *
         * Example - ump.db.deleteRecord("CUSTOMER_HEADER",{'EMP_NO':'0039'},callback);
         *
         * @param {string} tableName - table name
         * @param {object} whereClause - (Optional)Json object contains field name-value
         * @param {function} callback - (Optional) user supplied async callback / error handler
         */
        static deleteRecord(tableName: string, whereClause?: Object, callback?: (result: callbackResult) => void): void;
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
        static update(tableName: string, updatedObject: Object, whereClause?: Object, callback?: (result: callbackResult) => void): void;
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
        static executeStatement(query: string, callback: (result: callbackResult) => void): void;
        /**
         * createSavePoint - create a save point for db transaction
         */
        static createSavePoint(savePoint: string, callback: (result: callbackResult) => void): void;
        /**
         * releaseSavePoint - release a save point for db transaction
         */
        static releaseSavePoint(savePoint: string, callback: (result: callbackResult) => void): void;
        /**
         * rollbackSavePoint - rollback a save point for db transaction
         */
        static rollbackSavePoint(savePoint: string, callback: (result: callbackResult) => void): void;
        /**
         * reloadWebDb - reinitialize web db. Use this api to initialize db from persisted local storage db
         */
        static reloadWebDb(callback?: (result: callbackResult) => void): void;
    }
    /**
     * settings - framework related apis
     *
     * Mobile Only module
     */
    class settings {
        /**
         * showSettings - Invoke native Settings screen. Api only available for Mobile.
         */
        static showSettings(): void;
        /**
         * userSettings - Get current User information
         * @param {function} callback
         */
        static userSettings(callback: (result: callbackResult) => void): void;
        /**
         * updateSystemCredentials - Save System Credentials
         */
        static updateSystemCredentials(credentials: Array<Object>, callback: (result: callbackResult) => void): void;
        /**
         * getSystemCredentials - Get all System Credentials
         */
        static getSystemCredentials(callback: (result: callbackResult) => void): void;
        /**
        *  Get Version Infrmation
        */
        static getVersionNumbers(callback: (result: callbackResult) => void): void;
        /**
         * clearData - clear application databases and files
         */
        static clearData(callback: (result: callbackResult) => void): void;
        /**
         * pullDb - pull database file to "temp" folder for development purpose only
         *
         * @param {function} callback - (Optional) user supplied async callback / error handler
         */
        static pullDb(callback: (result: callbackResult) => void): void;
        /**
         * pushDB - push updated database file from "temp" folder to application directory for development purpose only
         *
         * @param {function} callback - (Optional) user supplied async callback / error handler
         */
        static pushDB(callback: (result: resultType) => void): void;
        /**
         * encrypt - Get encrypted string
         * @param {function} callback
         */
        static encrypt(input: string, callback: (result: callbackResult) => void): void;
        static getAppMeta(): any;
    }
    /**
     * log - log messages and send log to server
     *
     * Mobile Only api
     */
    class log {
        /**
         * e - Print log with Level Error
         *
         * @param {string} sourceClass - source class name
         * @param {string} method - source method name
         * @param {string} message - message need to be logged.
         */
        static e(sourceClass: string, method: string, message: string): void;
        /**
         * d - Print log with Level Debug
         *
         * @param {string} sourceClass - source class name
         * @param {string} method - source method name
         * @param {string} message - message need to be logged.
         */
        static d(sourceClass: string, method: string, message: string): void;
        /**
         * i - Print log with Level Important
         *
         * @param {string} sourceClass - source class name
         * @param {string} method - source method name
         * @param {string} message - message need to be logged.
         */
        static i(sourceClass: string, method: string, message: string): void;
        /**
         * getLogs - Get already logged messages
         *
         * @param {function} callBack
         */
        static getLogs(callback: (result: callbackResult) => void): void;
        /**
         * deleteLogs - Delete already logged messages
         */
        static deleteLogs(): void;
        /**
         * sendLogToServer - upload log to server as attachment
         *
         * @param {function} callback - (Optional) user supplied async callback / error handler
         */
        static sendLogToServer(callback?: (result: callbackResult) => void): void;
        /**
         * sendLogViaEmail - Send log via email attachment
         *
         * @param {function} callback - (Optional) user supplied async callback / error handler
         */
        static sendLogViaEmail(callback?: (result: callbackResult) => void): void;
    }
}
