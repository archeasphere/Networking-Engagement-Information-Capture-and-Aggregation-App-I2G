const request = require('supertest');
const express = require('express');
const app = require('./server'); // Assuming you export your app from server.js

describe('API Tests', () => {
    it('should return a successful message for the root route', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toBe('🚀 Cloudinary & Database API is running!');
    });

    it('should return a successful message for the test-db route', async () => {
        const res = await request(app).get('/test-db');
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('✅ Database connected!');
    });

    // Add more tests for other routes as needed
});
