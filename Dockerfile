FROM nginx:stable-alpine-slim

ENV TARGET_KIBANA_URL=${TARGET_KIBANA_URL}
ENV TARGET_KIBANA_VERSION=${TARGET_KIBANA_VERSION}
ENV LISTEN_ON_PORT=${LISTEN_ON_PORT}

COPY build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf

COPY docker/kibana.conf.template /etc/nginx/templates/kibana.conf.template
# RUN sed -i "s/%TARGET_KIBANA_VERSION%/${TARGET_KIBANA_VERSION}/g" /etc/nginx/conf.d/default.conf
# RUN sed -i "s/%TARGET_KIBANA_URL%/${TARGET_KIBANA_URL}/g" /etc/nginx/conf.d/default.conf
# RUN sed -i "s/%LISTEN_ON_PORT%/${LISTEN_ON_PORT}/g" /etc/nginx/conf.d/default.conf
