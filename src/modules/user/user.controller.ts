import { FastifyReply, FastifyRequest } from "fastify";
import { verifyPassword } from "../../utils/hash";
import type { CreateUserInput, LoginInput } from "./user.schema";
import { createUser, findUserByEmail, findUsers } from "./user.service";

export async function registerUserHandler(
  request: FastifyRequest<{ Body: CreateUserInput }>,
  reply: FastifyReply
) {
  const body = request.body;
  try {
    const user = await createUser(body);
    return reply.status(201).send(user);
  } catch (error) {
    console.log(error);
    return reply.code(500).send(error);
  }
}

export async function loginHandler(
  request: FastifyRequest<{ Body: LoginInput }>,
  reply: FastifyReply
) {
  const body = request.body;

  // find a user by email
  const user = await findUserByEmail(body.email);

  if (!user) {
    return reply.code(401).send({
      error: "Invaid email or password",
    });
  }

  // verify password
  const correctPassword = await verifyPassword({
    candidatePassword: body.password,
    salt: user.salt,
    hash: user.password,
  });

  if (!correctPassword) {
    return reply.code(401).send({ error: "Invaid email or password" });
  }

  // generate access token
  const { password, salt, ...rest } = user;
  const accessToken = await reply.jwtSign(rest);

  // return access token
  return { accessToken };
}

export const getUsershandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const users = await findUsers();

  return users;
};
