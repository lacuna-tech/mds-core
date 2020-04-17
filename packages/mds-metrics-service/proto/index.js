/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const GetMetricsRequestMessage = $root.GetMetricsRequestMessage = (() => {

    /**
     * Properties of a GetMetricsRequestMessage.
     * @exports IGetMetricsRequestMessage
     * @interface IGetMetricsRequestMessage
     * @property {string} name GetMetricsRequestMessage name
     * @property {number} time_bin_size GetMetricsRequestMessage time_bin_size
     * @property {number} time_bin_start GetMetricsRequestMessage time_bin_start
     * @property {number|null} [time_bin_end] GetMetricsRequestMessage time_bin_end
     * @property {string|null} [provider_id] GetMetricsRequestMessage provider_id
     * @property {string|null} [geography_id] GetMetricsRequestMessage geography_id
     * @property {string|null} [vehicle_type] GetMetricsRequestMessage vehicle_type
     */

    /**
     * Constructs a new GetMetricsRequestMessage.
     * @exports GetMetricsRequestMessage
     * @classdesc Represents a GetMetricsRequestMessage.
     * @implements IGetMetricsRequestMessage
     * @constructor
     * @param {IGetMetricsRequestMessage=} [properties] Properties to set
     */
    function GetMetricsRequestMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * GetMetricsRequestMessage name.
     * @member {string} name
     * @memberof GetMetricsRequestMessage
     * @instance
     */
    GetMetricsRequestMessage.prototype.name = "";

    /**
     * GetMetricsRequestMessage time_bin_size.
     * @member {number} time_bin_size
     * @memberof GetMetricsRequestMessage
     * @instance
     */
    GetMetricsRequestMessage.prototype.time_bin_size = 0;

    /**
     * GetMetricsRequestMessage time_bin_start.
     * @member {number} time_bin_start
     * @memberof GetMetricsRequestMessage
     * @instance
     */
    GetMetricsRequestMessage.prototype.time_bin_start = 0;

    /**
     * GetMetricsRequestMessage time_bin_end.
     * @member {number} time_bin_end
     * @memberof GetMetricsRequestMessage
     * @instance
     */
    GetMetricsRequestMessage.prototype.time_bin_end = 0;

    /**
     * GetMetricsRequestMessage provider_id.
     * @member {string} provider_id
     * @memberof GetMetricsRequestMessage
     * @instance
     */
    GetMetricsRequestMessage.prototype.provider_id = "";

    /**
     * GetMetricsRequestMessage geography_id.
     * @member {string} geography_id
     * @memberof GetMetricsRequestMessage
     * @instance
     */
    GetMetricsRequestMessage.prototype.geography_id = "";

    /**
     * GetMetricsRequestMessage vehicle_type.
     * @member {string} vehicle_type
     * @memberof GetMetricsRequestMessage
     * @instance
     */
    GetMetricsRequestMessage.prototype.vehicle_type = "";

    return GetMetricsRequestMessage;
})();

export const GetMetricsResponseMessage = $root.GetMetricsResponseMessage = (() => {

    /**
     * Properties of a GetMetricsResponseMessage.
     * @exports IGetMetricsResponseMessage
     * @interface IGetMetricsResponseMessage
     * @property {string} version GetMetricsResponseMessage version
     * @property {IServiceErrorDescriptorMessage|null} [error] GetMetricsResponseMessage error
     * @property {IMetricMessages|null} [result] GetMetricsResponseMessage result
     */

    /**
     * Constructs a new GetMetricsResponseMessage.
     * @exports GetMetricsResponseMessage
     * @classdesc Represents a GetMetricsResponseMessage.
     * @implements IGetMetricsResponseMessage
     * @constructor
     * @param {IGetMetricsResponseMessage=} [properties] Properties to set
     */
    function GetMetricsResponseMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * GetMetricsResponseMessage version.
     * @member {string} version
     * @memberof GetMetricsResponseMessage
     * @instance
     */
    GetMetricsResponseMessage.prototype.version = "";

    /**
     * GetMetricsResponseMessage error.
     * @member {IServiceErrorDescriptorMessage|null|undefined} error
     * @memberof GetMetricsResponseMessage
     * @instance
     */
    GetMetricsResponseMessage.prototype.error = null;

    /**
     * GetMetricsResponseMessage result.
     * @member {IMetricMessages|null|undefined} result
     * @memberof GetMetricsResponseMessage
     * @instance
     */
    GetMetricsResponseMessage.prototype.result = null;

    // OneOf field names bound to virtual getters and setters
    let $oneOfFields;

    /**
     * GetMetricsResponseMessage response.
     * @member {"error"|"result"|undefined} response
     * @memberof GetMetricsResponseMessage
     * @instance
     */
    Object.defineProperty(GetMetricsResponseMessage.prototype, "response", {
        get: $util.oneOfGetter($oneOfFields = ["error", "result"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    return GetMetricsResponseMessage;
})();

export const MetricsService = $root.MetricsService = (() => {

    /**
     * Constructs a new MetricsService service.
     * @exports MetricsService
     * @classdesc Represents a MetricsService
     * @extends $protobuf.rpc.Service
     * @constructor
     * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
     * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
     * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
     */
    function MetricsService(rpcImpl, requestDelimited, responseDelimited) {
        $protobuf.rpc.Service.call(this, rpcImpl, requestDelimited, responseDelimited);
    }

    (MetricsService.prototype = Object.create($protobuf.rpc.Service.prototype)).constructor = MetricsService;

    /**
     * Callback as used by {@link MetricsService#getMetrics}.
     * @memberof MetricsService
     * @typedef getMetricsCallback
     * @type {function}
     * @param {Error|null} error Error, if any
     * @param {GetMetricsResponseMessage} [response] GetMetricsResponseMessage
     */

    /**
     * Calls getMetrics.
     * @function getMetrics
     * @memberof MetricsService
     * @instance
     * @param {IGetMetricsRequestMessage} request GetMetricsRequestMessage message or plain object
     * @param {MetricsService.getMetricsCallback} callback Node-style callback called with the error, if any, and GetMetricsResponseMessage
     * @returns {undefined}
     * @variation 1
     */
    Object.defineProperty(MetricsService.prototype.getMetrics = function getMetrics(request, callback) {
        return this.rpcCall(getMetrics, $root.GetMetricsRequestMessage, $root.GetMetricsResponseMessage, request, callback);
    }, "name", { value: "getMetrics" });

    /**
     * Calls getMetrics.
     * @function getMetrics
     * @memberof MetricsService
     * @instance
     * @param {IGetMetricsRequestMessage} request GetMetricsRequestMessage message or plain object
     * @returns {Promise<GetMetricsResponseMessage>} Promise
     * @variation 2
     */

    return MetricsService;
})();

export const MetricMessage = $root.MetricMessage = (() => {

    /**
     * Properties of a MetricMessage.
     * @exports IMetricMessage
     * @interface IMetricMessage
     * @property {string} name MetricMessage name
     * @property {number} time_bin_size MetricMessage time_bin_size
     * @property {number} time_bin_start MetricMessage time_bin_start
     * @property {number|null} [count] MetricMessage count
     * @property {number|null} [sum] MetricMessage sum
     * @property {number|null} [min] MetricMessage min
     * @property {number} max MetricMessage max
     * @property {number} avg MetricMessage avg
     * @property {string} provider_id MetricMessage provider_id
     * @property {string|null} [geography_id] MetricMessage geography_id
     * @property {string} vehicle_type MetricMessage vehicle_type
     */

    /**
     * Constructs a new MetricMessage.
     * @exports MetricMessage
     * @classdesc Represents a MetricMessage.
     * @implements IMetricMessage
     * @constructor
     * @param {IMetricMessage=} [properties] Properties to set
     */
    function MetricMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * MetricMessage name.
     * @member {string} name
     * @memberof MetricMessage
     * @instance
     */
    MetricMessage.prototype.name = "";

    /**
     * MetricMessage time_bin_size.
     * @member {number} time_bin_size
     * @memberof MetricMessage
     * @instance
     */
    MetricMessage.prototype.time_bin_size = 0;

    /**
     * MetricMessage time_bin_start.
     * @member {number} time_bin_start
     * @memberof MetricMessage
     * @instance
     */
    MetricMessage.prototype.time_bin_start = 0;

    /**
     * MetricMessage count.
     * @member {number} count
     * @memberof MetricMessage
     * @instance
     */
    MetricMessage.prototype.count = 0;

    /**
     * MetricMessage sum.
     * @member {number} sum
     * @memberof MetricMessage
     * @instance
     */
    MetricMessage.prototype.sum = 0;

    /**
     * MetricMessage min.
     * @member {number} min
     * @memberof MetricMessage
     * @instance
     */
    MetricMessage.prototype.min = 0;

    /**
     * MetricMessage max.
     * @member {number} max
     * @memberof MetricMessage
     * @instance
     */
    MetricMessage.prototype.max = 0;

    /**
     * MetricMessage avg.
     * @member {number} avg
     * @memberof MetricMessage
     * @instance
     */
    MetricMessage.prototype.avg = 0;

    /**
     * MetricMessage provider_id.
     * @member {string} provider_id
     * @memberof MetricMessage
     * @instance
     */
    MetricMessage.prototype.provider_id = "";

    /**
     * MetricMessage geography_id.
     * @member {string} geography_id
     * @memberof MetricMessage
     * @instance
     */
    MetricMessage.prototype.geography_id = "";

    /**
     * MetricMessage vehicle_type.
     * @member {string} vehicle_type
     * @memberof MetricMessage
     * @instance
     */
    MetricMessage.prototype.vehicle_type = "";

    return MetricMessage;
})();

export const MetricMessages = $root.MetricMessages = (() => {

    /**
     * Properties of a MetricMessages.
     * @exports IMetricMessages
     * @interface IMetricMessages
     * @property {Array.<IMetricMessage>|null} [metrics] MetricMessages metrics
     */

    /**
     * Constructs a new MetricMessages.
     * @exports MetricMessages
     * @classdesc Represents a MetricMessages.
     * @implements IMetricMessages
     * @constructor
     * @param {IMetricMessages=} [properties] Properties to set
     */
    function MetricMessages(properties) {
        this.metrics = [];
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * MetricMessages metrics.
     * @member {Array.<IMetricMessage>} metrics
     * @memberof MetricMessages
     * @instance
     */
    MetricMessages.prototype.metrics = $util.emptyArray;

    return MetricMessages;
})();

export const ServiceErrorDescriptorMessage = $root.ServiceErrorDescriptorMessage = (() => {

    /**
     * Properties of a ServiceErrorDescriptorMessage.
     * @exports IServiceErrorDescriptorMessage
     * @interface IServiceErrorDescriptorMessage
     * @property {string} type ServiceErrorDescriptorMessage type
     * @property {string} message ServiceErrorDescriptorMessage message
     * @property {string|null} [detail] ServiceErrorDescriptorMessage detail
     */

    /**
     * Constructs a new ServiceErrorDescriptorMessage.
     * @exports ServiceErrorDescriptorMessage
     * @classdesc Represents a ServiceErrorDescriptorMessage.
     * @implements IServiceErrorDescriptorMessage
     * @constructor
     * @param {IServiceErrorDescriptorMessage=} [properties] Properties to set
     */
    function ServiceErrorDescriptorMessage(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * ServiceErrorDescriptorMessage type.
     * @member {string} type
     * @memberof ServiceErrorDescriptorMessage
     * @instance
     */
    ServiceErrorDescriptorMessage.prototype.type = "";

    /**
     * ServiceErrorDescriptorMessage message.
     * @member {string} message
     * @memberof ServiceErrorDescriptorMessage
     * @instance
     */
    ServiceErrorDescriptorMessage.prototype.message = "";

    /**
     * ServiceErrorDescriptorMessage detail.
     * @member {string} detail
     * @memberof ServiceErrorDescriptorMessage
     * @instance
     */
    ServiceErrorDescriptorMessage.prototype.detail = "";

    return ServiceErrorDescriptorMessage;
})();

export { $root as default };
