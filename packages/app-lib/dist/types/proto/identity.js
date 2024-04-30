"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_SERVICE_NAME = exports.UserServiceControllerMethods = exports.IDENTITY_PACKAGE_NAME = exports.protobufPackage = void 0;
const microservices_1 = require("@nestjs/microservices");
exports.protobufPackage = "identity";
exports.IDENTITY_PACKAGE_NAME = "identity";
function UserServiceControllerMethods() {
    return function (constructor) {
        const grpcMethods = [
            "createUser",
            "findAllUsers",
            "findOneUser",
            "updateUser",
            "removeUser",
            "findOneUserByPrimaryEmailAddress",
        ];
        for (const method of grpcMethods) {
            const descriptor = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
            (0, microservices_1.GrpcMethod)("UserService", method)(constructor.prototype[method], method, descriptor);
        }
        const grpcStreamMethods = [];
        for (const method of grpcStreamMethods) {
            const descriptor = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
            (0, microservices_1.GrpcStreamMethod)("UserService", method)(constructor.prototype[method], method, descriptor);
        }
    };
}
exports.UserServiceControllerMethods = UserServiceControllerMethods;
exports.USER_SERVICE_NAME = "UserService";
//# sourceMappingURL=identity.js.map