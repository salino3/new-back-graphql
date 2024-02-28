const express = require("express");
const cors = require("cors");
const { graphqlHTTP } = require("express-graphql");
const { mergeSchemas } = require("@graphql-tools/schema");
const userSchema = require("./schemas/users-schema");
const productSchema = require("./schemas/products-schema");

// rm -rf .git


const app = express();
const PORT = 5000;
app.use(cors());

const schemas = mergeSchemas({
  schemas: [userSchema, productSchema],
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schemas,
    graphiql: true,
  })
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
