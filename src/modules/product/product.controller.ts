import { FastifyReply, FastifyRequest } from "fastify";
import { CreateProductInput } from "./product.schema";
import { createProduct, getProducts } from "./product.service";

export async function createProductHandler(
  request: FastifyRequest<{ Body: CreateProductInput }>,
  reply: FastifyReply
) {
  const product = await createProduct({
    ...request.body,
    ownerId: 1,
  });

  return reply.code(201).send(product);
}

export async function getProductshandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const products = await getProducts();

  return products;
}
