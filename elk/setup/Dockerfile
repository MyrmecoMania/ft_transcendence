ARG ELASTIC_VERSION

# https://www.docker.elastic.co/
FROM docker.elastic.co/elasticsearch/elasticsearch:${ELASTIC_VERSION:-8.17.2}

LABEL maintainer="Pierre MAGNERON <pmagnero@student.42.fr>"
LABEL version="1.0"
LABEL description="Setup for the ELK Stack"

# COPY --chown=elasticsearch:elasticsearch . /usr/share/elasticsearch


####### For Debug purpose #######
# RUN pwd
# RUN whoami
# RUN ls -la

ENTRYPOINT ["./entrypoint.sh"]