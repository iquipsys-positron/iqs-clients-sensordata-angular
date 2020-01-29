FROM nginx:1.13.3-alpine
## Remove default nginx weborganization
RUN rm -rf /usr/share/nginx/html/*
## From 'builder' stage copy over the artifacts in dist folder to default nginx public folder
COPY /dist/iqs-sensor-data /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]