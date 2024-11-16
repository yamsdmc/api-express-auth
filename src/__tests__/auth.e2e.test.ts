import request from 'supertest';
import {describe, it, expect, beforeEach} from 'vitest';
import {createApp} from "../app";
import {Express} from "express";

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

        describe('Resend Verification Email', () => {
            beforeEach(async () => {
                await userRepository.reset()
                await insertUser(app, testUser);
                const user = await userRepository.findByEmail(testUser.email);
                verificationToken = user?.verificationToken!;
            });
            it('should resend verification email', async () => {
                const res = await request(app)
                    .post('/api/auth/resend-verification')
                    .send({ email: testUser.email });

                console.log('Resend Response:', res.body); // Pour déboguer

                expect(res.status).toBe(200);
                expect(res.body.message).toBe('Verification email sent');
            });

            it('should not resend if email is already verified', async () => {
                const user = await userRepository.findByEmail(testUser.email);
                await userRepository.update(user!.id!, { isVerified: true });

                const res = await request(app)
                    .post('/api/auth/resend-verification')
                    .send({ email: testUser.email });

                expect(res.status).toBe(400);
                expect(res.body.message).toBe('Email already verified');
            });
            it('should return 400 with correct error when email already verified', async () => {
                // Créer et vérifier un utilisateur
                await insertUser(app, testUser);
                const user = await userRepository.findByEmail(testUser.email);
                await userRepository.update(user!.id!, { isVerified: true });

                const res = await request(app)
                    .post('/api/auth/resend-verification')
                    .send({ email: testUser.email });

                expect(res.status).toBe(400);
                expect(res.body).toEqual({
                    code: 'AUTH_006',
                    message: 'Email already verified'
                });
            });

            it('should return 404 when user not found', async () => {
                const res = await request(app)
                    .post('/api/auth/resend-verification')
                    .send({ email: 'nonexistent@example.com' });

                expect(res.status).toBe(404);
                expect(res.body.message).toBe('User not found');
            });
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