ARG ELASTIC_VERSION

# https://www.docker.elastic.co/
FROM docker.elastic.co/elasticsearch/elasticsearch:${ELASTIC_VERSION:-8.17.2}

LABEL maintainer="Pierre MAGNERON <pmagnero@student.42.fr>"
LABEL version="1.0"
LABEL description="Elasticsearch part of the ELK Stack"

# COPY --chown=elasticsearch:elasticsearch elasticsearch.yml /usr/share/elasticsearch/config/

# USER root

# RUN groupadd --gid 995 vboxsf; usermod -aG vboxsf elasticsearch

# USER elasticsearch

# RUN chown -R elasticsearch:elasticsearch /usr/share/elasticsearch/data

# USER elasticsearch

# USER root

# Add your elasticsearch plugins setup here
# Example: RUN elasticsearch-plugin install analysis-icu