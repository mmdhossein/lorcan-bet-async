import { DataSource } from "typeorm";
import { DataSourceOptions } from "typeorm/data-source/DataSourceOptions";

// const {DataSource} = require('typeorm')
// const {DataSourceOptions} = require('typeorm/data-source/DataSourceOptions')

let connectionOptions:DataSourceOptions = {
  type: "postgres" as "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "1",
  database: "ecommerce",
  synchronize: false,
  logging: true,
  migrations: [`dist/migrations/*{.ts,.js}`],

};
export default new DataSource({
  ...connectionOptions,
});