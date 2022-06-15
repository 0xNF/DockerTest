FROM node:18
WORKDIR /app
COPY package.json ./

ARG NODE_ENV
RUN if [ "$NODE_ENV" = "dev" ]; \
    then npm install; \
    else npm install --omit=dev; \
    fi

COPY ./ ./
ENV PORT 3000
EXPOSE $PORT
CMD ["node", "index.js"]