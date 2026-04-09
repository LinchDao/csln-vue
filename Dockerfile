FROM nginx:stable-alpine

COPY dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
