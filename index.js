"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var core_amqp_1 = require("@azure/core-amqp");
var dotenv = require('dotenv');
dotenv.config();
var isLocalServer = process.env.MESSAGE_QUEUE_CONNECTION_STRING.indexOf("servicebus.windows.net") == -1;
if (isLocalServer) {
    //Workaround for bypassing setting up a valid SSL on local
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}
var connectionConfig = core_amqp_1.ConnectionConfig.create(process.env.MESSAGE_QUEUE_CONNECTION_STRING, process.env.MESSAGE_QUEUE_NAME);
var parameters = {
    config: connectionConfig,
    connectionProperties: {
        product: "MSJSClient",
        userAgent: "/js-core-amqp",
        version: "1.0.0"
    }
};
var connectionContext = core_amqp_1.ConnectionContextBase.create(parameters);
function authenticate(audience) {
    return __awaiter(this, void 0, void 0, function () {
        var sharedKeyCredential, tokenObject;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, connectionContext.cbsSession.init()];
                case 1:
                    _a.sent();
                    if (isLocalServer) {
                        return [2 /*return*/];
                    }
                    sharedKeyCredential = (0, core_amqp_1.createSasTokenProvider)({ sharedAccessKeyName: connectionConfig.sharedAccessKeyName, sharedAccessKey: connectionConfig.sharedAccessKey });
                    tokenObject = sharedKeyCredential.getToken(audience);
                    return [4 /*yield*/, connectionContext.cbsSession.negotiateClaim(audience, tokenObject.token, core_amqp_1.TokenType.CbsTokenTypeSas)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var senderName, senderOptions, sender, message, delivery;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, authenticate("".concat(connectionConfig.endpoint).concat(connectionConfig.entityPath))];
                case 1:
                    _a.sent();
                    senderName = "sender-1";
                    senderOptions = {
                        name: senderName,
                        target: {
                            address: "".concat(connectionConfig.entityPath)
                        },
                        onError: function (context) {
                            var senderError = context.sender && context.sender.error;
                            if (senderError) {
                                console.log("[%s] An error occurred for sender '%s': %O.", connectionContext.connection.id, senderName, senderError);
                            }
                        },
                        onSessionError: function (context) {
                            var sessionError = context.session && context.session.error;
                            if (sessionError) {
                                console.log("[%s] An error occurred for session of sender '%s': %O.", connectionContext.connection.id, senderName, sessionError);
                            }
                        }
                    };
                    return [4 /*yield*/, connectionContext.connection.createSender(senderOptions)];
                case 2:
                    sender = _a.sent();
                    message = {
                        body: "Hello World!!"
                    };
                    return [4 /*yield*/, sender.send(message)];
                case 3:
                    delivery = _a.sent();
                    console.log("[%s] Delivery id: ", connectionContext.connection.id, delivery.id);
                    return [4 /*yield*/, sender.close()];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, connectionContext.connection.close()];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main()["catch"](function (err) { return console.log(err); });
