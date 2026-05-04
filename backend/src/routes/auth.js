import bcrypt from 'bcryptjs';
import { UnauthorizedError, ValidationError, ConflictError } from '../utils/errors.js';

export default async function authRoutes(fastify) {
  fastify.post('/auth/register', {
    schema: {
      body: {
        type: 'object',
        required: ['phone', 'password', 'name', 'role'],
        properties: {
          phone: { type: 'string', pattern: '^[+][0-9]{10,15}$' },
          password: { type: 'string', minLength: 6 },
          name: { type: 'string', minLength: 1 },
          role: { type: 'string', enum: ['customer', 'business'] },
        },
      },
    },
  }, async (request, reply) => {
    const { phone, password, name, role } = request.body;

    const existing = await fastify.db.query(
      'SELECT id FROM users WHERE phone = $1',
      [phone]
    );

    if (existing.rows.length > 0) {
      throw new ConflictError('Phone number already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await fastify.db.query(
      `INSERT INTO users (phone, password_hash, name, role, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, phone, name, role, created_at`,
      [phone, passwordHash, name, role]
    );

    const user = result.rows[0];
    const token = fastify.jwt.sign({
      id: user.id,
      phone: user.phone,
      role: user.role,
    });

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role,
        },
        token,
      },
    };
  });

  fastify.post('/auth/login', {
    schema: {
      body: {
        type: 'object',
        required: ['phone', 'password'],
        properties: {
          phone: { type: 'string' },
          password: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { phone, password } = request.body;

    const result = await fastify.db.query(
      'SELECT id, phone, password_hash, name, role FROM users WHERE phone = $1',
      [phone]
    );

    if (result.rows.length === 0) {
      throw new UnauthorizedError('Invalid phone or password');
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      throw new UnauthorizedError('Invalid phone or password');
    }

    const token = fastify.jwt.sign({
      id: user.id,
      phone: user.phone,
      role: user.role,
    });

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role,
        },
        token,
      },
    };
  });

  fastify.get('/auth/me', {
    onRequest: [fastify.authenticate],
  }, async (request) => {
    const result = await fastify.db.query(
      'SELECT id, phone, name, role, created_at FROM users WHERE id = $1',
      [request.user.id]
    );

    if (result.rows.length === 0) {
      throw new UnauthorizedError('User not found');
    }

    return {
      success: true,
      data: result.rows[0],
    };
  });
}