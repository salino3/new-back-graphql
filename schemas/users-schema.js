const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLEnumType,
  GraphQLList,
} = require("graphql");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

// Enum type for gender
const GenderEnumType = new GraphQLEnumType({
  name: "Gender",
  values: {
    MALE: { value: "male" },
    FEMALE: { value: "female" },
    PREFER_NOT_SAY: { value: "prefer_not_say" },
  },
});

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
    gender: { type: GenderEnumType },
    age: { type: GraphQLInt },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    user: {
      type: UserType,
      args: {
        id: { type: GraphQLString },
      },
      async resolve(parent, args) {
        try {
          const response = await axios.get(
            `http://localhost:3000/users/${args.id}`
          );
          return response.data;
        } catch (error) {
          if (error.response && error.response.status === 404) {
            return null;
          }
          throw new Error("Error al obtener el usuario");
        }
      },
    },
    allUsers: {
      type: new GraphQLList(UserType),
      async resolve(parent, args) {
        try {
          const response = await axios.get("http://localhost:3000/users");
          return response.data;
        } catch (error) {
          throw new Error("Error al obtener todos los usuarios");
        }
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addUser: {
      type: UserType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        phone: { type: GraphQLString },
        gender: { type: GenderEnumType },
        age: { type: new GraphQLNonNull(GraphQLInt) },
      },
      async resolve(parent, args) {
        try {
          const newUser = {
            id: uuidv4(),
            name: args.name,
            email: args.email,
            phone: args.phone,
            gender: args.gender,
            age: args.age,
          };
          const response = await axios.post(
            "http://localhost:3000/users",
            newUser
          );
          return response.data;
        } catch (error) {
          throw new Error("Error al agregar el usuario");
        }
      },
    },
    updateUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        phone: { type: GraphQLString },
        gender: { type: GenderEnumType },
        age: { type: GraphQLInt },
      },
      async resolve(parent, args) {
        try {
            const { data: currentUser } = await axios.get(
              `http://localhost:3000/products/${args.id}`
            );

            if(!currentUser){
              throw new Error("User not found");
            };

            const updatedFields = {
              name: args.name || currentUser.name,
              email: args.email || currentUser.email,
              phone: args.phone || currentUser.phone,
              gennder: args.gender || currentUser.gender,
              age: args.age || currentUser.age
            };

          //
          const response = await axios.put(
            `http://localhost:3000/users/${args.id}`,
            updatedFields
          );
          return response.data;
        } catch (error) {
          throw new Error("Error updating user");
        }
      },
    },
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, args) {
        try {
          const response = await axios.delete(
            `http://localhost:3000/users/${args.id}`
          );
          return response.data;
        } catch (error) {
          throw new Error("Error deleting user");
        }
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
