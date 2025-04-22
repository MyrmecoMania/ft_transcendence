ARG ELASTIC_VERSION

# https://www.docker.elastic.co/
FROM docker.elastic.co/logstash/logstash:${ELASTIC_VERSION:-8.17.2}

LABEL maintainer="Pierre MAGNERON <pmagnero@student.42.fr>"
LABEL version="1.0"
LABEL description="Logstash part of the ELK Stack"

# COPY --chown=logstash:logstash ./config/logstash.yml /usr/share/logstash/config/
# COPY --chown=logstash:logstash ./pipeline /usr/share/logstash/pipeline

####### For Debug purpose #######
# RUN pwd
# RUN whoami
# RUN ls -la

# Add your logstash plugins setup here
# Example: RUN logstash-plugin install logstash-filter-json