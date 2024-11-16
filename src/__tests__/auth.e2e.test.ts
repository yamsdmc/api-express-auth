import request from 'supertest';
import {describe, it, expect} from 'vitest';
import {createApp} from "../app";
import {Express} from "express";
import * as console from "node:console";

describe('Auth API', () => {
    const {app, userRepository} = createApp();

    const testUser = {
        email: 'test@example.com',
        password: 'Password123!@',
    };

    let accessToken: string;
    let refreshToken: string;
    let verificationToken: string;

    describe('Registration and Email Verification Flow', () => {
        it('should register a new user', async () => {
            const res = await insertUser(app, testUser);

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('accessToken');
            expect(res.body).toHaveProperty('refreshToken');
            expect(res.body.user.email).toBe(testUser.email);
            expect(res.body.user.isVerified).toBe(false);

            accessToken = res.body.accessToken;
            refreshToken = res.body.refreshToken;
        });

        it('should not allow login before email verification', async () => {
            await insertUser(app, testUser);
            const res = await request(app)
                .post('/api/auth/login')
                .send(testUser);

            expect(res.status).toBe(403);
            expect(res.body.message).toBe('Email not verified');
        });

        it('should verify email', async () => {
            await insertUser(app, testUser);

            const user = await userRepository.findByEmail(testUser.email);

            verificationToken = user?.verificationToken!;

            const res = await request(app)
                .post('/api/auth/verify-email')
                .send({token: verificationToken});

            expect(res.status).toBe(200);
        });

        it('should login successfully after verification', async () => {
            await insertUser(app, testUser);
            const userRegistered = await userRepository.findByEmail(testUser.email);

            await userRepository.update(userRegistered?.id!, {isVerified: true});
            const res = await request(app)
                .post('/api/auth/login')
                .send(testUser);

            expect(res.status).toBe(200);
            accessToken = res.body.accessToken;
            refreshToken = res.body.refreshToken;
        });
    });

    describe('Duplicate Registration', () => {
        it('should not register user with same email', async () => {
            await insertUser(app, testUser);
            const res = await request(app)
                .post('/api/auth/register')
                .send(testUser);

            expect(res.status).toBe(409);
            expect(res.body.message).toBe('Email already exists');
        });
    });

    describe('Protected Routes and Logout', () => {
        it('should access protected route', async () => {
            const res = await request(app)
                .get('/api/protected/profile')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
        });

        it('should logout successfully', async () => {
            const res = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({refreshToken});

            expect(res.status).toBe(200);
        });

        it('should not access protected route after logout', async () => {
            const res = await request(app)
                .get('/api/protected/profile')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).toBe(401);
        });
    });
});

const insertUser = async (app: Express, user) => await request(app)
    .post('/api/auth/register')
    .send(user);