FROM node:20
RUN npm install
RUN mkdir -p /var/www/product
WORKDIR /var/www/product
ADD . /var/www/product
RUN npm install
CMD npm run build npx ts-node ./node_modules/typeorm/cli.js migration:run -d config/dataSourceLocal.ts && npm run start:prod
