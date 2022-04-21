FROM nginx:latest

ARG TARGET_KIBANA_URL
ARG TARGET_KIBANA_VERSION
ARG LISTEN_ON_PORT

COPY build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
RUN sed -i "s/%TARGET_KIBANA_VERSION%/${TARGET_KIBANA_VERSION}/g" /etc/nginx/conf.d/default.conf
RUN sed -i "s/%TARGET_KIBANA_URL%/${TARGET_KIBANA_URL}/g" /etc/nginx/conf.d/default.conf
RUN sed -i "s/%LISTEN_ON_PORT%/${LISTEN_ON_PORT}/g" /etc/nginx/conf.d/default.conf