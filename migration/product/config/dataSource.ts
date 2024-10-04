// import DataSourceProd from "./dataSourceProd";
// import dataSourceLocal from "./dataSourceLocal";
const {dataSourceLocal} =require('./dataSourceLocal');
// export default process.env.NODE_ENV === "production"
//   ? DataSourceProd
//   : DataSourceLocal;
export default dataSourceLocal