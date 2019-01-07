NAMESPACE=kevincharm
IMAGE=naiad
TAG=latest

build:
	docker build . -t $(NAMESPACE)/$(IMAGE):$(TAG)

push:
	docker push $(NAMESPACE)/$(IMAGE):$(TAG)

# Run locally. Make sure the envs below are exported before invoking.
run:
	docker run --rm -it \
	-e "NAIAD_DISCORD_TOKEN=$(NAIAD_DISCORD_TOKEN)" \
	$(NAMESPACE)/$(IMAGE):$(TAG)
