ns=${ns:-nats}

kubectl create namespace ${ns}
kubectl label namespace ${ns} knative-eventing-injection=enabled
kubectl -n ${ns} create serviceaccount eventing-broker-ingress
kubectl -n ${ns} create serviceaccount eventing-broker-filter
kubectl -n ${ns} create rolebinding eventing-broker-ingress \
  --clusterrole=eventing-broker-ingress \
  --serviceaccount=${ns}:eventing-broker-ingress
kubectl -n ${ns} create rolebinding eventing-broker-filter \
  --clusterrole=eventing-broker-filter \
  --serviceaccount=${ns}:eventing-broker-filter
kubectl -n knative-eventing create rolebinding eventing-config-reader-${ns}-eventing-broker-ingress \
  --clusterrole=eventing-config-reader \
  --serviceaccount=${ns}:eventing-broker-ingress
kubectl -n knative-eventing create rolebinding eventing-config-reader-${ns}-eventing-broker-filter \
  --clusterrole=eventing-config-reader \
  --serviceaccount=${ns}:eventing-broker-filter

kubectl -n ${ns} apply -f ./knative/broker.yaml
kubectl -n ${ns} apply -f ./knative/broker-service.yaml
kubectl -n ${ns} apply -f ./knative/broker-trigger.yaml
kubectl -n ${ns} apply -f ./knative/broker-event-source.yaml
