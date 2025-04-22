ARG ELASTIC_VERSION

# https://www.docker.elastic.co/
FROM docker.elastic.co/kibana/kibana:${ELASTIC_VERSION:-8.17.2}

LABEL maintainer="Pierre MAGNERON <pmagnero@student.42.fr>"
LABEL version="1.0"
LABEL description="Kibana part of the ELK Stack"

# COPY --chown=kibana:kibana ./config/kibana.yml /usr/share/kibana/config/

####### For Debug purpose #######
# RUN pwd
# RUN whoami
# RUN ls -la

# Add your kibana plugins setup here
# Example: RUN kibana-plugin install <name|url>