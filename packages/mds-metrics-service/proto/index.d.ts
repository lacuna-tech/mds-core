import * as $protobuf from "protobufjs";
/** Properties of a GetMetricsRequestMessage. */
export interface IGetMetricsRequestMessage {

    /** GetMetricsRequestMessage name */
    name: string;

    /** GetMetricsRequestMessage time_bin_size */
    time_bin_size: number;

    /** GetMetricsRequestMessage time_bin_start */
    time_bin_start: number;

    /** GetMetricsRequestMessage time_bin_end */
    time_bin_end?: (number|null);

    /** GetMetricsRequestMessage provider_id */
    provider_id?: (string|null);

    /** GetMetricsRequestMessage geography_id */
    geography_id?: (string|null);

    /** GetMetricsRequestMessage vehicle_type */
    vehicle_type?: (string|null);
}

/** Represents a GetMetricsRequestMessage. */
export class GetMetricsRequestMessage implements IGetMetricsRequestMessage {

    /**
     * Constructs a new GetMetricsRequestMessage.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGetMetricsRequestMessage);

    /** GetMetricsRequestMessage name. */
    public name: string;

    /** GetMetricsRequestMessage time_bin_size. */
    public time_bin_size: number;

    /** GetMetricsRequestMessage time_bin_start. */
    public time_bin_start: number;

    /** GetMetricsRequestMessage time_bin_end. */
    public time_bin_end: number;

    /** GetMetricsRequestMessage provider_id. */
    public provider_id: string;

    /** GetMetricsRequestMessage geography_id. */
    public geography_id: string;

    /** GetMetricsRequestMessage vehicle_type. */
    public vehicle_type: string;
}

/** Properties of a GetMetricsResponseMessage. */
export interface IGetMetricsResponseMessage {

    /** GetMetricsResponseMessage version */
    version: string;

    /** GetMetricsResponseMessage error */
    error?: (IServiceErrorDescriptorMessage|null);

    /** GetMetricsResponseMessage result */
    result?: (IMetricMessages|null);
}

/** Represents a GetMetricsResponseMessage. */
export class GetMetricsResponseMessage implements IGetMetricsResponseMessage {

    /**
     * Constructs a new GetMetricsResponseMessage.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGetMetricsResponseMessage);

    /** GetMetricsResponseMessage version. */
    public version: string;

    /** GetMetricsResponseMessage error. */
    public error?: (IServiceErrorDescriptorMessage|null);

    /** GetMetricsResponseMessage result. */
    public result?: (IMetricMessages|null);

    /** GetMetricsResponseMessage response. */
    public response?: ("error"|"result");
}

/** Represents a MetricsService */
export class MetricsService extends $protobuf.rpc.Service {

    /**
     * Constructs a new MetricsService service.
     * @param rpcImpl RPC implementation
     * @param [requestDelimited=false] Whether requests are length-delimited
     * @param [responseDelimited=false] Whether responses are length-delimited
     */
    constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

    /**
     * Calls getMetrics.
     * @param request GetMetricsRequestMessage message or plain object
     * @param callback Node-style callback called with the error, if any, and GetMetricsResponseMessage
     */
    public getMetrics(request: IGetMetricsRequestMessage, callback: MetricsService.getMetricsCallback): void;

    /**
     * Calls getMetrics.
     * @param request GetMetricsRequestMessage message or plain object
     * @returns Promise
     */
    public getMetrics(request: IGetMetricsRequestMessage): Promise<GetMetricsResponseMessage>;
}

export namespace MetricsService {

    /**
     * Callback as used by {@link MetricsService#getMetrics}.
     * @param error Error, if any
     * @param [response] GetMetricsResponseMessage
     */
    type getMetricsCallback = (error: (Error|null), response?: GetMetricsResponseMessage) => void;
}

/** Properties of a MetricMessage. */
export interface IMetricMessage {

    /** MetricMessage name */
    name: string;

    /** MetricMessage time_bin_size */
    time_bin_size: number;

    /** MetricMessage time_bin_start */
    time_bin_start: number;

    /** MetricMessage count */
    count?: (number|null);

    /** MetricMessage sum */
    sum?: (number|null);

    /** MetricMessage min */
    min?: (number|null);

    /** MetricMessage max */
    max: number;

    /** MetricMessage avg */
    avg: number;

    /** MetricMessage provider_id */
    provider_id: string;

    /** MetricMessage geography_id */
    geography_id?: (string|null);

    /** MetricMessage vehicle_type */
    vehicle_type: string;
}

/** Represents a MetricMessage. */
export class MetricMessage implements IMetricMessage {

    /**
     * Constructs a new MetricMessage.
     * @param [properties] Properties to set
     */
    constructor(properties?: IMetricMessage);

    /** MetricMessage name. */
    public name: string;

    /** MetricMessage time_bin_size. */
    public time_bin_size: number;

    /** MetricMessage time_bin_start. */
    public time_bin_start: number;

    /** MetricMessage count. */
    public count: number;

    /** MetricMessage sum. */
    public sum: number;

    /** MetricMessage min. */
    public min: number;

    /** MetricMessage max. */
    public max: number;

    /** MetricMessage avg. */
    public avg: number;

    /** MetricMessage provider_id. */
    public provider_id: string;

    /** MetricMessage geography_id. */
    public geography_id: string;

    /** MetricMessage vehicle_type. */
    public vehicle_type: string;
}

/** Properties of a MetricMessages. */
export interface IMetricMessages {

    /** MetricMessages metrics */
    metrics?: (IMetricMessage[]|null);
}

/** Represents a MetricMessages. */
export class MetricMessages implements IMetricMessages {

    /**
     * Constructs a new MetricMessages.
     * @param [properties] Properties to set
     */
    constructor(properties?: IMetricMessages);

    /** MetricMessages metrics. */
    public metrics: IMetricMessage[];
}

/** Properties of a ServiceErrorDescriptorMessage. */
export interface IServiceErrorDescriptorMessage {

    /** ServiceErrorDescriptorMessage type */
    type: string;

    /** ServiceErrorDescriptorMessage message */
    message: string;

    /** ServiceErrorDescriptorMessage detail */
    detail?: (string|null);
}

/** Represents a ServiceErrorDescriptorMessage. */
export class ServiceErrorDescriptorMessage implements IServiceErrorDescriptorMessage {

    /**
     * Constructs a new ServiceErrorDescriptorMessage.
     * @param [properties] Properties to set
     */
    constructor(properties?: IServiceErrorDescriptorMessage);

    /** ServiceErrorDescriptorMessage type. */
    public type: string;

    /** ServiceErrorDescriptorMessage message. */
    public message: string;

    /** ServiceErrorDescriptorMessage detail. */
    public detail: string;
}
