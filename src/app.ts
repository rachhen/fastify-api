import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import fJwt from "@fastify/jwt";
import type { User } from "@prisma/client";
import { withRefResolver } from "fastify-zod";
import userRoutes from "./modules/user/user.route";
import productRoutes from "./modules/product/product.route";
import { userSchemas } from "./modules/user/user.schema";
import { productSchemas } from "./modules/product/product.schema";
import { version } from "../package.json";

const server = Fastify();

declare module "fastify" {
  interface FastifyInstance {
    authenticate: any;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: User;
  }
}

server.register(fJwt, {
  secret: "secret",
});

server.decorate(
  "authenticate",
  async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (error) {
      console.log(error);
      return reply.code(500).send(error);
    }
  }
);

server.get("/healthcheck", async () => {
  return { status: "OK" };
});

async function main() {
  for (const schema of [...userSchemas, ...productSchemas]) {
    server.addSchema(schema);
  }

  server.register(
    require("@fastify/swagger"),
    withRefResolver({
      routePrefix: "/docs",
      exposeRoute: true,
      staticCSP: true,
      openapi: {
        info: {
          title: "Fastify API",
          description: "API for some products",
          version,
        },
      },
    })
  );
  server.register(userRoutes, { prefix: "/api/users" });
  server.register(productRoutes, { prefix: "/api/products" });

  try {
    await server.listen(3000, "0.0.0.0");
    console.log(`Server listening on http://localhost:3000`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}
main();
