https://knative.dev/docs/eventing/getting-started/

% ./bin/mdsctl bootstrap install:knative
# note: the following is likely not required, verify/remove
% kubectl apply -f knative/viable/getting-started/istio-knative-extras.yaml

% kubectl create namespace event-example
% kubectl label namespace event-example knative-eventing-injection=enabled
% kubectl --namespace event-example get Broker default

% kubectl --namespace event-example apply -f knative/viable/getting-started/hello-deployment.yaml
% kubectl --namespace event-example apply -f knative/viable/getting-started/goodbye-deployment.yaml
% kubectl --namespace event-example get deployments hello-display goodbye-display

% kubectl --namespace event-example apply -f knative/viable/getting-started/hello-trigger.yaml
% kubectl --namespace event-example apply -f knative/viable/getting-started/goodbye-trigger.yaml
% kubectl --namespace event-example get triggers

% kubectl --namespace event-example apply -f knative/viable/getting-started/curl-pod.yaml
% kubectl --namespace event-example attach curl -it
# hello
% curl -v "http://default-broker.event-example.svc.cluster.local" -X POST -H "Ce-Id: say-hello" -H "Ce-Specversion: 0.3" -H "Ce-Type: greeting" -H "Ce-Source: not-sendoff" -H "Content-Type: application/json" -d '{"msg":"Hello Knative!"}'
# goodbye
% curl -v "http://default-broker.event-example.svc.cluster.local" -X POST -H "Ce-Id: say-goodbye" -H "Ce-Specversion: 0.3" -H "Ce-Type: not-greeting" -H "Ce-Source: sendoff" -H "Content-Type: application/json" -d '{"msg":"Goodbye Knative!"}'
# hello, goodbye
% curl -v "http://default-broker.event-example.svc.cluster.local" -X POST -H "Ce-Id: say-hello-goodbye" -H "Ce-Specversion: 0.3" -H "Ce-Type: greeting" -H "Ce-Source: sendoff" -H "Content-Type: application/json" -d '{"msg":"Hello Knative! Goodbye Knative!"}'

% ./bin/mdsctl install:natss
% kubectl -n event-example apply -f knative/viable/getting-started/natss-channel.yaml
% kubectl -n event-example apply -f knative/viable/getting-started/natss-broker.yaml

% curl -v "http://natss-broker.event-example.svc.cluster.local" -X POST -H "Ce-Id: say-hello" -H "Ce-Specversion: 0.3" -H "Ce-Type: greeting" -H "Ce-Source: not-sendoff" -H "Content-Type: application/json" -d '{"msg":"Hello Knative!"}'
# goodbye
% curl -v "http://natss-broker.event-example.svc.cluster.local" -X POST -H "Ce-Id: say-goodbye" -H "Ce-Specversion: 0.3" -H "Ce-Type: not-greeting" -H "Ce-Source: sendoff" -H "Content-Type: application/json" -d '{"msg":"Goodbye Knative!"}'
# hello, goodbye
% curl -v "http://natss-broker.event-example.svc.cluster.local" -X POST -H "Ce-Id: say-hello-goodbye" -H "Ce-Specversion: 0.3" -H "Ce-Type: greeting" -H "Ce-Source: sendoff" -H "Content-Type: application/json" -d '{"msg":"Hello Knative! Goodbye Knative!"}'
