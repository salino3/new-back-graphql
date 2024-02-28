const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLFloat,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLList,
} = require("graphql");
const axios = require("axios"); 
const { v4: uuidv4 } = require("uuid");

const ProductType = new GraphQLObjectType({
  name: "Product",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    code: { type: GraphQLString },
    price: { type: GraphQLFloat },
    quantity: { type: GraphQLInt },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    allProducts: {
      type: new GraphQLList(ProductType),
      async resolve(parent, args) {
        try {
          const response = await axios.get("http://localhost:3000/products");
          return response.data;
        } catch (error) {
          throw new Error("Error al obtener todos los productos");
        }
      },
    },
    product: {
      type: ProductType,
      args: {
        id: { type: GraphQLString },
      },
      async resolve(parent, args) {
        try {
          const response = await axios.get(
            `http://localhost:3000/products/${args.id}`
          );
          return response.data;
        } catch (error) {
          // Verifica si el error es porque el producto no se encontró
          if (error.response && error.response.status === 404) {
            return null; // Devuelve null si el producto no se encuentra
          }
          throw new Error("Error al obtener el producto");
        }
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addProduct: {
      type: ProductType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        code: { type: GraphQLNonNull(GraphQLString) },
        price: { type: GraphQLFloat },
        quantity: { type: GraphQLInt },
      },
      async resolve(parent, args) {
        try {
          const newProduct = {
            id: uuidv4(),
            name: args.name,
            code: args.code,
            price: args.price,
            quantity: args.quantity,
          };
          const response = await axios.post(
            "http://localhost:3000/products",
            newProduct
          );
          return response.data;
        } catch (error) {
          throw new Error("Error al agregar el producto");
        }
      },
    },
    updateProduct: {
      type: ProductType,
      args: {
        id: { type: GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLString },
        code: { type: GraphQLString },
        price: { type: GraphQLFloat },
        quantity: { type: GraphQLInt },
      },
      async resolve(parent, args) {
        try {
          const response = await axios.put(
            `http://localhost:3000/products/${args.id}`,
            args
          );
          return response.data;
        } catch (error) {
          throw new Error("Error al actualizar el producto");
        }
      },
    },
    deleteProduct: {
      type: ProductType,
      args: {
        id: { type: GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, args) {
        try {
          const response = await axios.delete(
            `http://localhost:3000/products/${args.id}`
          );
          return response.data;
        } catch (error) {
          throw new Error("Error al eliminar el producto");
        }
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});