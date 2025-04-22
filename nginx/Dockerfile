# FROM alpine:3.18
FROM nginxinc/nginx-unprivileged

LABEL maintainer="Pierre MAGNERON <pmagnero@student.42.fr>"
LABEL version="1.0"
LABEL description="Nginx image based on Alpine"

ENV LANG=en_US.UTF-8
ENV NGINX_VERSION=1.24.0

WORKDIR /etc/nginx

# RUN apk update; apk add --no-cache su-exec nginx openssl nginx-mod-http-headers-more

# COPY --chown=nginx:nginx ./nginx/* .

# RUN addgroup nginx tty

RUN chown -R nginx:nginx /tmp /etc/nginx /var/run/ /var/lib/nginx /var/lib/nginx/logs

# RUN mkdir -p /var/log/nginx /var/www/html /etc/nginx/certs

# RUN chmod -R 777 /var

USER nginx

RUN whoami

# RUN cd /var/log/nginx; touch error.log
# RUN cd /var/lib/nginx/logs ; touch error.log

# WORKDIR /etc/nginx


# COPY --chown=nginx:nginx .ssl/* ./certs

# RUN openssl req -x509 -nodes -newkey rsa:2048 -days 365 -keyout\
#     /etc/nginx/certs/cert.key -out /etc/nginx/certs/cert.pem -subj "/CN=localhost";\
#     openssl dhparam -out /etc/nginx/certs/dhparam-2048.pem 2048

# RUN ln -sf /dev/stdout /var/log/nginx/access.log \
#     && ln -sf /dev/stderr /var/log/nginx/error.log
#, "-g", "daemon off;"
CMD ["nginx", "-g", "daemon off;"]