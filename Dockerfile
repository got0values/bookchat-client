FROM nginx:1.19-alpine AS server
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY ./nginx/nginx.conf /etc/nginx/conf.d/
EXPOSE 5500
ENTRYPOINT ["nginx", "-g", "daemon off;"]